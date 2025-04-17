'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import TravelForm from './TravelForm'
import ChatInterface from './ChatInterface' // Import ChatInterface instead of ChatBot
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
import TripList from './TripList'

axios.defaults.baseURL = backendUrl

export default function Planner ({ user }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [conversationState, setConversationState] = useState('idle')
  const [formData, setFormData] = useState(null)
  const [language, setLanguage] = useState('English')
  const [iterinary, setIterinary] = useState('')
  const [iterinaryId, setIterinaryId] = useState('')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [isModifyIterinary, setIsModifyIterinary] = useState(false)
  const [locations, setLocations] = useState([])

  const startChat = () => {
    setConversationState('form')
  }

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

  async function fetchLocations (message) {
    try {
      const response = await axios.post('/locations', {
        message: message
      })
      setLocations(response.data.data)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('An error occurred while fetching locations.')
    }
  }

  const generateItinerary = async data => {
    try {
      setLoading(true)
      const response = await axios.post(`/generate-itinerary`, data)

      const formattedResponse = response.data.data
      setIterinary(formattedResponse)
      const dbResponse = await saveTripData(data, user, formattedResponse)
      console.log('Trip saved:', dbResponse)
      setIterinaryId(dbResponse)
      setConversationState('postItinerary')
      fetchLocations(iterinary)
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error('An error occurred while generating your itinerary.')
      setConversationState('idle')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadMessagesForTrip () {
      if (selectedTrip) {
        try {
          setLoading(true)
          const fetchedMessages = await getMessagesForItinerary(
            selectedTrip.$id || selectedTrip.id
          )
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

      const response = await axios.post(`/ask-question`, {
        question: message,
        iterinary,
        language,
        chatHistory: history
      })

      const formattedResponse = response.data.data

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
      fetchLocations(formattedResponse.answer)
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
      setIterinary(formattedResponse)
      setMessages(prev => [...prev, botMessage])
      setIsModifyIterinary(false)
    } catch (error) {
      console.error('Error generating response:', error)
      toast.error('An error occurred while generating a response.')
    } finally {
      setLoading(false)
    }
  }

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
            setIterinary(trip.iterinary)
            setIterinaryId(trip.$id || trip.id)
            setConversationState('postItinerary')
          }}
        />
      </div>
    )
  }

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

  return (
    <>
      <div>
        <Button onClick={resetChat} className='absolute'>
          ← Back to Trips
        </Button>

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
          locations={locations}
          setLocations={setLocations} // Pass setLocations to ChatInterface
        />
      </div>
    </>
  )
}
