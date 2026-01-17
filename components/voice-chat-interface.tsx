"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader, X, Send } from "lucide-react"
import { useVoiceChat } from "@/hooks/use-voice-chat"

interface Message {
  id: string
  type: "user" | "assistant"
  text: string
  timestamp: Date
}

interface VoiceChatInterfaceProps {
  onClose?: () => void
}

export function VoiceChatInterface({ onClose }: VoiceChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      text: "Hello! I'm your BloodConnect AI Assistant. I can help you find blood units in your area. Ask me about blood availability, blood banks, or specific blood types.",
      timestamp: new Date(),
    },
  ])
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { startListening, stopListening, transcript, isSupported } = useVoiceChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleVoiceInput = async () => {
    if (!isSupported) {
      alert("Voice recognition is not supported in your browser")
      return
    }

    if (isListening) {
      stopListening()
      setIsListening(false)

      if (transcript.trim()) {
        await sendMessage(transcript)
      }
    } else {
      setIsListening(true)
      startListening()
    }
  }

  const handleTextSubmit = async () => {
    if (textInput.trim()) {
      await sendMessage(textInput)
      setTextInput("")
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const response = await fetch(`${basePath}/api/voice-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.response)
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Area */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col border-border shadow-lg">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">AI Voice Assistant</CardTitle>
              <CardDescription className="mt-1">Ask about blood availability and locations</CardDescription>
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
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-accent text-accent-foreground rounded-br-none shadow-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-none border border-border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs mt-2 opacity-60">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg rounded-bl-none border border-border">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Transcript Display */}
            {isListening && transcript && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Listening:</strong> {transcript}
                </p>
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleVoiceInput}
                  variant={isListening ? "destructive" : "default"}
                  className={`flex-1 font-semibold gap-2 ${
                    isListening ? "bg-red-600 hover:bg-red-700" : "bg-accent hover:bg-accent/90"
                  }`}
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Voice
                    </>
                  )}
                </Button>
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
                  placeholder="Or type your question..."
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={isProcessing || !textInput.trim()}
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
                  <span>Voice input & output</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Location-based search</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Blood type filtering</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Real-time availability</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
