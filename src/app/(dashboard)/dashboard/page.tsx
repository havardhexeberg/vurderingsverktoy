"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Check,
  Plus,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface Stats {
  classGroups: number
  students: number
  assessments: number
  warnings: number
}

interface UrgentAction {
  id: string
  type: "missing_assessment" | "low_coverage" | "deadline"
  priority: "critical" | "warning" | "info"
  title: string
  description: string
  studentName?: string
  classGroupName?: string
  classGroupId?: string
}

interface CoverageData {
  classGroupId: string
  classGroupName: string
  subject: string
  coverage: number
  total: number
  assessed: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    classGroups: 0,
    students: 0,
    assessments: 0,
    warnings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [urgentActions, setUrgentActions] = useState<UrgentAction[]>([])
  const [coverageData, setCoverageData] = useState<CoverageData[]>([])

  // Calculate days until term end (assuming June 20th for spring term)
  const today = new Date()
  const termEnd = new Date(today.getFullYear(), 5, 20) // June 20
  if (today > termEnd) {
    termEnd.setFullYear(termEnd.getFullYear() + 1)
  }
  const daysUntilTermEnd = Math.ceil(
    (termEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, classGroupsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/class-groups"),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)

        // Generate urgent actions based on warnings
        if (data.warnings > 0) {
          setUrgentActions([
            {
              id: "1",
              type: "missing_assessment",
              priority: "critical",
              title: `${data.warnings} elever mangler vurdering`,
              description:
                "Disse elevene har ikke blitt vurdert denne terminen",
            },
          ])
        }
      }

      if (classGroupsRes.ok) {
        const groups = await classGroupsRes.json()

        // Calculate coverage per class group (not per subject)
        const coverage = groups.map((group: any) => {
          const totalStudents = group.students.length
          const assessedStudents = Math.min(
            group._count.assessments,
            totalStudents
          )
          return {
            classGroupId: group.id,
            classGroupName: group.name,
            subject: group.subject,
            coverage:
              totalStudents > 0
                ? Math.round((assessedStudents / totalStudents) * 100)
                : 0,
            total: totalStudents,
            assessed: assessedStudents,
          }
        })
        setCoverageData(coverage)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "bg-green-500"
    if (coverage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCoverageTextColor = (coverage: number) => {
    if (coverage >= 80) return "text-green-600"
    if (coverage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Velkommen, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Her er en oversikt over dine faggrupper og oppgaver.
        </p>
      </div>

      {/* CTA — Ny vurdering (bred, lav, elegant) */}
      <Link href="/vurderinger/ny" className="block">
        <Button className="w-full h-14 bg-brand-600 hover:bg-brand-700 text-lg font-semibold shadow-sm hover:shadow-md transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Ny vurdering
        </Button>
      </Link>

      {/* Main Content Grid: Handlinger som haster + Terminslutt */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Actions — Clickable, links to Mine oppgaver */}
        <Link href="/oppgaver" className="lg:col-span-2 block">
          <Card className="h-full hover:shadow-md hover:border-brand-300 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Handlinger som haster
                </CardTitle>
                <CardDescription>
                  Oppgaver som bør gjøres før terminslutt
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {daysUntilTermEnd} dager til terminslutt
              </Badge>
            </CardHeader>
            <CardContent>
              {urgentActions.length > 0 || stats.warnings > 0 ? (
                <div className="space-y-3">
                  {stats.warnings > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-red-200 bg-red-50">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-red-800">
                          {stats.warnings} elever mangler vurdering
                        </div>
                        <div className="text-sm text-red-600">
                          Klikk for å se hvilke elever som mangler vurdering
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-400" />
                    </div>
                  )}

                  {coverageData.some((c) => c.coverage < 50) && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-amber-800">
                          Lav kompetansemåldekning
                        </div>
                        <div className="text-sm text-amber-600">
                          Noen fag har under 50% dekning av kompetansemål
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-400" />
                    </div>
                  )}

                  {stats.warnings === 0 &&
                    !coverageData.some((c) => c.coverage < 50) && (
                      <div className="flex items-center justify-center py-8 text-gray-500">
                        <div className="text-center">
                          <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="font-medium text-gray-900">
                            Alt i orden!
                          </p>
                          <p className="text-sm">
                            Ingen hastesaker akkurat nå
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Alt i orden!</p>
                    <p className="text-sm">Ingen hastesaker akkurat nå</p>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-3 border-t text-sm text-gray-500 flex items-center gap-1">
                Se alle oppgaver <ChevronRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Term Countdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Terminslutt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-brand-600 mb-2">
                {daysUntilTermEnd}
              </div>
              <div className="text-gray-500 mb-4">dager igjen</div>
              <Progress
                value={100 - (daysUntilTermEnd / 180) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-400 mt-2">
                Terminslutt: 20. juni
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vurderingsdekning per gruppe — Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            Vurderingsdekning per gruppe
          </CardTitle>
          <CardDescription>
            Andel elever som har fått vurdering i hver faggruppe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coverageData.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p>Ingen data ennå. Opprett faggrupper for å se dekning.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coverageData.map((item) => (
                <div key={item.classGroupId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.classGroupName}
                    </span>
                    <span className={`font-medium ${getCoverageTextColor(item.coverage)}`}>
                      {item.assessed}/{item.total} ({item.coverage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getCoverageColor(
                        item.coverage
                      )}`}
                      style={{ width: `${item.coverage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
