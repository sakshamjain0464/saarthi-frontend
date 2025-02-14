"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Send, Loader2, Volume2 } from "lucide-react"
import MarkDownRenderer from "./components/ui/markdownRenderer"
import removeMarkdown from "remove-markdown"

export default function ChatInterface({
  messages,
  loading,
  onSendMessage,
  isPostItinerary,
  onStartNewChat,
  onResetChat,
  language,
  downloadIterinary,
  iterinary = "", // default to empty string if undefined
  initialMessage
}) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = inputRef.current.value
    if (message.trim()) {
      onSendMessage(message)
      inputRef.current.value = ""
    }
  }

  const speakMessage = (text) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        return
      }
      setIsSpeaking(true)
      const plainText = removeMarkdown(text)
      const utterance = new SpeechSynthesisUtterance(plainText)

      // Set language based on the provided language prop
      utterance.lang = language === "Hindi" ? "hi-IN" : "en-US"
      utterance.rate = 1.2

      // Optionally set a specific voice if desired
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find((v) => v.lang === utterance.lang)
      if (voice) {
        utterance.voice = voice
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      console.error("Speech synthesis not supported in this browser.")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto h-[80vh] flex flex-col">
      <CardContent className="flex-grow overflow-auto p-4">
        {/* Render the initial message */}
        {initialMessage && (
          <div className="mb-4 text-left">
            <div className="inline-block p-3 rounded-lg bg-blue-100 text-blue-900">
              <MarkDownRenderer message={initialMessage} />
              <Button onClick={() => speakMessage(initialMessage)} variant="outline" className="mt-2">
                <Volume2 className="w-4 h-4 mr-2" />
                Speak
              </Button>
            </div>
          </div>
        )}
        {/* Render the itinerary if available */}
        {iterinary && iterinary.length > 0 && (
          <div className="mb-4 text-left">
            <div className="inline-block p-3 rounded-lg bg-blue-100 text-blue-900">
              <MarkDownRenderer message={iterinary} />
              <Button onClick={() => speakMessage(iterinary)} variant="outline" className="mt-2">
                <Volume2 className="w-4 h-4 mr-2" />
                Speak
              </Button>
            </div>
          </div>
        )}
        {/* Render each message */}
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.sender === "bot" ? "text-left" : "text-right"}`}>
            <div className={`inline-block p-3 rounded-lg ${message.sender === "bot" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"}`}>
              {message.sender === "bot" ? (
                <div>
                  <MarkDownRenderer message={message.content} />
                  <Button onClick={() => speakMessage(message.content)} variant="outline" className="mt-2">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Speak
                  </Button>
                </div>
              ) : (
                message.content
              )}
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
            <Button onClick={downloadIterinary} variant="outline" className="flex-grow">
              Download itinerary
            </Button>
            {isSpeaking && (
              <Button
                onClick={() => {
                  setIsSpeaking(false)
                  window.speechSynthesis.cancel()
                }}
                variant="outline"
                className="flex-grow"
              >
                Stop Speaking
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
