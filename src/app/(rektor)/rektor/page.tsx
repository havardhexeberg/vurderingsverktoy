"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  School,
} from "lucide-react"

interface SchoolStats {
  totalTeachers: number
  totalStudents: number
  totalClassGroups: number
  totalAssessments: number
  statusSummary: {
    ok: number
    warning: number
    critical: number
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
  teacherStats: Array<{
    name: string
    classGroups: number
    assessmentCount: number
    criticalStudents: number
  }>
}

export default function RektorDashboard() {
  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/rektor/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
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

  if (!stats) {
    return <div className="text-center p-8">Kunne ikke laste data</div>
  }

  const totalStudentsWithStatus =
    stats.statusSummary.ok + stats.statusSummary.warning + stats.statusSummary.critical
  const okPercentage = totalStudentsWithStatus > 0
    ? Math.round((stats.statusSummary.ok / totalStudentsWithStatus) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <School className="h-6 w-6 text-purple-600" />
          Skoleoversikt
        </h1>
        <p className="text-gray-600">Velkommen til rektorportalenDashboard</p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lærere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Elever
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Faggrupper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClassGroups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Vurderinger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Elevstatus på skolen</CardTitle>
            <CardDescription>
              Oversikt over vurderingsdekning for alle elever
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vurderingsdekning</span>
                <span className="text-sm text-gray-600">{okPercentage}%</span>
              </div>
              <Progress value={okPercentage} className="h-3" />

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">
                    {stats.statusSummary.ok}
                  </div>
                  <div className="text-sm text-green-600">Klar</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">
                    {stats.statusSummary.warning}
                  </div>
                  <div className="text-sm text-amber-600">Nesten klar</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">
                    {stats.statusSummary.critical}
                  </div>
                  <div className="text-sm text-red-600">Kritisk</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Læreroversikt</CardTitle>
            <CardDescription>Status per lærer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.teacherStats.map((teacher, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-sm text-gray-600">
                      {teacher.classGroups} faggrupper | {teacher.assessmentCount} vurderinger
                    </div>
                  </div>
                  {teacher.criticalStudents > 0 ? (
                    <Badge variant="destructive">
                      {teacher.criticalStudents} kritisk
                    </Badge>
                  ) : (
                    <Badge variant="default">OK</Badge>
                  )}
                </div>
              ))}
              {stats.teacherStats.length === 0 && (
                <p className="text-center text-gray-500 py-4">Ingen lærere funnet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts section */}
      {stats.statusSummary.critical > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Krever oppmerksomhet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {stats.statusSummary.critical} elever har kritisk status og trenger flere vurderinger.
              Se detaljer under "Varsler" for å følge opp.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
