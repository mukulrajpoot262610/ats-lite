import React from 'react'

import { SUGGESTIONS } from '@/constants/suggestions'

export default function ChatSuggestions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-6xl w-full">
      {SUGGESTIONS.map(suggestion => (
        <div
          key={suggestion.title}
          className="bg-background rounded-xl p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center mr-3">
              <suggestion.icon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm text-foreground font-medium">{suggestion.title}</p>
        </div>
      ))}
    </div>
  )
}
