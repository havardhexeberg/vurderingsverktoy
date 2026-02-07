"use client"

import { useState, useEffect, useMemo, useRef, use } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { StatusDot, GradeChip, DekningBar, InlineGradeInput } from "@/components/dashboard/scannable"
import { QuickAssessmentModal } from "@/components/QuickAssessmentModal"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback?: string
  description?: string
  isPublished: boolean
  studentId?: string
  student?: { id: string }
  competenceGoals?: { id: string }[]
}

interface Student {
  id: string
  name: string
  grade: number
  assessments: Assessment[]
}

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
  schoolYear: string
  students: { student: Student }[]
}

interface CompetenceGoal {
  id: string
  code: string
  description: string
  area: string
}

interface MatrixData {
  students: { id: string; name: string }[]
  competenceGoals: CompetenceGoal[]
  matrix: Record<string, Record<string, "assessed" | "outdated" | "missing">>
  summary: { total: number; assessed: number; missing: number; coverage: number }
}

type ViewMode = "elevliste" | "matrise" | "hurtig"

export default function ClassGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("elevliste")

  // Matrix state
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null)
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [assessmentsByStudent, setAssessmentsByStudent] = useState<Record<string, Assessment[]>>({})

  // Hurtig (bulk) state
  const [competenceGoals, setCompetenceGoals] = useState<CompetenceGoal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string>("")
  const [bulkGrades, setBulkGrades] = useState<Record<string, number | null>>({})
  const [isSaving, setIsSaving] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // QuickAssessmentModal state
  const [quickModalOpen, setQuickModalOpen] = useState(false)
  const [quickModalStudent, setQuickModalStudent] = useState<{ id: string; name: string } | undefined>()
  const [quickModalGoal, setQuickModalGoal] = useState<CompetenceGoal | undefined>()

  useEffect(() => {
    fetchClassGroup()
  }, [id])

  useEffect(() => {
    if (viewMode === "matrise" && classGroup) {
      fetchMatrixData()
    }
  }, [viewMode, classGroup])

  useEffect(() => {
    if (viewMode === "hurtig" && classGroup && competenceGoals.length === 0) {
      fetchCompetenceGoals()
    }
  }, [viewMode, classGroup])

  const fetchClassGroup = async () => {
    try {
      const response = await fetch(`/api/class-groups/${id}`)
      if (response.ok) {
        setClassGroup(await response.json())
      }
    } catch (error) {
      console.error("Error fetching class group:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMatrixData = async () => {
    setMatrixLoading(true)
    try {
      const [matrixRes, assessmentsRes] = await Promise.all([
        fetch(`/api/teacher/competence-matrix?classGroupId=${id}`),
        fetch(`/api/assessments?classGroupId=${id}`),
      ])
      if (matrixRes.ok) {
        setMatrixData(await matrixRes.json())
      }
      if (assessmentsRes.ok) {
        const assessments: Assessment[] = await assessmentsRes.json()
        const byStudent: Record<string, Assessment[]> = {}
        assessments.forEach((a) => {
          const sid = a.studentId || a.student?.id
          if (sid) {
            if (!byStudent[sid]) byStudent[sid] = []
            byStudent[sid].push(a)
          }
        })
        setAssessmentsByStudent(byStudent)
      }
    } catch (error) {
      console.error("Error fetching matrix data:", error)
    } finally {
      setMatrixLoading(false)
    }
  }

  const fetchCompetenceGoals = async () => {
    if (!classGroup) return
    try {
      const response = await fetch(
        `/api/competence-goals?subject=${encodeURIComponent(classGroup.subject)}&grade=${classGroup.grade}`
      )
      if (response.ok) {
        const data = await response.json()
        setCompetenceGoals(data.goals || data || [])
      }
    } catch (error) {
      console.error("Error fetching competence goals:", error)
    }
  }

  const students = useMemo(() => {
    if (!classGroup) return []
    return classGroup.students.map((s) => s.student)
  }, [classGroup])

  const getStudentStatus = (student: Student): "ok" | "warn" | "crit" => {
    if (student.assessments.length === 0) return "crit"
    if (student.assessments.length < 3) return "warn"
    return "ok"
  }

  const getLatestGrade = (student: Student): number | null => {
    if (student.assessments.length === 0) return null
    const sorted = [...student.assessments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0].grade
  }

  const getMatrixGrade = (studentId: string, goalId: string): number | null => {
    const studentAssessments = assessmentsByStudent[studentId] || []
    for (const a of studentAssessments) {
      if (a.competenceGoals?.some((g) => g.id === goalId) && a.grade !== null) {
        return a.grade
      }
    }
    return null
  }

  const handleBulkSave = async () => {
    if (!classGroup || !selectedGoal) return
    const gradesToSave = Object.entries(bulkGrades).filter(([_, g]) => g !== null)
    if (gradesToSave.length === 0) {
      toast.error("Ingen karakterer å lagre")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/assessments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classGroupId: id,
          commonData: {
            date: new Date().toISOString(),
            type: "ONGOING",
            form: "WRITTEN",
          },
          assessments: gradesToSave.map(([studentId, grade]) => ({
            studentId,
            grade,
          })),
          competenceGoalIds: [selectedGoal],
          isPublished: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.created} vurderinger lagret`)
        setBulkGrades({})
        fetchClassGroup()
      } else {
        toast.error("Kunne ikke lagre vurderinger")
      }
    } catch (error) {
      toast.error("Kunne ikke lagre vurderinger")
    } finally {
      setIsSaving(false)
    }
  }

  const focusNextInput = (currentIndex: number) => {
    const next = currentIndex + 1
    if (next < students.length) {
      const nextInput = document.querySelector<HTMLInputElement>(
        `[data-student-index="${next}"]`
      )
      nextInput?.focus()
      nextInput?.select()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!classGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-scan-text3">Faggruppe ikke funnet</p>
        <Link href="/faggrupper">
          <Button variant="link">Tilbake til faggrupper</Button>
        </Link>
      </div>
    )
  }

  const studentsAssessed = students.filter((s) => s.assessments.length > 0).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/faggrupper">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-scan-text">{classGroup.name}</h1>
          <p className="text-sm text-scan-text2">
            {classGroup.subject} · {classGroup.grade}. trinn · {classGroup.schoolYear}
          </p>
        </div>
        <span className="font-mono text-sm text-scan-text2">
          {studentsAssessed}/{students.length} vurdert
        </span>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-1 bg-scan-bg p-1 rounded-lg">
        {([
          { key: "elevliste", label: "Elevliste" },
          { key: "matrise", label: "Kompetansematrise" },
          { key: "hurtig", label: "Hurtigvurdering" },
        ] as { key: ViewMode; label: string }[]).map((mode) => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === mode.key
                ? "bg-brand-600 text-white"
                : "text-scan-text2 hover:text-scan-text hover:bg-scan-surface"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* ===== VIEW: Elevliste ===== */}
      {viewMode === "elevliste" && (
        <div className="bg-scan-surface border border-scan-border rounded-xl">
          <div className="grid grid-cols-[1fr_60px_120px_32px] gap-3 px-4 py-2.5 border-b border-scan-border text-xs font-medium text-scan-text3 uppercase tracking-wider">
            <div>Navn</div>
            <div>Karakter</div>
            <div>Dekning</div>
            <div></div>
          </div>
          {students.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[1fr_60px_120px_32px] gap-3 items-center px-4 py-3 border-b border-scan-border last:border-b-0 hover:bg-scan-bg transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusDot status={getStudentStatus(student)} />
                <span className="text-sm font-medium text-scan-text truncate">
                  {student.name}
                </span>
              </div>
              <div>
                <GradeChip grade={getLatestGrade(student)} size="sm" />
              </div>
              <div>
                <DekningBar
                  assessed={student.assessments.length}
                  total={Math.max(student.assessments.length, 4)}
                  showLabel={false}
                />
              </div>
              <div className="font-mono text-xs text-scan-text3 text-right">
                {student.assessments.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== VIEW: Kompetansematrise ===== */}
      {viewMode === "matrise" && (
        <>
          {matrixLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            </div>
          ) : matrixData && matrixData.competenceGoals.length > 0 ? (
            <div className="bg-scan-surface border border-scan-border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-scan-border">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-scan-text3 uppercase tracking-wider sticky left-0 bg-scan-surface z-10">
                      Elev
                    </th>
                    {matrixData.competenceGoals.map((goal) => (
                      <th
                        key={goal.id}
                        className="px-2 py-2.5 text-center"
                        title={goal.description}
                      >
                        <Badge variant="secondary" className="font-mono text-xs">
                          {goal.code}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.students.map((student) => (
                    <tr key={student.id} className="border-b border-scan-border last:border-b-0 hover:bg-scan-bg">
                      <td className="px-4 py-2 font-medium text-scan-text whitespace-nowrap sticky left-0 bg-scan-surface z-10">
                        {student.name}
                      </td>
                      {matrixData.competenceGoals.map((goal) => {
                        const grade = getMatrixGrade(student.id, goal.id)
                        const status = matrixData.matrix[student.id]?.[goal.id]
                        return (
                          <td
                            key={goal.id}
                            className="px-2 py-2 text-center cursor-pointer hover:bg-brand-50 transition-colors"
                            onClick={() => {
                              setQuickModalStudent(student)
                              setQuickModalGoal(goal)
                              setQuickModalOpen(true)
                            }}
                          >
                            {grade !== null ? (
                              <GradeChip grade={grade} size="sm" />
                            ) : status === "missing" ? (
                              <span className="text-scan-text3">–</span>
                            ) : (
                              <span className="text-amber-400">○</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {matrixData.summary && (
                <div className="px-4 py-2.5 border-t border-scan-border flex items-center gap-4 text-xs text-scan-text2">
                  <span>Dekning: <strong className="text-scan-text">{matrixData.summary.coverage}%</strong></span>
                  <span>Vurdert: <strong className="text-scan-text">{matrixData.summary.assessed}</strong></span>
                  <span>Mangler: <strong className="text-status-crit">{matrixData.summary.missing}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-scan-surface border border-scan-border rounded-xl p-8 text-center text-scan-text3">
              Ingen kompetansemål funnet for dette faget og trinnet.
            </div>
          )}
        </>
      )}

      {/* ===== VIEW: Hurtigvurdering ===== */}
      {viewMode === "hurtig" && (
        <div className="space-y-4">
          <div className="bg-scan-surface border border-scan-border rounded-xl p-4">
            <label className="text-sm font-medium text-scan-text mb-2 block">
              Velg kompetansemål
            </label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Velg kompetansemål..." />
              </SelectTrigger>
              <SelectContent>
                {competenceGoals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <span className="font-mono text-xs mr-2">{goal.code}</span>
                    <span className="text-sm">{goal.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGoal && (
            <div className="bg-scan-surface border border-scan-border rounded-xl">
              <div className="px-4 py-2.5 border-b border-scan-border flex items-center justify-between">
                <span className="text-xs font-medium text-scan-text3 uppercase tracking-wider">
                  Sett karakterer (1-6, Enter/Tab for neste)
                </span>
                <span className="font-mono text-xs text-scan-text2">
                  {Object.values(bulkGrades).filter((g) => g !== null).length}/{students.length}
                </span>
              </div>
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-scan-border last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-scan-text truncate">
                      {student.name}
                    </span>
                  </div>
                  <InlineGradeInput
                    value={bulkGrades[student.id] ?? null}
                    onChange={(grade) =>
                      setBulkGrades((prev) => ({ ...prev, [student.id]: grade }))
                    }
                    onNext={() => focusNextInput(index)}
                    autoFocus={index === 0}
                    data-student-index={index}
                  />
                </div>
              ))}

              <div className="px-4 py-3 border-t border-scan-border">
                <Button
                  onClick={handleBulkSave}
                  disabled={isSaving || Object.values(bulkGrades).every((g) => g === null || g === undefined)}
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Lagrer...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lagre alle ({Object.values(bulkGrades).filter((g) => g !== null).length} karakterer)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!selectedGoal && competenceGoals.length > 0 && (
            <div className="bg-scan-surface border border-scan-border rounded-xl p-8 text-center text-scan-text3">
              Velg et kompetansemål for å starte hurtigvurdering
            </div>
          )}

          {competenceGoals.length === 0 && (
            <div className="bg-scan-surface border border-scan-border rounded-xl p-8 text-center text-scan-text3">
              Ingen kompetansemål funnet for dette faget
            </div>
          )}
        </div>
      )}

      {/* QuickAssessmentModal for matrix cell clicks */}
      <QuickAssessmentModal
        open={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        student={quickModalStudent}
        competenceGoal={quickModalGoal}
        classGroup={classGroup ? { id: classGroup.id, name: classGroup.name, subject: classGroup.subject } : undefined}
        onSuccess={() => {
          fetchClassGroup()
          if (viewMode === "matrise") fetchMatrixData()
        }}
      />
    </div>
  )
}
