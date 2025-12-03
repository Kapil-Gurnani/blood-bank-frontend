"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Loader, Wifi, WifiOff, Mic, MicOff } from "lucide-react"
import SockJS from "sockjs-client"
import { Client, IMessage } from "@stomp/stompjs"
import { useVoiceChat } from "@/hooks/use-voice-chat"

interface ChatMessage {
  content?: string
  sender?: string
  type?: string
  data?: any
  dataType?: string
  displayFormat?: "STRING" | "TABLE" | "READING"
  timestamp?: string | number
  latitude?: number
  longitude?: number
  city?: string
  state?: string
}

interface MessageDisplay {
  id: string
  message: ChatMessage
  timestamp: Date
}

interface WebSocketChatInterfaceProps {
  readonly onClose?: () => void
  readonly wsUrl?: string
  readonly username?: string
}

interface UserLocation {
  latitude: number | null
  longitude: number | null
  city: string | null
  state: string | null
  lastUpdated: number | null
}

export function WebSocketChatInterface({ 
  onClose, 
  wsUrl = "http://localhost:8080/ws",
  username = "User"
}: WebSocketChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageDisplay[]>([])
  const [textInput, setTextInput] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stompClientRef = useRef<Client | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: null,
    longitude: null,
    city: null,
    state: null,
    lastUpdated: null
  })
  const { startListening, stopListening, transcript, isListening, isSupported: isVoiceSupported } = useVoiceChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = useCallback((chatMessage: ChatMessage) => {
    const messageDisplay: MessageDisplay = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
      message: chatMessage,
      timestamp: chatMessage.timestamp ? new Date(chatMessage.timestamp) : new Date()
    }
    setMessages((prev) => [...prev, messageDisplay])
  }, [])

  const reverseGeocode = async (latitude: number, longitude: number): Promise<{ city: string; state: string }> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MedicalBackend/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }
      
      const data = await response.json()
      const address = data.address || {}
      
      const city = address.city || address.town || address.village || address.county || ''
      const state = address.state || address.region || ''
      
      return { city, state }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw error
    }
  }

  const getLocationAndSendMessage = useCallback(async (content: string) => {
    const now = Date.now()
    
    // Check cached location
    if (userLocation.latitude && userLocation.lastUpdated && 
        (now - (userLocation.lastUpdated ?? 0)) < 5 * 60 * 1000) {
      sendMessageWithLocation(content, userLocation.latitude, userLocation.longitude, 
                             userLocation.city ?? null, userLocation.state ?? null)
      return
    }
    
    // Request location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          
          setUserLocation({
            latitude: lat,
            longitude: lon,
            lastUpdated: now,
            city: null,
            state: null
          })
          
          try {
            const locationInfo = await reverseGeocode(lat, lon)
            setUserLocation(prev => ({
              ...prev,
              city: locationInfo.city,
              state: locationInfo.state
            }))
            sendMessageWithLocation(content, lat, lon, locationInfo.city, locationInfo.state)
          } catch (error) {
            console.error('Reverse geocoding failed:', error)
            sendMessageWithLocation(content, lat, lon, null, null)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          addMessage({
            content: 'Unable to get your location. Please allow location access or specify a city/state in your query.',
            sender: 'system',
            type: 'ERROR',
            displayFormat: 'STRING'
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000
        }
      )
    } else {
      addMessage({
        content: 'Geolocation is not supported by your browser. Please specify a city/state in your query.',
        sender: 'system',
        type: 'ERROR',
        displayFormat: 'STRING'
      })
    }
  }, [userLocation, addMessage])

  const sendMessageWithLocation = useCallback((content: string, latitude: number | null, longitude: number | null, city: string | null, state: string | null) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      return
    }

    const chatMessage: ChatMessage = {
      content: content,
      sender: username,
      type: 'MESSAGE',
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      city: city || undefined,
      state: state || undefined
    }
    
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    })
    
    setTextInput("")
  }, [username])

  const sendMessage = useCallback(() => {
    const content = textInput.trim()
    if (!content || !stompClientRef.current || !stompClientRef.current.connected) {
      return
    }
    
    // Check if message needs location
    const lowerContent = content.toLowerCase()
    const needsLocation = lowerContent.includes('near me') || 
                         lowerContent.includes('nearby') || 
                         lowerContent.includes('close to me') ||
                         lowerContent.includes('around me')
    
    if (needsLocation) {
      getLocationAndSendMessage(content)
    } else {
      sendMessageWithLocation(content, null, null, null, null)
    }
  }, [textInput, getLocationAndSendMessage, sendMessageWithLocation])

  const handleVoiceInput = useCallback(async () => {
    if (!isVoiceSupported) {
      addMessage({
        content: 'Voice recognition is not supported in your browser',
        sender: 'system',
        type: 'ERROR',
        displayFormat: 'STRING'
      })
      return
    }

    if (isListening) {
      stopListening()
      if (transcript.trim()) {
        setTextInput(transcript.trim())
        // Auto-send the voice transcript
        const content = transcript.trim()
        if (stompClientRef.current && stompClientRef.current.connected) {
          const lowerContent = content.toLowerCase()
          const needsLocation = lowerContent.includes('near me') || 
                               lowerContent.includes('nearby') || 
                               lowerContent.includes('close to me') ||
                               lowerContent.includes('around me')
          
          if (needsLocation) {
            getLocationAndSendMessage(content)
          } else {
            sendMessageWithLocation(content, null, null, null, null)
          }
        }
      }
    } else {
      startListening()
    }
  }, [isListening, isVoiceSupported, transcript, startListening, stopListening, getLocationAndSendMessage, sendMessageWithLocation, addMessage])

  useEffect(() => {
    if (transcript && !isListening) {
      setTextInput(transcript)
    }
  }, [transcript, isListening])

  const connect = useCallback(() => {
    setConnectionStatus("connecting")
    
    try {
      const socket = new SockJS(wsUrl)
      const client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setConnectionStatus("connected")
          
          // Join chat
          const joinMessage: ChatMessage = {
            sender: username,
            content: '',
            type: 'MESSAGE'
          }
          client.publish({
            destination: '/app/chat.addUser',
            body: JSON.stringify(joinMessage)
          })
          
          // Subscribe to messages
          client.subscribe('/topic/public', (message: IMessage) => {
            const chatMessage: ChatMessage = JSON.parse(message.body)
            handleIncomingMessage(chatMessage)
          })
          
          addMessage({
            content: 'Connected to Gavriel! How can I help you today?',
            sender: 'system',
            type: 'MESSAGE',
            displayFormat: 'STRING'
          })
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame)
          setConnectionStatus("disconnected")
          addMessage({
            content: 'Connection error: ' + frame.headers['message'],
            sender: 'system',
            type: 'ERROR',
            displayFormat: 'STRING'
          })
        },
        onWebSocketClose: () => {
          setConnectionStatus("disconnected")
        }
      })
      
      client.activate()
      stompClientRef.current = client
    } catch (error: any) {
      setConnectionStatus("disconnected")
      addMessage({
        content: 'Error: ' + (error.message || 'Connection failed'),
        sender: 'system',
        type: 'ERROR',
        displayFormat: 'STRING'
      })
    }
  }, [wsUrl, username, addMessage])

  const handleIncomingMessage = useCallback((chatMessage: ChatMessage) => {
    if (chatMessage.type === 'TYPING') {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
      return
    }
    
    setIsTyping(false)
    addMessage(chatMessage)
  }, [addMessage])

  useEffect(() => {
    // Auto-connect on mount
    addMessage({
      content: 'Welcome to Gavriel Support! Connect to start chatting.',
      sender: 'system',
      type: 'MESSAGE',
      displayFormat: 'STRING'
    })
    const timer = setTimeout(() => {
      connect()
    }, 500)
    
    return () => {
      clearTimeout(timer)
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderStructuredData = (message: ChatMessage) => {
    const { data, dataType, displayFormat, content } = message
    
    if (displayFormat === 'TABLE' && data) {
      return renderStructuredDataFromObject(data, dataType)
    } else if (displayFormat === 'READING' && content) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
    } else if (displayFormat === 'STRING' && content) {
      return <div>{content}</div>
    } else if (data) {
      return renderStructuredDataFromObject(data, dataType)
    } else if (content) {
        try {
          const jsonRegex = /\{[\s\S]*\}|\[[\s\S]*\]/
          const jsonMatch = jsonRegex.exec(content)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return renderStructuredDataFromObject(parsed, dataType)
          }
        } catch {
          // Not JSON, fall through
        }
      return <div>{content}</div>
    }
    
    return <div>No content</div>
  }

  const renderStructuredDataFromObject = (data: any, dataType?: string) => {
    let responseData = data
    
    if (data.bloodBanks) {
      responseData = { bloodBanks: data.bloodBanks, totalResults: data.totalResults }
    } else if (data.states) {
      responseData = { states: data.states, totalResults: data.totalResults }
    } else if (data.districts) {
      responseData = { districts: data.districts, totalResults: data.totalResults, stateName: data.stateName }
    } else if (data.stocks) {
      responseData = { stocks: data.stocks, totalResults: data.totalResults }
    }
    
    if (responseData.bloodBanks && Array.isArray(responseData.bloodBanks)) {
      return (
        <div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 mb-2 rounded">
            Found {responseData.totalResults || responseData.bloodBanks.length} blood bank(s)
          </div>
          {renderBloodBanksTable(responseData.bloodBanks)}
        </div>
      )
    } else if (responseData.states && Array.isArray(responseData.states)) {
      return (
        <div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 mb-2 rounded">
            Found {responseData.totalResults || responseData.states.length} state(s)
          </div>
          {renderStatesTable(responseData.states)}
        </div>
      )
    } else if (responseData.districts && Array.isArray(responseData.districts)) {
      return (
        <div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 mb-2 rounded">
            Found {responseData.totalResults || responseData.districts.length} district(s) in {responseData.stateName || 'the state'}
          </div>
          {renderDistrictsTable(responseData.districts)}
        </div>
      )
    } else if (responseData.stocks && Array.isArray(responseData.stocks)) {
      return (
        <div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 mb-2 rounded">
            Found {responseData.totalResults || responseData.stocks.length} blood stock entry/entries
          </div>
          {renderStockTable(responseData.stocks)}
        </div>
      )
    } else if (Array.isArray(responseData) && responseData.length > 0 && typeof responseData[0] === 'object') {
      return renderGenericTable(responseData)
    }
    
    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-xs overflow-auto max-h-72">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }

  const renderBloodBanksTable = (bloodBanks: any[]) => {
    if (!bloodBanks || bloodBanks.length === 0) {
      return <div className="p-4 text-center text-muted-foreground italic">No data available</div>
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <tr>
              {['Name', 'Address', 'City', 'State', 'Phone', 'Email'].map(header => (
                <th key={header} className="px-3 py-2 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloodBanks.map((bank, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50">
                {[
                  bank.name || bank.bloodBankName || 'N/A',
                  bank.address || 'N/A',
                  bank.city || 'N/A',
                  bank.state || 'N/A',
                  bank.phone || bank.contactNumber || 'N/A',
                  bank.email || 'N/A'
                ].map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderStatesTable = (states: any[]) => {
    if (!states || states.length === 0) {
      return <div className="p-4 text-center text-muted-foreground italic">No data available</div>
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <tr>
              {['State ID', 'State Name', 'State Code'].map(header => (
                <th key={header} className="px-3 py-2 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.map((state, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50">
                {[
                  state.stateId || 'N/A',
                  state.stateName || 'N/A',
                  state.stateCode || 'N/A'
                ].map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderDistrictsTable = (districts: any[]) => {
    if (!districts || districts.length === 0) {
      return <div className="p-4 text-center text-muted-foreground italic">No data available</div>
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <tr>
              {['District ID', 'District Name', 'District Code'].map(header => (
                <th key={header} className="px-3 py-2 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {districts.map((district, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50">
                {[
                  district.districtId || 'N/A',
                  district.districtName || 'N/A',
                  district.districtCode || 'N/A'
                ].map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderStockTable = (stocks: any[]) => {
    if (!stocks || stocks.length === 0) {
      return <div className="p-4 text-center text-muted-foreground italic">No data available</div>
    }

    const allBloodTypes = new Set<string>()
    stocks.forEach(stock => {
      if (stock.bloodGroups && typeof stock.bloodGroups === 'object') {
        Object.keys(stock.bloodGroups).forEach(bloodType => {
          allBloodTypes.add(bloodType)
        })
      }
    })
    
    const sortedBloodTypes = Array.from(allBloodTypes).sort((a, b) => {
      const order = ['O+Ve', 'O-Ve', 'A+Ve', 'A-Ve', 'B+Ve', 'B-Ve', 'AB+Ve', 'AB-Ve', 
                    'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
      const indexA = order.indexOf(a)
      const indexB = order.indexOf(b)
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      return a.localeCompare(b)
    })

    const hasDistance = stocks.some((s: any) => s.distance != null)

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <tr>
              {['Blood Bank', 'Address', 'Contact'].map(header => (
                <th key={header} className="px-3 py-2 text-left font-semibold">{header}</th>
              ))}
              {sortedBloodTypes.map(bloodType => (
                <th key={bloodType} className="px-3 py-2 text-center font-semibold">{bloodType}</th>
              ))}
              {hasDistance && (
                <th className="px-3 py-2 text-center font-semibold">Distance (km)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50">
                <td className="px-3 py-2 font-medium">{stock.bloodBankName || stock.name || 'N/A'}</td>
                <td className="px-3 py-2 max-w-[200px] break-words">{stock.address || 'N/A'}</td>
                <td className="px-3 py-2 max-w-[150px] break-words">{stock.contact || 'N/A'}</td>
                {sortedBloodTypes.map(bloodType => {
                  const units = stock.bloodGroups?.[bloodType]
                  return (
                    <td key={bloodType} className="px-3 py-2 text-center">
                      {units != null ? (
                        <span className={units > 0 ? "font-bold text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                          {units > 0 ? units : '0'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  )
                })}
                {hasDistance && (
                  <td className="px-3 py-2 text-center">
                    {stock.distance != null ? stock.distance.toFixed(2) : '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderGenericTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div className="p-4 text-center text-muted-foreground italic">No data available</div>
    }

    const keys = new Set<string>()
    data.forEach(item => {
      Object.keys(item).forEach(key => keys.add(key))
    })

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <tr>
              {Array.from(keys).map(key => (
                <th key={key} className="px-3 py-2 text-left font-semibold">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50">
                {Array.from(keys).map(key => (
                  <td key={key} className="px-3 py-2">
                    {item[key] !== null && item[key] !== undefined ? 
                      (typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key])) : 
                      'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Area */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col border-border shadow-lg">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Gavriel Support
                {connectionStatus === "connected" ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : connectionStatus === "connecting" ? (
                  <Loader className="w-4 h-4 animate-spin text-yellow-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </CardTitle>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-6">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4">
              {messages.map((msg) => {
                const sender = msg.message.sender || 'assistant'
                const isUser = sender === username || sender === 'user'
                const isSystem = sender === 'system'
                const isError = msg.message.type === 'ERROR'
                
                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-4xl px-4 py-3 rounded-lg ${
                        isUser
                          ? "bg-accent text-accent-foreground rounded-br-none shadow-md"
                          : isSystem || isError
                          ? isError
                            ? "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800"
                            : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800"
                          : "bg-secondary text-secondary-foreground rounded-bl-none border border-border"
                      }`}
                    >
                      {renderStructuredData(msg.message)}
                      <p className="text-xs mt-2 opacity-60">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg rounded-bl-none border border-border">
                    <span className="text-sm italic text-muted-foreground">Gavriel is typing...</span>
                  </div>
                </div>
              )}
              {isListening && transcript && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Listening:</strong> {transcript}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleVoiceInput}
                  variant={isListening ? "destructive" : "outline"}
                  className={`gap-2 ${isListening ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                  disabled={connectionStatus !== "connected" || !isVoiceSupported}
                  size="icon"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message here... (e.g., 'Find blood banks in Mumbai')"
                  className="flex-1"
                  disabled={connectionStatus !== "connected"}
                />
                <Button
                  onClick={sendMessage}
                  disabled={connectionStatus !== "connected" || !textInput.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-accent mb-2">Try asking:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>"Find O+ blood in Delhi"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>"Show blood banks near me"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>"What blood types available?"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>"Find AB- blood units"</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="font-semibold text-foreground mb-3">Features:</p>
              <ul className="space-y-2 text-muted-foreground text-xs">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Real-time WebSocket chat</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Voice input support</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Location-based search</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Structured data tables</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Blood type filtering</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

