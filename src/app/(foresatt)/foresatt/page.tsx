"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface ChildData {
  id: string
  name: string
  grade: number
  subjects: string[]
  status: "OK" | "WARNING" | "CRITICAL"
  assessmentCount: number
  recentAssessments: Array<{
    id: string
    date: string
    subject: string
    type: string
    form: string
    grade: number | null
    feedback: string | null
  }>
}

export default function ForesattDashboard() {
  const [children, setChildren] = useState<ChildData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/foresatt/children")
      if (response.ok) {
        const data = await response.json()
        setChildren(data)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-600" />
          Velkommen til foresattportalen
        </h1>
        <p className="text-gray-600">Se vurderinger og kompetanseutvikling for dine barn</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Ingen barn registrert</h3>
            <p className="text-gray-500">Kontakt skolen for å få tilgang til dine barns vurderinger.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Children overview */}
          <div className="grid gap-6 md:grid-cols-2">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-rose-600" />
                        {child.name}
                      </CardTitle>
                      <CardDescription>
                        {child.grade}. trinn | {child.subjects.join(", ")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(child.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Totalt antall vurderinger</span>
                      <span className="font-medium">{child.assessmentCount}</span>
                    </div>

                    {child.recentAssessments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Siste vurderinger</h4>
                        <div className="space-y-2">
                          {child.recentAssessments.slice(0, 3).map((assessment) => (
                            <div
                              key={assessment.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium">{assessment.subject}</div>
                                  <div className="text-xs text-gray-500">
                                    {getFormLabel(assessment.form)} | {format(new Date(assessment.date), "d. MMM", { locale: nb })}
                                  </div>
                                </div>
                              </div>
                              {assessment.grade && (
                                <Badge variant="outline">{assessment.grade}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/foresatt/barn/${child.id}`}>
                      <Button variant="outline" className="w-full">
                        Se alle vurderinger
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info box */}
          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-rose-900">Om vurderinger</h3>
                  <p className="text-sm text-rose-800 mt-1">
                    Her ser du kun publiserte vurderinger fra lærerne. Kladder og interne notater er ikke synlige.
                    Ta kontakt med kontaktlærer hvis du har spørsmål om barnets faglige utvikling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
