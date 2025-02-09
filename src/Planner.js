import React, { useState } from 'react';
import axios from 'axios';
import TravelForm from './TravelForm'; // Import the TravelForm component
import './App.css';

function Planner() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [conversationState, setConversationState] = useState('idle');
    const [itinerary, setItinerary] = useState('');
    const [formData, setFormData] = useState(null); // State to store form data

    const startChat = () => {
        setMessages([{ sender: 'bot', text: 'Hi! I am Saarthi. Please fill out the form to plan your trip.' }]);
        setConversationState('form');
    };

    const resetChat = () => {
        setMessages([]);
        setLoading(false);
        setConversationState('idle');
        setItinerary('');
        setFormData(null); // Reset form data
    };

    const handleFormSubmit = (data) => {
        setFormData(data); // Store form data
        setConversationState('askInterests'); // Skip asking for days
        setMessages([
            { sender: 'bot', text: `Planning a trip from ${data.from} to ${data.to} for ${data.numberOfPeople} people?` },
        ]);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        const input = e.target.value.trim();
        if (!input) return;

        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);

        try {
            setLoading(true);

            if (conversationState === 'askInterests') {
                const response = await axios.post('https://saarthi-backend-g50f.onrender.com/generate-itinerary', {
                    destination: formData.to,
                    days: formData.days, // Use days calculated in the form
                    interests: formData.interests.split(',').map((i) => i.trim()),
                    groupType: formData.groupType,
                    additionalInfo: formData.additionalInfo,
                });

                const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '$1');
                setMessages([...newMessages, { sender: 'bot', text: formattedResponse }]);
                setItinerary(formattedResponse);
                setConversationState('postItinerary');
            } else if (conversationState === 'postItinerary' || conversationState === 'freeChat') {
                const response = await axios.post('https://saarthi-backend-g50f.onrender.com/generate-itinerary', {
                    followUpQuestion: input,
                    itinerary,
                });

                const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '$1');
                setMessages([...newMessages, { sender: 'bot', text: formattedResponse }]);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            setMessages([...newMessages, { sender: 'bot', text: 'Failed to generate response. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="planner">
            {conversationState === 'idle' ? (
                <button onClick={startChat}>Start Planning</button>
            ) : conversationState === 'form' ? (
                <TravelForm onSubmit={handleFormSubmit} />
            ) : (
                <>
                    <h2>🌍 Saarthi - Your Travel Companion</h2>
                    <div className="chat-box">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {loading && <p>Loading...</p>}
                    </div>
                    <div className="controls">
                        {conversationState === 'postItinerary' ? (
                            <>
                                <button onClick={() => setConversationState('freeChat')}>Ask Any Question</button>
                                <button onClick={resetChat}>Plan Another Trip</button>
                            </>
                        ) : (
                            <input
                                type="text"
                                placeholder="Type your message..."
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Planner;