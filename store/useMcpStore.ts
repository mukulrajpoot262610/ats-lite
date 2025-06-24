import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MCPState } from '@/types'
import { MCP_CONFIG } from '@/constants/app-config'

export const useMCPStore = create<MCPState>()(
  persist(
    set => ({
      phase: MCP_CONFIG.DEFAULT_PHASE,
      plan: MCP_CONFIG.DEFAULT_PLAN,
      filtered: [],
      ranked: [],
      reply: '',
      setPhase: phase => set({ phase }),
      setPlan: plan => set({ plan }),
      setFiltered: c => set({ filtered: c }),
      setRanked: c => set({ ranked: c }),
      setReply: text => set({ reply: text }),
    }),
    {
      name: 'mcp-store',
      version: 2,
    },
  ),
)
