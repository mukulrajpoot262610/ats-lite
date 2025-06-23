import { OpenAIChatMessage } from './openai.types'

export interface Request {
  messages: OpenAIChatMessage[]
  model: string
  stream?: boolean
}

export interface OpenAIChatRequest {
  messages: OpenAIChatMessage[]
  model: string
}

export interface Response {
  message: string
}

export interface APIError extends Error {
  status?: number
  code?: string
}
