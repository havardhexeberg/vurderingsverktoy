"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { StatusDot, DekningBar } from "@/components/dashboard/scannable"

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
  schoolYear: string
  students: { student: { id: string; name: string } }[]
  _count: { assessments: number }
}

export default function FaggrupperPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/class-groups")
      if (res.ok) {
        setClassGroups(await res.json())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupedBySubject = useMemo(() => {
    const grouped: Record<string, (ClassGroup & { assessed: number; totalStudents: number; status: "ok" | "warn" | "crit" })[]> = {}
    classGroups.forEach((group) => {
      const totalStudents = group.students.length
      const assessed = Math.min(group._count.assessments, totalStudents)
      const pct = totalStudents > 0 ? Math.round((assessed / totalStudents) * 100) : 0
      const status: "ok" | "warn" | "crit" =
        pct >= 70 ? "ok" : pct >= 40 ? "warn" : "crit"
      const enriched = { ...group, assessed, totalStudents, status }
      if (!grouped[group.subject]) {
        grouped[group.subject] = []
      }
      grouped[group.subject].push(enriched)
    })
    Object.keys(grouped).forEach((subject) => {
      grouped[subject].sort((a, b) => a.grade - b.grade)
    })
    return grouped
  }, [classGroups])

  const totalStudents = useMemo(() => {
    return new Set(
      classGroups.flatMap((g) => g.students.map((s) => s.student.id))
    ).size
  }, [classGroups])

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
        <h1 className="text-2xl font-bold text-scan-text">Faggrupper</h1>
        <p className="text-sm text-scan-text2 mt-0.5">
          {classGroups.length} faggrupper · {totalStudents} elever
        </p>
      </div>

      {/* Empty State */}
      {classGroups.length === 0 ? (
        <div className="bg-scan-surface border border-scan-border rounded-xl p-12 text-center">
          <h3 className="text-base font-medium text-scan-text mb-1">Ingen faggrupper</h3>
          <p className="text-sm text-scan-text3">
            Importer elever og opprett faggrupper via administrasjon
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySubject).map(([subject, groups]) => (
            <div key={subject}>
              <h2 className="text-xs font-medium text-scan-text3 uppercase tracking-wider mb-2">
                {subject}
              </h2>
              <div className="bg-scan-surface border border-scan-border rounded-xl divide-y divide-scan-border">
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/faggrupper/${group.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-scan-bg transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <StatusDot status={group.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-scan-text truncate">
                        {group.name}
                      </div>
                      <div className="text-xs text-scan-text3">
                        {group.grade}. trinn
                      </div>
                    </div>
                    <div className="w-32">
                      <DekningBar assessed={group.assessed} total={group.totalStudents} />
                    </div>
                    <span className="font-mono text-xs text-scan-text3 w-16 text-right">
                      {group.totalStudents} elever
                    </span>
                    <ChevronRight className="w-4 h-4 text-scan-text3" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
