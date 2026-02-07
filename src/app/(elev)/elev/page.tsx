"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
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

interface CompetenceData {
  goal: { id: string; code: string; area: string; description: string }
  assessmentCount: number
  averageGrade: number | null
}

interface StudentProfile {
  id: string
  name: string
  grade: number
  subjects: string[]
  status: "OK" | "WARNING" | "CRITICAL"
  statusMessage: string
  competenceBySubject: Record<string, CompetenceData[]>
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

function ProgressDots({ assessed, total }: { assessed: number; total: number }) {
  const dots = []
  for (let i = 0; i < total; i++) {
    dots.push(
      <div
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          i < assessed ? "bg-elev" : "bg-gray-200"
        }`}
      />
    )
  }
  return (
    <div className="flex gap-0.5 flex-wrap">
      {dots}
    </div>
  )
}

export default function ElevHjem() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/elev/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

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

  // All assessments sorted by date (newest first)
  const allAssessments: Assessment[] = Object.values(profile.assessmentsBySubject)
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Subjects with assessments vs without
  const subjectsWithAssessments = profile.subjects.filter(
    (s) => (profile.assessmentsBySubject[s]?.length || 0) > 0
  )
  const subjectsWithout = profile.subjects.filter(
    (s) => (profile.assessmentsBySubject[s]?.length || 0) === 0
  )

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">
          Hei, {profile.name.split(" ")[0]}!
        </h1>
        <p className="text-sm text-scan-text2 mt-0.5">{profile.grade}. trinn · {profile.totalAssessments} vurderinger totalt</p>
      </div>

      {/* Recent assessments feed */}
      {allAssessments.length > 0 && (
        <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
          <div className="px-4 py-3 border-b border-scan-border">
            <h2 className="text-[15px] font-semibold text-scan-text">Siste vurderinger</h2>
          </div>
          {allAssessments.slice(0, 5).map((a, i) => (
            <div
              key={a.id}
              className={`px-4 py-3 flex items-center gap-3 ${
                i < Math.min(allAssessments.length, 5) - 1 ? "border-b border-gray-100" : ""
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
              <span className="text-xs text-scan-text3 flex-shrink-0">
                {format(new Date(a.date), "d. MMM", { locale: nb })}
              </span>
            </div>
          ))}
          {allAssessments.length > 5 && (
            <Link
              href="/elev/vurderinger"
              className="block px-4 py-2.5 text-center text-xs font-medium text-elev hover:bg-elev-light transition-colors border-t border-scan-border"
            >
              Se alle {allAssessments.length} vurderinger →
            </Link>
          )}
        </div>
      )}

      {/* Subject cards grid */}
      <div>
        <h2 className="text-[15px] font-semibold text-scan-text mb-3">Mine fag</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjectsWithAssessments.map((subject) => {
            const goals = profile.competenceBySubject[subject] || []
            const assessments = profile.assessmentsBySubject[subject] || []
            const assessed = goals.filter((g) => g.assessmentCount > 0).length
            const total = goals.length

            return (
              <Link
                key={subject}
                href={`/elev/kompetanse?fag=${encodeURIComponent(subject)}`}
                className="bg-scan-surface rounded-xl border border-scan-border p-4 hover:border-elev-border transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-scan-text group-hover:text-elev transition-colors">{subject}</h3>
                  <span className="font-mono text-xs text-scan-text3">{assessments.length} vurd.</span>
                </div>
                <ProgressDots assessed={assessed} total={total} />
                <div className="mt-2 text-[11px] text-scan-text3">
                  {assessed}/{total} kompetansemål vurdert
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Not assessed yet section */}
      {subjectsWithout.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider mb-2">Ikke vurdert ennå</h2>
          <div className="flex flex-wrap gap-2">
            {subjectsWithout.map((subject) => (
              <Link
                key={subject}
                href={`/elev/kompetanse?fag=${encodeURIComponent(subject)}`}
                className="px-3 py-1.5 rounded-lg border border-scan-border text-xs text-scan-text2 hover:border-elev-border hover:text-elev transition-colors"
              >
                {subject}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
