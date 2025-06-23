export interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'assistant'
  model?: string
  data?: Record<string, unknown>
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ModelConfig {
  provider: string
  model: string
  name: string
}

export interface ChatStore {
  message: string
  chats: Chat[]
  currentChatId: string | null
  messages: ChatMessage[]

  selectedModel: ModelConfig

  // Input actions
  setMessage: (message: string) => void
  setSuggestion: (suggestion: string) => void

  // Model actions
  setSelectedModel: (model: ModelConfig) => void

  // Chat actions
  createNewChat: () => string
  switchToChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => void
  updateChatTitle: (chatId: string, title: string) => void
}
