import { Candidate } from '@/types/candidate.types'

export type FilterPlan = {
  include?: Partial<Record<keyof Candidate, string | number | boolean>>
  exclude?: Partial<Record<keyof Candidate, string | number | boolean>>
}

export type RankingPlan = {
  primary: keyof Candidate
  tie_breakers?: (keyof Candidate)[]
}
