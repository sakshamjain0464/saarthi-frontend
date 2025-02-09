// src/ChatInterface.js
import React from 'react';

export default function ChatInterface({ messages, loading, sendMessage, setConversationState, onResetChat }) {
  return (
    <div>
      {/* Display chat messages */}
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.sender === 'bot' ? 'Bot' : 'You'}:</strong> {message.content}
        </div>
      ))}
      {/* Input field for sending messages */}
      <input
        type="text"
        placeholder="Type a message..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.target.value);
            e.target.value = '';
          }
        }}
      />
      {/* Buttons for state management */}
      <button onClick={() => setConversationState('freeChat')}>Free Chat</button>
      <button onClick={onResetChat}>Reset Chat</button>
    </div>
  );
}