import { FilterPlan, RankingPlan, Candidate } from '@/types'
import { Brain, ArrowUpDown, Filter, MessageSquare } from 'lucide-react'
import { ThinkingStep } from './thinking-timeline'

const CreateTimelineSteps = (
  phase: string,
  plan?: { filter?: FilterPlan; rank?: RankingPlan } | null,
  filtered?: Candidate[] | null,
  ranked?: Candidate[] | null,
  summary?: string | null,
): ThinkingStep[] => {
  const steps: ThinkingStep[] = [
    {
      id: 'filter-plan',
      title: 'Filter Plan',
      description: 'Creating filter criteria',
      icon: <Brain className="w-3 h-3" />,
      status: phase === 'thinking' ? 'active' : plan?.filter ? 'completed' : 'pending',
      data: { filter: plan?.filter },
    },
    {
      id: 'match-count',
      title: 'Match Count',
      description: `${filtered?.length || 0} candidates found`,
      icon: <Filter className="w-3 h-3" />,
      status: phase === 'filtering' ? 'active' : filtered ? 'completed' : 'pending',
      data: filtered,
    },
    {
      id: 'ranking-plan',
      title: 'Ranking Plan',
      description: 'Creating ranking criteria',
      icon: <ArrowUpDown className="w-3 h-3" />,
      status: phase === 'ranking' && !ranked ? 'active' : plan?.rank ? 'completed' : 'pending',
      data: { rank: plan?.rank },
    },
    {
      id: 'ranked-ids',
      title: 'Ranked Results',
      description: 'Final candidate rankings',
      icon: <Filter className="w-3 h-3" />,
      status: phase === 'speaking' ? 'active' : ranked ? 'completed' : 'pending',
      data: ranked,
    },
    {
      id: 'summary',
      title: 'Generate Summary',
      description: 'Creating response summary',
      icon: <MessageSquare className="w-3 h-3" />,
      status: phase === 'speaking' ? 'active' : summary ? 'completed' : 'pending',
      data: summary,
    },
  ]

  if (filtered && filtered.length === 0) {
    return steps.slice(0, 2)
  }

  return steps
}
export default CreateTimelineSteps
