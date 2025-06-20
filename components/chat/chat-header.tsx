import React from 'react'
import ChatGreetings from './chat-greetings'
import ChatSuggestions from './chat-suggestions'

export default function ChatHeader() {
  return (
    <div className="flex flex-col items-center justify-center">
      <ChatGreetings />
      <ChatSuggestions />
    </div>
  )
}
