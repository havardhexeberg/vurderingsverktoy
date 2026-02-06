"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Target,
  CheckCircle,
  Circle,
  TrendingUp,
  Calendar,
  MessageSquare,
  ChevronRight,
  Star,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface Assessment {
  id: string
  date: string
  description: string | null
  grade: number | null
  feedback: string | null
  form: string
  type: string
}

interface CompetenceGoal {
  id: string
  code: string
  area: string
  description: string
}

interface CompetenceData {
  goal: CompetenceGoal
  profile: { level: string } | null
  assessmentCount: number
  assessments?: Assessment[]
  averageGrade?: number | null
}

interface StudentProfile {
  subjects: string[]
  competenceBySubject: Record<string, CompetenceData[]>
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

function KompetanseContent() {
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get("fag")

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState<string>("")
  const [selectedGoal, setSelectedGoal] = useState<CompetenceData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile && initialSubject && profile.subjects.includes(initialSubject)) {
      setActiveSubject(initialSubject)
    } else if (profile && profile.subjects.length > 0 && !activeSubject) {
      setActiveSubject(profile.subjects[0])
    }
  }, [profile, initialSubject, activeSubject])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/elev/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeColor = (grade: number | null) => {
    if (!grade) return "bg-gray-100 text-gray-600"
    if (grade >= 5) return "bg-green-100 text-green-800"
    if (grade >= 3) return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
  }

  const openGoalDetails = (item: CompetenceData) => {
    setSelectedGoal(item)
    setDialogOpen(true)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  if (!profile) {
    return <div className="text-center p-8">Kunne ikke laste data</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-cyan-600" />
          Mine kompetansemal
        </h1>
        <p className="text-gray-600">Se hvor du star pa hvert kompetansemal - trykk for detaljer</p>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-600">Maloppnaelse:</span>
            <div className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-800">5-6</Badge>
              <span>Hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-amber-100 text-amber-800">3-4</Badge>
              <span>Middels</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-red-100 text-red-800">1-2</Badge>
              <span>Lav</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="bg-gray-100 text-gray-600">-</Badge>
              <span>Ikke vurdert</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject tabs */}
      <Tabs value={activeSubject} onValueChange={setActiveSubject}>
        <TabsList className="flex-wrap">
          {profile.subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {profile.subjects.map((subject) => {
          const goals = profile.competenceBySubject[subject] || []
          const assessed = goals.filter(g => g.assessmentCount > 0).length
          const coverage = goals.length > 0 ? Math.round((assessed / goals.length) * 100) : 0

          // Group by area
          const byArea: Record<string, CompetenceData[]> = {}
          goals.forEach(g => {
            if (!byArea[g.goal.area]) {
              byArea[g.goal.area] = []
            }
            byArea[g.goal.area].push(g)
          })

          return (
            <TabsContent key={subject} value={subject} className="space-y-6">
              {/* Summary card */}
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{subject}</h2>
                      <p className="text-gray-600">{goals.length} kompetansemal</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-600">{coverage}%</div>
                      <div className="text-sm text-gray-600">dekket</div>
                    </div>
                  </div>
                  <Progress value={coverage} className="h-3" />
                  <div className="mt-2 text-sm text-gray-600">
                    {assessed} av {goals.length} mal har blitt vurdert
                  </div>
                </CardContent>
              </Card>

              {/* Competence areas */}
              <Accordion type="multiple" className="space-y-4">
                {Object.entries(byArea).map(([area, areaGoals]) => (
                  <AccordionItem
                    key={area}
                    value={area}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-cyan-600" />
                        <span className="font-medium">{area}</span>
                        <Badge variant="outline">
                          {areaGoals.filter(g => g.assessmentCount > 0).length}/{areaGoals.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {areaGoals.map((item) => (
                          <button
                            key={item.goal.id}
                            onClick={() => openGoalDetails(item)}
                            className="w-full flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                          >
                            <div className="mt-1">
                              {item.assessmentCount > 0 ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.goal.code}
                                </Badge>
                                {item.assessmentCount > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {item.assessmentCount} vurdering{item.assessmentCount > 1 ? "er" : ""}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">
                                {item.goal.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.averageGrade !== undefined && item.averageGrade !== null ? (
                                <div className="flex flex-col items-center">
                                  <Badge className={getGradeColor(item.averageGrade)}>
                                    <Star className="h-3 w-3 mr-1" />
                                    {item.averageGrade}
                                  </Badge>
                                  <span className="text-xs text-gray-500 mt-1">snitt</span>
                                </div>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600">-</Badge>
                              )}
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Tips */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">Tips</h3>
                      <p className="text-sm text-amber-800 mt-1">
                        {coverage < 50
                          ? "Du har fortsatt mange kompetansemal som ikke er vurdert. Spor laereren din om muligheter for a vise kompetanse."
                          : coverage < 80
                          ? "Du er godt pa vei! Fokuser pa de gjenvaerende kompetansemalene."
                          : "Flott jobbet! Du har vist kompetanse pa de fleste malene."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Competence Goal Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-600" />
              {selectedGoal?.goal.code}
            </DialogTitle>
            <DialogDescription>
              {selectedGoal?.goal.area}
            </DialogDescription>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-6">
              {/* Goal description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{selectedGoal.goal.description}</p>
              </div>

              {/* Achievement summary */}
              <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Maloppnaelse</p>
                  <p className="font-semibold">
                    {selectedGoal.averageGrade !== undefined && selectedGoal.averageGrade !== null
                      ? `Snittkarakter: ${selectedGoal.averageGrade}`
                      : "Ikke vurdert enna"}
                  </p>
                </div>
                {selectedGoal.averageGrade !== undefined && selectedGoal.averageGrade !== null && (
                  <Badge className={`text-lg px-4 py-2 ${getGradeColor(selectedGoal.averageGrade)}`}>
                    {selectedGoal.averageGrade}
                  </Badge>
                )}
              </div>

              {/* Assessments list */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vurderinger ({selectedGoal.assessmentCount})
                </h4>

                {!selectedGoal.assessments || selectedGoal.assessments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Ingen vurderinger registrert for dette kompetansemalet enna.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedGoal.assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {format(new Date(assessment.date), "d. MMMM yyyy", { locale: nb })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {FORM_LABELS[assessment.form] || assessment.form}
                            </Badge>
                          </div>
                          {assessment.grade !== null && (
                            <Badge className={getGradeColor(assessment.grade)}>
                              Karakter: {assessment.grade}
                            </Badge>
                          )}
                        </div>

                        {assessment.description && (
                          <p className="text-sm font-medium">{assessment.description}</p>
                        )}

                        {assessment.feedback && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded">
                            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-900">{assessment.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function KompetansePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Laster...</div>}>
      <KompetanseContent />
    </Suspense>
  )
}
