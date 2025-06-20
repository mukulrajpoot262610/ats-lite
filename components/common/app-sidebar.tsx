import * as React from 'react'

import { NavChats } from '@/components/common/nav-chats'
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { Separator } from '../ui/separator'
import { NAV_DATA } from '@/constants/nav'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props} collapsible="icon">
      <SidebarHeader>
        <NavMain />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavChats chats={NAV_DATA.chats} />
        <Separator className="mt-auto" />
        <NavUser user={NAV_DATA.user} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
