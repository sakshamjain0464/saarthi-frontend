"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Send, Loader2 } from "lucide-react"

export default function ChatInterface({
  messages,
  loading,
  onSendMessage,
  isPostItinerary,
  onStartNewChat,
  onResetChat,
}) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = inputRef.current.value
    if (message.trim()) {
      onSendMessage(message)
      inputRef.current.value = ""
    }
  }

  return (
    <Card className="max-w-2xl mx-auto h-[80vh] flex flex-col">
      <CardContent className="flex-grow overflow-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.sender === "bot" ? "text-left" : "text-right"}`}>
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === "bot" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin inline-block" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input ref={inputRef} type="text" placeholder="Type your message..." className="flex-grow" />
          <Button type="submit" disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </form>
        {isPostItinerary && (
          <div className="mt-4 flex space-x-2">
            <Button onClick={onStartNewChat} variant="outline" className="flex-grow">
              Start New Chat
            </Button>
            <Button onClick={onResetChat} variant="outline" className="flex-grow">
              Reset Chat
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

