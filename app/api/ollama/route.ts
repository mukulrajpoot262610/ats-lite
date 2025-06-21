import { NextRequest, NextResponse } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

const SYSTEM_PROMPT = `
You are ATS-Lite, a helpful AI assistant for recruiters and HR professionals. You help with:
- Candidate screening and evaluation
- Interview preparation and questions
- Recruitment strategy and best practices
- Resume analysis and feedback
- Job posting optimization
- Hiring process improvements

Be conversational, helpful, and professional. Provide detailed, actionable advice when possible.
`

export async function GET() {
  try {
    // List available models
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)

    if (!response.ok) {
      throw new Error('Failed to connect to Ollama')
    }

    const data = await response.json()
    return NextResponse.json({ models: data.models || [] }, { status: 200 })
  } catch (err: unknown) {
    console.error('OLLAMA LIST MODELS ERROR:', err)
    return NextResponse.json(
      {
        error: 'Failed to list Ollama models',
        details: err instanceof Error ? err.message : 'Unknown error',
        suggestion: 'Make sure Ollama is running on localhost:11434',
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'llama2', stream = false } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Format messages for Ollama
    const ollamaMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]

    // Handle streaming response
    if (stream) {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: ollamaMessages,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      // Create a readable stream for the client
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n').filter(line => line.trim())

              for (const line of lines) {
                try {
                  const data = JSON.parse(line)
                  if (data.message?.content) {
                    // Send the content chunk to the client
                    const streamData = JSON.stringify({
                      content: data.message.content,
                      done: data.done || false,
                    })
                    controller.enqueue(encoder.encode(`data: ${streamData}\n\n`))
                  }

                  if (data.done) {
                    controller.close()
                    return
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming response chunk:', parseError)
                }
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error)
            controller.error(error)
          } finally {
            reader.releaseLock()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Handle non-streaming response (fallback)
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const assistantMessage = data.message?.content || 'No response from model'

    return NextResponse.json(
      {
        message: assistantMessage,
        model: model,
      },
      { status: 200 },
    )
  } catch (err: unknown) {
    console.error('OLLAMA CHAT ERROR:', err)
    return NextResponse.json(
      {
        error: 'Failed to generate response with Ollama',
        details: err instanceof Error ? err.message : 'Unknown error',
        suggestion: 'Make sure Ollama is running and the specified model is available',
      },
      { status: 500 },
    )
  }
}
