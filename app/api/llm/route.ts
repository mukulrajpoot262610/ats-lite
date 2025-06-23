import { NextRequest, NextResponse } from 'next/server'
import { handleError, createNonStreamingResponse } from '../_tools'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await createNonStreamingResponse(body.messages, body.model)
    return NextResponse.json(await response.json())
  } catch (err: unknown) {
    return handleError(err)
  }
}
