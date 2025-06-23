'use client'

import React from 'react'
import FadeContent from '@/components/animations/fade-content'
import { SUGGESTIONS_CONFIG } from '@/constants/app-config'
import { useChatStore } from '@/store/useChatStore'
import { mcpService } from '@/lib/mcp-service'

export default function ChatSuggestions() {
  const { addMessage, currentChatId, createNewChat, selectedModel } = useChatStore()

  const handleSuggestionClick = async (suggestionTitle: string) => {
    // Ensure we have a current chat before adding messages
    let chatId = currentChatId
    if (!chatId) {
      chatId = createNewChat()
    }

    // Add the user message
    addMessage({
      text: suggestionTitle,
      sender: 'user',
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      const { messages } = useChatStore.getState()

      const result = await mcpService.executeLoopWithSteps(messages, step => {
        console.log('🔍 Step:', step)
      })

      addMessage({
        text: result,
        sender: 'assistant',
        model: selectedModel.name,
      })
    } catch (error) {
      console.error('Error calling think API:', error)

      addMessage({
        text: 'I apologize, but I encountered an error while processing your request. Please try again or check your connection.',
        sender: 'assistant',
        model: selectedModel.name,
      })
    }
  }

  return (
    <FadeContent duration={300} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-6xl w-full mx-auto">
        {SUGGESTIONS_CONFIG.SUGGESTIONS.map(suggestion => (
          <div
            key={suggestion.SUGGESTION_TITLE}
            onClick={() => handleSuggestionClick(suggestion.SUGGESTION_TITLE)}
            className="bg-background rounded-xl p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center mr-3">
                <suggestion.SUGGESTION_ICON className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-foreground font-medium">{suggestion.SUGGESTION_TITLE}</p>
          </div>
        ))}
      </div>
    </FadeContent>
  )
}
