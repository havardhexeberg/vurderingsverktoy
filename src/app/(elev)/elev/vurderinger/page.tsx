"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Calendar, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
  description: string | null
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

interface StudentProfile {
  subjects: string[]
  assessmentsBySubject: Record<string, Assessment[]>
  totalAssessments: number
}

export default function VurderingerPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState<string>("")

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile && profile.subjects.length > 0 && !activeSubject) {
      setActiveSubject(profile.subjects[0])
    }
  }, [profile])

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

  const getFormLabel = (form: string) => {
    const labels: Record<string, string> = {
      WRITTEN: "Skriftlig",
      ORAL: "Muntlig",
      ORAL_PRACTICAL: "Muntlig-praktisk",
      PRACTICAL: "Praktisk",
    }
    return labels[form] || form
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ONGOING: "Underveisvurdering",
      MIDTERM: "Halvårsvurdering",
      FINAL: "Standpunkt",
    }
    return labels[type] || type
  }

  const getGradeBadgeColor = (grade: number) => {
    if (grade >= 5) return "bg-green-100 text-green-800"
    if (grade >= 3) return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
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
          <BookOpen className="h-6 w-6 text-cyan-600" />
          Mine vurderinger
        </h1>
        <p className="text-gray-600">Alle publiserte vurderinger fra lærerne dine</p>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{profile.totalAssessments}</div>
              <div className="text-sm text-gray-600">Totalt</div>
            </div>
            {profile.subjects.slice(0, 3).map((subject) => {
              const count = profile.assessmentsBySubject[subject]?.length || 0
              return (
                <div key={subject} className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">{count}</div>
                  <div className="text-sm text-gray-600">{subject}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subject tabs */}
      <Tabs value={activeSubject} onValueChange={setActiveSubject}>
        <TabsList className="flex-wrap">
          {profile.subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
              <Badge variant="secondary" className="ml-2">
                {profile.assessmentsBySubject[subject]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {profile.subjects.map((subject) => {
          const assessments = profile.assessmentsBySubject[subject] || []

          return (
            <TabsContent key={subject} value={subject} className="space-y-6">
              {assessments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Ingen vurderinger ennå</h3>
                    <p className="text-gray-500">Du har ingen publiserte vurderinger i dette faget.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Assessments table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Vurderinger i {subject}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Dato</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Form</TableHead>
                            <TableHead>Karakter</TableHead>
                            <TableHead>Kompetansemål</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assessments.map((assessment) => (
                            <TableRow key={assessment.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {format(new Date(assessment.date), "d. MMM yyyy", { locale: nb })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{getTypeLabel(assessment.type)}</Badge>
                              </TableCell>
                              <TableCell>{getFormLabel(assessment.form)}</TableCell>
                              <TableCell>
                                {assessment.grade ? (
                                  <Badge className={getGradeBadgeColor(assessment.grade)}>
                                    {assessment.grade}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {assessment.competenceGoals.slice(0, 3).map((cg, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {cg.competenceGoal.code}
                                    </Badge>
                                  ))}
                                  {assessment.competenceGoals.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{assessment.competenceGoals.length - 3}
                                    </Badge>
                                  )}
                                  {assessment.competenceGoals.length === 0 && "-"}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Feedback section */}
                  {assessments.some((a) => a.feedback) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-cyan-600" />
                          Tilbakemeldinger
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {assessments
                            .filter((a) => a.feedback)
                            .map((assessment) => (
                              <div
                                key={assessment.id}
                                className="p-4 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">{getFormLabel(assessment.form)}</span>
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(assessment.date), "d. MMM yyyy", { locale: nb })}
                                  </span>
                                  {assessment.grade && (
                                    <Badge className={getGradeBadgeColor(assessment.grade)}>
                                      {assessment.grade}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm">{assessment.feedback}</p>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
