"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
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

export default function VurderingspraksisPage() {
  const [data, setData] = useState<VurderingspraksisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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

  if (!data) {
    return <div className="text-center p-8">Kunne ikke laste data</div>
  }

  const getTrendIcon = (value: number, average: number) => {
    const diff = value - average
    if (diff > 0.5) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (diff < -0.5) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getComparisonBadge = (value: number, average: number, higherIsBetter = true) => {
    const diff = value - average
    const isGood = higherIsBetter ? diff >= 0 : diff <= 0

    if (Math.abs(diff) < 0.3) {
      return <Badge variant="secondary">Normalt</Badge>
    }
    if (isGood) {
      return <Badge variant="default">Over snitt</Badge>
    }
    return <Badge variant="destructive">Under snitt</Badge>
  }

  const formLabels: Record<string, string> = {
    WRITTEN: "Skriftlig",
    ORAL: "Muntlig",
    ORAL_PRACTICAL: "Muntlig-praktisk",
    PRACTICAL: "Praktisk",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-brand-600" />
          Vurderingspraksis
        </h1>
        <p className="text-gray-600">Sammenligning av lærernes vurderingspraksis</p>
      </div>

      {/* School averages */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Skolesnitt: Vurderinger per elev
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-600">
              {data.schoolAverages.assessmentsPerStudent}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Anbefalt: 6-10 vurderinger per elev
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Skolesnitt: Gjennomsnittskarakter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-600">
              {data.schoolAverages.averageGrade || "-"}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Basert på alle registrerte karakterer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher comparison table */}
      <Card>
        <CardHeader>
          <CardTitle>Læreroversikt</CardTitle>
          <CardDescription>
            Sammenligning av vurderingspraksis mellom lærere
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.teachers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Ingen lærere funnet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lærer</TableHead>
                  <TableHead>Faggrupper</TableHead>
                  <TableHead>Elever</TableHead>
                  <TableHead>Vurderinger/elev</TableHead>
                  <TableHead>Snittkarakter</TableHead>
                  <TableHead>Kompetansemål</TableHead>
                  <TableHead>Siste 30 dager</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.classGroupCount}</TableCell>
                    <TableCell>{teacher.totalStudents}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {teacher.assessmentsPerStudent}
                        {getTrendIcon(
                          teacher.assessmentsPerStudent,
                          data.schoolAverages.assessmentsPerStudent
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {teacher.averageGrade || "-"}
                        {teacher.averageGrade > 0 && getTrendIcon(
                          teacher.averageGrade,
                          data.schoolAverages.averageGrade
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={teacher.competenceGoalCoverage} className="w-16 h-2" />
                        <span className="text-sm">{teacher.competenceGoalCoverage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacher.recentAssessments > 0 ? (
                        <Badge variant="default">{teacher.recentAssessments} nye</Badge>
                      ) : (
                        <Badge variant="secondary">Ingen</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detailed breakdown per teacher */}
      <div className="grid gap-6 lg:grid-cols-2">
        {data.teachers.map((teacher) => (
          <Link key={teacher.id} href={`/rektor/vurderingspraksis/${teacher.id}`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{teacher.name}</span>
                {getComparisonBadge(
                  teacher.assessmentsPerStudent,
                  data.schoolAverages.assessmentsPerStudent
                )}
              </CardTitle>
              <CardDescription>
                {teacher.classGroupCount} faggrupper | {teacher.totalStudents} elever
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Grade distribution */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Karakterfordeling</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((grade) => {
                      const count = teacher.gradeDistribution[grade] || 0
                      const total = Object.values(teacher.gradeDistribution).reduce((a, b) => a + b, 0)
                      const percentage = total > 0 ? (count / total) * 100 : 0
                      return (
                        <div key={grade} className="flex-1 text-center">
                          <div
                            className="bg-brand-100 rounded-t"
                            style={{ height: `${Math.max(percentage * 0.6, 4)}px` }}
                          />
                          <div className="text-xs mt-1">{grade}</div>
                          <div className="text-xs text-gray-500">{count}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Form distribution */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Vurderingsformer</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(teacher.formDistribution).map(([form, count]) => (
                      <div key={form} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formLabels[form]}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {teacher.assessmentsPerStudent < data.schoolAverages.assessmentsPerStudent - 1 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      Vurderingsfrekvensen er lavere enn skolesnittet. Vurder å øke antall vurderinger.
                    </div>
                  </div>
                )}

                {teacher.competenceGoalCoverage < 50 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      Kun {teacher.competenceGoalCoverage}% av vurderingene er koblet til kompetansemål.
                    </div>
                  </div>
                )}

                {teacher.recentAssessments === 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      Ingen nye vurderinger de siste 30 dagene.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
