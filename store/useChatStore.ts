import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Chat, ChatMessage, ChatStore, ModelConfig } from '@/types'
import { LLM_CONFIG } from '@/constants/app-config'
import { generateChatTitle, generateUniqueId } from '@/lib/utils'

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      message: '',
      chats: [],
      currentChatId: null,
      selectedModel: {
        provider: LLM_CONFIG.DEFAULT_PROVIDER,
        model: LLM_CONFIG.DEFAULT_MODEL,
        name: LLM_CONFIG.DEFAULT_MODEL,
      },
      getCurrentMessages: () => {
        const state = get()
        const currentChat = state.chats.find(chat => chat.id === state.currentChatId)
        return currentChat?.messages || []
      },
      setMessage: (message: string) => set({ message }),
      setSuggestion: (suggestion: string) => set({ message: suggestion }),
      setSelectedModel: (model: ModelConfig) => set({ selectedModel: model }),
      createNewChat: () => {
        const state = get()

        const existingEmptyChat = state.chats.find(chat => chat.messages.length === 0)

        if (existingEmptyChat) {
          set({ currentChatId: existingEmptyChat.id, message: '' })
          return existingEmptyChat.id
        }

        const newChatId = generateUniqueId('chat')
        const newChat: Chat = {
          id: newChatId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set(state => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChatId,
          message: '',
        }))

        return newChatId
      },
      switchToChat: (chatId: string) => {
        set({
          currentChatId: chatId,
          message: '',
        })
      },
      deleteChat: (chatId: string) => {
        set(state => {
          const updatedChats = state.chats.filter(chat => chat.id !== chatId)
          const newCurrentChatId = state.currentChatId === chatId ? updatedChats[0]?.id || null : state.currentChatId

          return {
            chats: updatedChats,
            currentChatId: newCurrentChatId,
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
          const chatMap = new Map(state.chats.map(chat => [chat.id, chat]))
          const currentChat = chatMap.get(currentChatId)

          if (!currentChat) {
            console.error(`Chat with ID ${currentChatId} not found`)
            return state
          }

          const updatedMessages = [...currentChat.messages, newMessage]
          const updatedTitle =
            currentChat.messages.length === 0 && message.sender === 'user'
              ? generateChatTitle(message.text)
              : currentChat.title

          const updatedChat = {
            ...currentChat,
            messages: updatedMessages,
            title: updatedTitle,
            updatedAt: new Date(),
          }

          chatMap.set(currentChatId, updatedChat)

          return {
            chats: Array.from(chatMap.values()).sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            ),
          }
        })
      },
      updateChatTitle: (chatId: string, title: string) => {
        set(state => {
          const chatMap = new Map(state.chats.map(chat => [chat.id, chat]))
          const targetChat = chatMap.get(chatId)

          if (!targetChat) return state

          chatMap.set(chatId, { ...targetChat, title, updatedAt: new Date() })

          return {
            chats: Array.from(chatMap.values()),
          }
        })
      },
      updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
        const currentChatId = get().currentChatId
        if (!currentChatId) {
          console.error('No current chat ID when trying to update message')
          return
        }

        set(state => {
          const chatMap = new Map(state.chats.map(chat => [chat.id, chat]))
          const currentChat = chatMap.get(currentChatId)

          if (!currentChat) return state

          const updatedMessages = currentChat.messages.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg))

          const updatedChat = {
            ...currentChat,
            messages: updatedMessages,
            updatedAt: new Date(),
          }

          chatMap.set(currentChatId, updatedChat)

          return {
            chats: Array.from(chatMap.values()),
          }
        })
      },
    }),
    {
      name: 'chat-store',
      version: 2,
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str, (key, value) => {
            if (value && typeof value === 'object' && value.__type === 'Date') {
              return new Date(value.value)
            }
            return value
          })
        },
        setItem: (name: string, value: unknown) => {
          const str = JSON.stringify(value, (key, val) => {
            if (val instanceof Date) {
              return { __type: 'Date', value: val.toISOString() }
            }
            return val
          })
          localStorage.setItem(name, str)
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      },
    },
  ),
)
