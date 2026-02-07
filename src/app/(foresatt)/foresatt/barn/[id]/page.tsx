"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Target,
  ShieldOff,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { SubjectTabs } from "@/components/shared/subject-tabs"
import { AssessmentTable } from "@/components/shared/assessment-table"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
  description?: string | null
  classGroup: {
    subject: string
  }
  competenceGoals: Array<{
    competenceGoal: {
      code: string
      description: string
    }
  }>
}

interface CompetenceProfile {
  id: string
  level: string
  competenceGoal: {
    code: string
    area: string
    description: string
  }
}

interface ChildData {
  id: string
  name: string
  grade: number
  subjects: string[]
  teachers: Array<{ name: string; subject: string }>
  assessmentsBySubject: Record<string, Assessment[]>
  competenceBySubject: Record<string, CompetenceProfile[]>
  exemptions: Array<{
    subject: string
    subjectArea: string | null
    type: string
    validTo: string
  }>
  totalAssessments: number
}

export default function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [child, setChild] = useState<ChildData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState<string>("")

  useEffect(() => {
    fetchChild()
  }, [id])

  const fetchChild = async () => {
    try {
      const response = await fetch(`/api/foresatt/children/${id}`)
      if (response.ok) {
        const data = await response.json()
        setChild(data)
        if (data.subjects.length > 0) {
          setActiveSubject(data.subjects[0])
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "H":
      case "5":
      case "6":
        return "bg-green-100 text-green-800"
      case "M":
      case "3":
      case "4":
        return "bg-amber-100 text-amber-800"
      case "L":
      case "1":
      case "2":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  if (!child) {
    return <div className="text-center p-8">Kunne ikke laste data</div>
  }

  // Find teacher for active subject
  const activeTeacher = child.teachers.find((t) => t.subject === activeSubject)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/foresatt">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-brand-600" />
            {child.name}
          </h1>
          <p className="text-gray-600">{child.grade}. trinn | {child.totalAssessments} vurderinger</p>
        </div>
      </div>

      {/* Exemptions */}
      {child.exemptions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <ShieldOff className="h-5 w-5" />
              Aktive fritak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {child.exemptions.map((exemption, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                  <span>
                    {exemption.subject}
                    {exemption.subjectArea && ` (${exemption.subjectArea})`}
                  </span>
                  <span className="text-sm text-gray-500">
                    Gyldig til {format(new Date(exemption.validTo), "d. MMM yyyy", { locale: nb })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject tabs */}
      <SubjectTabs
        subjects={child.subjects}
        activeSubject={activeSubject}
        onValueChange={setActiveSubject}
      >
        {child.subjects.map((subject) => {
          const teacher = child.teachers.find((t) => t.subject === subject)

          return (
            <TabsContent key={subject} value={subject} className="space-y-6">
              {/* Teacher info */}
              {teacher && (
                <p className="text-sm text-gray-600">
                  Lærer: <span className="font-medium">{teacher.name}</span>
                </p>
              )}

              {/* Competence profile */}
              {child.competenceBySubject[subject]?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-brand-600" />
                      Kompetanseprofil
                    </CardTitle>
                    <CardDescription>
                      Nivå på hvert kompetansemål basert på vurderinger
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {child.competenceBySubject[subject].map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {profile.competenceGoal.code}
                              </Badge>
                              <span className="text-sm font-medium">
                                {profile.competenceGoal.area}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {profile.competenceGoal.description}
                            </p>
                          </div>
                          <Badge className={getLevelColor(profile.level)}>
                            {profile.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assessments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand-600" />
                    Vurderinger i {subject}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AssessmentTable
                    assessments={(child.assessmentsBySubject[subject] || []).map((a) => ({
                      ...a,
                      description: a.description || null,
                    }))}
                    showCompetenceGoals={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </SubjectTabs>
    </div>
  )
}
