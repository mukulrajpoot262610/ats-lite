import { useState } from 'react'

export function useTimelineState(defaultCollapsed: boolean = false, autoProgress: boolean = true, stepsLength: number) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [visibleStepsCount, setVisibleStepsCount] = useState(autoProgress ? 1 : stepsLength)
  const [isWaiting, setIsWaiting] = useState(false)
  const [activeStepId, setActiveStepId] = useState<string | null>(null)

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

  return {
    expandedSteps,
    isCollapsed,
    visibleStepsCount,
    isWaiting,
    activeStepId,
    setVisibleStepsCount,
    setIsWaiting,
    setActiveStepId,
    toggleStep,
    toggleCollapsed,
  }
}
