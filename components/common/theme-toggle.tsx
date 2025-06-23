'use client'

import * as React from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Handle hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and before hydration, show a neutral state
  if (!mounted) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all scale-100 rotate-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all scale-0 rotate-90" />
            <Monitor className="absolute h-[1.2rem] w-[1.2rem] transition-all scale-0 -rotate-90" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-xs">
          <DropdownMenuItem onClick={() => setTheme('light')} className="text-xs p-2">
            <Sun className="" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="text-xs p-2">
            <Moon className="" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="text-xs p-2">
            <Monitor className="" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sun
            className={cn(
              'h-[1.2rem] w-[1.2rem] transition-all',
              theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90',
            )}
          />
          <Moon
            className={cn(
              'absolute h-[1.2rem] w-[1.2rem] transition-all',
              theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90',
            )}
          />
          <Monitor
            className={cn(
              'absolute h-[1.2rem] w-[1.2rem] transition-all',
              theme === 'system' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90',
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        <DropdownMenuItem onClick={() => setTheme('light')} className="text-xs p-2">
          <Sun className="" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="text-xs p-2">
          <Moon className="" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="text-xs p-2">
          <Monitor className="" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
