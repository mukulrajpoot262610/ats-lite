import { ChatMessage } from '@/types/chat.types'
import { CandidateStats, FilterPlan, RankingPlan } from '@/types/mcp.types'
import { ApiService, apiService } from './api-service'
import { OpenAIChatMessage } from '@/types/openai.types'
import { OpenAIChatRequest } from '@/types/api.types'
import { LLM_CONFIG } from '@/constants/app-config'
import { getCsvHeaders } from './csv-service'

export class LLMService {
  private apiService: ApiService
  constructor(apiService: ApiService) {
    this.apiService = apiService
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
- Invent field names (e.g., “availability” ❌)
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

      return JSON.parse(response.message) as unknown as { filter: FilterPlan; rank: RankingPlan }
    } catch (error) {
      console.error('Error generating think plans:', error)
      throw error
    }
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
