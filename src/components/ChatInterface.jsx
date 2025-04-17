'use client'

import ChatBot from './ChatBot'
import MapComponent from './MapComponent'

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
  iterinary,
  initialMessage,
  isModifyIterinary,
  setIterinary,
  modifyIterinary,
  setIsModifyIterinary,
  setLocations,
  locations
}) {
  return (
    <div className='w-full h-screen flex flex-col md:flex-row'>
      {/* Chat Section (Left on Desktop) */}
      <div className='md:w-[60%]'>
        <ChatBot
          messages={messages}
          iterinaryId={iterinaryId}
          loading={loading}
          onSendMessage={onSendMessage}
          isPostItinerary={isPostItinerary}
          onStartNewChat={onStartNewChat}
          onResetChat={onResetChat}
          language={language}
          downloadIterinary={downloadIterinary}
          iterinary={iterinary}
          initialMessage={initialMessage}
          isModifyIterinary={isModifyIterinary}
          setIterinary={setIterinary}
          modifyIterinary={modifyIterinary}
          setIsModifyIterinary={setIsModifyIterinary}
        />
      </div>

      {/* Map Section (Right on Desktop) */}
      <div className='hidden md:block md:w-[40%]'>
        <MapComponent
          locations={locations}
          isVisible={true}
          onClose={() => {}}
        />
      </div>
    </div>
  )
}
