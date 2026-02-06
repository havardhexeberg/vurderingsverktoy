"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Check,
  Plus,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
  Loader2,
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
  const daysUntilTermEnd = Math.ceil((termEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

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
              description: "Disse elevene har ikke blitt vurdert denne terminen",
            },
          ])
        }
      }

      if (classGroupsRes.ok) {
        const groups = await classGroupsRes.json()
        // Calculate coverage per subject
        const subjectCoverage: Record<string, { total: number; assessed: number }> = {}

        groups.forEach((group: any) => {
          if (!subjectCoverage[group.subject]) {
            subjectCoverage[group.subject] = { total: 0, assessed: 0 }
          }
          subjectCoverage[group.subject].total += group.students.length
          subjectCoverage[group.subject].assessed += Math.min(
            group._count.assessments,
            group.students.length
          )
        })

        const coverage = Object.entries(subjectCoverage).map(([subject, data]) => ({
          subject,
          coverage: data.total > 0 ? Math.round((data.assessed / data.total) * 100) : 0,
          total: data.total,
          assessed: data.assessed,
        }))
        setCoverageData(coverage)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      num: 1,
      title: "Importer elever",
      desc: "Last opp en CSV-fil med elevdata",
      href: "/import",
      done: stats.students > 0 || stats.classGroups > 0,
    },
    {
      num: 2,
      title: "Opprett faggruppe",
      desc: "Opprett en faggruppe og legg til elever",
      href: "/faggrupper",
      done: stats.classGroups > 0,
    },
    {
      num: 3,
      title: "Registrer vurderinger",
      desc: "Begynn å registrere vurderinger",
      href: "/vurderinger/ny",
      done: stats.assessments > 0,
    },
  ]

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "bg-green-500"
    if (coverage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Velkommen, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Her er en oversikt over dine faggrupper og oppgaver.
          </p>
        </div>
        <Link href="/vurderinger/ny">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Ny vurdering
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-teal-100">
              Faggrupper
            </CardTitle>
            <BookOpen className="h-5 w-5 text-teal-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.classGroups}</div>
            <p className="text-sm text-teal-100">Aktive faggrupper</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Elever
            </CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.students}</div>
            <p className="text-sm text-gray-500">Totalt i dine grupper</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vurderinger
            </CardTitle>
            <ClipboardCheck className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.assessments}</div>
            <p className="text-sm text-gray-500">Registrert denne terminen</p>
          </CardContent>
        </Card>

        <Card className={stats.warnings > 0 ? "border-amber-300 bg-amber-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mangler vurdering
            </CardTitle>
            <AlertTriangle className={`h-5 w-5 ${stats.warnings > 0 ? "text-amber-600" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.warnings > 0 ? "text-amber-700" : "text-gray-900"}`}>
              {stats.warnings}
            </div>
            <p className="text-sm text-gray-500">Elever uten vurdering</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Actions - Takes 2 columns */}
        <Card className="lg:col-span-2">
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
                  <Link href="/mine-elever">
                    <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
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
                  </Link>
                )}

                {coverageData.some((c) => c.coverage < 50) && (
                  <Link href="/kompetansemaal">
                    <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
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
                  </Link>
                )}

                {stats.warnings === 0 && !coverageData.some((c) => c.coverage < 50) && (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Alt i orden!</p>
                      <p className="text-sm">Ingen hastesaker akkurat nå</p>
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
          </CardContent>
        </Card>

        {/* Term Countdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Terminslutt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-teal-600 mb-2">
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

      {/* Coverage Heatmap and Getting Started */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coverage by Subject */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Vurderingsdekning per fag
            </CardTitle>
            <CardDescription>
              Andel elever som har fått vurdering
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
                  <div key={item.subject} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.subject}</span>
                      <span className="text-gray-500">
                        {item.assessed}/{item.total} ({item.coverage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getCoverageColor(item.coverage)}`}
                        style={{ width: `${item.coverage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Kom i gang</CardTitle>
            <CardDescription>
              Følg disse stegene for å sette opp verktøyet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step) => (
                <Link
                  key={step.num}
                  href={step.href}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    step.done
                      ? "bg-green-50 border-green-200"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step.done ? "bg-green-100" : "bg-teal-100"
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-teal-600 font-semibold">
                        {step.num}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
