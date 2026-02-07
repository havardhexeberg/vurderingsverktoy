"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { StatusDot, DekningBar } from "@/components/dashboard/scannable"

interface Stats {
  classGroups: number
  students: number
  assessments: number
  warnings: number
}

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
  students: { student: { id: string } }[]
  _count: { assessments: number }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    classGroups: 0,
    students: 0,
    assessments: 0,
    warnings: 0,
  })
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        setStats(await statsRes.json())
      }
      if (classGroupsRes.ok) {
        setClassGroups(await classGroupsRes.json())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const coverageData = useMemo(() => {
    return classGroups.map((group) => {
      const totalStudents = group.students.length
      const assessed = Math.min(group._count.assessments, totalStudents)
      const pct = totalStudents > 0 ? Math.round((assessed / totalStudents) * 100) : 0
      const status: "ok" | "warn" | "crit" =
        pct >= 70 ? "ok" : pct >= 40 ? "warn" : "crit"
      return { ...group, assessed, totalStudents, pct, status }
    })
  }, [classGroups])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const firstName = session?.user?.name?.split(" ")[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-scan-text">
          Hei, {firstName}
        </h1>
        <p className="text-sm text-scan-text2 mt-0.5">
          {stats.classGroups} faggrupper · {stats.students} elever · {stats.assessments} vurderinger
        </p>
      </div>

      {/* Critical alerts */}
      {stats.warnings > 0 && (
        <Link href="/oppgaver" className="block">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 hover:border-red-300 transition-colors">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-status-crit" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-red-800">
                {stats.warnings} elever mangler vurdering
              </div>
              <div className="text-sm text-red-600">
                Se oppgaver for detaljer
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </div>
        </Link>
      )}

      {/* Quick-action faggruppe buttons */}
      {classGroups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {classGroups.map((group) => {
            const shortSubject = group.subject.slice(0, 3)
            const className = group.name.replace(group.subject, "").trim() || group.name
            return (
              <Link
                key={group.id}
                href={`/faggrupper/${group.id}`}
                className="flex-shrink-0 px-3 py-2 bg-scan-surface border border-scan-border rounded-lg hover:border-brand-300 transition-colors"
              >
                <div className="font-mono text-xs text-scan-text3">{shortSubject}</div>
                <div className="text-sm font-semibold text-scan-text">{className}</div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Faggruppe list with status */}
      <div>
        <h2 className="text-sm font-medium text-scan-text2 uppercase tracking-wider mb-3">
          Faggrupper
        </h2>
        <div className="bg-scan-surface border border-scan-border rounded-xl divide-y divide-scan-border">
          {coverageData.length === 0 ? (
            <div className="p-8 text-center text-scan-text3">
              Ingen faggrupper ennå
            </div>
          ) : (
            coverageData.map((item) => (
              <Link
                key={item.id}
                href={`/faggrupper/${item.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-scan-bg transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <StatusDot status={item.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-scan-text truncate">
                    {item.name}
                  </div>
                </div>
                <div className="w-32">
                  <DekningBar assessed={item.assessed} total={item.totalStudents} />
                </div>
                <span className="font-mono text-xs text-scan-text3 w-16 text-right">
                  {item.totalStudents} elever
                </span>
                <ChevronRight className="w-4 h-4 text-scan-text3" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
