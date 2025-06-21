'use client'

import React from 'react'
import { Button } from '../ui/button'
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { toast } from 'sonner'

interface MessageActionsProps {
  messageId: string
  messageText: string
}

export default function MessageActions({ messageId, messageText }: MessageActionsProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText)
    toast.success('Copied to clipboard')
  }

  const handleThumbsUp = () => {
    console.log('Thumbs up:', messageId)
  }

  const handleThumbsDown = () => {
    console.log('Thumbs down:', messageId)
  }

  return (
    <div className="flex items-center justify-end mt-2">
      <Button variant="ghost" size="icon" className="rounded-xl p-0" onClick={handleCopy}>
        <CopyIcon className="w-2 h-2 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-xl p-0" onClick={handleThumbsUp}>
        <ThumbsUpIcon className="w-2 h-2 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-xl p-0" onClick={handleThumbsDown}>
        <ThumbsDownIcon className="w-2 h-2 text-muted-foreground" />
      </Button>
    </div>
  )
}
