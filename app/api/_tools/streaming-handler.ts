import { openai, DEFAULT_TEMPERATURE } from './openai-client'
import type { OpenAIChatMessage } from '@/types/openai.types'

export async function createStreamingResponse(messages: OpenAIChatMessage[], model: string): Promise<Response> {
  const completion = await openai.chat.completions.create({
    model,
    temperature: DEFAULT_TEMPERATURE,
    messages,
    stream: true,
  })

  const encoder = new TextEncoder()

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            const data = JSON.stringify({ content, done: false })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Check if streaming is complete
          if (chunk.choices[0]?.finish_reason === 'stop') {
            const data = JSON.stringify({ content: '', done: true })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            controller.close()
            break
          }
        }
      } catch (error) {
        console.error('Streaming error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
