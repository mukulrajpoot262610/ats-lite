import { create } from 'zustand'
import { Chat, ChatMessage, ChatStore, ModelConfig } from '@/types/chat.types'
import { LLM_CONFIG } from '@/constants/app-config'
import { generateUniqueId } from '@/lib/utils'

const generateChatTitle = (firstMessage?: string): string => {
  if (!firstMessage) return 'New Chat'

  const words = firstMessage.split(' ').slice(0, 6)
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
}

export const useChatStore = create<ChatStore>((set, get) => ({
  message: '',
  chats: [],
  currentChatId: null,
  messages: [],

  selectedModel: {
    provider: LLM_CONFIG.DEFAULT_PROVIDER,
    model: LLM_CONFIG.DEFAULT_MODEL,
    name: LLM_CONFIG.DEFAULT_MODEL,
  },

  setMessage: (message: string) => set({ message }),
  setSuggestion: (suggestion: string) => set({ message: suggestion }),

  // Model actions
  setSelectedModel: (model: ModelConfig) => set({ selectedModel: model }),

  // Chat actions
  createNewChat: () => {
    const state = get()

    // Check if there's already an empty chat (0 messages)
    const existingEmptyChat = state.chats.find(chat => chat.messages.length === 0)

    if (existingEmptyChat) {
      // Switch to the existing empty chat instead of creating a new one
      get().switchToChat(existingEmptyChat.id)
      return existingEmptyChat.id
    }

    // No empty chat exists, create a new one
    const newChatId = generateUniqueId('chat')
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
        messages: [], // Set messages to empty for new chat
        message: '',
      }
    })

    return newChatId
  },

  switchToChat: (chatId: string) => {
    const state = get()
    const targetChat = state.chats.find(chat => chat.id === chatId)

    set({
      currentChatId: chatId,
      messages: targetChat?.messages || [], // Update messages when switching chats
      message: '',
    })
  },

  deleteChat: (chatId: string) => {
    set(state => {
      const updatedChats = state.chats.filter(chat => chat.id !== chatId)
      const newCurrentChatId = state.currentChatId === chatId ? updatedChats[0]?.id || null : state.currentChatId

      // Update messages based on new current chat
      const newCurrentChat = updatedChats.find(chat => chat.id === newCurrentChatId)

      return {
        chats: updatedChats,
        currentChatId: newCurrentChatId,
        messages: newCurrentChat?.messages || [],
      }
    })
  },

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => {
    const currentChatId = get().currentChatId
    if (!currentChatId) {
      console.error('No current chat ID when trying to add message')
      return
    }

    const newMessage: ChatMessage = {
      ...message,
      id: message.id || generateUniqueId('msg'),
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

      // Update current messages if this is the active chat
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
}))
