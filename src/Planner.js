"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import TravelForm from "./TravelForm"
import ChatInterface from "./ChatInterface"
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { toast } from "react-toastify"
import { saveTripData, saveMessage, getMessagesForItinerary } from "./dbHelpers"
import TripList from "./TripList" // Import the TripList component

export default function Planner({ user }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [conversationState, setConversationState] = useState("idle")
  const [formData, setFormData] = useState(null)
  const [language, setLanguage] = useState("English")
  const [iterinary, setIterinary] = useState("")
  const [iterinaryId, setIterinaryId] = useState("")
  const [selectedTrip, setSelectedTrip] = useState(null)

  // Starts a new trip planning process
  const startChat = () => {
    setConversationState("form")
  }

  // Resets state to go back to the trip list view
  const resetChat = () => {
    setMessages([])
    setLoading(false)
    setConversationState("idle")
    setIterinary("")
    setFormData(null)
    setSelectedTrip(null)
  }

  const handleFormSubmit = (data) => {
    setFormData(data)
    console.log("Form data:", data)
    setConversationState("askInterests")
    generateItinerary(data)
  }

  // Generate a new itinerary (and save the trip) when creating a new trip
  const generateItinerary = async (data) => {
    try {
      setLoading(true)

      // https://saarthi-backend-g50f.onrender.com/generate-itinerary
      const response = await axios.post("https://saarthi-backend-g50f.onrender.com/generate-itinerary", data)


      const formattedResponse = response.data.data
      setIterinary(formattedResponse)
      // Save the trip data in Appwrite
      const dbResponse = await saveTripData(data, user, formattedResponse)
      console.log("Trip saved:", dbResponse)
      // Use the returned document id ($id or id) as the itinerary identifier
      setIterinaryId(dbResponse)
      setConversationState("postItinerary")
    } catch (error) {
      console.error("Error generating itinerary:", error)
      toast.error("An error occurred while generating your itinerary.")
      setConversationState("idle")
    } finally {
      setLoading(false)
    }
  }

  // Load messages when a trip is selected (existing trip)
  useEffect(() => {
    async function loadMessagesForTrip() {
      if (selectedTrip) {
        try {
          setLoading(true)
          const fetchedMessages = await getMessagesForItinerary(selectedTrip.$id || selectedTrip.id)
          // Sort messages by time in ascending order
          const sortedMessages = fetchedMessages.sort(
            (a, b) => new Date(a.time) - new Date(b.time)
          )
          setMessages(sortedMessages)
        } catch (error) {
          console.error("Error loading messages:", error)
          toast.error("An error occurred while loading messages.")
        } finally {
          setLoading(false)
        }
      }
    }
    loadMessagesForTrip()
  }, [selectedTrip])

  // Handle sending a message (both user and bot)
  const sendMessage = async (message) => {
    if (!message.trim()) return

    const userMessage = {
      iterinaryId,
      time: new Date().toISOString(),
      content: message,
      sender: "user",
    }

    await saveMessage(userMessage)
    setMessages((prev) => [...prev, userMessage])
    const history = messages

    try {
      setLoading(true)

      // https://saarthi-backend-g50f.onrender.com/generate-itinerary
      const response = await axios.post("https://saarthi-backend-g50f.onrender.com/ask-question", {

        question: message,
        iterinary,
        language,
        chatHistory: history,
      })

      const formattedResponse = response.data.data
      const botMessage = {
        iterinaryId,
        time: new Date().toISOString(),
        content: formattedResponse,
        sender: "bot",
      }

      await saveMessage(botMessage)
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      toast.error("An error occurred while generating a response.")
    } finally {
      setLoading(false)
    }
  }

  // Download the itinerary as a PDF
  const generateItineraryPDF = async () => {
    try {
      const response = await axios.post(

        'http://localhost:5001/download-itinerary',

        { itineraryMarkdown: iterinary, language },
        { responseType: "blob" }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "itinerary.pdf")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating itinerary PDF:", error)
    }
  }

  // When no trip is selected and we're in the idle state, show the new trip option and TripList
  if (conversationState === "idle" && !selectedTrip) {
    return (
      <div>
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
        <TripList
          user={user}
          onSelectTrip={(trip) => {
            setSelectedTrip(trip)
            setFormData(trip)
            // Load the itinerary and id from the selected trip
            setIterinary(trip.iterinary)
            setIterinaryId(trip.$id || trip.id)
            setConversationState("postItinerary")
          }}
        />
      </div>
    )
  }

  // If the user is planning a new trip, show the TravelForm
  if (conversationState === "form") {
    return <TravelForm onSubmit={handleFormSubmit} setLanguage={setLanguage} />
  }

  // Otherwise, show the ChatInterface for the current trip.
  return (
    <div>
      {/* Back button to return to TripList */}
      <Button onClick={resetChat} className="mb-4">
        ← Back to Trips
      </Button>
      <ChatInterface
        messages={messages}
        loading={loading}
        onSendMessage={sendMessage}
        isPostItinerary={conversationState === "postItinerary"}
        onStartNewChat={() => setConversationState("freeChat")}
        onResetChat={resetChat}
        downloadIterinary={generateItineraryPDF}
        language={language}
        iterinary={iterinary}
        initialMessage={
          formData
            ? `Great! I'm planning a trip from ${formData.departureCity} to ${formData.destinationCity} for ${formData.numberOfPeople} people. Let me create an itinerary based on your interests.`
            : ""
        }
      />
    </div>
  )
}
