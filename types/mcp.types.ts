import { Candidate } from '@/types/candidate.types'

export type FilterPlan = {
  include?: Partial<Record<keyof Candidate, string | number | boolean>>
  exclude?: Partial<Record<keyof Candidate, string | number | boolean>>
}

export type RankingPlan = {
  primary: keyof Candidate
  tie_breakers?: (keyof Candidate)[]
  order?: 'asc' | 'desc'
}

export type ThinkPlanResponse = {
  filter: FilterPlan
  rank: RankingPlan
}

export type CandidateStats = {
  count: number
  avg_experience: number
  top_skills: string[]
}

export type MCPResult = {
  filteredCandidates: Candidate[]
  rankedCandidates: Candidate[]
  topCandidates: Candidate[]
  stats: CandidateStats
  summary: string
}

export type MCPStepResult =
  | { step: 'think'; data: ThinkPlanResponse }
  | { step: 'filter'; data: Candidate[] }
  | { step: 'rank'; data: Candidate[] }
  | { step: 'speak'; data: string }
