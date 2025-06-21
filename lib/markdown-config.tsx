import React, { ReactNode } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownProps {
  children?: ReactNode
  className?: string
}

interface CodeProps extends MarkdownProps {
  [key: string]: unknown
}

export const markdownComponents = {
  p: ({ children }: MarkdownProps) => <p className="mb-3 leading-relaxed">{children}</p>,
  h1: ({ children }: MarkdownProps) => <h1 className="text-xl font-bold mb-4 text-foreground">{children}</h1>,
  h2: ({ children }: MarkdownProps) => <h2 className="text-lg font-semibold mb-3 text-foreground">{children}</h2>,
  h3: ({ children }: MarkdownProps) => <h3 className="text-base font-semibold mb-2 text-foreground">{children}</h3>,
  h4: ({ children }: MarkdownProps) => <h4 className="text-sm font-semibold mb-2 text-foreground">{children}</h4>,
  ul: ({ children }: MarkdownProps) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }: MarkdownProps) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
  li: ({ children }: MarkdownProps) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }: MarkdownProps) => (
    <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: CodeProps) => {
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
  pre: ({ children }: MarkdownProps) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3 text-xs">{children}</pre>
  ),
  table: ({ children }: MarkdownProps) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full border-collapse border border-border">{children}</table>
    </div>
  ),
  thead: ({ children }: MarkdownProps) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }: MarkdownProps) => <tbody>{children}</tbody>,
  tr: ({ children }: MarkdownProps) => <tr className="border-b border-border">{children}</tr>,
  th: ({ children }: MarkdownProps) => (
    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }: MarkdownProps) => <td className="border border-border px-3 py-2 text-foreground">{children}</td>,
  hr: () => <hr className="my-4 border-border" />,
  strong: ({ children }: MarkdownProps) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }: MarkdownProps) => <em className="italic">{children}</em>,
}
