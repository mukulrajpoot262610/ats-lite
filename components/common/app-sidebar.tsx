import * as React from 'react'

import AppSidebarChats from '@/components/common/app-sidebar-chats'
import AppSidebarUser from '@/components/common/app-sidebar-user'

import { Sidebar, SidebarContent, SidebarHeader, SidebarSeparator } from '@/components/ui/sidebar'
import { AppSidebarHeader } from '@/components/common/app-sidebar-header'
import { Separator } from '../ui/separator'

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar className="border-r-0" {...props} collapsible="icon">
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <AppSidebarChats />
        <Separator className="mt-auto" />
        <AppSidebarUser />
      </SidebarContent>
    </Sidebar>
  )
}
export default AppSidebar
