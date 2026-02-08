"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < assessed ? "bg-brand-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  )
}

export default function ElevKortPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = use(params)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/kontaktlaerer/elever/${studentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [studentId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center p-8 text-scan-text2">Kunne ikke laste elevdata</div>
  }

  const allAssessments: Assessment[] = Object.values(profile.assessmentsBySubject)
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const subjectsWithAssessments = profile.subjects.filter(
    (s) => (profile.assessmentsBySubject[s]?.length || 0) > 0
  )
  const subjectsWithout = profile.subjects.filter(
    (s) => (profile.assessmentsBySubject[s]?.length || 0) === 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/min-klasse">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-scan-text tracking-tight">
            {profile.name}
          </h1>
          <p className="text-sm text-scan-text2 mt-0.5">
            {profile.grade}. trinn · {profile.totalAssessments} vurderinger totalt
          </p>
        </div>
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
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
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
        </div>
      )}

      {/* Subject cards grid */}
      <div>
        <h2 className="text-[15px] font-semibold text-scan-text mb-3">Fag</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjectsWithAssessments.map((subject) => {
            const goals = profile.competenceBySubject[subject] || []
            const assessments = profile.assessmentsBySubject[subject] || []
            const assessed = goals.filter((g) => g.assessmentCount > 0).length
            const total = goals.length

            return (
              <div
                key={subject}
                className="bg-scan-surface rounded-xl border border-scan-border p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-scan-text">{subject}</h3>
                  <span className="font-mono text-xs text-scan-text3">{assessments.length} vurd.</span>
                </div>
                <ProgressDots assessed={assessed} total={total} />
                <div className="mt-2 text-[11px] text-scan-text3">
                  {assessed}/{total} kompetansemål vurdert
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Not assessed yet */}
      {subjectsWithout.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider mb-2">Ikke vurdert ennå</h2>
          <div className="flex flex-wrap gap-2">
            {subjectsWithout.map((subject) => (
              <span
                key={subject}
                className="px-3 py-1.5 rounded-lg border border-scan-border text-xs text-scan-text2"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
