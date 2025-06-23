'use client'

import React from 'react'
import { useChatStore } from '@/store/useChatStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import FadeContent from '@/components/animations/fade-content'
import MessageItem from './message-item'

export default function ChatMessages() {
  const { messages } = useChatStore()

  return (
    <FadeContent duration={300} className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col space-y-3 w-full max-w-4xl p-4 mt-20">
          {messages.map(message => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
    </FadeContent>
  )
}
