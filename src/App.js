import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, signInWithPopup, GoogleAuthProvider, signOut } from './firebase'; // Import Firebase auth
import './App.css';

function App() {
    const [user, setUser] = useState(null); // Tracks authenticated user
    const [messages, setMessages] = useState([]); // Chat messages
    const [input, setInput] = useState(''); // User input
    const [loading, setLoading] = useState(false); // Loading state
    const [conversationState, setConversationState] = useState('idle'); // Conversation flow state
    const [destination, setDestination] = useState(''); // User's destination
    const [days, setDays] = useState(''); // Number of travel days
    const [interests, setInterests] = useState(''); // User's interests
    const [itinerary, setItinerary] = useState(''); // Generated itinerary

    // Check if the user is logged in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Login with Google
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error logging in:", error.message);
        }
    };

    // // Logout
    // const logout = async () => {
    //     try {
    //         await signOut(auth);
    //     } catch (error) {
    //         console.error("Error logging out:", error.message);
    //     }
    // };

    // Start the chat conversation
    const startChat = () => {
        setMessages([{ sender: 'bot', text: 'Welcome to Saarthi! Where would you like to travel? Please specify your destination.' }]);
        setConversationState('askDestination');
    };

    // Reset the chat
    const resetChat = () => {
        setMessages([]);
        setInput('');
        setDestination('');
        setDays('');
        setInterests('');
        setItinerary('');
        setConversationState('idle');
    };

    // Send message to the backend
    const sendMessage = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please log in to use the chatbot.");
            return;
        }

        if (input.trim() === '') return;

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
                const response = await axios.post('/api/generate-itinerary', {
                    destination,
                    days,
                    interests: input.split(',').map((i) => i.trim()),
                });

                const formattedResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                setMessages([...newMessages, { sender: 'bot', text: formattedResponse }]);
                setItinerary(formattedResponse);
                setConversationState('postItinerary');
            } else if (conversationState === 'freeChat') {
                const response = await axios.post('/api/generate-itinerary', {
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

    return (
        <div className="chat-container">
            {/* Header */}
            <h1>🌍 Saarthi - Your Travel Companion</h1>

            {/* Authentication Section */}
            {!user ? (
                <div className="start-button-container">
                    <button className="start-button" onClick={loginWithGoogle}>
                        Login with Google
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <p>Welcome, {user.displayName || user.email}!</p>
                        <button onClick={logout}>Logout</button>
                    </div>

                    {/* Chat Interface */}
                    {conversationState === 'idle' ? (
                        <div className="start-button-container">
                            <button className="start-button" onClick={startChat}>
                                Start Chat
                            </button>
                        </div>
                    ) : (
                        <>
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
                                            onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
                                        />
                                        <button type="submit" disabled={loading}>
                                            Send
                                        </button>
                                    </>
                                )}
                            </form>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
