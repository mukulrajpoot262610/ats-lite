import { useEffect, useState } from 'react'
import { MCPService } from '@/lib/mcp-service'
import { loadCandidates } from '@/lib/csv-service'

export function useMCPService() {
  const [mcpService, setMcpService] = useState<MCPService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeCandidates = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const candidates = await loadCandidates()
        // Create MCP service with loaded candidates
        const service = new MCPService(candidates)
        setMcpService(service)
      } catch (error) {
        console.error('Failed to load candidates for MCP service:', error)
        setError('Failed to load candidates for MCP service')
      } finally {
        setIsLoading(false)
      }
    }
    initializeCandidates()
  }, [])

  return { mcpService, isLoading, error }
}
