import { useEffect } from 'react'
import { ThinkingStep } from '@/components/chat/thinking-timeline'

interface UseTimelineProgressionProps {
  steps: ThinkingStep[]
  autoProgress: boolean
  isComplete: boolean
  visibleStepsCount: number
  setVisibleStepsCount: (value: number | ((prev: number) => number)) => void
  setIsWaiting: (value: boolean) => void
  setActiveStepId: (value: string | null) => void
}

export function useTimelineProgression({
  steps,
  autoProgress,
  isComplete,
  setVisibleStepsCount,
  setIsWaiting,
  setActiveStepId,
}: UseTimelineProgressionProps) {
  // Handle auto-progression
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
  }, [steps, autoProgress, isComplete, setVisibleStepsCount, setIsWaiting, setActiveStepId])

  // Show all steps immediately when complete
  useEffect(() => {
    if (isComplete) {
      setVisibleStepsCount(steps.length)
    }
  }, [isComplete, steps.length, setVisibleStepsCount])
}
