'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMCPStore } from '@/store/useMcpStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Filter, ArrowUpDown, MessageSquare, CheckCircle2, Loader2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Candidate } from '@/types/candidate.types'
import { FilterPlan, RankingPlan } from '@/types/mcp.types'

type TimelineStepData = { filter?: FilterPlan; rank?: RankingPlan } | Candidate[] | string | null | undefined

interface TimelineStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed'
  data?: TimelineStepData
}

export function TimelineSidebar() {
  const { phase, plan, filtered, ranked, reply } = useMCPStore()

  const getSteps = (): TimelineStep[] => [
    {
      id: 'think',
      title: 'Think',
      description: 'Generating filter and ranking plans',
      icon: <Brain className="w-4 h-4" />,
      status: phase === 'thinking' ? 'active' : phase === 'idle' ? 'pending' : 'completed',
      data: plan,
    },
    {
      id: 'filter',
      title: 'Filter',
      description: `${filtered.length} candidates matched`,
      icon: <Filter className="w-4 h-4" />,
      status: phase === 'filtering' ? 'active' : ['idle', 'thinking'].includes(phase) ? 'pending' : 'completed',
      data: filtered,
    },
    {
      id: 'rank',
      title: 'Rank',
      description: 'Sorting candidates by criteria',
      icon: <ArrowUpDown className="w-4 h-4" />,
      status:
        phase === 'ranking' ? 'active' : ['idle', 'thinking', 'filtering'].includes(phase) ? 'pending' : 'completed',
      data: ranked,
    },
    {
      id: 'speak',
      title: 'Speak',
      description: 'Generating summary response',
      icon: <MessageSquare className="w-4 h-4" />,
      status: phase === 'speaking' ? 'active' : phase === 'idle' && reply ? 'completed' : 'pending',
      data: reply,
    },
  ]

  const steps = getSteps()

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-950'
      default:
        return 'border-muted bg-muted/20'
    }
  }

  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          ATS-Lite Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className={cn('p-3 rounded-lg border transition-all duration-300', getStatusColor(step.status))}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex-shrink-0">{step.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <Badge
                        variant={
                          step.status === 'completed' ? 'default' : step.status === 'active' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
              </div>

              {/* Show data preview for completed steps */}
              <AnimatePresence>
                {step.status === 'completed' && step.data && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-border/50"
                  >
                    <TimelineStepData step={step} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {phase === 'idle' && !reply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground py-4"
          >
            Send a message to start the ATS workflow
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function TimelineStepData({ step }: { step: TimelineStep }) {
  const planData = step.data as { filter?: FilterPlan; rank?: RankingPlan } | undefined
  switch (step.id) {
    case 'think':
      return (
        <div className="space-y-2">
          <div className="text-xs font-medium">Filter Plan:</div>
          <pre className="text-xs bg-muted p-2 rounded text-muted-foreground overflow-x-auto">
            {JSON.stringify(planData?.filter || {}, null, 2)}
          </pre>
          <div className="text-xs font-medium">Ranking Plan:</div>
          <pre className="text-xs bg-muted p-2 rounded text-muted-foreground overflow-x-auto">
            {JSON.stringify(planData?.rank || {}, null, 2)}
          </pre>
        </div>
      )

    case 'filter':
      return (
        <div className="space-y-1">
          <div className="text-xs font-medium">Matched Candidates:</div>
          <div className="text-xs text-muted-foreground">
            {Array.isArray(step.data) ? step.data.length : 0} candidates found
          </div>
          {Array.isArray(step.data) && step.data.length > 0 && (
            <div className="text-xs text-muted-foreground">
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
        <div className="space-y-1">
          <div className="text-xs font-medium">Ranked Order:</div>
          {Array.isArray(step.data) && step.data.length > 0 && (
            <div className="text-xs text-muted-foreground">
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
        <div className="space-y-1">
          <div className="text-xs font-medium">Response Generated:</div>
          <div className="text-xs text-muted-foreground">
            {typeof step.data === 'string' ? `${step.data.slice(0, 100)}...` : 'Summary complete'}
          </div>
        </div>
      )

    default:
      return null
  }
}
