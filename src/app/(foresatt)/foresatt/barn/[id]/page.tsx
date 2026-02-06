"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Target,
  ShieldOff,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
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
            <GraduationCap className="h-6 w-6 text-rose-600" />
            {child.name}
          </h1>
          <p className="text-gray-600">{child.grade}. trinn | {child.totalAssessments} vurderinger</p>
        </div>
      </div>

      {/* Teachers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Lærere
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {child.teachers.map((teacher, i) => (
              <Badge key={i} variant="outline" className="text-sm">
                {teacher.name} ({teacher.subject})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

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
      <Tabs value={activeSubject} onValueChange={setActiveSubject}>
        <TabsList>
          {child.subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {child.subjects.map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-6">
            {/* Competence profile */}
            {child.competenceBySubject[subject]?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-rose-600" />
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
                  <BookOpen className="h-5 w-5 text-rose-600" />
                  Vurderinger i {subject}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!child.assessmentsBySubject[subject] ||
                child.assessmentsBySubject[subject].length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Ingen publiserte vurderinger ennå
                  </p>
                ) : (
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
                      {child.assessmentsBySubject[subject].map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            {format(new Date(assessment.date), "d. MMM yyyy", { locale: nb })}
                          </TableCell>
                          <TableCell>{getTypeLabel(assessment.type)}</TableCell>
                          <TableCell>{getFormLabel(assessment.form)}</TableCell>
                          <TableCell>
                            {assessment.grade ? (
                              <Badge variant="outline">{assessment.grade}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {assessment.competenceGoals.map((cg, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {cg.competenceGoal.code}
                                </Badge>
                              ))}
                              {assessment.competenceGoals.length === 0 && "-"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Feedback section */}
            {child.assessmentsBySubject[subject]?.some((a) => a.feedback) && (
              <Card>
                <CardHeader>
                  <CardTitle>Tilbakemeldinger</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {child.assessmentsBySubject[subject]
                      .filter((a) => a.feedback)
                      .map((assessment) => (
                        <div
                          key={assessment.id}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {format(new Date(assessment.date), "d. MMM yyyy", { locale: nb })}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {getFormLabel(assessment.form)}
                            </span>
                            {assessment.grade && (
                              <Badge>{assessment.grade}</Badge>
                            )}
                          </div>
                          <p className="text-sm">{assessment.feedback}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
