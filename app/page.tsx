'use client'

import { useState } from 'react'
import ChatInput from '@/components/chat/chat-input'
import ChatGreetings from '@/components/chat/chat-greetings'
import ChatSuggestions from '@/components/chat/chat-suggestions'
import ChatMessages from '@/components/chat/chat-messages'
import { useChatStore } from '@/store/useChatStore'
import { Candidate } from '@/types/candidate.types'

export default function Page() {
  const { messages } = useChatStore()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    // TODO: Open candidate detail drawer
    console.log('Selected candidate:', candidate)
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

      {/* Candidate Detail Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-xl z-50">
          {/* Candidate detail panel - to be implemented */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedCandidate.full_name}</h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedCandidate.title}</p>
            <p className="text-sm text-muted-foreground">Detailed candidate view coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}
