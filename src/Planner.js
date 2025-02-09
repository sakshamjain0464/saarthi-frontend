import React, { useState } from 'react';
// import ChatInterface from './ChatInterface';
import axios from 'axios';
import TravelForm from './TravelForm';
import ChatInterface from './ChatInterface';
import { Card, CardHeader, CardTitle, CardContent } from '../src/components/ui/card';
import { Input } from '../src//components/ui/input';
import { Button } from '../src/components/ui/button';
import { Label } from '../src//components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src//components/ui/select';
import { Textarea } from '../src//components/ui/textarea';
import { Alert, AlertDescription } from '../src/components/ui/alert';
import { MapPin } from "../src/components/icons/MapPin";
import { CalendarIcon } from "../src/components/icons/CalendarIcon";
import { Users } from "../src/components/icons/Users";
import { Heart } from "../src/components/icons/Heart"


export default function Planner() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState('idle');
  const [itinerary, setItinerary] = useState('');
  const [formData, setFormData] = useState(null);

  const startChat = () => {
    setMessages([{ 
      id: '1',
      content: 'Hi! I am Saarthi. Please fill out the form to plan your trip.',
      sender: 'bot' 
    }]);
    setConversationState('form');
  };

  const resetChat = () => {
    setMessages([]);
    setLoading(false);
    setConversationState('idle');
    setItinerary('');
    setFormData(null);
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    setConversationState('askInterests');
    setMessages([{
      id: Date.now().toString(),
      content: `Planning a trip from ${data.from} to ${data.to} for ${data.numberOfPeople} people?`,
      sender: 'bot'
    }]);
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user'
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    try {
      setLoading(true);

      if (conversationState === 'askInterests') {
        const response = await axios.post('https://saarthi-backend-g50f.onrender.com/generate-itinerary', {
          destination: formData.to,
          days: formData.days,
          interests: formData.interests.split(',').map((i) => i.trim()),
          groupType: formData.groupType,
          additionalInfo: formData.additionalInfo,
        });

        const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '$1');
        setMessages([...newMessages, { 
          id: (Date.now() + 1).toString(),
          content: formattedResponse,
          sender: 'bot'
        }]);
        setItinerary(formattedResponse);
        setConversationState('postItinerary');
      } else if (conversationState === 'postItinerary' || conversationState === 'freeChat') {
        const response = await axios.post('https://saarthi-backend-g50f.onrender.com/generate-itinerary', {
          followUpQuestion: message,
          itinerary,
        });

        const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '$1');
        setMessages([...newMessages, {
          id: (Date.now() + 1).toString(),
          content: formattedResponse,
          sender: 'bot'
        }]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        content: 'Failed to generate response. Please try again.',
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (conversationState === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button onClick={startChat}>Start Planning</Button>
      </div>
    );
  }

  if (conversationState === 'form') {
    return <TravelForm onSubmit={handleFormSubmit} />;
  }

  return (
    <ChatInterface
      messages={messages}
      loading={loading}
      onSendMessage={sendMessage}
      isPostItinerary={conversationState === 'postItinerary'}
      onStartNewChat={() => setConversationState('freeChat')}
      onResetChat={resetChat}
    />
  );
}