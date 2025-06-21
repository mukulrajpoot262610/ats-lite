'use client'

import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/useChatStore'
import { SendIcon } from 'lucide-react'
import React from 'react'

export default function ChatInput() {
  const {
    message,
    setMessage,
    addMessage,
    setChatStarted,
    setIsThinking,
    isThinking,
    setThinkingStartTime,
    currentChatId,
    createNewChat,
    selectedModel,
    isStreaming,
    setIsStreaming,
    setStreamingMessageId,
    setStreamingContent,
    setStreamingThinking,
    setIsStreamingThinking,
    isStreamingThinking,
    finalizeStreamingMessage,
  } = useChatStore()

  const simulateThoughtProcess = (userMessage: string): string[] => {
    const thoughtPatterns = [
      `Analyzing user's query: "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}"`,
      'Considering the context of candidate recruitment and ATS functionality',
      'Searching through available candidate database and matching criteria',
      'Evaluating the best approach to provide comprehensive assistance',
      'Generating personalized response based on user requirements',
      'Finalizing response to ensure accuracy and helpfulness',
    ]

    // Return 3-4 random thought steps
    const shuffled = thoughtPatterns.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 3)
  }

  const parseStreamingContent = (content: string) => {
    // Check if content contains thinking tags
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g
    const matches = content.match(thinkRegex)

    if (matches) {
      // Extract thinking content
      const thinkingContent = matches.map(match => match.replace(/<\/?think>/g, '')).join('')

      // Extract response content (everything after the last </think> tag)
      const lastThinkEndIndex = content.lastIndexOf('</think>')
      const responseContent = lastThinkEndIndex >= 0 ? content.substring(lastThinkEndIndex + 8).trim() : content

      return {
        hasThinking: true,
        thinking: thinkingContent,
        response: responseContent,
        isThinkingComplete: content.includes('</think>'),
      }
    }

    return {
      hasThinking: false,
      thinking: '',
      response: content,
      isThinkingComplete: false,
    }
  }

  const handleSend = async () => {
    if (message.trim() && !isThinking && !isStreaming) {
      const userMessage = message.trim()

      let chatId = currentChatId
      if (!chatId) {
        chatId = createNewChat()
      }

      // Add user message
      addMessage({
        text: userMessage,
        sender: 'user',
      })

      setChatStarted(true)
      setMessage('')

      const startTime = Date.now()
      setThinkingStartTime(startTime)
      setIsThinking(true)

      const thoughtProcess = simulateThoughtProcess(userMessage)

      try {
        // Get current messages for context (give a small delay to ensure user message is in state)
        await new Promise(resolve => setTimeout(resolve, 100))
        const { messages: currentMessages } = useChatStore.getState()

        console.log('Current messages for context:', currentMessages.length)

        // Convert to OpenAI format
        const openAIMessages = currentMessages.map(msg => ({
          role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.text,
        }))

        // Determine API endpoint and streaming support based on selected model
        const apiEndpoint = selectedModel.provider === 'ollama' ? '/api/ollama' : '/api/think'
        const supportsStreaming = true // Both ollama and openai now support streaming

        if (supportsStreaming) {
          // Handle streaming response for both Ollama and OpenAI
          const requestBody =
            selectedModel.provider === 'ollama'
              ? {
                  messages: openAIMessages,
                  model: selectedModel.model,
                  stream: true,
                }
              : {
                  messages: openAIMessages,
                  stream: true,
                }

          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }

          // Stop thinking and start streaming
          setIsThinking(false)
          setThinkingStartTime(null)
          setIsStreaming(true)
          setStreamingContent('')
          setStreamingThinking('')
          setIsStreamingThinking(false)

          // Add initial empty message for streaming
          const streamingId = Date.now().toString()
          setStreamingMessageId(streamingId)

          addMessage({
            id: streamingId,
            text: '',
            sender: 'assistant',
            model: selectedModel.name,
            thinking: {
              duration: Math.round((Date.now() - startTime) / 1000),
              content: thoughtProcess,
            },
          })

          // Small delay to ensure message is added before we start streaming
          await new Promise(resolve => setTimeout(resolve, 100))

          // Process streaming response
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let accumulatedContent = ''

          if (reader) {
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6))
                      if (data.content) {
                        accumulatedContent += data.content

                        // Parse the accumulated content for thinking tags
                        const parsed = parseStreamingContent(accumulatedContent)

                        if (parsed.hasThinking && parsed.thinking) {
                          if (!isStreamingThinking) {
                            setIsStreamingThinking(true)
                          }
                          setStreamingThinking(parsed.thinking)
                        }

                        if (parsed.isThinkingComplete && isStreamingThinking) {
                          setIsStreamingThinking(false)
                        }

                        // Update the response content
                        setStreamingContent(parsed.response)
                      }
                      if (data.done) {
                        finalizeStreamingMessage()
                        return
                      }
                    } catch (parseError) {
                      console.error('Error parsing streaming data:', parseError)
                    }
                  }
                }
              }
            } catch (streamError) {
              console.error('Streaming error:', streamError)
            } finally {
              finalizeStreamingMessage()
            }
          }
        }

        console.log('Messages after adding AI response:', useChatStore.getState().messages.length)
      } catch (error) {
        console.error('Error calling think API:', error)

        const endTime = Date.now()
        const actualDuration = Math.round((endTime - startTime) / 1000)

        setIsThinking(false)
        setThinkingStartTime(null)

        addMessage({
          text: 'I apologize, but I encountered an error while processing your request. Please try again or check your connection.',
          sender: 'assistant',
          model: selectedModel.name,
          thinking: {
            duration: actualDuration,
            content: ['Error occurred while processing request'],
          },
        })
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
              placeholder={
                isThinking
                  ? 'AI is thinking...'
                  : isStreaming
                  ? 'AI is responding...'
                  : 'Ask ATSLite whatever you want...'
              }
              className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder-muted-foreground h-full"
              disabled={isThinking || isStreaming}
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center space-x-2">
              <span className={cn(message.length >= 990 && 'text-red-500', 'text-xs text-muted-foreground')}>
                {message.length}/1000
              </span>
            </div>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={message.length === 0 || isThinking || isStreaming}
              className="gap-2"
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
