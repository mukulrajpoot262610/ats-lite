'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, Loader2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Candidate } from '@/types/candidate.types'
import { FilterPlan, RankingPlan } from '@/types/mcp.types'
import ShinyText from '../animations/animated-shiny-text'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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

export interface ThinkingTimelineProps {
  steps: ThinkingStep[]
  isComplete?: boolean
  className?: string
  defaultCollapsed?: boolean
  autoProgress?: boolean
}

export function ThinkingTimeline({
  steps,
  isComplete = false,
  className,
  defaultCollapsed = false,
  autoProgress = true,
}: ThinkingTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [visibleStepsCount, setVisibleStepsCount] = useState(autoProgress ? 1 : steps.length)
  const [isWaiting, setIsWaiting] = useState(false)
  const [activeStepId, setActiveStepId] = useState<string | null>(null)

  // Auto-progress through steps with 2-second delay and data validation
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

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

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

  const visibleSteps = steps.slice(0, visibleStepsCount)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg p-4 my-2 w-full', 'backdrop-blur-sm', className)}
    >
      <Collapsible open={!isCollapsed} onOpenChange={open => setIsCollapsed(!open)}>
        <CollapsibleTrigger className="flex items-center gap-2 mb-3 w-full hover:opacity-80 transition-opacity">
          <Brain className="w-4 h-4 text-primary" />
          {isComplete ? (
            <span className="text-sm font-medium">ATS-Lite finished thinking</span>
          ) : (
            <ShinyText text="ATS-Lite is thinking..." disabled={false} speed={3} className="custom-class text-sm" />
          )}
          {!isComplete && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          {isWaiting && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>waiting...</span>
            </div>
          )}
          <div className="ml-auto">
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {visibleSteps.map(step => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 py-1">
                    {/* Icon */}
                    <div className="flex-shrink-0">{step.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            getStepColor(activeStepId === step.id ? 'active' : step.status),
                          )}
                        >
                          {step.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{step.description}</span>
                      </div>
                    </div>

                    {/* Status & Expand */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activeStepId === step.id ? 'active' : step.status)}

                      {step.status === 'completed' && step.data && (
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedSteps.has(step.id) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Data */}
                  <AnimatePresence>
                    {expandedSteps.has(step.id) && step.data && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-2 overflow-hidden"
                      >
                        <StepDataDisplay step={step} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 pt-3 border-t border-border/50"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>Analysis complete</span>
              </div>
            </motion.div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  )
}

export function StepDataDisplay({ step }: { step: ThinkingStep }) {
  // Helper function to check if data is an array of candidates
  const isCandidateArray = (data: ThinkingStepData): data is Candidate[] => {
    return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'id' in data[0]
  }

  // Helper function to check if data is a filter plan object
  const isFilterPlan = (data: ThinkingStepData): data is { filter?: FilterPlan } => {
    return typeof data === 'object' && data !== null && 'filter' in data
  }

  // Helper function to check if data is a ranking plan object
  const isRankingPlan = (data: ThinkingStepData): data is { rank?: RankingPlan } => {
    return typeof data === 'object' && data !== null && 'rank' in data
  }

  // Safely extract data based on type
  const filterPlan = isFilterPlan(step.data) ? step.data : undefined
  const filteredCandidates = isCandidateArray(step.data) ? step.data : undefined
  const filteredIds = filteredCandidates?.map(c => c.id) || []

  const rankingPlan = isRankingPlan(step.data) ? step.data : undefined
  const rankedCandidates = isCandidateArray(step.data) ? step.data : undefined
  const rankedIds = rankedCandidates?.map(c => c.id) || []

  switch (step.id) {
    case 'filter-plan':
      return (
        <div className="text-xs">
          <div className="font-medium text-muted-foreground mb-2">Filter Plan JSON:</div>
          <pre className="bg-background/80 p-3 rounded text-xs overflow-x-auto border">
            {JSON.stringify(filterPlan?.filter || {}, null, 2)}
          </pre>
        </div>
      )

    case 'match-count':
      return (
        <div className="text-xs space-y-2">
          <div className="text-muted-foreground font-medium">
            Found {filteredCandidates?.length || 0} matching candidates
          </div>
          {filteredIds.length > 0 && (
            <div className="bg-background/80 p-3 rounded border">
              <div className="font-medium text-muted-foreground mb-2">Filtered IDs:</div>
              <div className="font-mono text-foreground">
                [{filteredIds.slice(0, 10).join(', ')}
                {filteredIds.length > 10 ? ', …' : ''}]
              </div>
            </div>
          )}
        </div>
      )

    case 'ranking-plan':
      return (
        <div className="text-xs">
          <div className="font-medium text-muted-foreground mb-2">Ranking Plan JSON:</div>
          <pre className="bg-background/80 p-3 rounded text-xs overflow-x-auto border">
            {JSON.stringify(rankingPlan?.rank || {}, null, 2)}
          </pre>
        </div>
      )

    case 'ranked-ids':
      return (
        <div className="text-xs space-y-2">
          <div className="text-muted-foreground font-medium">
            Ranked {rankedCandidates?.length || 0} candidates by relevance
          </div>
          {rankedIds.length > 0 && (
            <div className="bg-background/80 p-3 rounded border">
              <div className="font-medium text-muted-foreground mb-2">Ranked IDs:</div>
              <div className="font-mono text-foreground">
                [{rankedIds.slice(0, 10).join(', ')}
                {rankedIds.length > 10 ? ', …' : ''}]
              </div>
            </div>
          )}
        </div>
      )

    case 'summary':
      return (
        <div className="text-xs space-y-2">
          <div className="text-muted-foreground font-medium">
            Generated {typeof step.data === 'string' ? step.data.length : 0} character summary
          </div>
        </div>
      )

    default:
      return null
  }
}
