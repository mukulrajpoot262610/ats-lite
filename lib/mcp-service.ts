import {
  Candidate,
  ChatMessage,
  FilterPlan,
  RankingPlan,
  ThinkPlanResponse,
  CandidateStats,
  MCPStepResult,
} from '@/types'
import { filterCandidates, rankCandidates, aggregateStats } from '@/lib/mcp-tools'
import { llmService } from '@/lib/llm-service'
import { CANDIDATE_CONFIG, CSV_CONFIG } from '@/constants/app-config'

export class MCPService {
  private allCandidates: Candidate[] = []
  private csvHeaders: string[] = []

  constructor(candidates: Candidate[] = [], headers: string[] = []) {
    this.allCandidates = candidates
    this.csvHeaders = headers.length > 0 ? headers : this.getDefaultHeaders()
  }

  /**
   * Get default CSV headers based on the Candidate type
   */
  private getDefaultHeaders(): string[] {
    return [...CSV_CONFIG.DEFAULT_HEADERS]
  }

  /**
   * STEP 1: THINK - Generate filter and ranking plans from user query
   */
  async think(messages: ChatMessage[]): Promise<ThinkPlanResponse> {
    try {
      const response = await llmService.generateThinkPlans(messages)
      return {
        filter: response.filter || {},
        rank: response.rank || { primary: 'years_experience' },
      }
    } catch (error) {
      console.error('Error in THINK step:', error)
      throw new Error(`THINK step failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * STEP 2: ACT 1 - Filter candidates based on the filter plan
   */
  filter(filterPlan: FilterPlan): Candidate[] {
    try {
      return filterCandidates(filterPlan, this.allCandidates)
    } catch (error) {
      console.error('Error in FILTER step:', error)
      throw new Error(`FILTER step failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * STEP 3: ACT 2 - Rank filtered candidates based on the ranking plan
   */
  rank(rankingPlan: RankingPlan, candidates: Candidate[]): Candidate[] {
    try {
      return rankCandidates(rankingPlan, candidates)
    } catch (error) {
      console.error('Error in RANK step:', error)
      throw new Error(`RANK step failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate aggregate statistics for a set of candidates
   */
  getStats(candidates: Candidate[]): CandidateStats {
    try {
      return aggregateStats(candidates)
    } catch (error) {
      console.error('Error in GET STATS step:', error)
      throw new Error(`GET STATS step failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * STEP 4: SPEAK - Generate recruiter-friendly summary from top candidates
   */
  async speak(messages: ChatMessage[], topCandidates: Candidate[], stats: CandidateStats): Promise<string> {
    const candidatesText = topCandidates
      .slice(0, CANDIDATE_CONFIG.TOP_CANDIDATES_COUNT)
      .map(
        (candidate, index) =>
          `${index + 1}. ${candidate.full_name} - ${candidate.title}
   Location: ${candidate.location}
   Experience: ${candidate.years_experience} years
   Skills: ${candidate.skills.slice(0, CANDIDATE_CONFIG.SKILLS_DISPLAY_COUNT).join(', ')}
   Salary: $${candidate.desired_salary_usd?.toLocaleString() || 'Not specified'}
   Summary: ${candidate.summary.slice(0, 200)}...`,
      )
      .join('\n\n')

    const response = await llmService.generateSummary(messages, stats, candidatesText)

    try {
      return response
    } catch (error) {
      console.error('Error in SPEAK step:', error)
      throw new Error(`SPEAK step failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute MCP loop with step-by-step callbacks (for debugging/monitoring)
   */
  async executeLoopWithSteps(messages: ChatMessage[], onStep?: (step: MCPStepResult) => void) {
    try {
      // STEP 1: THINK
      const planResponse = await this.think(messages)
      onStep?.({ step: 'think', data: planResponse })

      // STEP 2: ACT 1 - Filter
      const filteredCandidates = this.filter(planResponse.filter)
      onStep?.({ step: 'filter', data: filteredCandidates })

      // Check if no candidates found - stop here and return early
      if (filteredCandidates.length === 0) {
        return 'No candidates found matching your criteria. Please try adjusting your search filters.'
      }

      // STEP 3: ACT 2 - Rank
      const rankedCandidates = this.rank(planResponse.rank, filteredCandidates)
      onStep?.({ step: 'rank', data: rankedCandidates })

      // Get top candidates and stats
      const topCandidates = rankedCandidates.slice(0, CANDIDATE_CONFIG.TOP_CANDIDATES_COUNT)
      const stats = this.getStats(rankedCandidates)

      // STEP 4: SPEAK
      const summary = await this.speak(messages, topCandidates, stats)
      onStep?.({ step: 'speak', data: summary })

      return summary
    } catch (error) {
      console.error('MCP loop execution failed:', error)
      throw error
    }
  }

  /**
   * Get all loaded candidates
   */
  getAllCandidates(): Candidate[] {
    return this.allCandidates
  }

  /**
   * Get CSV headers
   */
  getHeaders(): string[] {
    return this.csvHeaders
  }
}

export const mcpService = new MCPService()
