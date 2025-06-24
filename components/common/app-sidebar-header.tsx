'use client'

import { NAV_CONFIG } from '@/constants/app-config'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export function AppSidebarHeader() {
  const { open } = useSidebar()
  const [, setOpenCommand] = useState(false)
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
        <h1 className={cn(open ? 'block ' : 'hidden', 'text-sm font-semibold')}>
          ATS<span className={cn(open ? 'text-gray-500' : 'text-gray-500')}>Lite</span>
        </h1>
      </div>
      {NAV_CONFIG.NAV_DATA.map(item => (
        <SidebarMenuItem key={item.NAV_TITLE}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  isActive={item.NAV_IS_ACTIVE}
                  className={cn(
                    'p-4 h-10 gap-2 group text-xs cursor-pointer',
                    item.NAV_TITLE === 'New Chat' && hasEmptyChat && 'text-muted-foreground',
                  )}
                  onClick={() => handleItemClick(item)}
                  title={
                    item.NAV_TITLE === 'New Chat' && hasEmptyChat ? 'Will switch to existing empty chat' : undefined
                  }
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
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{item.NAV_TITLE}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
