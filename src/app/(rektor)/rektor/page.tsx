"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { StatusDot } from "@/components/dashboard/scannable"

interface SchoolStats {
  totalTeachers: number
  totalStudents: number
  totalClassGroups: number
  totalAssessments: number
  statusSummary: { ok: number; warning: number; critical: number }
  teacherStats: Array<{
    name: string
    classGroups: number
    assessmentCount: number
    criticalStudents: number
  }>
}

interface TeacherData {
  id: string
  name: string
  classGroups: Array<{ id: string; name: string; subject: string; studentCount: number }>
  totalStudents: number
  totalAssessments: number
  criticalStudents: number
  warningStudents: number
  okStudents: number
}

interface Alert {
  priority: "CRITICAL" | "WARNING" | "INFO"
  description: string
}

function BarInline({ pct, width = 80 }: { pct: number; width?: number }) {
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

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-scan-surface p-4 rounded-xl border border-scan-border">
      <div className="text-[11px] text-scan-text3 font-semibold uppercase tracking-wider mb-1.5">{label}</div>
      <div className={`text-[26px] font-bold tracking-tight leading-none ${color || "text-scan-text"}`}>{value}</div>
      {sub && <div className="text-xs text-scan-text2 mt-1">{sub}</div>}
    </div>
  )
}

export default function RektorDashboard() {
  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/rektor/stats").then((r) => r.ok ? r.json() : null),
      fetch("/api/rektor/teachers").then((r) => r.ok ? r.json() : []),
      fetch("/api/rektor/alerts").then((r) => r.ok ? r.json() : []),
    ])
      .then(([s, t, a]) => { setStats(s); setTeachers(t); setAlerts(a) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const criticalAlerts = useMemo(() => alerts.filter((a) => a.priority === "CRITICAL"), [alerts])

  const teacherRows = useMemo(() => {
    return teachers
      .map((t) => {
        const total = t.totalStudents || 1
        const vurdertPct = Math.round(((t.okStudents + t.warningStudents) / total) * 100)
        const status: "ok" | "warn" | "crit" =
          t.criticalStudents > 3 ? "crit" : t.criticalStudents > 0 ? "warn" : "ok"
        const subjects = t.classGroups.map((cg) => cg.subject).filter((v, i, a) => a.indexOf(v) === i).join(", ")
        return { ...t, vurdertPct, status, subjects }
      })
      .sort((a, b) => a.vurdertPct - b.vurdertPct)
  }, [teachers])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  if (!stats) return <div className="text-center p-8 text-scan-text2">Kunne ikke laste data</div>

  const totalWithStatus = stats.statusSummary.ok + stats.statusSummary.warning + stats.statusSummary.critical
  const avgPct = totalWithStatus > 0 ? Math.round((stats.statusSummary.ok / totalWithStatus) * 100) : 0
  const larereMedProblemer = teacherRows.filter((t) => t.status === "crit" || t.status === "warn")

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Skoleoversikt</h1>
        <p className="text-sm text-scan-text2 mt-1">
          Nordvik ungdomsskole · {stats.totalStudents} elever · {stats.totalTeachers} lærere
        </p>
      </div>

      {/* Critical alerts banner */}
      {criticalAlerts.length > 0 && (
        <Link href="/rektor/varsler" className="block">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 hover:border-red-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-status-crit flex items-center justify-center flex-shrink-0">
              <span className="text-white font-mono font-bold text-sm">{criticalAlerts.length}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-red-800">{criticalAlerts.length} varsler krever oppmerksomhet</div>
              <div className="text-sm text-scan-text2 truncate mt-0.5">{criticalAlerts[0]?.description}</div>
            </div>
            <span className="text-sm text-status-crit font-medium flex-shrink-0">Se alle →</span>
          </div>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Elever totalt" value={stats.totalStudents} sub="8.–10. trinn" />
        <StatCard label="Vurderingsgrad" value={`${avgPct}%`} sub="snitt alle lærere" color={avgPct >= 70 ? "text-status-ok" : "text-status-warn"} />
        <StatCard label="Kritiske elever" value={stats.statusSummary.critical} sub="mangler vurdering" color={stats.statusSummary.critical > 0 ? "text-status-crit" : "text-status-ok"} />
        <StatCard label="Lærere" value={stats.totalTeachers} sub={`${larereMedProblemer.length} trenger oppfølging`} color={larereMedProblemer.length > 0 ? "text-status-warn" : "text-status-ok"} />
      </div>

      {/* Teacher table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-scan-text">Læreroversikt</h2>
          <Link href="/rektor/larere" className="text-sm text-rektor font-medium hover:underline">Se detaljer →</Link>
        </div>
        <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
          <div className="grid grid-cols-[minmax(150px,1fr)_120px_130px_100px] gap-3 px-4 py-2.5 border-b border-scan-border">
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Lærer</span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Fag</span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Vurderingsgrad</span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider text-center">Kritiske</span>
          </div>
          {teacherRows.map((t, i) => (
            <Link
              key={t.id}
              href={`/rektor/larere/${t.id}`}
              className={`grid grid-cols-[minmax(150px,1fr)_120px_130px_100px] gap-3 px-4 py-2.5 items-center hover:bg-scan-bg transition-colors ${
                t.status === "crit" ? "bg-red-50/50" : ""
              } ${i < teacherRows.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="flex items-center gap-2">
                <StatusDot status={t.status} />
                <span className="text-sm font-medium text-scan-text">{t.name}</span>
              </div>
              <span className="text-[13px] text-scan-text2 truncate">{t.subjects || "–"}</span>
              <BarInline pct={t.vurdertPct} width={70} />
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
    </div>
  )
}
