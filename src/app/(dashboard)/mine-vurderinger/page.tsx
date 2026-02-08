"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradeChip } from "@/components/dashboard/scannable"

interface StudentGrade {
  id: string
  name: string
  grade: number | null
  feedback: string | null
}

interface VurderingBatch {
  classGroupId: string
  classGroupName: string
  subject: string
  grade: number
  description: string | null
  form: string
  type: string
  date: string
  students: StudentGrade[]
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  PRACTICAL: "Praktisk",
  ORAL_PRACTICAL: "Muntlig-praktisk",
}

const TYPE_LABELS: Record<string, string> = {
  ONGOING: "Underveis",
  MIDTERM: "Halvår",
  FINAL: "Standpunkt",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
}

export default function MineVurderingerPage() {
  const [batches, setBatches] = useState<VurderingBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/teacher/vurderinger")
      .then((r) => (r.ok ? r.json() : []))
      .then(setBatches)
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

  const getBatchKey = (b: VurderingBatch) =>
    `${b.classGroupId}|${b.date}|${b.description || ""}|${b.form}`

  // Group batches by subject for overview
  const subjectGroups = new Map<string, VurderingBatch[]>()
  batches.forEach((b) => {
    if (!subjectGroups.has(b.subject)) subjectGroups.set(b.subject, [])
    subjectGroups.get(b.subject)!.push(b)
  })

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
          <h1 className="text-2xl font-bold text-scan-text">Mine vurderinger</h1>
          <p className="text-sm text-scan-text2 mt-0.5">
            {batches.length} vurderinger registrert
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="bg-scan-surface rounded-xl border border-scan-border p-8 text-center">
          <p className="text-sm text-scan-text3">Ingen vurderinger registrert ennå.</p>
          <Link href="/vurderinger/ny" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
            Registrer din første vurdering
          </Link>
        </div>
      ) : (
        Array.from(subjectGroups.entries()).map(([subject, subjectBatches]) => (
          <div key={subject}>
            <h2 className="text-sm font-medium text-scan-text2 uppercase tracking-wider mb-3">
              {subject}
            </h2>
            <div className="bg-scan-surface border border-scan-border rounded-xl divide-y divide-scan-border">
              {subjectBatches.map((batch) => {
                const key = getBatchKey(batch)
                const isExpanded = expandedKey === key
                const gradedCount = batch.students.filter((s) => s.grade !== null).length
                const className = batch.classGroupName.replace(batch.subject, "").trim()

                return (
                  <div key={key}>
                    {/* Batch header row */}
                    <button
                      onClick={() => setExpandedKey(isExpanded ? null : key)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-scan-bg transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-scan-text3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-scan-text3 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-scan-text">
                            {batch.description || "Uten beskrivelse"}
                          </span>
                          <span className="font-mono text-xs text-scan-text3">{className}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {FORM_LABELS[batch.form] || batch.form}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {TYPE_LABELS[batch.type] || batch.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono text-xs text-scan-text3">
                          {gradedCount}/{batch.students.length} elever
                        </div>
                        <div className="text-[11px] text-scan-text3">
                          {formatDate(batch.date)}
                        </div>
                      </div>
                    </button>

                    {/* Expanded: student list */}
                    {isExpanded && (
                      <div className="border-t border-scan-border bg-scan-bg">
                        {batch.students
                          .sort((a, b) => a.name.localeCompare(b.name, "nb"))
                          .map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 px-4 py-2.5 pl-11 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                                {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-scan-text">{student.name}</div>
                                {student.feedback && (
                                  <div className="text-xs text-scan-text3 truncate mt-0.5">
                                    {student.feedback}
                                  </div>
                                )}
                              </div>
                              <GradeChip grade={student.grade} />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
