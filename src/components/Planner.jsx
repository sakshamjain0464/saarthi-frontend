'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import TravelForm from './TravelForm'
import ChatInterface from './ChatInterface'
import ChatMapLayout from './ChatMapLayout' // Import the ChatMapLayout component
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import {
  saveTripData,
  saveMessage,
  getMessagesForItinerary,
  updateIterinary
} from '../helpers/dbHelpers'
import { backendUrl } from '../env.exports'
import TripList from './TripList' // Import the TripList component
import useMediaQuery from '../lib/hooks/useMediaQuery'

axios.defaults.baseURL = backendUrl

export default function Planner ({ user }) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [conversationState, setConversationState] = useState('idle')
  const [formData, setFormData] = useState(null)
  const [language, setLanguage] = useState('English')
  const [iterinary, setIterinary] = useState('')
  const [iterinaryId, setIterinaryId] = useState('')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [isModifyIterinary, setIsModifyIterinary] = useState(false)

  // Starts a new trip planning process
  const startChat = () => {
    setConversationState('form')
  }

  // Resets state to go back to the trip list view
  const resetChat = () => {
    setMessages([])
    setLoading(false)
    setConversationState('idle')
    setIterinary('')
    setFormData(null)
    setSelectedTrip(null)
  }

  const handleFormSubmit = data => {
    setFormData(data)
    console.log('Form data:', data)
    setConversationState('askInterests')
    generateItinerary(data)
  }

  // Generate a new itinerary (and save the trip) when creating a new trip
  const generateItinerary = async data => {
    try {
      setLoading(true)
      const response = await axios.post(`/generate-itinerary`, data)

      const formattedResponse = response.data.data
      setIterinary(formattedResponse)
      // Save the trip data in Appwrite
      const dbResponse = await saveTripData(data, user, formattedResponse)
      console.log('Trip saved:', dbResponse)
      // Use the returned document id ($id or id) as the itinerary identifier
      setIterinaryId(dbResponse)
      setConversationState('postItinerary')
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error('An error occurred while generating your itinerary.')
      setConversationState('idle')
    } finally {
      setLoading(false)
    }
  }

  // Load messages when a trip is selected (existing trip)
  useEffect(() => {
    async function loadMessagesForTrip () {
      if (selectedTrip) {
        try {
          setLoading(true)
          const fetchedMessages = await getMessagesForItinerary(
            selectedTrip.$id || selectedTrip.id
          )
          // Sort messages by time in ascending order
          const sortedMessages = fetchedMessages.sort(
            (a, b) => new Date(a.time) - new Date(b.time)
          )
          setMessages(sortedMessages)
        } catch (error) {
          console.error('Error loading messages:', error)
          toast.error('An error occurred while loading messages.')
        } finally {
          setLoading(false)
        }
      }
    }
    loadMessagesForTrip()
  }, [selectedTrip])

  // Handle sending a message (both user and bot)
  const sendMessage = async message => {
    if (!message.trim()) return

    const userMessage = {
      iterinaryId,
      time: new Date().toISOString(),
      content: message,
      sender: 'user'
    }

    await saveMessage(userMessage)
    setMessages(prev => [...prev, userMessage])
    const history = messages

    try {
      setLoading(true)

      // https://saarthi-backend-g50f.onrender.com/generate-itinerary
      const response = await axios.post(`/ask-question`, {
        question: message,
        iterinary,
        language,
        chatHistory: history
      })

      const formattedResponse = response.data.data

      console.log('Formatted response:', formattedResponse)

      if (formattedResponse.isModifyIterinary) {
        setIsModifyIterinary(true)
      } else setIsModifyIterinary(false)

      const botMessage = {
        iterinaryId,
        time: new Date().toISOString(),
        content: formattedResponse.answer,
        sender: 'bot'
      }

      await saveMessage(botMessage)
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      toast.error('An error occurred while generating a response.')
    } finally {
      setLoading(false)
    }
  }

  const modifyIterinary = async () => {
    try {
      setLoading(true)

      // https://saarthi-backend-g50f.onrender.com/generate-itinerary
      const response = await axios.post(`/modify-iterinary`, {
        iterinary,
        answer: messages[messages.length - 1].content,
        language
      })

      const formattedResponse = response.data.data

      const botMessage = {
        iterinaryId,
        time: new Date().toISOString(),
        content: formattedResponse,
        sender: 'bot'
      }

      await saveMessage(botMessage)
      await updateIterinary(iterinaryId, formattedResponse)
      setMessages(prev => [...prev, botMessage])
      setIsModifyIterinary(false)
    } catch (error) {
      console.error('Error generating response:', error)
      toast.error('An error occurred while generating a response.')
    } finally {
      setLoading(false)
    }
  }

  // Download the itinerary as a PDF
  const generateItineraryPDF = async () => {
    try {
      const response = await axios.post(
        `download-itinerary`,

        { itineraryMarkdown: iterinary, language },
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'itinerary.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating itinerary PDF:', error)
    }
  }

  // When no trip is selected and we're in the idle state, show the new trip option and TripList
  if (conversationState === 'idle' && !selectedTrip) {
    return (
      <div>
        <Card className='max-w-md mx-auto'>
          <CardHeader>
            <CardTitle>Start Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={startChat} className='w-full'>
              Plan My Trip
            </Button>
          </CardContent>
        </Card>
        <TripList
          user={user}
          onSelectTrip={trip => {
            setSelectedTrip(trip)
            setFormData(trip)
            // Load the itinerary and id from the selected trip
            setIterinary(trip.iterinary)
            setIterinaryId(trip.$id || trip.id)
            setConversationState('postItinerary')
          }}
        />
      </div>
    )
  }

  // If the user is planning a new trip, show the TravelForm
  if (conversationState === 'form') {
    return (
      <>
        <Button onClick={resetChat} className='mb-4 '>
          ← Back to Trips
        </Button>
        <TravelForm onSubmit={handleFormSubmit} setLanguage={setLanguage} />
      </>
    )
  }

  // Otherwise, show the ChatInterface for the current trip.
  return (
    <>
      <div>
        {/* Back button to return to TripList */}
        <Button onClick={resetChat} className='absolute'>
          ← Back to Trips
        </Button>
        
        {/* Wrap ChatInterface with ChatMapLayout for responsive design */}
        <ChatMapLayout 
          locations={[
            // Extract locations from the destination city
            // This is a simple example - in a real app, you would parse the itinerary
            // to extract actual coordinates or use a geocoding service
            formData ? { 
              name: formData.destinationCity, 
              lat: 20.5937, // Default coordinates - would be replaced with actual coordinates
              lng: 78.9629  // Default coordinates - would be replaced with actual coordinates
            } : {}
          ]}
          onCloseMap={() => {}}
        >
          <ChatInterface
            messages={messages}
            loading={loading}
            onSendMessage={sendMessage}
            isPostItinerary={conversationState === 'postItinerary'}
            onStartNewChat={() => setConversationState('freeChat')}
            onResetChat={resetChat}
            downloadIterinary={generateItineraryPDF}
            language={language}
            iterinary={iterinary}
            isModifyIterinary={isModifyIterinary}
            setIsModifyIterinary={setIsModifyIterinary}
            setIterinary={setIterinary}
            modifyIterinary={modifyIterinary}
            iterinaryId={iterinaryId}
            initialMessage={
              formData
                ? `Great! I'm planning a trip from ${formData.departureCity} to ${formData.destinationCity} for ${formData.numberOfPeople} people. Let me create an itinerary based on your interests.`
                : ''
            }
          />
        </ChatMapLayout>
      </div>
    </>
  )
}
