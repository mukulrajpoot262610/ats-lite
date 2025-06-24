import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'candidates.csv')
    const csvText = await fs.readFile(filePath, 'utf8')

    return new NextResponse(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error reading CSV file:', error)
    return NextResponse.json({ error: 'Failed to read CSV file' }, { status: 500 })
  }
}
