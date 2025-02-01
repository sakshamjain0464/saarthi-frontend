import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TypingAnimation = () => (
  <div className="typing-animation">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
);

const Message = ({ text, sender, isTyping }) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (sender === 'bot' && !isTyping) {
      let currentText = '';
      const textToType = text;
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < textToType.length) {
          currentText += textToType[currentIndex];
          setDisplayText(currentText);
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
        }
      }, 30); // Adjust typing speed here

      return () => clearInterval(typeInterval);
    } else {
      setDisplayText(text);
      setIsComplete(true);
    }
  }, [text, sender, isTyping]);

  return (
    <div className={`message ${sender} ${isComplete ? 'complete' : ''}`}>
      <div 
        className="message-content"
        dangerouslySetInnerHTML={{ 
          __html: sender === 'bot' ? displayText : text 
        }} 
      />
      {!isComplete && sender === 'bot' && <TypingAnimation />}
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState('idle');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [interests, setInterests] = useState('');
  const [itinerary, setItinerary] = useState('');
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const startChat = () => {
    setMessages([{
      sender: 'bot',
      text: 'Hi I am Saarthi, Where would you like to travel? Please specify your destination.'
    }]);
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

  const handleMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let botResponse;

      switch (conversationState) {
        case 'askDestination':
          setDestination(input);
          botResponse = { 
            sender: 'bot', 
            text: 'How many days will you be traveling?' 
          };
          setConversationState('askDays');
          break;

        case 'askDays':
          setDays(input);
          botResponse = { 
            sender: 'bot', 
            text: 'What are your interests? (e.g., Culture, Food, Nature)' 
          };
          setConversationState('askInterests');
          break;

        case 'askInterests':
          setInterests(input);
          const itineraryResponse = await axios.post(
            'https://saarthi-backend-g50f.onrender.com/generate-itinerary',
            {
              destination,
              days,
              interests: input.split(',').map(i => i.trim()),
            }
          );
          
          const formattedItinerary = itineraryResponse.data.reply.replace(
            /\*\*(.*?)\*\*/g, 
            '<b>$1</b>'
          );
          
          botResponse = { 
            sender: 'bot', 
            text: formattedItinerary 
          };
          setItinerary(formattedItinerary);
          setConversationState('postItinerary');
          break;

        case 'postItinerary':
        case 'freeChat':
          const followUpResponse = await axios.post(
            'https://saarthi-backend-g50f.onrender.com/generate-itinerary',
            {
              followUpQuestion: input,
              itinerary,
            }
          );
          
          botResponse = { 
            sender: 'bot', 
            text: followUpResponse.data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
          };
          break;

        default:
          botResponse = { 
            sender: 'bot', 
            text: 'I apologize, but I seem to have lost track of our conversation. Should we start over?' 
          };
          break;
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'I apologize, but I encountered an error. Would you like to try again?' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="max-w-3xl mx-auto w-full p-4 flex flex-col h-full">
        {conversationState === 'idle' ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={startChat}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors shadow-lg transform hover:scale-105 duration-200"
            >
              Start Planning Your Trip
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
              🌍 Saarthi - Your Travel Companion
            </h1>
            
            <div 
              ref={chatBoxRef}
              className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow-md p-4"
            >
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  text={msg.text}
                  sender={msg.sender}
                  isTyping={loading && index === messages.length - 1}
                />
              ))}
            </div>

            {conversationState === 'postItinerary' ? (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setConversationState('freeChat')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
                             transition-colors"
                >
                  Ask Questions
                </button>
                <button
                  onClick={resetChat}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                             transition-colors"
                >
                  Plan New Trip
                </button>
              </div>
            ) : (
              <form onSubmit={handleMessage} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                             transition-colors disabled:bg-gray-400"
                >
                  Send
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
