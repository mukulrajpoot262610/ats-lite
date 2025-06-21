'use client'

import { NAV_MAIN } from '@/constants/nav'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Bot, Settings, Smile } from 'lucide-react'
import { Calculator } from 'lucide-react'
import { User } from 'lucide-react'
import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CommandDialog } from '../ui/command'
import { CommandInput } from '../ui/command'
import { CommandList } from '../ui/command'
import { CommandGroup } from '../ui/command'
import { CommandItem } from '../ui/command'
import { CommandSeparator } from '../ui/command'
import { CommandEmpty } from '../ui/command'
import { CommandShortcut } from '../ui/command'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { toast } from 'sonner'

export function NavMain() {
  const { open } = useSidebar()
  const [openCommand, setOpenCommand] = useState(false)
  const { createNewChat, chats } = useChatStore()

  // Check if there's an empty chat that exists
  const hasEmptyChat = chats.some(chat => chat.messages.length === 0)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenCommand(open => !open)
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleNewChat()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleNewChat = () => {
    // Check if there's already an empty chat before creating
    const existingEmptyChat = chats.find(chat => chat.messages.length === 0)

    if (existingEmptyChat) {
      // Show feedback that we're switching to existing empty chat
      toast.info('Switched to existing empty chat', {
        description: 'You already have an empty chat. Start typing to begin the conversation!',
        duration: 3000,
      })
    }

    createNewChat()
  }

  const handleItemClick = (item: (typeof NAV_MAIN)[0]) => {
    if (item.title === 'New Chat') {
      handleNewChat()
    } else if (item.hasCommand) {
      setOpenCommand(true)
    }
  }

  return (
    <SidebarMenu>
      <div className={cn(open ? 'p-4' : 'p-1 py-4', 'flex items-center gap-2 flex-1')}>
        <Bot className="w-6 h-6" />
        <h1 className={cn(open ? 'block' : 'hidden', 'text-sm font-semibold')}>
          ATS<span className={cn(open ? 'text-gray-500' : 'text-gray-500')}>Lite</span>
        </h1>
      </div>
      {NAV_MAIN.map(item => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            isActive={item.isActive}
            className={cn(
              'p-4 h-10 gap-2 group text-xs cursor-pointer',
              item.title === 'New Chat' && hasEmptyChat && 'text-muted-foreground',
            )}
            onClick={() => handleItemClick(item)}
            title={item.title === 'New Chat' && hasEmptyChat ? 'Will switch to existing empty chat' : undefined}
          >
            <div className="flex items-center gap-2 flex-1">
              <item.icon className="w-4 h-4" />
              <span className={cn(open ? 'block' : 'hidden')}>
                {item.title === 'New Chat' && hasEmptyChat ? 'Switch to Chat' : item.title}
              </span>
            </div>
            <kbd className={cn(open && 'visible', 'invisible')}>
              <span className="text-xs font-semibold text-muted-foreground">{item.shortcut}</span>
            </kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder="Type a command or search..." className="text-xs" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarMenu>
  )
}
