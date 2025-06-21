import { create } from 'zustand'
import { Candidate } from '@/types/candidate.types'
import { FilterPlan, RankingPlan } from '@/types/mcp.types'

type MCPPhase = 'idle' | 'thinking' | 'filtering' | 'ranking' | 'speaking'

type MCPState = {
  phase: MCPPhase
  plan: { filter?: FilterPlan; rank?: RankingPlan } | null
  filtered: Candidate[]
  ranked: Candidate[]
  reply: string
  setPhase: (phase: MCPPhase) => void
  setPlan: (plan: { filter?: FilterPlan; rank?: RankingPlan } | null) => void
  setFiltered: (c: Candidate[]) => void
  setRanked: (c: Candidate[]) => void
  setReply: (text: string) => void
}

export const useMCPStore = create<MCPState>(set => ({
  phase: 'idle',
  plan: null,
  filtered: [],
  ranked: [],
  reply: '',
  setPhase: phase => set({ phase }),
  setPlan: plan => set({ plan }),
  setFiltered: c => set({ filtered: c }),
  setRanked: c => set({ ranked: c }),
  setReply: text => set({ reply: text }),
}))
