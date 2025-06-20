'use client'
import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SendIcon } from 'lucide-react'
import React, { useState } from 'react'

export default function ChatInput() {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    console.log(message)
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="bg-background rounded-xl border border-border w-full p-4">
          <div className="flex items-center justify-between h-full">
            <AutosizeTextarea
              value={message}
              maxLength={1000}
              minHeight={20}
              onChange={e => setMessage(e.target.value)}
              maxHeight={300}
              placeholder="🪄 Ask ATSLite whatever you want..."
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
