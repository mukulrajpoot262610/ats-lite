import { create } from 'zustand'

interface ThinkingData {
  duration: number // in seconds
  content: string[]
}

interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'assistant'
  thinking?: ThinkingData
}

interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

interface ChatStore {
  // Current input state
  message: string
  isThinking: boolean
  thinkingStartTime: number | null

  // Multi-chat state
  chats: Chat[]
  currentChatId: string | null
  messages: ChatMessage[]

  // Input actions
  setMessage: (message: string) => void
  setSuggestion: (suggestion: string) => void
  setIsThinking: (thinking: boolean) => void
  setThinkingStartTime: (time: number | null) => void

  // Chat actions
  createNewChat: () => string
  switchToChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateChatTitle: (chatId: string, title: string) => void

  // Legacy getters for backward compatibility
  chatStarted: boolean
  setChatStarted: (started: boolean) => void
}

const generateChatTitle = (firstMessage?: string): string => {
  if (!firstMessage) return 'New Chat'

  const words = firstMessage.split(' ').slice(0, 6)
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Current input state
  message: '',
  isThinking: false,
  thinkingStartTime: null,

  // Multi-chat state
  chats: [],
  currentChatId: null,
  messages: [],

  // Input actions
  setMessage: (message: string) => set({ message }),
  setSuggestion: (suggestion: string) => set({ message: suggestion }),
  setIsThinking: (thinking: boolean) => set({ isThinking: thinking }),
  setThinkingStartTime: (time: number | null) => set({ thinkingStartTime: time }),

  // Chat actions
  createNewChat: () => {
    const newChatId = Date.now().toString()
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => {
      return {
        chats: [newChat, ...state.chats],
        currentChatId: newChatId,
        messages: [],
        message: '',
        isThinking: false,
        thinkingStartTime: null,
      }
    })

    return newChatId
  },

  switchToChat: (chatId: string) => {
    const state = get()
    const targetChat = state.chats.find(chat => chat.id === chatId)

    set({
      currentChatId: chatId,
      messages: targetChat?.messages || [],
      message: '',
      isThinking: false,
      thinkingStartTime: null,
    })
  },

  deleteChat: (chatId: string) => {
    set(state => {
      const updatedChats = state.chats.filter(chat => chat.id !== chatId)
      const newCurrentChatId = state.currentChatId === chatId ? updatedChats[0]?.id || null : state.currentChatId

      const newCurrentChat = updatedChats.find(chat => chat.id === newCurrentChatId)

      return {
        chats: updatedChats,
        currentChatId: newCurrentChatId,
        messages: newCurrentChat?.messages || [],
      }
    })
  },

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const currentChatId = get().currentChatId
    if (!currentChatId) return

    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    set(state => {
      const updatedChats = state.chats.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, newMessage]
          const updatedTitle =
            chat.messages.length === 0 && message.sender === 'user' ? generateChatTitle(message.text) : chat.title

          return {
            ...chat,
            messages: updatedMessages,
            title: updatedTitle,
            updatedAt: new Date(),
          }
        }
        return chat
      })

      const currentChat = updatedChats.find(chat => chat.id === currentChatId)

      return {
        chats: updatedChats,
        messages: currentChat?.messages || state.messages,
      }
    })
  },

  updateChatTitle: (chatId: string, title: string) => {
    set(state => ({
      chats: state.chats.map(chat => (chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat)),
    }))
  },

  // Legacy getters for backward compatibility
  get chatStarted() {
    return get().messages.length > 0
  },

  setChatStarted: (started: boolean) => {
    // Legacy function - now handled automatically by message presence
    if (started && !get().currentChatId) {
      get().createNewChat()
    }
  },
}))
