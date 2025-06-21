'use client'

import React from 'react'
import { useChatStore } from '@/store/useChatStore'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import FadeContent from '@/components/animations/fade-content'
import ChatThinking from './chat-thinking'
import ThinkingDropdown from './thinking-dropdown'

export default function ChatMessages() {
  const { messages, isThinking, isStreaming, streamingContent, streamingMessageId } = useChatStore()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  const handleThumbsUp = (messageId: string) => {
    console.log(messageId)
  }
  const handleThumbsDown = (messageId: string) => {
    console.log(messageId)
  }

  return (
    <FadeContent duration={300} className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col space-y-3 w-full max-w-4xl p-4 mt-20">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn('flex flex-col group', message.sender === 'user' ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'rounded-xl ',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-xl px-4 max-w-[60%] py-3'
                    : 'w-full mb-8 justify-start flex flex-col items-start',
                )}
              >
                <p className="text-lg">
                  {message.id === streamingMessageId && isStreaming ? streamingContent : message.text}
                  {message.id === streamingMessageId && isStreaming && <span className="animate-pulse">|</span>}
                </p>

                {/* Show model info for assistant messages */}
                {message.sender === 'assistant' && message.model && (
                  <div className="mt-1 mb-1">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{message.model}</span>
                  </div>
                )}

                {/* Show thinking dropdown for assistant messages with thinking data */}
                {message.sender === 'assistant' && message.thinking && (
                  <ThinkingDropdown duration={message.thinking.duration} content={message.thinking.content} />
                )}

                {message.sender === 'assistant' && (
                  <div className="flex items-center justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl p-0"
                      onClick={() => handleCopy(message.text)}
                    >
                      <CopyIcon className="w-2 h-2 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl p-0"
                      onClick={() => handleThumbsUp(message.id)}
                    >
                      <ThumbsUpIcon className="w-2 h-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">1</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl p-0"
                      onClick={() => handleThumbsDown(message.id)}
                    >
                      <ThumbsDownIcon className="w-2 h-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">1</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isThinking && <ChatThinking />}
        </div>
      </ScrollArea>
    </FadeContent>
  )
}
