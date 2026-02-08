"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradeChip } from "@/components/dashboard/scannable"

interface StudentInfo {
  id: string
  name: string
  grade: number
  totalAssessments: number
  subjects: string[]
  avgGrade: number | null
}

interface KlasseData {
  klasse: string
  students: StudentInfo[]
}

export default function MinKlassePage() {
  const [data, setData] = useState<KlasseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/kontaktlaerer/elever")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-scan-text2">
        Du er ikke registrert som kontaktlaerer for noen klasse.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-scan-text">
            Min klasse — {data.klasse}
          </h1>
          <p className="text-sm text-scan-text2 mt-0.5">
            {data.students.length} elever
          </p>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-scan-surface border border-scan-border rounded-xl divide-y divide-scan-border">
        {data.students.map((student) => (
          <Link
            key={student.id}
            href={`/min-klasse/${student.id}`}
            className="flex items-center gap-4 px-4 py-3 hover:bg-scan-bg transition-colors first:rounded-t-xl last:rounded-b-xl"
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-scan-text">
                {student.name}
              </div>
              <div className="text-xs text-scan-text3">
                {student.totalAssessments} vurderinger · {student.subjects.length} fag
              </div>
            </div>
            {student.avgGrade !== null && (
              <GradeChip grade={Math.round(student.avgGrade)} />
            )}
            <ChevronRight className="w-4 h-4 text-scan-text3" />
          </Link>
        ))}
      </div>
    </div>
  )
}
