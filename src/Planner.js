"use client"

import { useState } from "react"
import axios from "axios"
import TravelForm from "./TravelForm"
import ChatInterface from "./ChatInterface"
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"

export default function Planner() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [conversationState, setConversationState] = useState("idle")
  const [itinerary, setItinerary] = useState("")
  const [formData, setFormData] = useState(null)

  const startChat = () => {
    setMessages([
      {
        id: "1",
        content: "Hi! I am Saarthi. Please fill out the form to plan your trip.",
        sender: "bot",
      },
    ])
    setConversationState("form")
  }

  const resetChat = () => {
    setMessages([])
    setLoading(false)
    setConversationState("idle")
    setItinerary("")
    setFormData(null)
  }

  const handleFormSubmit = (data) => {
    setFormData(data)
    console.log(formData)
    console.log(data)
    setConversationState("askInterests")
    setMessages([
      {
        id: Date.now().toString(),
        content: `Great! I'm planning a trip from ${data.from} to ${data.to} for ${data.numberOfPeople} people. Let me create an itinerary based on your interests.`,
        sender: "bot",
      },
    ])
    generateItinerary(data)
  }

  const generateItinerary = async (data) => {
    try {
      setLoading(true)
      // https://saarthi-backend-g50f.onrender.com/generate-itinerary
      const response = await axios.post("https://saarthi-backend-g50f.onrender.com/generate-itinerary", data)

      const formattedResponse = response.data.data
      console.log(formattedResponse)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: formattedResponse,
          sender: "bot",
        },
      ])
      setItinerary(formattedResponse)
      setConversationState("postItinerary")
    } catch (error) {
      console.error("Error generating itinerary:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "I apologize, but I encountered an error while generating your itinerary. Please try again.",
          sender: "bot",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (message) => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
    }

    setMessages((prev) => [...prev, newMessage])

    try {
      setLoading(true)
      // https://saarthi-backend-g50f.onrender.com/generate-itinerary
      const response = await axios.post("https://saarthi-backend-g50f.onrender.com/generate-itinerary", {
        followUpQuestion: message,
        itinerary,
      })

      const formattedResponse = response.data.data
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: formattedResponse,
          sender: "bot",
        },
      ])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "I apologize, but I encountered an error while processing your request. Please try again.",
          sender: "bot",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (conversationState === "idle") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Start Your Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={startChat} className="w-full">
            Plan My Trip
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (conversationState === "form") {
    return <TravelForm onSubmit={handleFormSubmit} />
  }

  return (
    <ChatInterface
      messages={messages}
      loading={loading}
      onSendMessage={sendMessage}
      isPostItinerary={conversationState === "postItinerary"}
      onStartNewChat={() => setConversationState("freeChat")}
      onResetChat={resetChat}
    />
  )
}

