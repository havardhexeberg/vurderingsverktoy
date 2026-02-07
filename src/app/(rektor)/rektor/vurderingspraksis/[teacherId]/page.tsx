"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  BarChart3,
  AlertTriangle,
} from "lucide-react"

interface TeacherStats {
  id: string
  name: string
  classGroupCount: number
  totalStudents: number
  totalAssessments: number
  assessmentsPerStudent: number
  averageGrade: number
  gradeDistribution: Record<number, number>
  formDistribution: Record<string, number>
  competenceGoalCoverage: number
  recentAssessments: number
}

interface VurderingspraksisData {
  teachers: TeacherStats[]
  schoolAverages: {
    assessmentsPerStudent: number
    averageGrade: number
  }
}

const formLabels: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

export default function TeacherVurderingspraksisPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = use(params)
  const [data, setData] = useState<VurderingspraksisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [teacherId])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/rektor/vurderingspraksis")
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  const teacher = data?.teachers.find((t) => t.id === teacherId)

  if (!teacher || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lærer ikke funnet</p>
        <Link href="/rektor/vurderingspraksis">
          <Button variant="link">Tilbake til vurderingspraksis</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rektor/vurderingspraksis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand-600" />
            {teacher.name}
          </h1>
          <p className="text-gray-600">Vurderingspraksis - detaljert oversikt</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Faggrupper</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.classGroupCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Elever</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Per elev</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.assessmentsPerStudent}</div>
            <p className="text-xs text-gray-500">Snitt: {data.schoolAverages.assessmentsPerStudent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Snittkarakter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.averageGrade || "-"}</div>
            <p className="text-xs text-gray-500">Snitt: {data.schoolAverages.averageGrade || "-"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Karakterfordeling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((grade) => {
              const count = teacher.gradeDistribution[grade] || 0
              const total = Object.values(teacher.gradeDistribution).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={grade} className="flex-1 text-center">
                  <div
                    className="bg-brand-100 rounded-t mx-auto"
                    style={{ height: `${Math.max(percentage * 1.5, 8)}px`, maxWidth: "40px" }}
                  />
                  <div className="text-sm font-medium mt-1">{grade}</div>
                  <div className="text-xs text-gray-500">{count}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Vurderingsformer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(teacher.formDistribution).map(([form, count]) => (
              <div key={form} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-lg font-bold">{count}</div>
                <div className="text-sm text-gray-600">{formLabels[form] || form}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competence goal coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Kompetansemåldekning</CardTitle>
          <CardDescription>
            Andel vurderinger koblet til kompetansemål
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={teacher.competenceGoalCoverage} className="flex-1 h-3" />
            <span className="font-bold text-lg">{teacher.competenceGoalCoverage}%</span>
          </div>
          {teacher.competenceGoalCoverage < 50 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg mt-4">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                Kun {teacher.competenceGoalCoverage}% av vurderingene er koblet til kompetansemål.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitet siste 30 dager</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.recentAssessments > 0 ? (
            <Badge variant="default">{teacher.recentAssessments} nye vurderinger</Badge>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                Ingen nye vurderinger de siste 30 dagene.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
