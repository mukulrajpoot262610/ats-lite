import { NextResponse } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

export async function GET() {
  try {
    // Test connection to Ollama
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Ollama',
          status: response.status,
          statusText: response.statusText,
          suggestion: 'Make sure Ollama is running on localhost:11434',
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    const models = data.models || []

    // Test with a simple completion if models are available
    let testCompletion = null
    if (models.length > 0) {
      const testModel = models[0].name
      try {
        const completionResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: testModel,
            prompt: 'Say hello',
            stream: false,
          }),
        })

        if (completionResponse.ok) {
          const completionData = await completionResponse.json()
          testCompletion = {
            model: testModel,
            response: completionData.response,
          }
        }
      } catch (error) {
        console.warn('Test completion failed:', error)
      }
    }

    return NextResponse.json(
      {
        success: true,
        ollamaVersion: data.version || 'unknown',
        modelsCount: models.length,
        models: models.map((m: { name: string; size: number; modified_at: string }) => ({
          name: m.name,
          size: m.size,
          modified: m.modified_at,
        })),
        testCompletion,
        endpoint: OLLAMA_BASE_URL,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Ollama test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to Ollama',
        details: error instanceof Error ? error.message : 'Unknown error',
        endpoint: OLLAMA_BASE_URL,
        suggestion: 'Make sure Ollama is installed and running. Visit: https://ollama.ai',
      },
      { status: 500 },
    )
  }
}
