'use client'
import { AutosizeTextarea } from '@/components/ui/autosize-textarea'
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
        <div className="bg-gray-50 rounded-xl border border-gray-200 w-full p-4">
          <div className="flex items-center justify-between h-full">
            <AutosizeTextarea
              value={message}
              maxLength={1000}
              minHeight={20}
              onChange={e => setMessage(e.target.value)}
              maxHeight={300}
              placeholder="Ask whatever you want..."
              className="w-full bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-500 h-full"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center space-x-2">
              <span className={cn(message.length >= 990 && 'text-red-500', 'text-xs text-muted-foreground')}>
                {message.length}/1000
              </span>
            </div>
            <button
              onClick={handleSend}
              disabled={message.length === 0}
              className="bg-gray-50 rounded-xl border border-gray-200 p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
