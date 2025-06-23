'use client'

import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
import { Button } from '@/components/ui/button'
import { mcpService } from '@/lib/mcp-service'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/useChatStore'
import { SendIcon } from 'lucide-react'
import React from 'react'

export default function ChatInput() {
  const { message, setMessage, currentChatId, createNewChat, addMessage, messages, selectedModel } = useChatStore()

  const handleSend = async () => {
    if (!message.trim()) return

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

    // Clear input immediately for better UX
    setMessage('')

    try {
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
              placeholder="Ask ATSLite to find candidates... e.g. 'Find frontend engineers with React experience'"
              className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder-muted-foreground h-full"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center space-x-2">
              <span className={cn(message.length >= 990 && 'text-red-500', 'text-xs text-muted-foreground')}>
                {message.length}/1000
              </span>
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
