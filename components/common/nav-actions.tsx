'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModeToggle } from './theme-toggle'
import { toast } from 'sonner'
import { useChatStore } from '@/store/useChatStore'

export function NavActions() {
  const { chats, createNewChat } = useChatStore()

  const handleNewChat = () => {
    const existingEmptyChat = chats.find(chat => chat.messages.length === 0)

    if (existingEmptyChat) {
      toast.info('Switched to existing empty chat', {
        description: 'You already have an empty chat. Start typing to begin the conversation!',
        duration: 3000,
      })
    }

    createNewChat()
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <ModeToggle />
      <Button
        className="bg-primary text-primary-foreground rounded-full text-xs px-4 py-2 hover:bg-primary/80"
        onClick={handleNewChat}
      >
        <Sparkles /> New Chat
      </Button>
    </div>
  )
}
