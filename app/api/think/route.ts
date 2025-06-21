import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
You are ATS-Lite, a helpful AI assistant for recruiters and HR professionals. You help with:
- Candidate screening and evaluation
- Interview preparation and questions
- Recruitment strategy and best practices
- Resume analysis and feedback
- Job posting optimization
- Hiring process improvements

Be conversational, helpful, and professional. Provide detailed, actionable advice when possible.
Always use markdown to format your responses. Use proper markdown syntax.
Use proper whitespace to format your responses.
Use Seperator to seperate wherever you like it is necessary.
`

export async function POST(req: NextRequest) {
  try {
    const { messages, stream = false } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    if (stream) {
      // Streaming response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      })

      // Create a readable stream for streaming response
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
    } else {
      // Non-streaming response (backwards compatibility)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
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
  } catch (err: unknown) {
    console.error('THINK API ERROR:', err)
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
