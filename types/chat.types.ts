import { Candidate } from './candidate.types'
import { FilterPlan, RankingPlan } from './mcp.types'

export interface ThinkingData {
  phase: string
  plan: { filter?: FilterPlan; rank?: RankingPlan } | null
  filtered: Candidate[]
  ranked: Candidate[]
  reply: string
}

export interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'assistant' | 'thinking' | 'system'
  model?: string
  data?: Record<string, unknown> & {
    thinkingData?: ThinkingData
    candidates?: Candidate[]
    type?: string
  }
  isComplete?: boolean // For thinking messages
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
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void
}
