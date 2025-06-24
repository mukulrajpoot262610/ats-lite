'use client'

import { NAV_CONFIG } from '@/constants/app-config'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Bot, Sparkles } from 'lucide-react'
import { Keyboard } from 'lucide-react'
import { cn, formatChatTime } from '@/lib/utils'
import { CommandDialog } from '../ui/command'
import { CommandInput } from '../ui/command'
import { CommandList } from '../ui/command'
import { CommandGroup } from '../ui/command'
import { CommandItem } from '../ui/command'
import { CommandSeparator } from '../ui/command'
import { CommandEmpty } from '../ui/command'
import { CommandShortcut } from '../ui/command'
import { useState } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function NavMain() {
  const { open } = useSidebar()
  const [openCommand, setOpenCommand] = useState(false)
  const { chats } = useChatStore()

  const hasEmptyChat = chats.some(chat => chat.messages.length === 0)

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
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span>New Chat</span>
              <CommandShortcut>
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span>⌘</span>
                  </kbd>
                  <span>+</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span>M</span>
                  </kbd>
                </div>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Keyboard className="w-4 h-4 text-muted-foreground" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span>⌘</span>
                  </kbd>
                  <span>+</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span>K</span>
                  </kbd>
                </div>
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Chats">
            {chats.length > 0 ? (
              chats.map(chat => (
                <CommandItem key={chat.id}>
                  <div className="flex items-center gap-2 flex-1 justify-between">
                    <span>{chat.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {chat.messages.length} messages • {formatChatTime(chat.createdAt)}
                    </span>
                  </div>
                </CommandItem>
              ))
            ) : (
              <CommandItem className="text-muted-foreground" disabled>
                No recent chats
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarMenu>
  )
}
