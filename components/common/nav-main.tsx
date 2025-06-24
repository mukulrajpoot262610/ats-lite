'use client'

import { NAV_CONFIG } from '@/constants/app-config'
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
import { useChatStore } from '@/store/useChatStore'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function NavMain() {
  const { open } = useSidebar()
  const [openCommand, setOpenCommand] = useState(false)
  const { chats } = useChatStore()

  // Check if there's an empty chat that exists
  const hasEmptyChat = chats.some(chat => chat.messages.length === 0)

  // Use the keyboard shortcuts hook
  const { handleNewChat } = useKeyboardShortcuts({
    onOpenCommandPalette: () => setOpenCommand(true),
  })

  const handleItemClick = (item: (typeof NAV_CONFIG.NAV_DATA)[number]) => {
    if (item.NAV_TITLE === 'New Chat') {
      handleNewChat()
    } else if (item.NAV_HAS_COMMAND) {
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
      {NAV_CONFIG.NAV_DATA.map(item => (
        <SidebarMenuItem key={item.NAV_TITLE}>
          <SidebarMenuButton
            isActive={item.NAV_IS_ACTIVE}
            className={cn(
              'p-4 h-10 gap-2 group text-xs cursor-pointer',
              item.NAV_TITLE === 'New Chat' && hasEmptyChat && 'text-muted-foreground',
            )}
            onClick={() => handleItemClick(item)}
            title={item.NAV_TITLE === 'New Chat' && hasEmptyChat ? 'Will switch to existing empty chat' : undefined}
          >
            <div className="flex items-center gap-2 flex-1">
              <item.NAV_ICON className="w-4 h-4" />
              <span className={cn(open ? 'block' : 'hidden')}>
                {item.NAV_TITLE === 'New Chat' && hasEmptyChat ? 'Switch to Chat' : item.NAV_TITLE}
              </span>
            </div>
            <kbd>
              <span className="text-xs font-semibold text-muted-foreground">{item.NAV_SHORTCUT}</span>
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
