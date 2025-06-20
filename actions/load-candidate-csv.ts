'use server'

import { Candidate } from '@/types/candidate.types'
import path from 'path'
import Papa from 'papaparse'
import fs from 'fs/promises'

export async function LoadCandidates(): Promise<Candidate[]> {
  const filePath = path.join(process.cwd(), 'public', 'candidates.csv')
  const csvText = await fs.readFile(filePath, 'utf8')
  return new Promise((resolve, reject) => {
    Papa.parse<Candidate>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
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
              willing_to_relocate: row.willing_to_relocate ?? false,
              work_preference: row.work_preference ?? '',
              notice_period_weeks: row.notice_period_weeks ?? 0,
              desired_salary_usd: row.desired_salary_usd ?? 0,
              open_to_contract: row.open_to_contract ?? false,
              remote_experience_years: row.remote_experience_years ?? 0,
              visa_status: row.visa_status ?? '',
              citizenships: row.citizenships ?? '',
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
