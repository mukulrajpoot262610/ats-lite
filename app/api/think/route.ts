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
`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    })

    const assistantMessage = response.choices?.[0]?.message?.content ?? ''

    return NextResponse.json(
      {
        message: assistantMessage,
      },
      { status: 200 },
    )
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
