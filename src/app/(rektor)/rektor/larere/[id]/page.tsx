"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import { StatusDot, DekningBar } from "@/components/dashboard/scannable"

interface TeacherDetail {
  id: string
  name: string
  email: string
  classGroups: Array<{
    id: string
    name: string
    subject: string
    studentCount: number
  }>
  totalStudents: number
  totalAssessments: number
  criticalStudents: number
  warningStudents: number
  okStudents: number
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

export default function RektorTeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rektor/teachers")
      .then((r) => r.ok ? r.json() : [])
      .then((data: TeacherDetail[]) => {
        const found = (Array.isArray(data) ? data : []).find((t) => t.id === id)
        setTeacher(found || null)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-scan-text2">Lærer ikke funnet</p>
        <Link href="/rektor/larere" className="text-sm text-rektor hover:underline mt-2 inline-block">Tilbake til lærerliste</Link>
      </div>
    )
  }

  const total = teacher.totalStudents || 1
  const vurdertPct = Math.round(((teacher.okStudents + teacher.warningStudents) / total) * 100)
  const status: "ok" | "warn" | "crit" =
    teacher.criticalStudents > 3 ? "crit" : teacher.criticalStudents > 0 ? "warn" : "ok"

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <Link href="/rektor/larere" className="text-sm text-scan-text2 hover:text-scan-text transition-colors">
        <span className="flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Tilbake</span>
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-scan-text tracking-tight">{teacher.name}</h1>
          <p className="text-sm text-scan-text2 mt-1">
            {teacher.classGroups.map((cg) => cg.subject).filter((v, i, a) => a.indexOf(v) === i).join(", ")} · {teacher.classGroups.length} faggrupper · {teacher.totalStudents} elever
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} size="md" />
          <span className="text-sm text-scan-text2">{teacher.email}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          label="Vurderingsgrad"
          value={`${vurdertPct}%`}
          sub={`${teacher.okStudents + teacher.warningStudents} av ${teacher.totalStudents} elever`}
          color={vurdertPct >= 80 ? "text-status-ok" : vurdertPct >= 50 ? "text-status-warn" : "text-status-crit"}
        />
        <StatCard
          label="Kritiske elever"
          value={teacher.criticalStudents}
          sub="mangler vurdering"
          color={teacher.criticalStudents > 0 ? "text-status-crit" : "text-status-ok"}
        />
        <StatCard
          label="Faggrupper"
          value={teacher.classGroups.length}
          sub={`${teacher.totalAssessments} vurderinger totalt`}
        />
      </div>

      {/* Class groups */}
      <div>
        <h2 className="text-[15px] font-semibold text-scan-text mb-3">Faggrupper</h2>
        <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden divide-y divide-gray-100">
          {teacher.classGroups.length > 0 ? teacher.classGroups.map((cg) => (
            <Link
              key={cg.id}
              href={`/rektor/faggrupper/${cg.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-scan-bg transition-colors"
            >
              <span className="text-sm font-medium text-scan-text flex-1">{cg.name}</span>
              <span className="text-[13px] text-scan-text3">{cg.studentCount} elever</span>
            </Link>
          )) : (
            <div className="px-4 py-5 text-center text-sm text-scan-text3">Ingen faggrupper registrert</div>
          )}
        </div>
      </div>

      {/* Student status breakdown */}
      <div>
        <h2 className="text-[15px] font-semibold text-scan-text mb-3">Elevstatus</h2>
        <div className="bg-scan-surface rounded-xl border border-scan-border p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <StatusDot status="ok" />
              <span className="text-sm text-scan-text2">Klar: <strong className="text-scan-text">{teacher.okStudents}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="warn" />
              <span className="text-sm text-scan-text2">Nesten: <strong className="text-scan-text">{teacher.warningStudents}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="crit" />
              <span className="text-sm text-scan-text2">Kritisk: <strong className="text-scan-text">{teacher.criticalStudents}</strong></span>
            </div>
          </div>
          <div className="mt-3">
            <DekningBar assessed={teacher.okStudents + teacher.warningStudents} total={teacher.totalStudents} />
          </div>
        </div>
      </div>
    </div>
  )
}
