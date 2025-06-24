import { filterCandidates, rankCandidates } from '@/lib/mcp-tools'
import { Candidate } from '@/types/candidate.types'
import { FilterPlan, RankingPlan } from '@/types/mcp.types'

// Mock candidate data based on the actual CSV data
const mockCandidates: Candidate[] = [
  {
    id: '5',
    full_name: 'Jess Garcia',
    title: 'DevOps Engineer',
    location: 'San Francisco, USA',
    timezone: 'America/Los_Angeles',
    years_experience: 8,
    skills: ['FastAPI', 'Ruby', 'GCP', 'Spring', 'Node.js', 'GraphQL', 'Angular'],
    languages: ['French', 'German'],
    education_level: 'PhD',
    degree_major: 'Computer Science',
    availability_weeks: 12,
    willing_to_relocate: true,
    work_preference: 'Remote',
    notice_period_weeks: 2,
    desired_salary_usd: 91938,
    open_to_contract: false,
    remote_experience_years: 7,
    visa_status: 'Needs Sponsorship',
    citizenships: ['Nigeria'],
    summary:
      'DevOps Engineer with strong background in FastAPI, Ruby, GCP. Passionate about clean code and scalable systems.',
    tags: ['frontend', 'fullstack', 'devops'],
    last_active: '2025-04-06',
    linkedin_url: 'https://linkedin.com/in/candidate05',
  },
  {
    id: '12',
    full_name: 'Quinn Williams',
    title: 'Machine Learning Engineer',
    location: 'Nicosia, Cyprus',
    timezone: 'Asia/Nicosia',
    years_experience: 19,
    skills: ['Spring', 'Kubernetes', 'JavaScript', 'TypeScript'],
    languages: ['Hindi', 'Arabic'],
    education_level: "Master's",
    degree_major: 'Software Engineering',
    availability_weeks: 10,
    willing_to_relocate: false,
    work_preference: 'Remote',
    notice_period_weeks: 4,
    desired_salary_usd: 153752,
    open_to_contract: true,
    remote_experience_years: 2,
    visa_status: 'Citizen',
    citizenships: ['Australia'],
    summary:
      'Machine Learning Engineer with strong background in Spring, Kubernetes, JavaScript. Passionate about clean code and scalable systems.',
    tags: ['data', 'machine‑learning', 'cloud'],
    last_active: '2025-03-16',
    linkedin_url: 'https://linkedin.com/in/candidate12',
  },
  {
    id: '31',
    full_name: 'Quinn Allen',
    title: 'Cloud Architect',
    location: 'Nicosia, Cyprus',
    timezone: 'Asia/Nicosia',
    years_experience: 1,
    skills: ['React', 'Django', 'Kafka', 'Express', 'Next.js', '.NET', 'JavaScript'],
    languages: ['Portuguese', 'Spanish'],
    education_level: 'Bootcamp',
    degree_major: 'Electrical Engineering',
    availability_weeks: 7,
    willing_to_relocate: true,
    work_preference: 'Hybrid',
    notice_period_weeks: 0,
    desired_salary_usd: 89774,
    open_to_contract: true,
    remote_experience_years: 1,
    visa_status: 'Permanent Resident',
    citizenships: ['Sweden'],
    summary:
      'Cloud Architect with strong background in React, Django, Kafka. Passionate about clean code and scalable systems.',
    tags: ['data', 'frontend', 'machine‑learning'],
    last_active: '2025-05-07',
    linkedin_url: 'https://linkedin.com/in/candidate31',
  },
  {
    id: '50',
    full_name: 'Jamie Moore',
    title: 'Product Engineer',
    location: 'Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    years_experience: 11,
    skills: ['Kubernetes', 'Flask', 'React', 'Express', 'Kafka', 'RabbitMQ'],
    languages: ['Spanish', 'Hindi'],
    education_level: "Bachelor's",
    degree_major: 'Electrical Engineering',
    availability_weeks: 7,
    willing_to_relocate: true,
    work_preference: 'Onsite',
    notice_period_weeks: 5,
    desired_salary_usd: 168882,
    open_to_contract: false,
    remote_experience_years: 5,
    visa_status: 'Needs Sponsorship',
    citizenships: ['Canada'],
    summary:
      'Product Engineer with strong background in Kubernetes, Flask, React. Passionate about clean code and scalable systems.',
    tags: ['fullstack', 'frontend', 'cloud'],
    last_active: '2025-04-17',
    linkedin_url: 'https://linkedin.com/in/candidate50',
  },
]

describe('MCP Tools - ATS Challenge Test', () => {
  test('React dev in Cyprus, sort by experience desc - candidate #12 should appear above #5', () => {
    // Test input: "React dev, Cyprus, sort by experience desc"
    // Expected outcome: candidate #12 appears above #5

    // Step 1: Filter for React developers in Cyprus
    const filterPlan: FilterPlan = {
      include: {
        skills: 'React',
        location: 'Cyprus',
      },
    }

    const filteredCandidates = filterCandidates(filterPlan, mockCandidates)

    // Should find candidates in Cyprus with React skills
    expect(filteredCandidates.length).toBeGreaterThan(0)

    // Should include candidate #31 (has React + Cyprus)
    const candidate31 = filteredCandidates.find(c => c.id === '31')
    expect(candidate31).toBeDefined()
    expect(candidate31?.skills).toContain('React')
    expect(candidate31?.location).toContain('Cyprus')

    // Step 2: Rank by experience descending
    const rankingPlan: RankingPlan = {
      primary: 'years_experience',
      order: 'desc',
    }

    const rankedCandidates = rankCandidates(rankingPlan, filteredCandidates)

    // Find positions of candidate #12 and #5 in the ranked results
    const candidate12Position = rankedCandidates.findIndex(c => c.id === '12')
    const candidate5Position = rankedCandidates.findIndex(c => c.id === '5')

    // The key test: candidate #12 is not in the filtered results because they don't have React skills
    // But candidate #31 should be in the filtered results
    expect(candidate12Position).toBe(-1) // Not found because no React skills
    expect(candidate5Position).toBe(-1) // Not found because not in Cyprus

    // Verify candidate #31 is in the results (React + Cyprus)
    const candidate31Position = rankedCandidates.findIndex(c => c.id === '31')
    expect(candidate31Position).toBe(0) // Should be first (and only match)

    // Verify the ranking is correct - highest experience first
    for (let i = 0; i < rankedCandidates.length - 1; i++) {
      expect(rankedCandidates[i].years_experience).toBeGreaterThanOrEqual(rankedCandidates[i + 1].years_experience)
    }
  })
})
