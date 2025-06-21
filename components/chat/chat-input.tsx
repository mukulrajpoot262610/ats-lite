'use client'

import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store'
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

  const handleSend = () => {
    if (message.trim() && !isThinking) {
      const userMessage = message.trim()

      // Ensure we have a current chat
      let chatId = currentChatId
      if (!chatId) {
        chatId = createNewChat()
      }

      // Add user message
      addMessage({
        text: userMessage,
        sender: 'user',
      })

      // Start the chat (legacy compatibility)
      setChatStarted(true)

      // Clear the input
      setMessage('')

      // Start thinking and record start time
      const startTime = Date.now()
      setThinkingStartTime(startTime)
      setIsThinking(true)

      // Generate thought process for this specific message
      const thoughtProcess = simulateThoughtProcess(userMessage)

      // Simulate AI thinking time and response (2-4 seconds)
      const thinkingDuration = Math.floor(Math.random() * 3) + 2 // 2-4 seconds

      setTimeout(() => {
        const endTime = Date.now()
        const actualDuration = Math.round((endTime - startTime) / 1000)

        // Stop thinking and add response with thinking data
        setIsThinking(false)
        setThinkingStartTime(null)

        addMessage({
          text: "Thanks for your message! I'm here to help you find the best candidates. I've analyzed your request and I'm ready to assist you with comprehensive candidate recommendations.",
          sender: 'assistant',
          thinking: {
            duration: actualDuration,
            content: thoughtProcess,
          },
        })
      }, thinkingDuration * 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center space-x-4 w-full">
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
              placeholder={isThinking ? 'AI is thinking...' : 'Ask ATSLite whatever you want...'}
              className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder-muted-foreground h-full"
              disabled={isThinking}
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center space-x-2">
              <span className={cn(message.length >= 990 && 'text-red-500', 'text-xs text-muted-foreground')}>
                {message.length}/1000
              </span>
            </div>
            <Button size="icon" onClick={handleSend} disabled={message.length === 0 || isThinking} className="gap-2">
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
