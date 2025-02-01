
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationState, setConversationState] = useState('idle'); // Tracks the conversation flow
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState('');
    const [interests, setInterests] = useState('');
    const [itinerary, setItinerary] = useState(''); // Store the generated itinerary

    const startChat = () => {
        setMessages([{ sender: 'bot', text: 'Hi I am Saarthi, Where would you like to travel? Please specify your destination.' }]);
        setConversationState('askDestination');
    };

    const resetChat = () => {
        setMessages([]);
        setInput('');
        setDestination('');
        setDays('');
        setInterests('');
        setItinerary('');
        setConversationState('idle');
    };

    const sendMessage = async () => {
        if (input.trim() === '') return;

        // Add user message to the chat
        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        try {
            setLoading(true);

            // Handle conversation flow
            if (conversationState === 'askDestination') {
                // Save destination and ask for days
                setDestination(input);
                setConversationState('askDays');
                setMessages([...newMessages, { sender: 'bot', text: 'How many days will you be traveling?' }]);
            } else if (conversationState === 'askDays') {
                // Save days and ask for interests
                setDays(input);
                setConversationState('askInterests');
                setMessages([...newMessages, { sender: 'bot', text: 'What are your interests? (e.g., Culture, Food, Nature)' }]);
            } else if (conversationState === 'askInterests') {
                // Save interests and generate itinerary
                setInterests(input);
                const response = await axios.post('https://saarthi-backend-mie7.onrender.com/generate-itinerary', {
                    destination,
                    days,
                    interests: input.split(',').map((i) => i.trim()),
                });

                // Format the response (handle bold text)
                const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                setMessages([...newMessages, { sender: 'bot', text: formattedResponse }]);
                setItinerary(formattedResponse); // Store the itinerary
                setConversationState('postItinerary'); // Transition to post-itinerary state
            } else if (conversationState === 'postItinerary' || conversationState === 'freeChat') {
                // Handle follow-up questions with itinerary context
                const response = await axios.post('https://saarthi-backend-mie7.onrender.com/generate-itinerary', {
                    followUpQuestion: input,
                    itinerary, // Include the itinerary context
                });

                // Format the response (handle bold text)
                const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
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
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <p dangerouslySetInnerHTML={{ __html: msg.text }} />
                    </div>
                ))}
                {loading && <div className="loader">Generating response...</div>}
            </div>
            <div className="input-container">
                {conversationState === 'idle' ? (
                    <button onClick={startChat}>Start Chat</button>
                ) : conversationState === 'postItinerary' ? (
                    <div className="post-itinerary-buttons">
                        <button onClick={() => setConversationState('freeChat')}>Ask Any Question</button>
                        <button onClick={resetChat}>Generate Itinerary for Another Destination</button>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading}>
                            Send
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;