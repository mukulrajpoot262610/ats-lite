'use client'

import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'
import ChatGreetings from '@/components/chat/chat-greetings'
import ChatSuggestions from '@/components/chat/chat-suggestions'
import ChatMessages from '@/components/chat/chat-messages'
import { useChatStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function Page() {
  const { messages, currentChatId, createNewChat } = useChatStore()

  // If no chat is selected, show welcome screen
  if (!currentChatId) {
    return (
      <div className="h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] flex flex-col w-full mx-auto bg-muted/50 rounded-xl p-10 relative">
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to ATSLite</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your intelligent assistant for finding and managing top candidates. Start a new conversation to begin
              exploring our powerful features.
            </p>
            <Button onClick={createNewChat} className="px-6 py-3 text-base font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>
              You can also use <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ N</kbd> to create a new chat
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] flex flex-col w-full mx-auto bg-muted/50 rounded-xl p-10 relative">
      <div
        className={cn(
          'flex flex-col h-full max-w-4xl mx-auto w-full relative',
          messages.length === 0 && 'justify-center items-center',
        )}
      >
        <ChatHeader />

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
