'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Candidate } from '@/types'
import { MapPin, DollarSign, User, Building, ChevronDown, ChevronUp, ExternalLink, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatSalary, getExperienceColor } from '@/lib/utils'

interface CandidateResultsProps {
  candidates: Candidate[]
  onCandidateClick?: (candidate: Candidate) => void
}

const CandidateResults = ({ candidates, onCandidateClick }: CandidateResultsProps) => {
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)

  const toggleCandidate = (candidateId: string) => {
    const newExpanded = new Set(expandedCandidates)
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId)
    } else {
      newExpanded.add(candidateId)
    }
    setExpandedCandidates(newExpanded)
  }

  const displayedCandidates = showAll ? candidates : candidates.slice(0, 5)

  if (candidates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-border/50"
      >
        <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No candidates found</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/30 rounded-lg border border-border/50 p-4 my-2 backdrop-blur-sm w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 w-full">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="font-medium">
            Found {candidates.length} candidate{candidates.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">Ranked by relevance</div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              layoutId={`chat-candidate-${candidate.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                layout: { duration: 0.2 },
              }}
              className={cn(
                'bg-background/80 border border-border/50 rounded-lg p-3 hover:shadow-sm transition-all duration-200 cursor-pointer',
                'hover:border-primary/20',
              )}
              onClick={() => onCandidateClick?.(candidate)}
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium"
                  >
                    {index + 1}
                  </motion.div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{candidate.full_name}</h4>
                      <p className="text-xs text-muted-foreground">{candidate.title}</p>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={cn(getExperienceColor(candidate.years_experience), 'text-xs')}>
                        {candidate.years_experience}y
                      </Badge>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          toggleCandidate(candidate.id)
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedCandidates.has(candidate.id) ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" />
                      {formatSalary(candidate.desired_salary_usd)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="w-2.5 h-2.5" />
                      {candidate.work_preference}
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {candidate.skills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        +{candidate.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedCandidates.has(candidate.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 pt-3 border-t border-border/50 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Professional</div>
                            <div className="space-y-0.5 text-muted-foreground">
                              <div>Education: {candidate.education_level}</div>
                              <div>Remote: {candidate.remote_experience_years}y</div>
                              <div>Notice: {candidate.notice_period_weeks}w</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Preferences</div>
                            <div className="space-y-0.5 text-muted-foreground">
                              <div>Relocate: {candidate.willing_to_relocate ? 'Yes' : 'No'}</div>
                              <div>Contract: {candidate.open_to_contract ? 'Yes' : 'No'}</div>
                              <div>Visa: {candidate.visa_status}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="font-medium text-muted-foreground mb-1 text-xs">Summary</div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {candidate.summary.slice(0, 150)}...
                          </p>
                        </div>

                        {candidate.linkedin_url && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation()
                                window.open(candidate.linkedin_url, '_blank')
                              }}
                              className="gap-1 h-6 px-2 text-xs"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              LinkedIn
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

      {/* Show More/Less Button */}
      {candidates.length > 5 && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="text-xs">
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {candidates.length - 5} More
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
export default CandidateResults
