'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { NAV_CONFIG } from '@/constants/app-config'
import { cn } from '@/lib/utils'

export function NavUser() {
  const { open } = useSidebar()

  return (
    <SidebarMenu className={cn(open ? 'p-4' : 'p-2 py-4', '')}>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={NAV_CONFIG.DEFAULT_USER_AVATAR} alt={NAV_CONFIG.DEFAULT_USER_NAME} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{NAV_CONFIG.DEFAULT_USER_NAME}</span>
            <span className="text-muted-foreground truncate text-xs">{NAV_CONFIG.DEFAULT_USER_EMAIL}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
