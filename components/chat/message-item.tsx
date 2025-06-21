'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/types/chat.types'
import MessageActions from './message-actions'
import ThinkingDropdown from './thinking-dropdown'
import StreamingThinking from './streaming-thinking'
import Markdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { markdownComponents } from '@/lib/markdown-config'

interface MessageItemProps {
  message: ChatMessage
  isStreaming: boolean
  streamingMessageId: string | null
  streamingContent: string
  streamingThinking: string
  isStreamingThinking: boolean
}

export default function MessageItem({
  message,
  isStreaming,
  streamingMessageId,
  streamingContent,
  streamingThinking,
  isStreamingThinking,
}: MessageItemProps) {
  const isCurrentlyStreaming = message.id === streamingMessageId && isStreaming
  const isShowingStreamingThinking =
    message.sender === 'assistant' && message.id === streamingMessageId && (streamingThinking || isStreamingThinking)

  const isShowingThinkingDropdown =
    message.sender === 'assistant' &&
    message.thinking &&
    !(message.id === streamingMessageId && (streamingThinking || isStreamingThinking))

  return (
    <div className={cn('flex flex-col group', message.sender === 'user' ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'rounded-xl',
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground rounded-xl px-4 max-w-[60%] py-3'
            : 'w-full mb-8 justify-start flex flex-col items-start',
        )}
      >
        <div className="flex items-start">
          <div className="text-sm tracking-normal leading-relaxed flex-1 prose prose-sm max-w-none dark:prose-invert">
            <Markdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents as unknown as Components}
            >
              {isCurrentlyStreaming ? streamingContent : message.text}
            </Markdown>
          </div>
          {isCurrentlyStreaming && <span className="animate-pulse text-sm ml-1">|</span>}
        </div>

        {/* Streaming thinking component */}
        {isShowingStreamingThinking && (
          <StreamingThinking
            content={streamingThinking}
            isActive={isStreamingThinking}
            duration={message.thinking?.duration}
          />
        )}

        {/* Model info */}
        {message.sender === 'assistant' && message.model && (
          <div className="mt-1 mb-1">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{message.model}</span>
          </div>
        )}

        {/* Thinking dropdown */}
        {isShowingThinkingDropdown && message.thinking && (
          <ThinkingDropdown
            duration={message.thinking.duration}
            content={message.thinking.content}
            rawThinking={message.thinking.rawThinking}
          />
        )}

        {/* Message actions */}
        {message.sender === 'assistant' && <MessageActions messageId={message.id} messageText={message.text} />}
      </div>
    </div>
  )
}
