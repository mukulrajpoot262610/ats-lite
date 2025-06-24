'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ChatMessage } from '@/types/chat.types'

interface MessageActionsProps {
  message: ChatMessage
}

export default function MessageActions({ message }: MessageActionsProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isThumbsUp, setIsThumbsUp] = useState(false)
  const [isThumbsDown, setIsThumbsDown] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    toast.success('Copied to clipboard')
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const handleThumbsUp = () => {
    setIsThumbsUp(true)
    setIsThumbsDown(false)
  }

  const handleThumbsDown = () => {
    setIsThumbsDown(true)
    setIsThumbsUp(false)
  }

  const MESSAGE_ACTIONS: {
    id: string
    icon: React.ElementType
    tooltip: string
    onClick: () => void
    isActive?: boolean
    className?: string
  }[] = [
    {
      id: 'copy',
      icon: isCopied ? CopyIcon : CopyIcon,
      tooltip: isCopied ? 'Copied!' : 'Copy to clipboard',
      isActive: isCopied,
      onClick: handleCopy,
      className: 'text-green-500 hover:text-green-500',
    },
    {
      id: 'thumbs-up',
      icon: ThumbsUpIcon,
      tooltip: 'Thumbs up',
      onClick: handleThumbsUp,
      isActive: isThumbsUp,
      className: 'text-green-500 hover:text-green-500',
    },
    {
      id: 'thumbs-down',
      icon: ThumbsDownIcon,
      tooltip: 'Thumbs down',
      onClick: handleThumbsDown,
      isActive: isThumbsDown,
      className: 'text-red-500 hover:text-red-500',
    },
  ]

  return (
    <div className="flex items-center justify-end mt-2">
      {MESSAGE_ACTIONS.map(action => (
        <Tooltip key={action.id}>
          <TooltipTrigger asChild>
            <Button
              variant={action.isActive ? 'outline' : 'ghost'}
              size="icon"
              className={`rounded-xl p-0 ${action.isActive ? action.className : ''}`}
              onClick={action.onClick}
            >
              <action.icon className="w-2 h-2" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{action.tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
