import {
  ChatMessage,
  CandidateStats,
  FilterPlan,
  RankingPlan,
  OpenAIChatMessage,
  OpenAIChatRequest,
  ThinkPlanResponse,
} from '@/types'
import { ApiService, apiService } from './api-service'
import { LLM_CONFIG } from '@/constants/app-config'
import { getCsvHeaders } from './csv-service'

// JSON parsing safety utilities
interface SafeJsonParseResult<T> {
  success: boolean
  data?: T
  error?: string
}

interface JsonParseOptions<T> {
  maxRetries?: number
  fallbackValue?: T
  schema?: (obj: unknown) => obj is T
}

export class LLMService {
  private apiService: ApiService

  constructor(apiService: ApiService) {
    this.apiService = apiService
  }

  /**
   * Safely parse JSON with comprehensive error handling, validation, and fallback
   */
  private safeJsonParse<T>(jsonString: string, options: JsonParseOptions<T> = {}): SafeJsonParseResult<T> {
    const { maxRetries = 3, fallbackValue, schema } = options

    if (!jsonString || typeof jsonString !== 'string') {
      return {
        success: false,
        error: 'Invalid input: empty or non-string JSON',
        data: fallbackValue,
      }
    }

    // Clean the JSON string - remove potential markdown formatting
    let cleanedJson = jsonString.trim()

    // Remove code block markers if present
    if (cleanedJson.startsWith('```json') || cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson
        .replace(/^```(json)?\s*/, '')
        .replace(/```\s*$/, '')
        .trim()
    }

    // Remove any trailing text after JSON - using compatible regex
    const jsonMatch = cleanedJson.match(/^(\{[\s\S]*\})/)
    if (jsonMatch) {
      cleanedJson = jsonMatch[1]
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const parsed = JSON.parse(cleanedJson)

        // Schema validation if provided
        if (schema && !schema(parsed)) {
          throw new Error('Schema validation failed')
        }

        return { success: true, data: parsed }
      } catch (error) {
        console.warn(`JSON parse attempt ${attempt}/${maxRetries} failed:`, error)

        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to parse JSON after ${maxRetries} attempts: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            data: fallbackValue,
          }
        }

