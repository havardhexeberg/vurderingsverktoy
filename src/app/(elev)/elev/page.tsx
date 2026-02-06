"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface StudentProfile {
  id: string
  name: string
  grade: number
  subjects: string[]
  status: "OK" | "WARNING" | "CRITICAL"
  statusMessage: string
  teachers: Array<{ name: string; subject: string }>
  competenceBySubject: Record<string, Array<{
    goal: { id: string; code: string; area: string; description: string }
    profile: { level: string } | null
    assessmentCount: number
  }>>
  assessmentsBySubject: Record<string, Array<{
    id: string
    date: string
    type: string
    form: string
    grade: number | null
  }>>
  totalAssessments: number
}

export default function ElevDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            God oversikt
          </Badge>
        )
      case "WARNING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pågående
          </Badge>
        )
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Følg opp
          </Badge>
        )
      default:
        return null
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  if (!profile) {
    return <div className="text-center p-8">Kunne ikke laste data</div>
  }

  // Calculate competence coverage
  const calculateCoverage = (goals: typeof profile.competenceBySubject[string]) => {
    const assessed = goals.filter(g => g.assessmentCount > 0).length
    return goals.length > 0 ? Math.round((assessed / goals.length) * 100) : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-600" />
          Hei, {profile.name}!
        </h1>
        <p className="text-gray-600">Her er din læringsreise på {profile.grade}. trinn</p>
      </div>

      {/* Status overview */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Din status</h2>
              <p className="text-gray-600">{profile.statusMessage}</p>
            </div>
            {getStatusBadge(profile.status)}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">{profile.totalAssessments}</div>
              <div className="text-sm text-gray-600">Vurderinger</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">{profile.subjects.length}</div>
              <div className="text-sm text-gray-600">Fag</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">
                {Object.values(profile.competenceBySubject)
                  .flat()
                  .filter(g => g.profile)
                  .length}
              </div>
              <div className="text-sm text-gray-600">Vurderte mål</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {profile.subjects.map((subject) => {
          const goals = profile.competenceBySubject[subject] || []
          const assessments = profile.assessmentsBySubject[subject] || []
          const coverage = calculateCoverage(goals)

          return (
            <Card key={subject}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-cyan-600" />
                      {subject}
                    </CardTitle>
                    <CardDescription>
                      {goals.length} kompetansemål | {assessments.length} vurderinger
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Coverage progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Kompetansemåldekning</span>
                      <span className="font-medium">{coverage}%</span>
                    </div>
                    <Progress value={coverage} className="h-2" />
                  </div>

                  {/* Recent assessments */}
                  {assessments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Siste vurderinger</h4>
                      <div className="space-y-2">
                        {assessments.slice(0, 2).map((assessment) => (
                          <div
                            key={assessment.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="text-sm">
                              <span className="font-medium">{getFormLabel(assessment.form)}</span>
                              <span className="text-gray-500 ml-2">
                                {format(new Date(assessment.date), "d. MMM", { locale: nb })}
                              </span>
                            </div>
                            {assessment.grade && (
                              <Badge>{assessment.grade}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/elev/kompetanse?fag=${encodeURIComponent(subject)}`}>
                    <Button variant="outline" className="w-full">
                      Se kompetansemål
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Motivation card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Tips for videre læring</h3>
              <p className="text-sm text-amber-800 mt-1">
                Se gjennom kompetansemålene dine og identifiser områder der du kan utvikle deg videre.
                Ta kontakt med læreren din hvis du har spørsmål om noe du synes er vanskelig.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
