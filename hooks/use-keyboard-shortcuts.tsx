'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useChatStore } from '@/store/useChatStore'
import { useSidebar } from '@/components/ui/sidebar'
import { toast } from 'sonner'

export interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
  category: 'Navigation' | 'Chat' | 'General'
  action: () => void
  preventDefault?: boolean
}

export interface UseKeyboardShortcutsOptions {
  onOpenShortcuts?: () => void
  onOpenCommandPalette?: () => void
  onSendMessage?: () => void
  onToggleTheme?: () => void
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { chats, createNewChat } = useChatStore()
  const { toggleSidebar } = useSidebar()

  const handleNewChat = useCallback(() => {
    const existingEmptyChat = chats.find(chat => chat.messages.length === 0)

    if (existingEmptyChat) {
      toast.info('Switched to existing empty chat', {
        description: 'You already have an empty chat. Start typing to begin the conversation!',
        duration: 3000,
      })
    }

    createNewChat()
  }, [chats, createNewChat])

  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        key: 'm',
        metaKey: true,
        shiftKey: false,
        description: 'Create new chat',
        category: 'Navigation',
        action: handleNewChat,
        preventDefault: true,
      },
      {
        key: 'k',
        metaKey: true,
        description: 'Open command palette / Search',
        category: 'Navigation',
        action: () => options.onOpenCommandPalette?.(),
        preventDefault: true,
      },
      {
        key: 'b',
        metaKey: true,
        description: 'Toggle sidebar',
        category: 'Navigation',
        action: toggleSidebar,
        preventDefault: true,
      },
      {
        key: '/',
        metaKey: true,
        description: 'Show keyboard shortcuts',
        category: 'General',
        action: () => options.onOpenShortcuts?.(),
        preventDefault: true,
      },
      {
        key: 'l',
        metaKey: true,
        shiftKey: true,
        description: 'Toggle theme',
        category: 'General',
        action: () => options.onToggleTheme?.(),
        preventDefault: true,
      },
      {
        key: 'Enter',
        description: 'Send message',
        category: 'Chat',
        action: () => options.onSendMessage?.(),
        preventDefault: false,
      },
      {
        key: 'Enter',
        metaKey: true,
        description: 'Send message (alternative)',
        category: 'Chat',
        action: () => options.onSendMessage?.(),
        preventDefault: false,
      },
      {
        key: 'Enter',
        shiftKey: true,
        description: 'New line in message',
        category: 'Chat',
        action: () => {},
        preventDefault: false,
      },
    ],
    [handleNewChat, options, toggleSidebar],
  )

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input/textarea elements
      const target = event.target as HTMLElement
      const isInputElement =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'

      if (event.key === 'Enter' && isInputElement) {
        const isEnterWithoutShift = event.key === 'Enter' && !event.shiftKey
        const isCmdEnter = event.key === 'Enter' && (event.metaKey || event.ctrlKey)

        if (isEnterWithoutShift || isCmdEnter) {
          event.preventDefault()
          options.onSendMessage?.()
          return
        }
      }

      if (isInputElement) {
        const allowedInInputs = ['k', '?']
        if (!allowedInInputs.includes(event.key.toLowerCase())) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const metaMatches = (shortcut.metaKey ?? false) === (event.metaKey || event.ctrlKey)
        const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey
        const altMatches = (shortcut.altKey ?? false) === event.altKey

        if (keyMatches && metaMatches && shiftMatches && altMatches) {
          if (shortcut.preventDefault) {
            event.preventDefault()
          }
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, options, handleNewChat, toggleSidebar])

  return {
    shortcuts: shortcuts.filter(s => s.category !== 'Chat' || s.key !== 'Enter' || s.shiftKey),
    getShortcutsForDisplay: () => {
      const formatShortcutForDisplay = (shortcut: KeyboardShortcut) => {
        const keys = []
        if (shortcut.metaKey) keys.push('⌘')
        if (shortcut.ctrlKey) keys.push('Ctrl')
        if (shortcut.shiftKey) keys.push('Shift')
        if (shortcut.altKey) keys.push('Alt')
        keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1))

        return {
          key: keys.join(' + '),
          description: shortcut.description,
          category: shortcut.category,
        }
      }

      const grouped = {
        Navigation: shortcuts.filter(s => s.category === 'Navigation').map(formatShortcutForDisplay),
        Chat: [
          { key: 'Enter', description: 'Send message', category: 'Chat' as const },
          { key: '⌘ + Enter', description: 'Send message (alternative)', category: 'Chat' as const },
          { key: 'Shift + Enter', description: 'New line in message', category: 'Chat' as const },
        ],
        General: shortcuts.filter(s => s.category === 'General').map(formatShortcutForDisplay),
      }
      return grouped
    },
    handleNewChat,
  }
}

export function formatShortcutKeys(shortcut: Partial<KeyboardShortcut>): string[] {
  const keys: string[] = []

  if (shortcut.metaKey) {
    keys.push('⌘')
  }
  if (shortcut.ctrlKey) {
    keys.push('Ctrl')
  }
  if (shortcut.shiftKey) {
    keys.push('Shift')
  }
  if (shortcut.altKey) {
    keys.push('Alt')
  }
  if (shortcut.key) {
    keys.push(shortcut.key.toUpperCase())
  }

  return keys
}
