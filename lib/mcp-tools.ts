import { Candidate, FilterPlan, RankingPlan, CandidateStats } from '@/types'
import { CANDIDATE_CONFIG } from '@/constants/app-config'

/**
 * Normalize candidate values for comparison
 */
const normalize = (val: unknown): string => {
  if (Array.isArray(val)) return val.join(' ').toLowerCase()
  return String(val ?? '').toLowerCase()
}

/**
 * Check if a numeric value matches a filter with operators
 */
const matchesNumericFilter = (candidateVal: number, filterVal: string): boolean => {
  if (filterVal.startsWith('>=')) return candidateVal >= parseFloat(filterVal.slice(2))
  if (filterVal.startsWith('<=')) return candidateVal <= parseFloat(filterVal.slice(2))
  if (filterVal.startsWith('>')) return candidateVal > parseFloat(filterVal.slice(1))
  if (filterVal.startsWith('<')) return candidateVal < parseFloat(filterVal.slice(1))
  return candidateVal === parseFloat(filterVal)
}

/**
 * Filter candidates based on include/exclude criteria
 */
const filterCandidates = (plan: FilterPlan, allCandidates: Candidate[]): Candidate[] => {
  return allCandidates.filter(candidate => {
    const include = plan.include || {}
    const exclude = plan.exclude || {}

    const includePass = Object.entries(include).every(([key, value]) => {
      const candidateVal = candidate[key as keyof Candidate]

      if (typeof candidateVal === 'number' && typeof value === 'string') {
        return matchesNumericFilter(candidateVal, value)
      }

      const candidateStr = normalize(candidateVal)
      const valueStr = String(value).toLowerCase()
      return candidateStr.includes(valueStr)
    })

    const excludePass = Object.entries(exclude).every(([key, value]) => {
      const candidateVal = candidate[key as keyof Candidate]

      if (typeof candidateVal === 'number' && typeof value === 'string') {
        return !matchesNumericFilter(candidateVal, value)
      }

      const candidateStr = normalize(candidateVal)
      const valueStr = String(value).toLowerCase()
      return !candidateStr.includes(valueStr)
    })

    return includePass && excludePass
  })
}

/**
 * Rank candidates based on primary field and tie-breakers
 */
const rankCandidates = (plan: RankingPlan, candidates: Candidate[]): Candidate[] => {
  const order = plan.order || CANDIDATE_CONFIG.DEFAULT_SORT_ORDER

  return [...candidates].sort((a, b) => {
    const primaryA = a[plan.primary]
    const primaryB = b[plan.primary]

    // Primary field sorting based on order parameter
    if (typeof primaryA === 'number' && typeof primaryB === 'number') {
      if (primaryB !== primaryA) {
        return order === 'desc' ? primaryB - primaryA : primaryA - primaryB
      }
    } else {
      const aStr = String(primaryA).toLowerCase()
      const bStr = String(primaryB).toLowerCase()
      if (aStr !== bStr) {
        return order === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr)
      }
    }

    // Tie-breakers using the same order as primary
    for (const tieKey of plan.tie_breakers || []) {
      const tieA = a[tieKey]
      const tieB = b[tieKey]

      if (typeof tieA === 'number' && typeof tieB === 'number') {
        if (tieA !== tieB) {
          return order === 'desc' ? tieB - tieA : tieA - tieB
        }
      } else {
        const aStr = String(tieA).toLowerCase()
        const bStr = String(tieB).toLowerCase()
        if (aStr !== bStr) {
          return order === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr)
        }
      }
    }

    return 0
  })
}

/**
 * Generate aggregate statistics for candidates
 */
const aggregateStats = (candidates: Candidate[]): CandidateStats => {
  if (candidates.length === 0) {
    return {
      count: 0,
      avg_experience: 0,
      top_skills: [],
    }
  }

  // Calculate average experience
  const totalExperience = candidates.reduce((sum, c) => sum + c.years_experience, 0)
  const avg_experience =
    Math.round((totalExperience / candidates.length) * Math.pow(10, CANDIDATE_CONFIG.EXPERIENCE_PRECISION)) /
    Math.pow(10, CANDIDATE_CONFIG.EXPERIENCE_PRECISION)

  // Count skill occurrences
  const skillCounts = new Map<string, number>()
  candidates.forEach(candidate => {
    candidate.skills.forEach(skill => {
      if (skill && skill.trim()) {
        const normalizedSkill = skill.trim().toLowerCase()
        skillCounts.set(normalizedSkill, (skillCounts.get(normalizedSkill) || 0) + 1)
      }
    })
  })

  // Get top skills (sorted by frequency, configurable count)
  const top_skills = Array.from(skillCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, CANDIDATE_CONFIG.TOP_SKILLS_COUNT)
    .map(([skill]) => skill)

  return {
    count: candidates.length,
    avg_experience,
    top_skills,
  }
}

export { filterCandidates, rankCandidates, aggregateStats }
