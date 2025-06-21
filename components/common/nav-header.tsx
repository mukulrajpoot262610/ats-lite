'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { NavActions } from './nav-actions'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'

export function NavHeader() {
  const { open } = useSidebar()

  return (
    <header
      className={cn(
        'flex shrink-0 items-center gap-2 p-4 fixed w-[calc(100%-256px)] top-0 z-10',
        !open && 'w-[calc(100%-64px)]',
      )}
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-sm font-semibold">ATSLite</h1>{' '}
        <Badge variant="outline" className="text-[9px] uppercase">
          Beta
        </Badge>
      </div>
      <div className="ml-auto px-3">
        <NavActions />
      </div>
    </header>
  )
}
