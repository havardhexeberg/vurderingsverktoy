"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { StatusDot } from "@/components/dashboard/scannable"

interface TeacherData {
  id: string
  name: string
  email: string
  classGroups: Array<{ id: string; name: string; subject: string; studentCount: number }>
  totalStudents: number
  totalAssessments: number
  criticalStudents: number
  warningStudents: number
  okStudents: number
}

function BarInline({ pct, width = 70 }: { pct: number; width?: number }) {
  const color = pct >= 80 ? "bg-status-ok" : pct >= 50 ? "bg-status-warn" : "bg-status-crit"
  const textColor = pct >= 80 ? "text-status-ok" : pct >= 50 ? "text-status-warn" : "text-status-crit"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0" style={{ width }}>
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`font-mono text-xs font-medium min-w-[32px] text-right ${textColor}`}>{pct}%</span>
    </div>
  )
}

export default function LarerePage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("status")

  useEffect(() => {
    fetch("/api/rektor/teachers")
      .then((r) => r.ok ? r.json() : [])
      .then(setTeachers)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const rows = useMemo(() => {
    const enriched = teachers.map((t) => {
      const total = t.totalStudents || 1
      const vurdertPct = Math.round(((t.okStudents + t.warningStudents) / total) * 100)
      const status: "ok" | "warn" | "crit" =
        t.criticalStudents > 3 ? "crit" : t.criticalStudents > 0 ? "warn" : "ok"
      const subjects = t.classGroups.map((cg) => cg.subject).filter((v, i, a) => a.indexOf(v) === i).join(", ")
      return { ...t, vurdertPct, status, subjects }
    })
    if (sortBy === "status") enriched.sort((a, b) => a.vurdertPct - b.vurdertPct)
    if (sortBy === "navn") enriched.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === "standpunkt") enriched.sort((a, b) => b.criticalStudents - a.criticalStudents)
    return enriched
  }, [teachers, sortBy])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Lærere</h1>

      {/* Sort buttons */}
      <div className="flex gap-1">
        {[
          { key: "status", label: "Trenger oppfølging" },
          { key: "navn", label: "Navn" },
          { key: "standpunkt", label: "Kritiske elever" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              sortBy === s.key
                ? "bg-rektor-light border-rektor-border text-rektor"
                : "border-scan-border text-scan-text2 hover:border-rektor-border"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
        <div className="grid grid-cols-[minmax(150px,1fr)_120px_60px_130px_100px] gap-3 px-4 py-2.5 border-b border-scan-border">
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Lærer</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Fag</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider text-center">Grupper</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Vurderingsgrad</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider text-center">Kritiske</span>
        </div>
        {rows.map((t, i) => (
          <Link
            key={t.id}
            href={`/rektor/larere/${t.id}`}
            className={`grid grid-cols-[minmax(150px,1fr)_120px_60px_130px_100px] gap-3 px-4 py-2.5 items-center hover:bg-scan-bg transition-colors ${
              t.status === "crit" ? "bg-red-50/50" : ""
            } ${i < rows.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <div className="flex items-center gap-2">
              <StatusDot status={t.status} />
              <span className="text-sm font-medium text-scan-text">{t.name}</span>
            </div>
            <span className="text-[13px] text-scan-text2 truncate">{t.subjects || "–"}</span>
            <span className="text-[13px] font-mono text-scan-text2 text-center">{t.classGroups.length}</span>
            <BarInline pct={t.vurdertPct} />
            <div className="text-center">
              {t.criticalStudents > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-status-crit border border-red-200">
                  {t.criticalStudents}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-status-ok border border-green-200">✓</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
