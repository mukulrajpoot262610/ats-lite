'use client'

import { useState } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { Candidate } from '@/types'

import ChatInput from '@/components/chat/chat-input'
import ChatGreetings from '@/components/chat/chat-greetings'
import ChatSuggestions from '@/components/chat/chat-suggestions'
import ChatMessages from '@/components/chat/chat-messages'
import CandidateSheet from '@/components/candidate/candidate-sheet'

export default function Page() {
  const { messages } = useChatStore()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="h-screen flex flex-col w-full bg-muted/50 relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col h-full w-full relative">
          {/* When no messages - center greetings, suggestions, and input */}
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto px-4">
              <ChatGreetings />
              <ChatSuggestions />
              <ChatInput />
            </div>
          )}

          {/* When messages exist - show messages and input */}
          {hasMessages && (
            <>
              <div className="flex-1 w-full overflow-hidden">
                <ChatMessages onCandidateClick={handleCandidateClick} />
              </div>
              <div className="px-4">
                <ChatInput />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Candidate Detail Sheet */}
      {selectedCandidate && (
        <CandidateSheet selectedCandidate={selectedCandidate} setSelectedCandidate={setSelectedCandidate} />
      )}
    </div>
  )
}
