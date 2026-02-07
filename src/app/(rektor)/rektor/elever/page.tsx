"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { StatusDot } from "@/components/dashboard/scannable"

interface StudentData {
  id: string
  name: string
  grade: number
  subjects: string[]
  teachers: string[]
  assessmentCount: number
  status: "OK" | "WARNING" | "CRITICAL"
  statusMessage: string
  hasExemptions: boolean
  lastAssessment: string | null
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

function mapStatus(s: string): "ok" | "warn" | "crit" {
  if (s === "OK") return "ok"
  if (s === "WARNING") return "warn"
  return "crit"
}

export default function RektorEleverPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterTrinn, setFilterTrinn] = useState("alle")
  const [sortBy, setSortBy] = useState("mangler")

  useEffect(() => {
    fetch("/api/rektor/students")
      .then((r) => r.ok ? r.json() : [])
      .then(setStudents)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = [...students]
    if (filterTrinn !== "alle") list = list.filter((e) => e.grade === parseInt(filterTrinn))
    if (sortBy === "mangler") {
      const statusOrder = { CRITICAL: 0, WARNING: 1, OK: 2 }
      list.sort((a, b) => (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2))
    }
    if (sortBy === "navn") list.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === "klasse") list.sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name))
    return list
  }, [students, filterTrinn, sortBy])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Alle elever</h1>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-1">
          {["alle", "10", "9", "8"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTrinn(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                filterTrinn === t
                  ? "bg-rektor-light border-rektor-border text-rektor"
                  : "border-scan-border text-scan-text2 hover:border-rektor-border"
              }`}
            >
              {t === "alle" ? "Alle" : `${t}. trinn`}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-scan-border" />
        <div className="flex gap-1">
          {[
            { key: "mangler", label: "Mangler først" },
            { key: "navn", label: "Navn" },
            { key: "klasse", label: "Klasse" },
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
      </div>

      {/* Table */}
      <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
        <div className="grid grid-cols-[minmax(150px,1fr)_60px_80px_120px_110px] gap-3 px-4 py-2.5 border-b border-scan-border">
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Elev</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Klasse</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider text-center">Vurdert</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Dekning</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider text-center">Status</span>
        </div>
        {filtered.map((e, i) => {
          const fag = e.subjects.length
          const vurdertFag = fag > 0 && e.assessmentCount > 0 ? Math.min(e.assessmentCount, fag) : 0
          const pct = fag > 0 ? Math.round((vurdertFag / fag) * 100) : 0
          return (
            <div
              key={e.id}
              onClick={() => router.push(`/rektor/elever/${e.id}`)}
              className={`grid grid-cols-[minmax(150px,1fr)_60px_80px_120px_110px] gap-3 px-4 py-2.5 items-center cursor-pointer hover:bg-scan-bg transition-colors ${
                e.status === "CRITICAL" ? "bg-red-50/50" : ""
              } ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="flex items-center gap-2">
                <StatusDot status={mapStatus(e.status)} />
                <span className="text-sm font-medium text-scan-text">{e.name}</span>
              </div>
              <span className="text-[13px] text-scan-text2">{e.grade}. trinn</span>
              <span className={`text-[13px] font-mono text-center ${e.assessmentCount === 0 ? "text-status-crit font-semibold" : "text-scan-text2"}`}>
                {e.assessmentCount} vurd.
              </span>
              <BarInline pct={pct} width={70} />
              <div className="text-center">
                {e.status === "CRITICAL" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-status-crit border border-red-200">Kritisk</span>
                ) : e.status === "WARNING" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-status-warn border border-amber-200">Nesten</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-status-ok border border-green-200">✓ Klar</span>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-scan-text3">Ingen elever funnet</div>
        )}
      </div>
    </div>
  )
}
