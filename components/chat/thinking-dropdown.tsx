'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, BrainIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ThinkingDropdownProps {
  duration: number
  content: string[]
  rawThinking?: string
}

export default function ThinkingDropdown({ duration, content, rawThinking }: ThinkingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mt-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-between w-full h-auto p-2 text-xs text-muted-foreground hover:text-foreground rounded-md border border-border/50 hover:border-border"
        >
          <div className="flex items-center space-x-2">
            <BrainIcon className="w-3 h-3" />
            <span>Thought for {duration}s</span>
          </div>
          {isOpen ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="bg-muted/30 rounded-md p-3 border border-border/30">
          <div className="text-xs font-medium text-muted-foreground mb-2">Thinking Process ({duration}s):</div>

          {rawThinking ? (
            <div className="text-xs text-muted-foreground">
              <pre className="whitespace-pre-wrap font-mono leading-relaxed bg-background rounded-md p-2 border">
                {rawThinking}
              </pre>
            </div>
          ) : (
            <div className="space-y-2">
              {content.map((thought, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{thought}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
