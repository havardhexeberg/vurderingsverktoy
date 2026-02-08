"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { GradeChip } from "@/components/dashboard/scannable"

interface ChildData {
  id: string
  name: string
  grade: number
  subjects: string[]
  status: "OK" | "WARNING" | "CRITICAL"
  assessmentCount: number
  totalMal: number
  totalDekket: number
  fagDekning: Record<string, { antallMal: number; dekkedeMal: number; antallVurderinger: number; laerer: string }>
  recentAssessments: Array<{
    id: string
    date: string
    subject: string
    type: string
    form: string
    grade: number | null
    feedback: string | null
  }>
}

const TYPE_LABELS: Record<string, string> = {
  ONGOING: "Underveis",
  MIDTERM: "Halvår",
  FINAL: "Standpunkt",
}

function ProgressDots({ filled, total }: { filled: number; total: number }) {
  const maxDots = Math.min(total, 14)
  return (
    <div className="flex gap-[3px] items-center">
      {Array.from({ length: maxDots }, (_, i) => (
        <div
          key={i}
          className={`w-[7px] h-[7px] rounded-full border ${
            i < filled
              ? "bg-foresatt border-foresatt-border"
              : "bg-scan-border border-scan-border"
          }`}
        />
      ))}
      {total > 14 && <span className="text-[10px] text-scan-text3 ml-0.5">+{total - 14}</span>}
    </div>
  )
}

function formatDaysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return "I dag"
  if (diff === 1) return "I går"
  if (diff < 7) return `${diff} dager siden`
  if (diff < 30) return `${Math.floor(diff / 7)} uker siden`
  return `${Math.floor(diff / 30)} mnd siden`
}

export default function ForesattHjem() {
  const [children, setChildren] = useState<ChildData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/foresatt/children")
      .then((r) => (r.ok ? r.json() : []))
      .then(setChildren)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foresatt" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Hei, {children[0]?.name ? "foresatt" : ""}!</h1>
        <p className="text-sm text-scan-text2 mt-0.5">{children.length} barn</p>
      </div>

      {/* Child cards */}
      {children.map((child) => {
        const fagMedVurd = Object.entries(child.fagDekning).filter(([, f]) => f.antallVurderinger > 0)
        const fagUten = Object.entries(child.fagDekning).filter(([, f]) => f.antallVurderinger === 0)

        return (
          <div key={child.id} className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
            {/* Child header */}
            <Link
              href={`/foresatt/barn/${child.id}`}
              className="flex items-center gap-3.5 px-5 py-4 hover:bg-scan-bg transition-colors"
            >
              <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-base font-bold bg-foresatt-light text-foresatt border-2 border-foresatt-border flex-shrink-0">
                {child.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-scan-text">{child.name}</div>
                <div className="text-xs text-scan-text3">{child.grade}. trinn</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-scan-text2">Vurdert i {fagMedVurd.length} av {child.subjects.length} fag</div>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="text-[11px] text-scan-text3">{child.totalDekket}/{child.totalMal} mål</span>
                  <ProgressDots filled={child.totalDekket} total={Math.min(child.totalMal, 14)} />
                </div>
              </div>
              <span className="text-scan-text3 text-sm ml-1">›</span>
            </Link>

            {/* Recent assessments */}
            {child.recentAssessments.length > 0 && (
              <div className="border-t border-scan-border">
                {child.recentAssessments.slice(0, 3).map((a, i) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2.5 px-5 py-2.5 pl-[76px] ${
                      i < Math.min(child.recentAssessments.length, 3) - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <GradeChip grade={a.grade} />
                    <span className="flex-1 text-[13px] text-scan-text">
                      {a.subject} <span className="text-scan-text3">·</span>{" "}
                      <span className="text-scan-text2">{TYPE_LABELS[a.type] || a.type}</span>
                    </span>
                    <span className="text-[11px] text-scan-text3">{formatDaysAgo(a.date)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Missing subjects */}
            {fagUten.length > 0 && (
              <div className="px-5 py-2.5 pl-[76px] border-t border-scan-border text-xs text-scan-text3">
                Ikke vurdert i: {fagUten.map(([name]) => name).join(", ")}
              </div>
            )}
          </div>
        )
      })}

      {children.length === 0 && (
        <div className="bg-scan-surface rounded-xl border border-scan-border p-8 text-center">
          <p className="text-sm text-scan-text3">Ingen barn registrert. Kontakt skolen for tilgang.</p>
        </div>
      )}
    </div>
  )
}
