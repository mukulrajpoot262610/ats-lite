'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { ChevronDownIcon, BrainIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamingThinkingProps {
  content: string
  isActive: boolean
  duration?: number
}

export default function StreamingThinking({ content, isActive, duration }: StreamingThinkingProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content && !isActive) return null

  return (
    <div className="mb-4 border rounded-lg bg-muted/50">
      <Button
        variant="ghost"
        className="w-full justify-between p-3 h-auto font-normal"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <BrainIcon className="h-4 w-4" />
          <span className="text-sm">
            {isActive ? (
              <span className="flex items-center gap-2">
                Thinking...
                <span className="flex space-x-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </span>
              </span>
            ) : (
              `Thought for ${duration || Math.ceil(content.length / 100)}s`
            )}
          </span>
        </div>
        <ChevronDownIcon className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
      </Button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="text-xs text-muted-foreground bg-background rounded-md p-3 border">
            {content ? (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {content}
                {isActive && <span className="animate-pulse">|</span>}
              </pre>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                Processing thoughts...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
