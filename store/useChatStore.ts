import { create } from 'zustand'
import { Chat, ChatMessage, ChatStore, ModelConfig, OllamaModel } from '@/types/chat.types'

const generateChatTitle = (firstMessage?: string): string => {
  if (!firstMessage) return 'New Chat'

  const words = firstMessage.split(' ').slice(0, 6)
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
}

const defaultModels: ModelConfig[] = [
  { provider: 'openai', model: 'gpt-4o-mini', name: 'GPT-4 Mini (OpenAI)' },
  { provider: 'openai', model: 'gpt-4', name: 'GPT-4 (OpenAI)' },
]

export const useChatStore = create<ChatStore>((set, get) => ({
  // Current input state
  message: '',
  isThinking: false,
  thinkingStartTime: null,

  // Streaming state
  isStreaming: false,
  streamingMessageId: null,
  streamingContent: '',

  // Multi-chat state
  chats: [],
  currentChatId: null,
  messages: [],

  // Model configuration
  selectedModel: defaultModels[0],
  availableModels: defaultModels,
  ollamaModels: [],

  // Input actions
  setMessage: (message: string) => set({ message }),
  setSuggestion: (suggestion: string) => set({ message: suggestion }),
  setIsThinking: (thinking: boolean) => set({ isThinking: thinking }),
  setThinkingStartTime: (time: number | null) => set({ thinkingStartTime: time }),

  // Streaming actions
  setIsStreaming: (streaming: boolean) => set({ isStreaming: streaming }),
  setStreamingMessageId: (id: string | null) => set({ streamingMessageId: id }),
  setStreamingContent: (content: string) => set({ streamingContent: content }),
  appendStreamingContent: (content: string) => set(state => ({ streamingContent: state.streamingContent + content })),

  finalizeStreamingMessage: () => {
    const state = get()
    const { streamingMessageId, streamingContent, currentChatId } = state

    if (!streamingMessageId || !currentChatId || !streamingContent) return

    // Update the streaming message with final content
    set(stateUpdate => {
      const updatedChats = stateUpdate.chats.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = chat.messages.map(msg =>
            msg.id === streamingMessageId ? { ...msg, text: streamingContent } : msg,
          )
          return { ...chat, messages: updatedMessages, updatedAt: new Date() }
        }
        return chat
      })

      const currentChat = updatedChats.find(chat => chat.id === currentChatId)

      return {
        chats: updatedChats,
        messages: currentChat?.messages || stateUpdate.messages,
        isStreaming: false,
        streamingMessageId: null,
        streamingContent: '',
      }
    })
  },

  // Model actions
  setSelectedModel: (model: ModelConfig) => set({ selectedModel: model }),
  setAvailableModels: (models: ModelConfig[]) => set({ availableModels: models }),
  setOllamaModels: (models: OllamaModel[]) => set({ ollamaModels: models }),

  loadOllamaModels: async () => {
    try {
      const response = await fetch('/api/ollama')
      if (response.ok) {
        const data = await response.json()
        const ollamaModels: OllamaModel[] = data.models || []

        // Update Ollama models in state
        set({ ollamaModels })

        // Create ModelConfig objects for Ollama models
        const ollamaModelConfigs: ModelConfig[] = ollamaModels.map(model => ({
          provider: 'ollama' as const,
          model: model.name,
          name: `${model.name} (Ollama)`,
        }))

        // Merge with existing OpenAI models
        const currentModels = get().availableModels
        const openaiModels = currentModels.filter(m => m.provider === 'openai')
        const allModels = [...openaiModels, ...ollamaModelConfigs]

        set({ availableModels: allModels })
      } else {
        console.warn('Failed to load Ollama models:', response.statusText)
      }
    } catch (error) {
      console.warn('Failed to connect to Ollama:', error)
    }
  },

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
        messages: [], // Set messages to empty for new chat
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
      messages: targetChat?.messages || [], // Update messages when switching chats
      message: '',
      isThinking: false,
      thinkingStartTime: null,
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
      id: message.id || Date.now().toString(),
      timestamp: new Date(),
    }

    console.log('Adding message to store:', { sender: newMessage.sender, text: newMessage.text.slice(0, 50) + '...' })

    set(state => {
      const updatedChats = state.chats.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, newMessage]
          const updatedTitle =
            chat.messages.length === 0 && message.sender === 'user' ? generateChatTitle(message.text) : chat.title

          console.log('Updated chat messages count:', updatedMessages.length)

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

      console.log('New state messages count:', currentChat?.messages?.length || 0)

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
