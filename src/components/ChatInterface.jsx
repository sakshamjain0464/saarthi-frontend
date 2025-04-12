'use client'

import { useRef, useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Send, Loader2, Volume2 } from 'lucide-react'
import MarkDownRenderer from './ui/markdownRenderer'
import removeMarkdown from 'remove-markdown'
import Editor from './ui/MarkdownEditor'
import { updateIterinary } from '../helpers/dbHelpers'
import { toast } from 'react-toastify'

export default function ChatInterface ({
  messages,
  iterinaryId,
  loading,
  onSendMessage,
  isPostItinerary,
  onStartNewChat,
  onResetChat,
  language,
  downloadIterinary,
  iterinary = '', // default to empty string if undefined
  initialMessage,
  isModifyIterinary,
  setIterinary,
  modifyIterinary,
  setIsModifyIterinary
}) {
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMessage, setSpeakingMessage] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = e => {
    e.preventDefault()
    const message = inputRef.current.value
    if (message.trim()) {
      onSendMessage(message)
      inputRef.current.value = ''
    }
  }

  const speakMessage = text => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        return
      }
      setIsSpeaking(true)
      setSpeakingMessage(text)
      const plainText = removeMarkdown(text)
      const utterance = new SpeechSynthesisUtterance(plainText)

      // Set language based on the provided language prop
      utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-US'
      utterance.rate = 1.2

      // Optionally set a specific voice if desired
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.lang === utterance.lang)
      if (voice) {
        utterance.voice = voice
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      console.error('Speech synthesis not supported in this browser.')
    }
  }

  return (
    <>
      <Card className='max-w-2xl mx-auto h-[90vh] flex flex-col'>
        <CardContent className='flex-grow overflow-auto p-4'>
          {/* Render the initial message */}
          {initialMessage && (
            <div className='mb-4 text-left'>
              <div className='inline-block p-3 rounded-lg bg-blue-100 text-blue-900'>
                <MarkDownRenderer message={initialMessage} />
                <Button
                  onClick={() => speakMessage(initialMessage)}
                  variant='outline'
                  className='mt-2'
                >
                  <Volume2 className='w-4 h-4 mr-2' />
                  Speak
                </Button>
              </div>
            </div>
          )}

          {/* Render the itinerary if available */}
          {iterinary && iterinary.length > 0 && (
            <div className='mb-4 text-left'>
              <div className='inline-block p-3 rounded-lg bg-blue-100 text-blue-900'>
                <MarkDownRenderer message={iterinary} />
                <Button
                  onClick={() => speakMessage(iterinary)}
                  variant='outline'
                  className='mt-2'
                >
                  <Volume2 className='w-4 h-4 mr-2' />
                  {speakingMessage === iterinary && isSpeaking
                    ? 'Stop'
                    : 'Speak'}
                </Button>
              </div>
            </div>
          )}

          {/* Render each message */}
          {messages.map(message => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === 'bot' ? 'text-left' : 'text-right'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.sender === 'bot'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-green-100 text-green-900'
                }`}
              >
                {message.sender === 'bot' ? (
                  <div>
                    <MarkDownRenderer message={message.content} />
                    <Button
                      onClick={() => speakMessage(message.content)}
                      variant='outline'
                      className='mt-2'
                    >
                      <Volume2 className='w-4 h-4 mr-2' />
                      {speakingMessage === message.content && isSpeaking
                        ? 'Stop'
                        : 'Speak'}
                    </Button>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {/* "Do you wish to modify itinerary" dialog */}
          {isModifyIterinary && (
            <div className='my-2 mx-auto text-center'>
              <p className='mb-2'>Do you wish to modify the itinerary?</p>
              <div className='flex justify-center space-x-4'>
                <Button onClick={() => modifyIterinary()} variant='outline'>
                  Yes
                </Button>
                <Button
                  onClick={() => setIsModifyIterinary(false)}
                  variant='outline'
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className='text-center'>
              <Loader2 className='w-6 h-6 animate-spin inline-block' />
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className='p-4 border-t'>
          <form onSubmit={handleSubmit} className='flex space-x-2'>
            <Input
              ref={inputRef}
              type='text'
              placeholder='Type your message...'
              className='flex-grow'
            />
            <Button type='submit' disabled={loading}>
              <Send className='w-4 h-4 mr-2' />
              Send
            </Button>
          </form>
          {isPostItinerary && (
            <div className='mt-4 flex space-x-2'>
              <Button
                onClick={onStartNewChat}
                variant='outline'
                className='flex-grow'
              >
                Start New Chat
              </Button>
              <Button
                onClick={onResetChat}
                variant='outline'
                className='flex-grow'
              >
                Reset Chat
              </Button>
              <Button
                onClick={downloadIterinary}
                variant='outline'
                className='flex-grow'
              >
                Download itinerary
              </Button>
              <Button
                onClick={() => setIsEditorOpen(true)}
                variant='outline'
                className='flex-grow'
              >
                Edit Iterinary
              </Button>
            </div>
          )}
        </div>
      </Card>
      {isEditorOpen && (
        <Editor
          iterinary={iterinary}
          setEditorOpen={setIsEditorOpen}
          setIterinary={setIterinary}
          saveEditedIterinary={async (editedIterinary, setIterinary) => {
            if (
              editedIterinary === '' &&
              typeof editedIterinary !== 'string' &&
              editedIterinary.length > 10000
            ) {
              toast.error('Please enter a valid itinerary.')
              return
            }
            await updateIterinary(iterinaryId, editedIterinary)
            setIterinary(editedIterinary)
            setIsEditorOpen(false)
          }}
        />
      )}
    </>
  )
}
