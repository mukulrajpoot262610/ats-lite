'use client'

import React from 'react'
import FadeContent from '@/components/animations/fade-content'
import { SUGGESTIONS } from '@/constants/suggestions'
import { useChatStore } from '@/store/useChatStore'

export default function ChatSuggestions() {
  const {
    setSuggestion,
    addMessage,
    setChatStarted,
    setIsThinking,
    setThinkingStartTime,
    currentChatId,
    createNewChat,
  } = useChatStore()

  const simulateThoughtProcess = (suggestionTitle: string): string[] => {
    const thoughtPatterns = [
      `Processing suggestion: "${suggestionTitle}"`,
      'Analyzing the specific requirements for this query type',
      'Accessing candidate database for relevant matches',
      "Applying filtering criteria based on user's selection",
      'Prioritizing results by relevance and quality scores',
      'Preparing comprehensive analysis and recommendations',
    ]

    // Return 3-4 random thought steps
    const shuffled = thoughtPatterns.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 3)
  }

  const handleSuggestionClick = (suggestionTitle: string) => {
    // Ensure we have a current chat
    let chatId = currentChatId
    if (!chatId) {
      chatId = createNewChat()
    }

    setSuggestion(suggestionTitle)

    // Add the suggestion as a user message
    addMessage({
      text: suggestionTitle,
      sender: 'user',
    })

    // Start the chat (legacy compatibility)
    setChatStarted(true)

    // Clear the input after adding the message
    setTimeout(() => setSuggestion(''), 100)

    // Start thinking and record start time
    const startTime = Date.now()
    setThinkingStartTime(startTime)
    setIsThinking(true)

    // Generate thought process for this specific suggestion
    const thoughtProcess = simulateThoughtProcess(suggestionTitle)

    // Simulate AI thinking time and response (2-4 seconds)
    const thinkingDuration = Math.floor(Math.random() * 3) + 2 // 2-4 seconds

    setTimeout(() => {
      const endTime = Date.now()
      const actualDuration = Math.round((endTime - startTime) / 1000)

      // Stop thinking and add response with thinking data
      setIsThinking(false)
      setThinkingStartTime(null)

      addMessage({
        text: "Great question! Let me help you with that. I'll analyze our candidate database to provide you with the best recommendations based on your specific criteria.",
        sender: 'assistant',
        thinking: {
          duration: actualDuration,
          content: thoughtProcess,
        },
      })
    }, thinkingDuration * 1000)
  }

  return (
    <FadeContent duration={300} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-6xl w-full mx-auto">
        {SUGGESTIONS.map(suggestion => (
          <div
            key={suggestion.title}
            onClick={() => handleSuggestionClick(suggestion.title)}
            className="bg-background rounded-xl p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center mr-3">
                <suggestion.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-foreground font-medium">{suggestion.title}</p>
          </div>
        ))}
      </div>
    </FadeContent>
  )
}
