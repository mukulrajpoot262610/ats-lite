'use client'

import React from 'react'
import FadeContent from '@/components/animations/fade-content'

export default function ChatGreetings() {
  return (
    <FadeContent duration={300} className="w-full">
      <div className="text-left mb-8 w-full tracking-tighter leading-snug">
        <h1 className="text-5xl font-semibold text-foreground">Hi there, John</h1>
        <h2 className="text-5xl font-semibold text-muted-foreground">Let&apos;s find top candidates.</h2>
        <p className="text-muted-foreground mt-4 text-lg max-w-sm leading-tight text-balance text-left">
          Use one of the most common prompts below or use your own to begin
        </p>
      </div>
    </FadeContent>
  )
}
