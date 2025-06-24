'use client'

import React, { useState } from 'react'
import { Sparkles, Keyboard } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { ModeToggle } from './theme-toggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function NavActions() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const { getShortcutsForDisplay, handleNewChat } = useKeyboardShortcuts({
    onOpenShortcuts: () => setShortcutsOpen(true),
    onOpenCommandPalette: () => {},
    onToggleTheme: toggleTheme,
  })

  const shortcutsData = getShortcutsForDisplay()

  return (
    <div className="flex items-center gap-3 text-sm">
      <ModeToggle />

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Keyboard shortcuts">
            <Keyboard className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(shortcutsData).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.key.split(' + ').map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.key.split(' + ').length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                On Windows/Linux, use <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl</kbd> instead of{' '}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘</kbd>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        className="bg-primary text-primary-foreground rounded-full text-xs px-4 py-2 hover:bg-primary/80"
        onClick={handleNewChat}
      >
        <Sparkles /> New Chat
      </Button>
    </div>
  )
}
