"use client"
import { useState } from "react"
import { BloodInventoryPage } from "@/components/blood-inventory-page"
import { WebSocketChatInterface } from "@/components/websocket-chat-interface"
import { Droplet, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Droplet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">BloodConnect</h1>
                <p className="text-xs text-muted-foreground">Find blood units instantly</p>
              </div>
            </div>
            <Button
              onClick={() => setShowChat(!showChat)}
              size="lg"
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Ask to Gavriel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showChat ? (
          <div className="animate-in fade-in duration-300">
            <WebSocketChatInterface onClose={() => setShowChat(false)} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <BloodInventoryPage />
          </div>
        )}
      </div>
    </main>
  )
}
