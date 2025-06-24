import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, Clock } from 'lucide-react'
import { Candidate, FilterPlan, RankingPlan } from '@/types'

export type ThinkingStepData = { filter?: FilterPlan; rank?: RankingPlan } | Candidate[] | string | null | undefined

export interface ThinkingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed'
  data?: ThinkingStepData
  timestamp?: Date
}

interface UseTimelineProps {
  steps: ThinkingStep[]
  defaultCollapsed?: boolean
  autoProgress?: boolean
  isComplete?: boolean
}

export function useTimeline({
  steps,
  defaultCollapsed = false,
  autoProgress = true,
  isComplete = false,
}: UseTimelineProps) {
  // State management
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [visibleStepsCount, setVisibleStepsCount] = useState(autoProgress ? 1 : steps.length)
  const [isWaiting, setIsWaiting] = useState(false)
  const [activeStepId, setActiveStepId] = useState<string | null>(null)

  // Status utilities
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 dark:text-blue-400'
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-muted-foreground'
    }
  }

  // Actions
  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Auto-progression effect
  useEffect(() => {
    if (!autoProgress || isComplete) return

    const timer = setInterval(() => {
      setVisibleStepsCount(prev => {
        // Check if current step has data before proceeding
        if (prev > 0 && prev <= steps.length) {
          const currentStep = steps[prev - 1]
          if (!currentStep?.data) {
            // Break progression if current step has no data
            clearInterval(timer)
            setIsWaiting(false)
            setActiveStepId(null)
            return prev
          }
        }

        const next = prev + 1
        if (next >= steps.length) {
          clearInterval(timer)
          setIsWaiting(false)
          setActiveStepId(null)
          return steps.length
        }

        // Show waiting state and mark next step as active
        setIsWaiting(true)
        if (next <= steps.length) {
          setActiveStepId(steps[next - 1]?.id || null)
        }

        setTimeout(() => {
          setIsWaiting(false)
          setActiveStepId(null)
        }, 2000)

        return next
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [steps, autoProgress, isComplete])

  // Show all steps immediately when complete
  useEffect(() => {
    if (isComplete) {
      setVisibleStepsCount(steps.length)
    }
  }, [isComplete, steps.length])

  // Computed values
  const visibleSteps = steps.slice(0, visibleStepsCount)

  return {
    // State
    expandedSteps,
    isCollapsed,
    visibleStepsCount,
    isWaiting,
    activeStepId,
    visibleSteps,

    // Actions
    toggleStep,
    toggleCollapsed,

    // Utilities
    getStatusIcon,
    getStepColor,
  }
}
