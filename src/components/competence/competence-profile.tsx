"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"

interface CompetenceGoalStatus {
  id: string
  code: string
  area: string
  description: string
  level: string | null
  assessmentCount: number
  averageGrade: number | null
  lastAssessmentDate: string | null
  isManualOverride: boolean
}

interface CompetenceArea {
  name: string
  goals: CompetenceGoalStatus[]
  coverage: number
  averageLevel: string | null
}

interface CompetenceProfileData {
  areas: CompetenceArea[]
  totalGoals: number
  assessedGoals: number
  overallCoverage: number
}

interface CompetenceProfileProps {
  studentId: string
  classGroupId: string
}

const LEVEL_LABELS: Record<string, string> = {
  H: "Høy måloppnåelse",
  M: "Middels måloppnåelse",
  L: "Lav måloppnåelse",
}

const LEVEL_COLORS: Record<string, string> = {
  H: "bg-green-100 text-green-800 border-green-300",
  M: "bg-amber-100 text-amber-800 border-amber-300",
  L: "bg-red-100 text-red-800 border-red-300",
}

export function CompetenceProfile({ studentId, classGroupId }: CompetenceProfileProps) {
  const [profile, setProfile] = useState<CompetenceProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [studentId, classGroupId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `/api/students/${studentId}/competence-profile?classGroupId=${classGroupId}`
      )
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster kompetanseprofil...</div>
  }

  if (!profile) {
    return <div className="text-center p-8 text-gray-500">Kunne ikke laste kompetanseprofil</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kompetanseprofil</CardTitle>
            <CardDescription>
              {profile.assessedGoals} av {profile.totalGoals} kompetansemål vurdert
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{profile.overallCoverage}%</div>
            <div className="text-sm text-gray-500">total dekning</div>
          </div>
        </div>
        <Progress value={profile.overallCoverage} className="mt-2" />
      </CardHeader>
      <CardContent>
        {profile.areas.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Ingen kompetansemål funnet for dette faget
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {profile.areas.map((area) => (
              <AccordionItem key={area.name} value={area.name}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{area.name}</span>
                      {area.averageLevel && (
                        <Badge
                          variant="outline"
                          className={LEVEL_COLORS[area.averageLevel]}
                        >
                          {area.averageLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{area.coverage}% dekket</span>
                      <span className="text-gray-300">|</span>
                      <span>{area.goals.length} mål</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-2">
                    {area.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div className="mt-0.5">
                          {goal.level ? (
                            <CheckCircle
                              className={`h-5 w-5 ${
                                goal.level === "H"
                                  ? "text-green-500"
                                  : goal.level === "M"
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">
                              {goal.code}
                            </span>
                            {goal.isManualOverride && (
                              <Badge variant="outline" className="text-xs">
                                Manuell
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {goal.description}
                          </p>
                          {goal.level && (
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{LEVEL_LABELS[goal.level]}</span>
                              {goal.averageGrade && (
                                <span>Snitt: {goal.averageGrade}</span>
                              )}
                              <span>
                                {goal.assessmentCount} vurdering
                                {goal.assessmentCount !== 1 ? "er" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        {goal.level && (
                          <Badge
                            variant="outline"
                            className={`${LEVEL_COLORS[goal.level]} shrink-0`}
                          >
                            {goal.level}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
