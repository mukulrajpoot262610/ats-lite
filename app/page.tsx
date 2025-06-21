'use client'

import ChatInput from '@/components/chat/chat-input'
import ChatGreetings from '@/components/chat/chat-greetings'
import ChatSuggestions from '@/components/chat/chat-suggestions'
import ChatMessages from '@/components/chat/chat-messages'
import { useChatStore } from '@/store/useChatStore'
import { cn } from '@/lib/utils'

export default function Page() {
  const { messages } = useChatStore()

  return (
    <div className="h-screen flex flex-col w-full mx-auto bg-muted/50 relative">
      <div
        className={cn(
          'flex flex-col h-full max-w-4xl mx-auto w-full relative',
          messages.length === 0 && 'justify-center items-center',
        )}
      >
        {/* When no messages - center greetings, suggestions, and input */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <ChatGreetings />
            <ChatSuggestions />
            <ChatInput />
          </div>
        )}

        {/* When messages exist - show messages taking full height and input at bottom */}
        {messages.length > 0 && (
          <>
            <ChatMessages />
            <ChatInput />
          </>
        )}
      </div>
    </div>
  )
}
