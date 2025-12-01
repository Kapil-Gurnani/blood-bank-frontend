"use client"

import { useState, useCallback } from "react"

export function useVoiceChat() {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)

  const isSupported =
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript)
        } else {
          interimTranscript += transcript
        }
      }

      if (interimTranscript) {
        setTranscript((prev) => {
          const parts = prev.split("|")
          parts[parts.length - 1] = interimTranscript
          return parts.join("|")
        })
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.stop()
    setIsListening(false)
  }, [isSupported])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
  }
}
