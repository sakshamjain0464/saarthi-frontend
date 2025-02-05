import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationState, setConversationState] = useState('idle');
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState('');
    const [interests, setInterests] = useState('');
    const [itinerary, setItinerary] = useState('');

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

    const sendMessage = async (e) => {
        // Prevent form submission from refreshing the page
        e.preventDefault();
        
        if (input.trim() === '') return;

        // Add user message to the chat
        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        try {
            setLoading(true);

            if (conversationState === 'askDestination') {
                setDestination(input);
                setConversationState('askDays');
                setMessages([...newMessages, { sender: 'bot', text: 'How many days will you be traveling?' }]);
            } else if (conversationState === 'askDays') {
                setDays(input);
                setConversationState('askInterests');
                setMessages([...newMessages, { sender: 'bot', text: 'What are your interests? (e.g., Culture, Food, Nature)' }]);
            } else if (conversationState === 'askInterests') {
                setInterests(input);
                const response = await axios.post('http://3.92.213.113:5000/generate-itinerary', {
                    destination,
                    days,
                    interests: input.split(',').map((i) => i.trim()),
                });

                const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                setMessages([...newMessages, { sender: 'bot', text: formattedResponse }]);
                setItinerary(formattedResponse);
                setConversationState('postItinerary');
            } else if (conversationState === 'postItinerary' || conversationState === 'freeChat') {
                const response = await axios.post('http://3.92.213.113:5000/generate-itinerary', {
                    followUpQuestion: input,
                    itinerary,
                });

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

    const handleKeyDown = (e) => {
        // Remove the direct form submission on Enter key
        // It will be handled by the form's onSubmit instead
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <div className="chat-container">
            {conversationState === 'idle' ? (
                <div className="start-button-container">
                    <button className="start-button" onClick={startChat}>
                        Start Chat
                    </button>
                </div>
            ) : (
                <>
                    <h1>🌍 Saarthi - Your Travel Companion</h1>
                    <div className="chat-box">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <p dangerouslySetInnerHTML={{ __html: msg.text }} />
                            </div>
                        ))}
                        {loading && (
                            <div className="loader">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                    </div>
                    <form onSubmit={sendMessage} className="input-container">
                        {conversationState === 'postItinerary' ? (
                            <div className="post-itinerary-buttons">
                                <button type="button" onClick={() => setConversationState('freeChat')}>
                                    Ask Any Question
                                </button>
                                <button type="button" onClick={resetChat}>
                                    Plan Another Trip
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    disabled={loading}
                                    onKeyDown={handleKeyDown}
                                />
                                <button type="submit" disabled={loading}>
                                    Send
                                </button>
                            </>
                        )}
                    </form>
                </>
            )}
        </div>
    );
}

export default App;
