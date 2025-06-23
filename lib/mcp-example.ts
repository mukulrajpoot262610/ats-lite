import { mcpService } from './mcp-service'
import { ChatMessage } from '@/types/chat.types'

/**
 * Example: How to use the MCP Client for candidate search
 *
 * This demonstrates the Think → Act → Act → Speak loop:
 * 1. THINK: LLM generates filter and ranking plans
 * 2. ACT 1: Filter candidates based on the plan
 * 3. ACT 2: Rank filtered candidates
 * 4. SPEAK: Generate recruiter-friendly summary
 */

export async function exampleMCPUsage() {
  // Example user query
  const userQuery: ChatMessage = {
    id: 'user-1',
    text: 'Find senior React developers with 5+ years experience who are available in 2 weeks',
    sender: 'user',
    timestamp: new Date(),
  }

  try {
    console.log('🔍 Starting MCP search for:', userQuery.text)

    // Execute the complete MCP loop
    const result = await mcpService.executeLoop([userQuery])

    console.log('\n📊 Search Results:')
    console.log(`- Found ${result.stats.count} candidates`)
    console.log(`- Average experience: ${result.stats.avg_experience} years`)
    console.log(`- Top skills: ${result.stats.top_skills.join(', ')}`)

    console.log('\n🏆 Top 5 Candidates:')
    result.topCandidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.full_name} - ${candidate.title}`)
      console.log(`   Experience: ${candidate.years_experience} years`)
      console.log(`   Skills: ${candidate.skills.slice(0, 3).join(', ')}`)
      console.log(`   Location: ${candidate.location}`)
    })

    console.log('\n📝 Recruiter Summary:')
    console.log(result.summary)

    return result
  } catch (error) {
    console.error('❌ MCP search failed:', error)
    throw error
  }
}

/**
 * Example: Step-by-step MCP execution with monitoring
 */
export async function exampleMCPWithSteps() {
  const userQuery: ChatMessage = {
    id: 'user-2',
    text: 'Find Python developers in San Francisco with machine learning experience',
    sender: 'user',
    timestamp: new Date(),
  }

  try {
    console.log('🔍 Starting step-by-step MCP search...')

    const result = await mcpService.executeLoopWithSteps([userQuery], step => {
      switch (step.step) {
        case 'think':
          console.log('🧠 THINK: Generated filter and ranking plans')
          console.log('   Filter:', JSON.stringify(step.data.filter, null, 2))
          console.log('   Rank:', JSON.stringify(step.data.rank, null, 2))
          break
        case 'filter':
          console.log(`🔧 FILTER: Found ${step.data.length} candidates`)
          break
        case 'rank':
          console.log(`📊 RANK: Ranked ${step.data.length} candidates`)
          break
        case 'speak':
          console.log('💬 SPEAK: Generated summary')
          break
      }
    })

    return result
  } catch (error) {
    console.error('❌ Step-by-step MCP failed:', error)
    throw error
  }
}

/**
 * Example: Manual step execution (for custom workflows)
 */
export async function exampleManualMCPSteps() {
  const userQuery: ChatMessage = {
    id: 'user-3',
    text: 'Find backend engineers with Go experience, willing to relocate',
    sender: 'user',
    timestamp: new Date(),
  }

  try {
    console.log('🔍 Manual MCP step execution...')

    // Step 1: THINK
    console.log('🧠 Step 1: THINK')
    const planResponse = await mcpService.think([userQuery])
    console.log('Generated plans:', planResponse)

    // Step 2: ACT 1 - Filter
    console.log('🔧 Step 2: FILTER')
    const filteredCandidates = mcpService.filter(planResponse.filter)
    console.log(`Filtered to ${filteredCandidates.length} candidates`)

    // Step 3: ACT 2 - Rank
    console.log('📊 Step 3: RANK')
    const rankedCandidates = mcpService.rank(planResponse.rank, filteredCandidates)
    console.log(`Ranked ${rankedCandidates.length} candidates`)

    // Get stats
    const stats = mcpService.getStats(rankedCandidates)
    console.log('Stats:', stats)

    // Step 4: SPEAK
    console.log('💬 Step 4: SPEAK')
    const topCandidates = rankedCandidates.slice(0, 5)
    const summary = await mcpService.speak([userQuery], topCandidates, stats)
    console.log('Summary:', summary)

    return {
      filteredCandidates,
      rankedCandidates,
      topCandidates,
      stats,
      summary,
    }
  } catch (error) {
    console.error('❌ Manual MCP steps failed:', error)
    throw error
  }
}

// Export for testing/demo purposes
export { mcpService }
