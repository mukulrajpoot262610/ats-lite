import { NextResponse } from 'next/server'

export function handleError(error: unknown): NextResponse {
  console.error('THINK API ERROR:', error)

  return NextResponse.json(
    {
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 },
  )
}
