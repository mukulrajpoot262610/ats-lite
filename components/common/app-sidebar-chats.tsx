'use client'

import { MoreHorizontal, Trash2, MessageSquare } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useChatStore } from '@/store/useChatStore'
import { cn, formatChatTime } from '@/lib/utils'
import { toast } from 'sonner'

const AppSidebarChats = () => {
  const { isMobile, open } = useSidebar()
  const { chats, currentChatId, switchToChat, deleteChat } = useChatStore()

  const handleChatClick = (chatId: string) => {
    switchToChat(chatId)
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
    toast.success('Chat deleted')
  }

  return (
    <SidebarGroup className="p-4">
      <SidebarGroupLabel className={cn('text-sm', !open && 'sr-only')}>Recent Chats</SidebarGroupLabel>
      <SidebarMenu>
        {chats.length === 0 ? (
          <div className={cn('px-2 py-4 text-xs text-muted-foreground text-center', !open && 'hidden')}>
            No chats yet. Start a new conversation!
          </div>
        ) : (
          chats.map(chat => (
            <SidebarMenuItem key={chat.id} className="flex items-center gap-2">
              <SidebarMenuButton
                className={cn(
                  'text-xs py-2 px-2 h-auto cursor-pointer hover:bg-accent/50 transition-colors',
                  currentChatId === chat.id && 'bg-accent',
                  !open && 'justify-center',
                )}
                onClick={() => handleChatClick(chat.id)}
                title={open ? undefined : chat.title}
              >
                <div className={cn('flex items-center gap-2 w-full min-w-0', !open && 'justify-center')}>
                  <MessageSquare className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                  {open && (
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-medium truncate" title={chat.title}>
                        {chat.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{chat.messages.length} messages</span>
                        <span>•</span>
                        <span>{formatChatTime(chat.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </SidebarMenuButton>
              {open && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align={isMobile ? 'end' : 'start'}
                  >
                    <DropdownMenuItem
                      className="text-xs p-3 text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={e => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="text-red-500 w-4 h-4" />
                      <span>Delete Chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
export default AppSidebarChats
