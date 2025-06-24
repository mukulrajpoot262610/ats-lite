import { NextRequest, NextResponse } from 'next/server'
import { handleError, createNonStreamingResponse } from '../_tools'

export async function POST(req: NextRequest) {
  try {
    // Safe JSON parsing with error handling
    let body
    try {
      body = await req.json()
    } catch (jsonError) {
      console.error('Failed to parse request JSON:', jsonError)
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: jsonError instanceof Error ? jsonError.message : 'Malformed JSON',
        },
        { status: 400 },
      )
    }

    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: 'messages array is required',
        },
        { status: 400 },
      )
    }

    if (!body.model || typeof body.model !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: 'model string is required',
        },
        { status: 400 },
      )
    }

    const response = await createNonStreamingResponse(body.messages, body.model)

    // Safe response parsing
    let responseData
    try {
      responseData = await response.json()
    } catch (responseJsonError) {
      console.error('Failed to parse response JSON:', responseJsonError)
      return NextResponse.json(
        {
          error: 'Failed to process response',
          details: 'Invalid JSON response from LLM service',
        },
        { status: 500 },
      )
    }

    return NextResponse.json(responseData)
  } catch (err: unknown) {
    return handleError(err)
  }
}
