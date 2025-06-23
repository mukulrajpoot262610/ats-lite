'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Filter,
  ArrowUpDown,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Candidate } from '@/types/candidate.types'
import { FilterPlan, RankingPlan } from '@/types/mcp.types'
import ShinyText from '../animations/animated-shiny-text'

type ThinkingStepData = { filter?: FilterPlan; rank?: RankingPlan } | Candidate[] | string | null | undefined

interface ThinkingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed'
  data?: ThinkingStepData
  timestamp?: Date
}

interface ThinkingTimelineProps {
  steps: ThinkingStep[]
  isComplete?: boolean
  className?: string
}

export function ThinkingTimeline({ steps, isComplete = false, className }: ThinkingTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg p-4 my-2 w-full', 'backdrop-blur-sm', className)}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        {isComplete ? (
          <span className="text-sm font-medium">ATS-Lite finished thinking</span>
        ) : (
          <ShinyText text="ATS-Lite is thinking..." disabled={false} speed={3} className="custom-class text-sm" />
        )}
        {!isComplete && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.2,
                delay: index * 0.1,
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
                    <span className={cn('text-sm font-medium', getStepColor(step.status))}>{step.title}</span>
                    <span className="text-xs text-muted-foreground">{step.description}</span>
                  </div>
                </div>

                {/* Status & Expand */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}

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
    </motion.div>
  )
}

function StepDataDisplay({ step }: { step: ThinkingStep }) {
  switch (step.id) {
    case 'think':
      const planData = step.data as { filter?: FilterPlan; rank?: RankingPlan } | undefined
      return (
        <div className="space-y-2 text-xs">
          <div>
            <div className="font-medium text-muted-foreground mb-1">Filter Plan:</div>
            <pre className="bg-background/80 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(planData?.filter || {}, null, 2)}
            </pre>
          </div>
          <div>
            <div className="font-medium text-muted-foreground mb-1">Ranking Plan:</div>
            <pre className="bg-background/80 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(planData?.rank || {}, null, 2)}
            </pre>
          </div>
        </div>
      )

    case 'filter':
      return (
        <div className="text-xs space-y-1">
          <div className="text-muted-foreground">
            Found {Array.isArray(step.data) ? step.data.length : 0} matching candidates
          </div>
          {Array.isArray(step.data) && step.data.length > 0 && (
            <div className="text-muted-foreground">
              IDs: [
              {step.data
                .slice(0, 5)
                .map(c => c.id)
                .join(', ')}
              {step.data.length > 5 ? '...' : ''}]
            </div>
          )}
        </div>
      )

    case 'rank':
      return (
        <div className="text-xs space-y-1">
          <div className="text-muted-foreground">
            Ranked {Array.isArray(step.data) ? step.data.length : 0} candidates
          </div>
          {Array.isArray(step.data) && step.data.length > 0 && (
            <div className="text-muted-foreground">
              Top 5: [
              {step.data
                .slice(0, 5)
                .map(c => c.id)
                .join(', ')}
              ]
            </div>
          )}
        </div>
      )

    case 'speak':
      return (
        <div className="text-xs text-muted-foreground">
          Generated {typeof step.data === 'string' ? step.data.length : 0} character response
        </div>
      )

    default:
      return null
  }
}

// Helper to create timeline steps from MCP phases
export function createTimelineSteps(
  phase: string,
  plan?: { filter?: FilterPlan; rank?: RankingPlan },
  filtered?: Candidate[],
  ranked?: Candidate[],
  reply?: string,
): ThinkingStep[] {
  const steps: ThinkingStep[] = [
    {
      id: 'think',
      title: 'Think',
      description: 'Analyzing query and creating plans',
      icon: <Brain className="w-3 h-3" />,
      status: phase === 'thinking' ? 'active' : plan ? 'completed' : 'pending',
      data: plan,
    },
    {
      id: 'filter',
      title: 'Filter',
      description: `${filtered?.length || 0} candidates matched`,
      icon: <Filter className="w-3 h-3" />,
      status: phase === 'filtering' ? 'active' : filtered?.length ? 'completed' : 'pending',
      data: filtered,
    },
    {
      id: 'rank',
      title: 'Rank',
      description: 'Sorting by relevance',
      icon: <ArrowUpDown className="w-3 h-3" />,
      status: phase === 'ranking' ? 'active' : ranked?.length ? 'completed' : 'pending',
      data: ranked,
    },
    {
      id: 'speak',
      title: 'Speak',
      description: 'Generating response',
      icon: <MessageSquare className="w-3 h-3" />,
      status: phase === 'speaking' ? 'active' : reply ? 'completed' : 'pending',
      data: reply,
    },
  ]

  return steps
}
