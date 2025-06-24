'use client'

import React from 'react'
import { useChatStore } from '@/store/useChatStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import FadeContent from '@/components/animations/fade-content'
import ChatMessageItem from './chat-message-item'
import { Candidate, ChatMessage } from '@/types'

interface ChatMessagesProps {
  onCandidateClick?: (candidate: Candidate) => void
}

const ChatMessages = ({ onCandidateClick }: ChatMessagesProps) => {
  const { getCurrentMessages } = useChatStore()
  const messages = getCurrentMessages()

  return (
    <FadeContent duration={300} className="flex-1 flex flex-col justify-center items-center min-h-0">
      <ScrollArea className="flex-1 w-full max-h-[calc(100vh-8.5rem)] overflow-y-auto max-w-4xl mx-auto scrollbar-hide">
        <div className="flex flex-col space-y-3 w-full max-w-4xl p-4 mt-20">
          {messages.map((message: ChatMessage) => (
            <ChatMessageItem key={message.id} message={message} onCandidateClick={onCandidateClick} />
          ))}
        </div>
      </ScrollArea>
    </FadeContent>
  )
}
export default ChatMessages
