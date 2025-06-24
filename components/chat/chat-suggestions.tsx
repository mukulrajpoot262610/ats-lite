'use client'

import React, { useEffect, useState } from 'react'
import FadeContent from '@/components/animations/fade-content'
import { SUGGESTIONS_CONFIG } from '@/constants/app-config'
import { MCPService } from '@/lib/mcp-service'
import { useMCPStore } from '@/store/useMcpStore'
import { useChatStore } from '@/store/useChatStore'
import { loadCandidates } from '@/lib/csv-service'
import { generateUniqueId } from '@/lib/utils'

export default function ChatSuggestions() {
  const { setMessage, currentChatId, createNewChat, addMessage, messages, selectedModel, updateMessage } =
    useChatStore()
  const { setPhase, setPlan, setFiltered, setRanked, setReply } = useMCPStore()
  const [mcpService, setMcpService] = useState<MCPService | null>(null)

  useEffect(() => {
    const initializeCandidates = async () => {
      try {
        const candidates = await loadCandidates()
        // Create MCP service with loaded candidates
        const service = new MCPService(candidates)
        setMcpService(service)
      } catch (error) {
        console.error('Failed to load candidates for MCP service:', error)
      }
    }
    initializeCandidates()
  }, [])

  const handleSuggestionClick = async (suggestionTitle: string) => {
    if (!suggestionTitle.trim() || !mcpService) return

    let chatId = currentChatId
    if (!chatId) {
      chatId = createNewChat()
    }

    // Add the user message
    const userMessage = {
      text: suggestionTitle.trim(),
      sender: 'user' as const,
    }
    addMessage(userMessage)

    // Add thinking message
    const thinkingId = generateUniqueId('thinking')
    addMessage({
      id: thinkingId,
      text: '',
      sender: 'thinking' as const,
      isComplete: false,
    })

    // Clear input immediately for better UX
    setMessage('')

    // Reset MCP state
    setPhase('thinking')
    setPlan(null)
    setFiltered([])
    setRanked([])
    setReply('')

    try {
      // Create proper ChatMessage object for the new message
      const newMessage = {
        id: generateUniqueId('msg'),
        text: suggestionTitle.trim(),
        sender: 'user' as const,
        timestamp: new Date(),
      }
      const allMessages = [...messages, newMessage]

      // Execute MCP workflow with step-by-step updates
      const result = await mcpService.executeLoopWithSteps(allMessages, step => {
        console.log('🔍 MCP Step:', step)

        switch (step.step) {
          case 'think':
            setPhase('thinking')
            setPlan(step.data)
            // Update thinking message with current state
            if (thinkingId) {
              const { filtered, ranked, reply } = useMCPStore.getState()
              updateMessage(thinkingId, {
                text: '',
                sender: 'thinking' as const,
                isComplete: false,
                data: {
                  thinkingData: {
                    phase: 'thinking',
                    plan: step.data,
                    filtered,
                    ranked,
                    reply,
                  },
                },
              })
            }
            break
          case 'filter':
            setPhase('filtering')
            setFiltered(step.data)
            // Update thinking message with current state
            if (thinkingId) {
              const { plan, ranked, reply } = useMCPStore.getState()
              updateMessage(thinkingId, {
                text: '',
                sender: 'thinking' as const,
                isComplete: false,
                data: {
                  thinkingData: {
                    phase: 'filtering',
                    plan,
                    filtered: step.data,
                    ranked,
                    reply,
                  },
                },
              })
            }
            // Check if no candidates found and handle early exit
            if (step.data.length === 0) {
              setPhase('idle')
              // Mark thinking as complete with final data
              if (thinkingId) {
                const { plan, reply } = useMCPStore.getState()
                updateMessage(thinkingId, {
                  text: '',
                  sender: 'thinking' as const,
                  isComplete: true,
                  data: {
                    thinkingData: {
                      phase: 'idle',
                      plan,
                      filtered: step.data,
                      ranked: [],
                      reply,
                    },
                  },
                })
              }
              return
            }
            break
          case 'rank':
            setPhase('ranking')
            setRanked(step.data)
            // Update thinking message with current state
            if (thinkingId) {
              const { plan, filtered, reply } = useMCPStore.getState()
              updateMessage(thinkingId, {
                text: '',
                sender: 'thinking' as const,
                isComplete: false,
                data: {
                  thinkingData: {
                    phase: 'ranking',
                    plan,
                    filtered,
                    ranked: step.data,
                    reply,
                  },
                },
              })
            }
            break
          case 'speak':
            setPhase('speaking')
            setReply(step.data)
            // Update thinking message with current state
            if (thinkingId) {
              const { plan, filtered, ranked } = useMCPStore.getState()
              updateMessage(thinkingId, {
                text: '',
                sender: 'thinking' as const,
                isComplete: false,
                data: {
                  thinkingData: {
                    phase: 'speaking',
                    plan,
                    filtered,
                    ranked,
                    reply: step.data,
                  },
                },
              })
            }
            break
        }
      })

      // Mark thinking as complete with final state
      if (thinkingId) {
        const { plan, filtered, ranked, reply } = useMCPStore.getState()
        updateMessage(thinkingId, {
          text: '',
          sender: 'thinking' as const,
          isComplete: true,
          data: {
            thinkingData: {
              phase: 'idle',
              plan,
              filtered,
              ranked,
              reply,
            },
          },
        })
      }
      setPhase('idle')

      // Add candidate results message if we have results
      const { ranked } = useMCPStore.getState()
      if (ranked && ranked.length > 0) {
        addMessage({
          text: '',
          sender: 'system',
          data: {
            type: 'candidate-results',
            candidates: ranked,
          },
        })
      }

      // Add the final response
      addMessage({
        text: result,
        sender: 'assistant',
        model: selectedModel.name,
      })
    } catch (error) {
      console.error('Error executing MCP workflow:', error)
      setPhase('idle')

      addMessage({
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
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
