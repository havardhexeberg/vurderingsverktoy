"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, ChevronDown, ChevronRight, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { GradeChip } from "@/components/dashboard/scannable"
import { Badge } from "@/components/ui/badge"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
  description: string | null
}

interface KompetansemalData {
  goal: { id: string; code: string; area: string; description: string }
  assessmentCount: number
  assessments: Assessment[]
  averageGrade: number | null
}

interface FagDekning {
  antallMal: number
  dekkedeMal: number
  antallVurderinger: number
  laerer: string
}

interface ChildData {
  id: string
  name: string
  grade: number
  subjects: string[]
  teachers: Array<{ name: string; subject: string }>
  assessmentsBySubject: Record<string, Assessment[]>
  kompetansemalBySubject: Record<string, KompetansemalData[]>
  fagDekning: Record<string, FagDekning>
  totalAssessments: number
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

const TYPE_LABELS: Record<string, string> = {
  ONGOING: "Underveis",
  MIDTERM: "Halvår",
  FINAL: "Standpunkt",
}

function ProgressDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-[3px] items-center flex-wrap">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-[7px] h-[7px] rounded-full border ${
            i < filled ? "bg-foresatt border-foresatt-border" : "bg-scan-border border-scan-border"
          }`}
        />
      ))}
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

function ChildContent({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const activeFag = searchParams.get("fag")

  const [child, setChild] = useState<ChildData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMal, setExpandedMal] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/foresatt/children/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setChild)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    setExpandedMal(null)
  }, [activeFag])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foresatt" />
      </div>
    )
  }

  if (!child) {
    return <div className="text-center p-8 text-scan-text2">Kunne ikke laste data</div>
  }

  // If a specific fag is selected, show fag detail
  if (activeFag && child.fagDekning[activeFag]) {
    return (
      <FagDetaljView
        child={child}
        fagNavn={activeFag}
        expandedMal={expandedMal}
        setExpandedMal={setExpandedMal}
      />
    )
  }

  // Otherwise show barn overview
  return <BarnOversiktView child={child} />
}

function BarnOversiktView({ child }: { child: ChildData }) {
  const fagMedVurd = Object.entries(child.fagDekning).filter(([, f]) => f.antallVurderinger > 0)
  const fagUten = Object.entries(child.fagDekning).filter(([, f]) => f.antallVurderinger === 0)

  // All recent assessments across all subjects
  const allRecent = Object.values(child.assessmentsBySubject)
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <button
        onClick={() => window.history.back()}
        className="text-[13px] text-scan-text2 hover:text-scan-text mb-4 cursor-pointer"
      >
        ← Alle barn
      </button>

      {/* Child header */}
      <div className="flex items-center gap-3.5 mb-6 p-5 bg-scan-surface rounded-xl border border-scan-border">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-foresatt-light text-foresatt border-2 border-foresatt-border flex-shrink-0">
          {child.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-scan-text tracking-tight">{child.name}</h1>
          <p className="text-[13px] text-scan-text2">
            {child.grade}. trinn · Vurdert i {fagMedVurd.length} av {child.subjects.length} fag
          </p>
        </div>
      </div>

      {/* Recent assessments */}
      {allRecent.length > 0 && (
        <div className="mb-7">
          <h2 className="text-[15px] font-semibold text-scan-text mb-3">Siste vurderinger</h2>
          <div className="flex flex-col gap-2">
            {allRecent.slice(0, 5).map((a) => {
              const subject = Object.entries(child.assessmentsBySubject).find(
                ([, assessments]) => assessments.some((x) => x.id === a.id)
              )?.[0] || ""

              return (
                <Link
                  key={a.id}
                  href={`/foresatt/barn/${child.id}?fag=${encodeURIComponent(subject)}`}
                  className="flex items-center gap-3 px-4 py-2.5 bg-scan-surface border border-scan-border rounded-xl hover:border-foresatt-border transition-colors"
                >
                  <GradeChip grade={a.grade} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-scan-text">
                      {subject}
                      {a.description && (
                        <span className="text-scan-text2 font-normal"> · {a.description}</span>
                      )}
                    </div>
                    {a.feedback && (
                      <div className="text-xs text-scan-text2 mt-0.5 truncate">{a.feedback}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-scan-text3">{formatDaysAgo(a.date)}</div>
                    <div className="mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-scan-text3 border border-scan-border">
                        {TYPE_LABELS[a.type] || a.type}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Subject cards */}
      <h2 className="text-[15px] font-semibold text-scan-text mb-3">Fag</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {fagMedVurd.map(([fagNavn, fag]) => (
          <Link
            key={fagNavn}
            href={`/foresatt/barn/${child.id}?fag=${encodeURIComponent(fagNavn)}`}
            className="bg-scan-surface rounded-xl border border-scan-border p-4 hover:border-foresatt-border transition-colors group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <div className="text-[14px] font-semibold text-scan-text group-hover:text-foresatt transition-colors">{fagNavn}</div>
                <div className="text-[11px] text-scan-text3 mt-0.5">{fag.laerer}</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-foresatt-light border-2 border-foresatt-border">
                <span className="text-[14px] font-mono font-bold text-foresatt">{fag.antallVurderinger}</span>
              </div>
            </div>
            <ProgressDots filled={fag.dekkedeMal} total={fag.antallMal} />
            <div className="text-[11px] text-scan-text3 mt-1.5">{fag.dekkedeMal} av {fag.antallMal} kompetansemål</div>
          </Link>
        ))}
      </div>

      {/* Not assessed */}
      {fagUten.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-scan-text mb-2.5">Ikke vurdert ennå</h2>
          <div className="flex flex-wrap gap-2">
            {fagUten.map(([fagNavn]) => (
              <div key={fagNavn} className="px-3.5 py-2 bg-scan-surface border border-scan-border rounded-lg text-[13px] text-scan-text3">
                {fagNavn}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FagDetaljView({
  child,
  fagNavn,
  expandedMal,
  setExpandedMal,
}: {
  child: ChildData
  fagNavn: string
  expandedMal: string | null
  setExpandedMal: (id: string | null) => void
}) {
  const fag = child.fagDekning[fagNavn]
  const kompetansemal = child.kompetansemalBySubject[fagNavn] || []
  const allVurd = (child.assessmentsBySubject[fagNavn] || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <Link
        href={`/foresatt/barn/${child.id}`}
        className="text-[13px] text-scan-text2 hover:text-scan-text mb-4 block"
      >
        ← {child.name}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-5 bg-scan-surface rounded-xl border border-scan-border">
        <div>
          <div className="text-xs text-scan-text3 mb-0.5">{child.name} · {child.grade}. trinn</div>
          <h1 className="text-[22px] font-bold text-scan-text tracking-tight">{fagNavn}</h1>
          <p className="text-[13px] text-scan-text2 mt-1">{fag.laerer} · {fag.antallVurderinger} vurderinger</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <ProgressDots filled={fag.dekkedeMal} total={fag.antallMal} />
            <span className="text-xs text-scan-text3">{fag.dekkedeMal}/{fag.antallMal} kompetansemål dekket</span>
          </div>
        </div>
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-foresatt-light border-[2.5px] border-foresatt-border flex-shrink-0">
          <span className="text-lg font-mono font-bold text-foresatt">{fag.antallVurderinger}</span>
        </div>
      </div>

      {/* Kompetansemål */}
      {kompetansemal.length > 0 && (
        <div className="mb-7">
          <h2 className="text-[15px] font-semibold text-scan-text mb-3">Kompetansemål</h2>
          <div className="flex flex-col gap-2">
            {kompetansemal.map((mal) => {
              const isExp = expandedMal === mal.goal.id
              const harVurd = mal.assessmentCount > 0
              const sisteKarakter = harVurd && mal.assessments.length > 0 ? mal.assessments[0].grade : null

              return (
                <div
                  key={mal.goal.id}
                  className={`bg-scan-surface rounded-xl border overflow-hidden transition-colors ${
                    isExp ? "border-foresatt-border" : "border-scan-border"
                  }`}
                >
                  <button
                    onClick={() => setExpandedMal(isExp ? null : mal.goal.id)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-scan-bg transition-colors cursor-pointer"
                  >
                    <GradeChip grade={sisteKarakter} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-scan-text">{mal.goal.area}</div>
                      <div className="text-[11px] text-scan-text3 font-mono">{mal.goal.code}</div>
                    </div>
                    {harVurd ? (
                      <span className="text-xs text-scan-text3">{mal.assessmentCount} vurd.</span>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Ikke vurdert</Badge>
                    )}
                    <span className={`text-scan-text3 text-sm transition-transform ${isExp ? "rotate-90" : ""}`}>›</span>
                  </button>

                  {isExp && (
                    <div className="border-t border-scan-border">
                      {/* Goal description */}
                      <div className="px-4 py-2.5 text-xs text-scan-text2 bg-scan-bg border-b border-gray-100">
                        {mal.goal.description}
                      </div>

                      {harVurd ? mal.assessments.map((v, vi) => (
                        <div
                          key={v.id}
                          className={`px-4 py-3 pl-14 ${vi < mal.assessments.length - 1 ? "border-b border-gray-100" : ""}`}
                        >
                          <div className="flex items-center gap-2.5 mb-1">
                            <GradeChip grade={v.grade} />
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-scan-text3 border border-scan-border">
                              {TYPE_LABELS[v.type] || v.type}
                            </span>
                            <span className="text-[11px] text-scan-text3">{FORM_LABELS[v.form] || v.form}</span>
                            <span className="text-xs text-scan-text3 ml-auto">{format(new Date(v.date), "d. MMM", { locale: nb })}</span>
                          </div>
                          {v.feedback && (
                            <div className="flex items-start gap-2 mt-2 p-2.5 bg-foresatt-light rounded-lg border border-foresatt-border">
                              <MessageSquare className="h-3.5 w-3.5 text-foresatt mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-scan-text leading-relaxed">{v.feedback}</p>
                            </div>
                          )}
                        </div>
                      )) : (
                        <div className="px-4 py-4 pl-14 text-xs text-scan-text3">
                          Ingen vurderinger ennå for dette målet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All assessments chronologically */}
      {allVurd.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-scan-text mb-3">Alle vurderinger</h2>
          <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
            {allVurd.map((v, i) => (
              <div
                key={v.id}
                className={`flex items-center gap-3 px-4 py-2.5 ${i < allVurd.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <GradeChip grade={v.grade} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-scan-text">{v.description || fagNavn}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-scan-text3 border border-scan-border">
                  {TYPE_LABELS[v.type] || v.type}
                </span>
                <span className="text-xs text-scan-text3 flex-shrink-0">{format(new Date(v.date), "d. MMM", { locale: nb })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foresatt" />
      </div>
    }>
      <ChildContent id={id} />
    </Suspense>
  )
}