        // Try to fix common JSON issues for next attempt
        if (attempt === 1) {
          // Fix trailing commas
          cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1')
        } else if (attempt === 2) {
          // Try to extract JSON from mixed content
          const jsonStartIndex = cleanedJson.indexOf('{')
          const jsonEndIndex = cleanedJson.lastIndexOf('}')
          if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedJson = cleanedJson.substring(jsonStartIndex, jsonEndIndex + 1)
          }
        }
      }
    }

    return {
      success: false,
      error: 'Unexpected error in JSON parsing',
      data: fallbackValue,
    }
  }

  /**
   * Validate ThinkPlanResponse structure
   */
  private validateThinkPlanResponse(obj: unknown): obj is ThinkPlanResponse {
    if (!obj || typeof obj !== 'object') return false

    const candidate = obj as Record<string, unknown>

    // Check for required filter and rank properties
    if (!candidate.filter && !candidate.rank) return false

    // Validate filter structure if present
    if (candidate.filter) {
      if (typeof candidate.filter !== 'object') return false
      const filter = candidate.filter as Record<string, unknown>
      if (filter.include && typeof filter.include !== 'object') return false
      if (filter.exclude && typeof filter.exclude !== 'object') return false
    }

    // Validate rank structure if present
    if (candidate.rank) {
      if (typeof candidate.rank !== 'object') return false
      const rank = candidate.rank as Record<string, unknown>
      if (!rank.primary || typeof rank.primary !== 'string') return false
      if (rank.tie_breakers && !Array.isArray(rank.tie_breakers)) return false
      if (rank.order && !['asc', 'desc'].includes(rank.order as string)) return false
    }

    return true
  }

  /**
   * Create fallback ThinkPlanResponse when JSON parsing fails
   */
  private createFallbackThinkPlan(): ThinkPlanResponse {
    return {
      filter: {
        include: {},
        exclude: {},
      },
      rank: {
        primary: 'years_experience',
        tie_breakers: ['desired_salary_usd'],
        order: 'desc',
      },
    }
  }

  private convertMessagesToOpenAIFormat(messages: ChatMessage[]): OpenAIChatMessage[] {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }))
  }

  private buildSystemPromptForFilterAndRank(headers: string[]): string {
    return ` You are ATS-Lite, a recruiter assistant for filtering and ranking candidates from a CSV.

🧠 Your job is to generate a valid JSON plan in this format:

{
  "filter": {
    "include": { "field": "value" },
    "exclude": { "field": "value" }
  },
  "rank": {
    "primary": "field",
    "tie_breakers": ["field", "field"],
    "order": "asc" | "desc"
  }
}

🧷 Strict Rules:

1. 🔑 Only use fields from this CSV header list:
${headers.join(', ')}

2. 🧩 For string-like fields (e.g., title, skills, location, tags):
- Do partial matching using "include"
- Example: { "title": "React" }

3. 🔢 For numeric fields, use comparison operators:
- Allowed: <, >, <=, >=
- Example: { "years_experience": ">=5" }
- Example: { "notice_period_weeks": "<2" }

4. 🚫 NEVER:
- Invent field names (e.g., "availability" ❌)
- Add any explanation or text outside the JSON

5. 🎯 Filtering Logic:
- Use "include" to require values
- Use "exclude" to remove unwanted values
- Omit keys entirely if not used
- Use "skills" for language/tool keywords like "Python", "Go", or "React".
- Use "title" only for job roles like "Backend Engineer" or "Frontend Developer".

6. 🧮 Ranking Logic:
- "primary": the main field to sort by (most important first)
- "tie_breakers": optional secondary fields for sorting when values are equal
- "order": "asc" for ascending order, "desc" for descending order

📦 Output format:
JSON only, no extra quotes or code blocks. Keep it strict and minimal.

Ready to generate plans.`
  }

  private buildSystemPromptForSummary(originalQuery: string, stats: CandidateStats, candidatesText: string): string {
    return `You are ATS-Lite, a recruiter assistant. Generate a professional summary for the recruiter based on the search results.

Original query: "${originalQuery}"

Search Statistics:
- Total candidates found: ${stats.count}
- Average experience: ${stats.avg_experience} years
- Top skills: ${stats.top_skills.join(', ')}

Top 5 Candidates: ${candidatesText}

Generate a concise, recruiter-friendly summary that:
1. Briefly explains what was searched for
2. Highlights key statistics
3. Summarizes the top candidates' strengths
4. Mentions any notable patterns or insights
5. Provides actionable next steps

Keep it professional, concise (under 300 words), and focused on business value.
Always use markdown to format your responses. Use proper markdown syntax.
Use proper whitespace to format your responses.
Use Seperator to seperate wherever you like it is necessary.
`
  }

  private async invokeLlm(
    request: OpenAIChatRequest,
    systemPrompt: string,
    endpoint: string,
  ): Promise<{ message: string }> {
    try {
      const body = {
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...request.messages,
        ],
        model: request.model,
      }

      const response = await this.apiService.makeRequest<{ message: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      return response as unknown as { message: string }
    } catch (error) {
      console.error('Error invoking LLM:', error)
      throw error
    }
  }

  async generateThinkPlans(currentMessages: ChatMessage[]): Promise<{ filter: FilterPlan; rank: RankingPlan }> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const headers = await getCsvHeaders()
        const systemPrompt = this.buildSystemPromptForFilterAndRank(headers)
        const messages = this.convertMessagesToOpenAIFormat(currentMessages)

        const response = await this.invokeLlm(
          {
            messages,
            model: LLM_CONFIG.DEFAULT_MODEL,
          },
          systemPrompt,
          '/api/llm',
        )

        // Safe JSON parsing with validation
        const parseResult = this.safeJsonParse<ThinkPlanResponse>(response.message, {
          maxRetries: 2,
          fallbackValue: this.createFallbackThinkPlan(),
          schema: this.validateThinkPlanResponse,
        })

        if (parseResult.success && parseResult.data) {
          console.log(`✅ Successfully parsed think plans on attempt ${attempt}`)
          return parseResult.data
        } else {
          const error = new Error(`JSON parsing failed: ${parseResult.error}`)
          console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message)
          lastError = error

          if (attempt === maxRetries) {
            // Use fallback plan on final failure
            console.warn('🔄 Using fallback think plan due to repeated parsing failures')
            return this.createFallbackThinkPlan()
          }

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ LLM request attempt ${attempt}/${maxRetries} failed:`, errorMessage)
        lastError = error instanceof Error ? error : new Error(errorMessage)

        if (attempt === maxRetries) {
          console.warn('🔄 Using fallback think plan due to repeated LLM failures')
          return this.createFallbackThinkPlan()
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    // This should never be reached, but just in case
    console.error('🚨 Unexpected error in generateThinkPlans, using fallback')
    return this.createFallbackThinkPlan()
  }

  async generateSummary(
    currentMessages: ChatMessage[],
    stats: CandidateStats,
    candidatesText: string,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPromptForSummary(
      currentMessages[currentMessages.length - 1]?.text || '',
      stats,
      candidatesText,
    )
    const messages = this.convertMessagesToOpenAIFormat(currentMessages)

    const response = await this.invokeLlm(
      {
        messages,
        model: LLM_CONFIG.DEFAULT_MODEL,
      },
      systemPrompt,
      '/api/llm',
    )

    return response.message as unknown as string
  }
}

export const llmService = new LLMService(apiService)
