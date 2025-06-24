'use client'

import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/useChatStore'
import { useMCPService } from '@/hooks/use-mcp-service'
import { useMCPWorkflow } from '@/hooks/use-mcp-workflow'
import { SendIcon } from 'lucide-react'
import React from 'react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

const ChatInput = () => {
  const { message, setMessage } = useChatStore()
  const { mcpService, error } = useMCPService()
  const { executeWorkflow } = useMCPWorkflow()

  useKeyboardShortcuts({
    onSendMessage: () => {
      if (message.trim() && mcpService) {
        handleSend()
      }
    },
  })

  const handleSend = async () => {
    if (!message.trim() || !mcpService) return
    const messageText = message.trim()
    setMessage('')
    await executeWorkflow(messageText, mcpService)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const isEnterWithoutShift = e.key === 'Enter' && !e.shiftKey
    const isCmdEnter = e.key === 'Enter' && (e.metaKey || e.ctrlKey)

    if (isEnterWithoutShift || isCmdEnter) {
      e.preventDefault()
      handleSend()
    }
  }

  if (error) {
    console.error('Error loading MCP service:', error)
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
export default ChatInput
