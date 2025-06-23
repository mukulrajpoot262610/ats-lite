import { NextResponse } from 'next/server'
import type { Request } from '@/types/api.types'

export function validateRequest(body: unknown): { isValid: boolean; error?: NextResponse; data?: Request } {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }),
    }
  }

  const { messages, stream = false, model = 'gpt-4o-mini' } = body as Record<string, unknown>

  if (!messages || !Array.isArray(messages)) {
    return {
      isValid: false,
      error: NextResponse.json({ error: 'Messages array is required' }, { status: 400 }),
    }
  }

  return {
    isValid: true,
    data: {
      messages,
      stream: Boolean(stream),
      model: typeof model === 'string' ? model : 'gpt-4o-mini',
    },
  }
}
