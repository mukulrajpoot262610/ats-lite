'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/types/chat.types'
import MessageActions from './message-actions'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageItemProps {
  message: ChatMessage
}

export default function MessageItem({ message }: MessageItemProps) {
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
              components={{
                p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                h1: ({ children }) => <h1 className="text-5xl font-bold mb-4 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-4xl font-semibold mb-4 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-3xl font-semibold mb-4 text-foreground">{children}</h3>,
                h4: ({ children }) => <h4 className="text-xl font-semibold mb-2 text-foreground">{children}</h4>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-3 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''

                  return match ? (
                    <SyntaxHighlighter
                      language={language}
                      style={oneDark}
                      customStyle={{
                        backgroundColor: 'transparent',
                        margin: '0',
                        padding: '0',
                        borderRadius: '0',
                      }}
                      wrapLongLines
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3 text-xs">{children}</pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-3">
                    <table className="min-w-full border-collapse border border-border">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                th: ({ children }) => (
                  <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>
                ),
                td: ({ children }) => <td className="border border-border px-3 py-2 text-foreground">{children}</td>,
                hr: () => <hr className="my-4 border-border" />,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {message.text}
            </Markdown>
          </div>
        </div>

        {/* Model info */}
        {message.sender === 'assistant' && message.model && (
          <div className="mt-1 mb-1">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{message.model}</span>
          </div>
        )}

        {/* Message actions */}
        {message.sender === 'assistant' && <MessageActions messageId={message.id} messageText={message.text} />}
      </div>
    </div>
  )
}
