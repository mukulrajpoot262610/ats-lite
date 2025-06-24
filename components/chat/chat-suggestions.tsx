'use client'

import React from 'react'
import FadeContent from '@/components/animations/fade-content'
import { SUGGESTIONS_CONFIG } from '@/constants/app-config'
import { useMCPService } from '@/hooks/use-mcp-service'
import { useMCPWorkflow } from '@/hooks/use-mcp-workflow'
import { useChatStore } from '@/store/useChatStore'

const ChatSuggestions = () => {
  const { setMessage } = useChatStore()
  const { mcpService, error } = useMCPService()
  const { executeWorkflow } = useMCPWorkflow()

  const handleSuggestionClick = async (suggestionTitle: string) => {
    if (!suggestionTitle.trim() || !mcpService) return
    setMessage('')
    await executeWorkflow(suggestionTitle, mcpService)
  }

  if (error) {
    console.error('Error loading MCP service:', error)
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
export default ChatSuggestions
