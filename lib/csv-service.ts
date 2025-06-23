import { CSV_CONFIG } from '@/constants/app-config'
import { Candidate } from '@/types/candidate.types'
import Papa from 'papaparse'

let cachedHeaders: string[] | null = null

export async function getCsvHeaders(): Promise<string[]> {
  if (cachedHeaders) {
    return cachedHeaders
  }

  try {
    const response = await fetch(`/${CSV_CONFIG.DEFAULT_CSV_PATH}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const csvText = await response.text()
    const firstLine = csvText.split('\n')[0]
    cachedHeaders = firstLine.split(',').map(header => header.trim())
    return cachedHeaders
  } catch (error) {
    console.error('Error reading CSV headers:', error)
    cachedHeaders = [...CSV_CONFIG.DEFAULT_HEADERS]
    return cachedHeaders
  }
}

export async function clearHeaderCache(): Promise<void> {
  cachedHeaders = null
}

export async function loadCandidates(): Promise<Candidate[]> {
  const response = await fetch(`/${CSV_CONFIG.DEFAULT_CSV_PATH}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const csvText = await response.text()
  return new Promise((resolve, reject) => {
    Papa.parse<Candidate>(csvText, {
      ...CSV_CONFIG.PARSE_OPTIONS,
      complete: result => {
        const cleaned = result.data.map(
          (row: Partial<Candidate>) =>
            ({
              id: row.id ?? '',
              full_name: row.full_name ?? '',
              title: row.title ?? '',
              location: row.location ?? '',
              timezone: row.timezone ?? '',
              years_experience: row.years_experience ?? 0,
              availability_weeks: row.availability_weeks ?? 0,
              willing_to_relocate: String(row.willing_to_relocate).toLowerCase() === 'yes',
              work_preference: row.work_preference ?? '',
              notice_period_weeks: row.notice_period_weeks ?? 0,
              desired_salary_usd: row.desired_salary_usd ?? 0,
              open_to_contract: String(row.open_to_contract).toLowerCase() === 'yes',
              remote_experience_years: row.remote_experience_years ?? 0,
              visa_status: row.visa_status ?? '',
              citizenships:
                typeof row.citizenships === 'string'
                  ? [row.citizenships as string]
                  : Array.isArray(row.citizenships)
                  ? row.citizenships
                  : [],
              summary: row.summary ?? '',
              tags:
                typeof row.tags === 'string'
                  ? (row.tags as string).split(',').map((s: string) => s.trim())
                  : Array.isArray(row.tags)
                  ? row.tags
                  : [],
              skills:
                typeof row.skills === 'string'
                  ? (row.skills as string).split(';').map((s: string) => s.trim())
                  : Array.isArray(row.skills)
                  ? row.skills
                  : [],
              languages:
                typeof row.languages === 'string'
                  ? (row.languages as string).split(';').map((s: string) => s.trim())
                  : Array.isArray(row.languages)
                  ? row.languages
                  : [],
              education_level: row.education_level ?? '',
              degree_major: row.degree_major ?? '',
              last_active: row.last_active ?? '',
              linkedin_url: row.linkedin_url ?? '',
            } as Candidate),
        )
        resolve(cleaned)
      },
      error: (err: Error) => reject(err),
    })
  })
}
