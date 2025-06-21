import { Candidate } from '@/types/candidate.types'
import { FilterPlan, RankingPlan } from '@/types/mcp.types'

function normalize(val: unknown): string {
  if (Array.isArray(val)) return val.join(' ').toLowerCase()
  return String(val ?? '').toLowerCase()
}

function matchesNumericFilter(candidateVal: number, filterVal: string): boolean {
  if (filterVal.startsWith('>=')) return candidateVal >= parseFloat(filterVal.slice(2))
  if (filterVal.startsWith('<=')) return candidateVal <= parseFloat(filterVal.slice(2))
  if (filterVal.startsWith('>')) return candidateVal > parseFloat(filterVal.slice(1))
  if (filterVal.startsWith('<')) return candidateVal < parseFloat(filterVal.slice(1))
  return candidateVal === parseFloat(filterVal)
}

export function filterCandidates(plan: FilterPlan, allCandidates: Candidate[]): Candidate[] {
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

export function rankCandidates(candidates: Candidate[], plan: RankingPlan): Candidate[] {
  return [...candidates].sort((a, b) => {
    const primaryA = a[plan.primary]
    const primaryB = b[plan.primary]

    // Descending for primary
    if (typeof primaryA === 'number' && typeof primaryB === 'number') {
      if (primaryB !== primaryA) return primaryB - primaryA
    } else {
      const aStr = String(primaryA).toLowerCase()
      const bStr = String(primaryB).toLowerCase()
      if (aStr !== bStr) return aStr.localeCompare(bStr)
    }

    // Tie-breakers (ascending)
    for (const tieKey of plan.tie_breakers || []) {
      const tieA = a[tieKey]
      const tieB = b[tieKey]

      if (typeof tieA === 'number' && typeof tieB === 'number') {
        if (tieA !== tieB) return tieA - tieB
      } else {
        const aStr = String(tieA).toLowerCase()
        const bStr = String(tieB).toLowerCase()
        if (aStr !== bStr) return aStr.localeCompare(bStr)
      }
    }

    return 0 // equal
  })
}

export async function thinkPlan(
  message: string,
  csvHeader: string[],
): Promise<{ filter: FilterPlan; rank: RankingPlan }> {
  const prompt = `You are an ATS agent. Based on this message: "${message}", and this CSV header: ${csvHeader.join(
    ', ',
  )}, reply ONLY in this JSON format:
  {
    "filter": { include?: { key: value }, exclude?: { key: value } },
    "rank": { primary: "field", tie_breakers?: ["field", "field"] }
  }`

  const res = await fetch('/api/think', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
  const json = await res.json()
  return json.plan
}
