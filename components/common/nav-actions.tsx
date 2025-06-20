'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModeToggle } from './theme-toggle'

export function NavActions() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <ModeToggle />
      <Button className="bg-primary text-primary-foreground rounded-full text-xs px-4 py-2 hover:bg-primary/80">
        <Sparkles /> New Chat
      </Button>
    </div>
  )
}
