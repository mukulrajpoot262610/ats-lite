import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const DEFAULT_MODEL = 'gpt-4o-mini'
export const DEFAULT_TEMPERATURE = 0.3
export const FALLBACK_TEMPERATURE = 0.7
