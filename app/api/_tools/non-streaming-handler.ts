import { NextResponse } from 'next/server'
import { openai, DEFAULT_TEMPERATURE } from './openai-client'
import type { OpenAIChatMessage } from '@/types'

export async function createNonStreamingResponse(messages: OpenAIChatMessage[], model: string): Promise<NextResponse> {
  const completion = await openai.chat.completions.create({
    model,
    temperature: DEFAULT_TEMPERATURE,
    messages,
    stream: false,
  })

  const assistantMessage = completion.choices?.[0]?.message?.content ?? ''

  return NextResponse.json(
    {
      message: assistantMessage,
    },
    { status: 200 },
  )
}
