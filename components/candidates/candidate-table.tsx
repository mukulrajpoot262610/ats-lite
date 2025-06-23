'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Candidate } from '@/types/candidate.types'
import { MapPin, Clock, DollarSign, User, Building, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CandidateTableProps {
  candidates: Candidate[]
  isLoading?: boolean
  onCandidateClick?: (candidate: Candidate) => void
}

export function CandidateTable({ candidates, isLoading = false, onCandidateClick }: CandidateTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (candidateId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId)
    } else {
      newExpanded.add(candidateId)
    }
    setExpandedRows(newExpanded)
  }

  const formatSalary = (salary?: number) => {
    if (!salary) return 'Not specified'
    return `$${salary.toLocaleString()}`
  }

  const getExperienceColor = (years: number) => {
    if (years >= 15) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    if (years >= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (years >= 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (years >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted animate-pulse rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-20 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
        <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No candidates found</p>
        <p className="text-sm">Try adjusting your search criteria</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold">
          Found {candidates.length} candidate{candidates.length === 1 ? '' : 's'}
        </h3>
        <div className="text-sm text-muted-foreground">Ranked by relevance and experience</div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            layoutId={`candidate-${candidate.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              layout: { duration: 0.3 },
            }}
            className={cn(
              'bg-background border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer',
              'hover:border-primary/20',
            )}
            onClick={() => onCandidateClick?.(candidate)}
          >
            <div className="flex items-start gap-4">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium"
                >
                  {index + 1}
                </motion.div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">{candidate.full_name}</h4>
                    <p className="text-muted-foreground font-medium">{candidate.title}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getExperienceColor(candidate.years_experience)}>
                      {candidate.years_experience}y exp
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        toggleRow(candidate.id)
                      }}
                    >
                      {expandedRows.has(candidate.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Info Row */}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {candidate.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatSalary(candidate.desired_salary_usd)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {candidate.work_preference}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {candidate.availability_weeks === 0
                      ? 'Available now'
                      : `Available in ${candidate.availability_weeks}w`}
                  </div>
                </div>

                {/* Top Skills */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {candidate.skills.slice(0, 5).map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{candidate.skills.length - 5} more
                    </Badge>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedRows.has(candidate.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-2">Professional Details</h5>
                          <div className="space-y-1 text-muted-foreground">
                            <div>
                              Education: {candidate.education_level} in {candidate.degree_major}
                            </div>
                            <div>Remote Experience: {candidate.remote_experience_years} years</div>
                            <div>Notice Period: {candidate.notice_period_weeks} weeks</div>
                            <div>Visa Status: {candidate.visa_status}</div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Preferences</h5>
                          <div className="space-y-1 text-muted-foreground">
                            <div>Willing to Relocate: {candidate.willing_to_relocate ? 'Yes' : 'No'}</div>
                            <div>Open to Contract: {candidate.open_to_contract ? 'Yes' : 'No'}</div>
                            <div>Languages: {candidate.languages.join(', ')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Summary</h5>
                        <p className="text-sm text-muted-foreground">{candidate.summary}</p>
                      </div>

                      {candidate.linkedin_url && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation()
                              window.open(candidate.linkedin_url, '_blank')
                            }}
                            className="gap-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            LinkedIn Profile
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
