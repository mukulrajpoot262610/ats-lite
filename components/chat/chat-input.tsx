'use client'

import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
import { Button } from '@/components/ui/button'
import { MCPService } from '@/lib/mcp-service'
import { cn, generateUniqueId } from '@/lib/utils'
import { useChatStore } from '@/store/useChatStore'
import { useMCPStore } from '@/store/useMcpStore'
import { loadCandidates } from '@/lib/csv-service'
import { SendIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export default function ChatInput() {
  const { message, setMessage, currentChatId, createNewChat, addMessage, messages, selectedModel, updateMessage } =
    useChatStore()
  const { setPhase, setPlan, setFiltered, setRanked, setReply } = useMCPStore()
  const [mcpService, setMcpService] = React.useState<MCPService | null>(null)

  // Load candidates and create MCP service on mount
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

  // Use the keyboard shortcuts hook for chat shortcuts
  useKeyboardShortcuts({
    onSendMessage: () => {
      // Only trigger if we have content and service
      if (message.trim() && mcpService) {
        handleSend()
      }
    },
  })

  const handleSend = async () => {
    if (!message.trim() || !mcpService) return

    let chatId = currentChatId
    if (!chatId) {
      chatId = createNewChat()
    }

    // Add the user message
    const userMessage = {
      text: message.trim(),
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
        text: message.trim(),
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const isEnterWithoutShift = e.key === 'Enter' && !e.shiftKey
    const isCmdEnter = e.key === 'Enter' && (e.metaKey || e.ctrlKey)

    if (isEnterWithoutShift || isCmdEnter) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center space-x-4 w-full mb-4">
      <div className="flex-1 max-w-4xl mx-auto">
        <div className="bg-background rounded-xl border border-border w-full p-4">
          <div className="flex items-center justify-between h-full relative">
            <AutosizeTextarea
              value={message}
              maxLength={1000}
              minHeight={20}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              maxHeight={300}
              placeholder="Ask ATS-Lite to find candidates... e.g. 'Backend engineers in Germany, most experience first'"
              className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder-muted-foreground h-full"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center space-x-2">
              <span className={cn(message.length >= 990 && 'text-red-500', 'text-xs text-muted-foreground')}>
                {message.length}/1000
              </span>
              <span className="text-xs text-muted-foreground">Press ⌘+Enter to send</span>
            </div>
            <Button size="icon" onClick={handleSend} disabled={message.length === 0} className="gap-2">
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
