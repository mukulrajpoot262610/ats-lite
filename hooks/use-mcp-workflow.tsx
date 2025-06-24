import { useCallback } from 'react'
import { MCPService } from '@/lib/mcp-service'
import { useChatStore } from '@/store/useChatStore'
import { useMCPStore } from '@/store/useMcpStore'
import { generateUniqueId } from '@/lib/utils'

export function useMCPWorkflow() {
  const { currentChatId, createNewChat, addMessage, getCurrentMessages, selectedModel, updateMessage } = useChatStore()
  const { setPhase, setPlan, setFiltered, setRanked, setReply } = useMCPStore()

  const executeWorkflow = useCallback(
    async (messageText: string, mcpService: MCPService) => {
      if (!messageText.trim() || !mcpService) return

      let chatId = currentChatId
      if (!chatId) {
        chatId = createNewChat()
      }

      // Add the user message
      const userMessage = {
        text: messageText.trim(),
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
          text: messageText.trim(),
          sender: 'user' as const,
          timestamp: new Date(),
        }
        const allMessages = [...getCurrentMessages(), newMessage]

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
    },
    [
      currentChatId,
      createNewChat,
      addMessage,
      getCurrentMessages,
      selectedModel,
      updateMessage,
      setPhase,
      setPlan,
      setFiltered,
      setRanked,
      setReply,
    ],
  )

  return { executeWorkflow }
}
