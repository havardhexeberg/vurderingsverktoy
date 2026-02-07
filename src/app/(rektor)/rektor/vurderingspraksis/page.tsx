"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

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
    fetch("/api/rektor/vurderingspraksis")
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  if (!data) return <div className="text-center p-8 text-scan-text2">Kunne ikke laste data</div>

  const sorted = [...data.teachers].sort((a, b) => a.assessmentsPerStudent - b.assessmentsPerStudent)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Vurderingspraksis</h1>
        <p className="text-sm text-scan-text2 mt-1">Oversikt over vurderingsaktivitet per lærer</p>
      </div>

      {/* Table */}
      <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
        {sorted.map((t, i) => {
          const pct = t.totalStudents > 0 ? Math.round((t.totalAssessments / t.totalStudents / 2) * 100) : 0
          const clampedPct = Math.min(pct, 100)
          const barColor = clampedPct >= 80 ? "bg-status-ok" : clampedPct >= 50 ? "bg-status-warn" : "bg-status-crit"
          const textColor = clampedPct >= 80 ? "text-status-ok" : clampedPct >= 50 ? "text-status-warn" : "text-status-crit"

          return (
            <Link
              key={t.id}
              href={`/rektor/vurderingspraksis/${t.id}`}
              className={`grid grid-cols-[minmax(150px,200px)_1fr_90px] gap-4 px-4 py-3.5 items-center hover:bg-scan-bg transition-colors ${
                i < sorted.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div>
                <div className="text-sm font-medium text-scan-text">{t.name}</div>
                <div className="text-xs text-scan-text3">{t.classGroupCount} grupper · {t.totalStudents} elever</div>
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${clampedPct}%` }} />
                  </div>
                  <span className={`font-mono text-sm font-semibold min-w-[40px] text-right ${textColor}`}>
                    {t.assessmentsPerStudent}
                  </span>
                </div>
                <div className="text-[11px] text-scan-text3">{t.totalAssessments} vurderinger · snitt {t.averageGrade || "–"}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-scan-text3">Siste 30d</span>
                <div className={`text-sm font-mono font-medium ${t.recentAssessments > 0 ? "text-scan-text" : "text-status-crit"}`}>
                  {t.recentAssessments > 0 ? `${t.recentAssessments} nye` : "Ingen"}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
