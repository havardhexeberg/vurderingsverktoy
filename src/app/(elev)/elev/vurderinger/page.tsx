"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { GradeChip } from "@/components/dashboard/scannable"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
  description: string | null
  classGroup: { subject: string }
  competenceGoals: Array<{ competenceGoal: { code: string; description: string } }>
}

interface StudentProfile {
  subjects: string[]
  assessmentsBySubject: Record<string, Assessment[]>
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

export default function VurderingerPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState("alle")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/elev/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const allAssessments = useMemo(() => {
    if (!profile) return []
    return Object.values(profile.assessmentsBySubject)
      .flat()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [profile])

  const filtered = useMemo(() => {
    if (filterSubject === "alle") return allAssessments
    return allAssessments.filter((a) => a.classGroup.subject === filterSubject)
  }, [allAssessments, filterSubject])

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Alle vurderinger</h1>
        <p className="text-sm text-scan-text2 mt-0.5">{profile.totalAssessments} vurderinger totalt</p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterSubject("alle")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
            filterSubject === "alle"
              ? "bg-elev-light border-elev-border text-elev"
              : "border-scan-border text-scan-text2 hover:border-elev-border"
          }`}
        >
          Alle ({allAssessments.length})
        </button>
        {profile.subjects.map((subject) => {
          const count = profile.assessmentsBySubject[subject]?.length || 0
          if (count === 0) return null
          return (
            <button
              key={subject}
              onClick={() => setFilterSubject(subject)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                filterSubject === subject
                  ? "bg-elev-light border-elev-border text-elev"
                  : "border-scan-border text-scan-text2 hover:border-elev-border"
              }`}
            >
              {subject} ({count})
            </button>
          )
        })}
      </div>

      {/* Assessment list */}
      <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-scan-text3">Ingen vurderinger funnet</div>
        ) : (
          filtered.map((a, i) => {
            const isExpanded = expandedId === a.id
            return (
              <div key={a.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-scan-bg transition-colors ${
                    i < filtered.length - 1 || isExpanded ? "border-b border-gray-100" : ""
                  }`}
                >
                  <GradeChip grade={a.grade} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-scan-text">{a.classGroup.subject}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-elev-light text-elev border border-elev-border">
                        {FORM_LABELS[a.form] || a.form}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-scan-text3 border border-scan-border">
                        {TYPE_LABELS[a.type] || a.type}
                      </span>
                    </div>
                    {a.description && (
                      <div className="text-xs text-scan-text2 mt-0.5 truncate">{a.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {a.feedback && <MessageSquare className="h-3.5 w-3.5 text-elev" />}
                    <span className="text-xs text-scan-text3">
                      {format(new Date(a.date), "d. MMM", { locale: nb })}
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="bg-scan-bg px-4 py-3 border-b border-gray-100 space-y-3">
                    <div className="text-xs text-scan-text3">
                      {format(new Date(a.date), "d. MMMM yyyy", { locale: nb })}
                    </div>

                    {a.competenceGoals.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider mb-1">Kompetansemål</div>
                        <div className="space-y-1">
                          {a.competenceGoals.map((cg, j) => (
                            <div key={j} className="text-xs text-scan-text2">
                              <span className="font-mono text-scan-text3 mr-1.5">{cg.competenceGoal.code}</span>
                              {cg.competenceGoal.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {a.feedback && (
                      <div className="flex items-start gap-2 p-2.5 bg-elev-light rounded-lg border border-elev-border">
                        <MessageSquare className="h-3.5 w-3.5 text-elev mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-scan-text leading-relaxed">{a.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
