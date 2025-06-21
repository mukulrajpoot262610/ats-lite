import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
You are ATS-Lite, an assistant for recruiters. You ONLY return a valid JSON plan for filtering and ranking candidates from a CSV.
Your reply format must be:

{
  "filter": {
    "include": { ... },
    "exclude": { ... }
  },
  "rank": {
    "primary": "field",
    "tie_breakers": ["field", "field"]
  }
}

- Use only fields mentioned in the CSV header.
- Use partial matches for title/skills/location.
- Use experience, availability, or salary for ranking.
- NEVER say anything outside the JSON format.
`

export async function GET(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    })

    const raw = response.choices?.[0]?.message?.content ?? ''
    const plan = JSON.parse(raw)

    return NextResponse.json({ plan }, { status: 200 })
  } catch (err: unknown) {
    console.error('THINK ERROR', err)
    return NextResponse.json(
      { error: 'Failed to generate plan', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
