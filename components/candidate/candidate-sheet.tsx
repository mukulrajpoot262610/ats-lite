import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Candidate } from '@/types'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  User,
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  Building,
  GraduationCap,
  Globe,
  Calendar,
  Languages,
  Award,
  ExternalLink,
  Mail,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSalary, formatDate } from '@/lib/utils'

const CandidateSheet = ({
  selectedCandidate,
  setSelectedCandidate,
}: {
  selectedCandidate: Candidate
  setSelectedCandidate: (candidate: Candidate | null) => void
}) => {
  return (
    <Sheet open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
      <SheetContent side="right" style={{ maxWidth: '40vw' }}>
        {selectedCandidate && (
          <div className="h-full flex flex-col w-full">
            <SheetHeader className="pb-4">
              <SheetTitle>Candidate Details</SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{selectedCandidate.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedCandidate.title}</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className={cn('font-medium')}>{selectedCandidate.years_experience} years</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Desired Salary</p>
                          <p className="font-medium">{formatSalary(selectedCandidate.desired_salary_usd)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Location & Availability */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Location & Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCandidate.location}</span>
                      <Badge className="text-xs">{selectedCandidate.timezone}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedCandidate.availability_weeks === 0
                          ? 'Available now'
                          : `Available in ${selectedCandidate.availability_weeks} weeks`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCandidate.work_preference}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map(skill => (
                        <Badge key={skill} className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Education & Experience */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Education & Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{selectedCandidate.education_level}</p>
                        <p className="text-xs text-muted-foreground">{selectedCandidate.degree_major}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Remote Experience</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedCandidate.remote_experience_years} years
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Notice Period</p>
                        <p className="text-xs text-muted-foreground">{selectedCandidate.notice_period_weeks} weeks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages & Citizenship */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Languages & Citizenship</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Languages className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Languages</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.languages.map(language => (
                          <Badge key={language} className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Citizenships</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.citizenships.map(citizenship => (
                          <Badge key={citizenship} className="text-xs">
                            {citizenship}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Visa Status:</span>
                      <Badge className="text-xs">{selectedCandidate.visa_status}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Willing to relocate</span>
                      <Badge className={selectedCandidate.willing_to_relocate ? '' : 'bg-secondary'}>
                        {selectedCandidate.willing_to_relocate ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Open to contract work</span>
                      <Badge className={selectedCandidate.open_to_contract ? '' : 'bg-secondary'}>
                        {selectedCandidate.open_to_contract ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedCandidate.summary}</p>
                  </CardContent>
                </Card>

                {/* Tags */}
                {selectedCandidate.tags.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.tags.map(tag => (
                          <Badge key={tag} className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Last Active */}
                <div className="text-center text-xs text-muted-foreground">
                  Last active: {formatDate(selectedCandidate.last_active)}
                </div>

                {/* Actions */}
                <div className="space-y-3 pb-4">
                  {selectedCandidate.linkedin_url && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => window.open(selectedCandidate.linkedin_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View LinkedIn Profile
                    </Button>
                  )}
                  <Button className="w-full gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Candidate
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
export default CandidateSheet
