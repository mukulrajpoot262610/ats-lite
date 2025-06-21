'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export default function ChatThinking() {
  return (
    <div className="flex flex-col group items-start">
      <div className="w-full mb-8 justify-start flex flex-col items-start">
        <div className="flex items-center space-x-1 py-2">
          <span className="text-sm text-muted-foreground">Thinking</span>
          <div className="flex space-x-1">
            <div className={cn('w-2 h-2 bg-muted-foreground rounded-full animate-bounce', '[animation-delay:0ms]')} />
            <div className={cn('w-2 h-2 bg-muted-foreground rounded-full animate-bounce', '[animation-delay:150ms]')} />
            <div className={cn('w-2 h-2 bg-muted-foreground rounded-full animate-bounce', '[animation-delay:300ms]')} />
          </div>
        </div>
      </div>
    </div>
  )
}
