"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, ChevronDown, ChevronRight, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { GradeChip } from "@/components/dashboard/scannable"
import { Badge } from "@/components/ui/badge"

interface Assessment {
  id: string
  date: string
  description: string | null
  grade: number | null
  feedback: string | null
  form: string
  type: string
}

interface CompetenceData {
  goal: { id: string; code: string; area: string; description: string }
  profile: { level: string } | null
  assessmentCount: number
  assessments?: Assessment[]
  averageGrade?: number | null
  lastAssessmentDate?: string | null
}

interface StudentProfile {
  subjects: string[]
  competenceBySubject: Record<string, CompetenceData[]>
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

function KompetanseContent() {
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get("fag")

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState<string>("")
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/elev/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (profile && initialSubject && profile.subjects.includes(initialSubject)) {
      setActiveSubject(initialSubject)
    } else if (profile && profile.subjects.length > 0 && !activeSubject) {
      setActiveSubject(profile.subjects[0])
    }
  }, [profile, initialSubject, activeSubject])

  const toggleGoal = (goalId: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) next.delete(goalId)
      else next.add(goalId)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-elev" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center p-8 text-scan-text2">Kunne ikke laste data</div>
  }

  const goals = profile.competenceBySubject[activeSubject] || []
  const assessed = goals.filter((g) => g.assessmentCount > 0).length
  const total = goals.length
  const pct = total > 0 ? Math.round((assessed / total) * 100) : 0

  // Group by area
  const byArea: Record<string, CompetenceData[]> = {}
  goals.forEach((g) => {
    if (!byArea[g.goal.area]) byArea[g.goal.area] = []
    byArea[g.goal.area].push(g)
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Kompetansemål</h1>
        <p className="text-sm text-scan-text2 mt-0.5">Trykk på et mål for å se dine vurderinger</p>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {profile.subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => { setActiveSubject(subject); setExpandedGoals(new Set()) }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
              activeSubject === subject
                ? "bg-elev-light border-elev-border text-elev"
                : "border-scan-border text-scan-text2 hover:border-elev-border"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Coverage summary */}
      <div className="bg-scan-surface rounded-xl border border-scan-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-scan-text">{activeSubject}</span>
          <span className="font-mono text-sm font-semibold text-elev">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-elev transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-scan-text3">{assessed} av {total} mål vurdert</div>
      </div>

      {/* Competence areas */}
      {Object.entries(byArea).map(([area, areaGoals]) => {
        const areaAssessed = areaGoals.filter((g) => g.assessmentCount > 0).length
        return (
          <div key={area} className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
            <div className="px-4 py-3 border-b border-scan-border flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-scan-text">{area}</h3>
              <span className="font-mono text-[11px] text-scan-text3">{areaAssessed}/{areaGoals.length}</span>
            </div>

            {areaGoals.map((item, i) => {
              const isExpanded = expandedGoals.has(item.goal.id)
              return (
                <div key={item.goal.id}>
                  <button
                    onClick={() => toggleGoal(item.goal.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-scan-bg transition-colors ${
                      i < areaGoals.length - 1 || isExpanded ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-elev" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-scan-text3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.goal.code}</Badge>
                        {item.assessmentCount > 0 ? (
                          <span className="text-[10px] text-elev font-medium">{item.assessmentCount} vurdering{item.assessmentCount > 1 ? "er" : ""}</span>
                        ) : (
                          <span className="text-[10px] text-scan-text3">Ikke vurdert</span>
                        )}
                      </div>
                      <p className="text-[13px] text-scan-text2 leading-snug">{item.goal.description}</p>
                    </div>
                    {item.averageGrade != null && (
                      <div className="flex-shrink-0">
                        <GradeChip grade={item.averageGrade} />
                      </div>
                    )}
                  </button>

                  {/* Expanded: assessment details */}
                  {isExpanded && item.assessments && item.assessments.length > 0 && (
                    <div className="bg-scan-bg border-b border-gray-100">
                      {item.assessments.map((a) => (
                        <div key={a.id} className="px-4 py-3 ml-7 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <GradeChip grade={a.grade} />
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-elev-light text-elev border border-elev-border">
                              {FORM_LABELS[a.form] || a.form}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-scan-text3 border border-scan-border">
                              {TYPE_LABELS[a.type] || a.type}
                            </span>
                            <span className="text-[11px] text-scan-text3 ml-auto">
                              {format(new Date(a.date), "d. MMMM yyyy", { locale: nb })}
                            </span>
                          </div>
                          {a.description && (
                            <p className="text-xs text-scan-text2 mt-1">{a.description}</p>
                          )}
                          {a.feedback && (
                            <div className="flex items-start gap-2 mt-2 p-2.5 bg-elev-light rounded-lg border border-elev-border">
                              <MessageSquare className="h-3.5 w-3.5 text-elev mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-scan-text leading-relaxed">{a.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && (!item.assessments || item.assessments.length === 0) && (
                    <div className="bg-scan-bg px-4 py-4 ml-7 border-b border-gray-100 text-xs text-scan-text3">
                      Ingen vurderinger registrert for dette kompetansemålet ennå.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {goals.length === 0 && (
        <div className="bg-scan-surface rounded-xl border border-scan-border p-8 text-center">
          <p className="text-sm text-scan-text3">Ingen kompetansemål funnet for dette faget.</p>
        </div>
      )}
    </div>
  )
}

export default function KompetansePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-elev" />
      </div>
    }>
      <KompetanseContent />
    </Suspense>
  )
}
