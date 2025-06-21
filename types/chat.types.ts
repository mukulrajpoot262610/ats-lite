export interface ThinkingData {
  duration: number // in seconds
  content: string[]
  rawThinking?: string // For models like deepseek-r1 that provide raw thinking
}

export interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'assistant'
  thinking?: ThinkingData
  model?: string // Track which model was used for this message
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export type ModelProvider = 'openai' | 'ollama'

export interface ModelConfig {
  provider: ModelProvider
  model: string
  name: string // Display name
}

export interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
}

export interface ChatStore {
  // Current input state
  message: string
  isThinking: boolean
  thinkingStartTime: number | null

  // Streaming state
  isStreaming: boolean
  streamingMessageId: string | null
  streamingContent: string
  streamingThinking: string
  isStreamingThinking: boolean

  // Multi-chat state
  chats: Chat[]
  currentChatId: string | null
  messages: ChatMessage[]

  // Model configuration
  selectedModel: ModelConfig
  availableModels: ModelConfig[]
  ollamaModels: OllamaModel[]

  // Input actions
  setMessage: (message: string) => void
  setSuggestion: (suggestion: string) => void
  setIsThinking: (thinking: boolean) => void
  setThinkingStartTime: (time: number | null) => void

  // Streaming actions
  setIsStreaming: (streaming: boolean) => void
  setStreamingMessageId: (id: string | null) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (content: string) => void
  setStreamingThinking: (thinking: string) => void
  appendStreamingThinking: (thinking: string) => void
  setIsStreamingThinking: (thinking: boolean) => void
  finalizeStreamingMessage: () => void

  // Model actions
  setSelectedModel: (model: ModelConfig) => void
  setAvailableModels: (models: ModelConfig[]) => void
  setOllamaModels: (models: OllamaModel[]) => void
  loadOllamaModels: () => Promise<void>

  // Chat actions
  createNewChat: () => string
  switchToChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => void
  updateChatTitle: (chatId: string, title: string) => void

  // Legacy getters for backward compatibility
  chatStarted: boolean
  setChatStarted: (started: boolean) => void
}
