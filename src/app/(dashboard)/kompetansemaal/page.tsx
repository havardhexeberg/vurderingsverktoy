"use client"

import { useState, useEffect } from "react"
import { Check, Clock, Plus, Download, AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickAssessmentModal } from "@/components/QuickAssessmentModal"

interface ClassGroup { id: string; name: string; subject: string; grade: number }
interface Student { id: string; name: string }
interface CompetenceGoal { id: string; code: string; description: string; area: string }
interface MatrixData {
  classGroup: ClassGroup; students: Student[]; competenceGoals: CompetenceGoal[]
  matrix: Record<string, Record<string, "assessed" | "outdated" | "missing">>
  summary: { total: number; assessed: number; outdated: number; missing: number; coverage: number }
}

export default function KompetansemaalPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("all")
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingClassGroups, setLoadingClassGroups] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<CompetenceGoal | null>(null)

  useEffect(() => {
    async function fetchClassGroups() {
      try {
        const response = await fetch("/api/class-groups")
        if (response.ok) {
          const data = await response.json()
          setClassGroups(data)
          if (data.length > 0) setSelectedClassGroup(data[0].id)
        }
      } catch (error) { console.error("Failed to fetch class groups:", error) }
      finally { setLoadingClassGroups(false) }
    }
    fetchClassGroups()
  }, [])

  useEffect(() => {
    if (!selectedClassGroup) return
    async function fetchMatrix() {
      setLoading(true)
      try {
        const response = await fetch(`/api/teacher/competence-matrix?classGroupId=${selectedClassGroup}&term=${selectedTerm}`)
        if (response.ok) setMatrixData(await response.json())
      } catch (error) { console.error("Failed to fetch matrix:", error) }
      finally { setLoading(false) }
    }
    fetchMatrix()
  }, [selectedClassGroup, selectedTerm])

  const getCellColor = (status: string) => {
    switch (status) {
      case "assessed": return "bg-green-100 hover:bg-green-200 border-green-300"
      case "outdated": return "bg-orange-100 hover:bg-orange-200 border-orange-300"
      case "missing": return "bg-gray-100 hover:bg-gray-200 border-gray-300"
      default: return "bg-gray-50"
    }
  }

  const getCellIcon = (status: string) => {
    switch (status) {
      case "assessed": return <Check className="w-4 h-4 text-green-600" />
      case "outdated": return <Clock className="w-4 h-4 text-orange-600" />
      case "missing": return <Plus className="w-4 h-4 text-gray-400" />
      default: return null
    }
  }

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleCellClick = (studentId: string, goalId: string, status: string) => {
    if (status === "missing" || status === "outdated") {
      const student = matrixData?.students.find((s) => s.id === studentId)
      const goal = matrixData?.competenceGoals.find((g) => g.id === goalId)
      if (student && goal) { setSelectedStudent(student); setSelectedGoal(goal); setModalOpen(true) }
    }
  }

  const handleModalSuccess = () => {
    if (selectedClassGroup) {
      fetch(`/api/teacher/competence-matrix?classGroupId=${selectedClassGroup}&term=${selectedTerm}`)
        .then((res) => res.json()).then((data) => setMatrixData(data)).catch(console.error)
    }
  }

  const currentClassGroup = classGroups.find((cg) => cg.id === selectedClassGroup)

  if (loadingClassGroups) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kompetansemål-matrise</h1>
        <p className="text-gray-600 mt-1">Oversikt over vurderingsdekning per elev og kompetansemål</p>
      </div>

      {/* Filters — Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Velg faggruppe</label>
          <Select value={selectedClassGroup} onValueChange={setSelectedClassGroup}>
            <SelectTrigger><SelectValue placeholder="Velg faggruppe" /></SelectTrigger>
            <SelectContent>{classGroups.map((group) => (<SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Termin</label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hele året</SelectItem>
              <SelectItem value="autumn">Høst</SelectItem>
              <SelectItem value="spring">Vår</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Eksporter</label>
          <Button variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" /> Last ned som Excel</Button>
        </div>
      </div>

      {/* Legend + Summary — Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4 px-5">
            <h3 className="text-sm font-semibold mb-3">Forklaring</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center"><Check className="w-3 h-3 text-green-600" /></div>
                <div><div className="text-xs font-medium">Vurdert</div><div className="text-xs text-gray-500">Siste 365 dager</div></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 border border-orange-300 rounded flex items-center justify-center"><Clock className="w-3 h-3 text-orange-600" /></div>
                <div><div className="text-xs font-medium">Utdatert</div><div className="text-xs text-gray-500">Mer enn 365 dager siden</div></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center"><Plus className="w-3 h-3 text-gray-400" /></div>
                <div><div className="text-xs font-medium">Ikke vurdert</div><div className="text-xs text-gray-500">Klikk for å registrere</div></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {matrixData && (
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0">
            <CardContent className="py-4 px-5">
              <h3 className="text-sm font-semibold mb-3 text-white">Oppsummering</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><div className="text-2xl font-bold">{matrixData.summary.coverage}%</div><div className="text-xs text-teal-100">Dekning</div></div>
                <div className="bg-white/20 rounded-lg p-2 text-center"><div className="text-lg font-bold">{matrixData.summary.assessed}</div><div className="text-xs text-teal-100">Vurdert</div></div>
                <div className="bg-white/20 rounded-lg p-2 text-center"><div className="text-lg font-bold">{matrixData.summary.missing}</div><div className="text-xs text-teal-100">Mangler</div></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Matrix Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
      ) : matrixData && matrixData.competenceGoals.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">Kompetansemål</th>
                    {matrixData.students.map((student) => (
                      <th key={student.id} className="px-2 py-3 text-center text-xs font-medium text-gray-600 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold mb-1">{getInitials(student.name)}</div>
                          <div className="font-semibold text-gray-900 text-xs">{student.name.split(" ")[0]}</div>
                          <div className="text-gray-500 text-xs">{student.name.split(" ").slice(1).join(" ")}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matrixData.competenceGoals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-gray-100">
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded whitespace-nowrap">{goal.code}</span>
                          <span className="text-sm text-gray-900 font-medium leading-tight line-clamp-2">{goal.description}</span>
                        </div>
                      </td>
                      {matrixData.students.map((student) => {
                        const status = matrixData.matrix[student.id]?.[goal.id] || "missing"
                        return (
                          <td key={student.id} className="px-2 py-2">
                            <button onClick={() => handleCellClick(student.id, goal.id, status)}
                              className={`w-full h-12 rounded-lg border-2 transition-all ${getCellColor(status)} flex items-center justify-center ${status === "missing" || status === "outdated" ? "cursor-pointer" : "cursor-default"}`}>
                              {getCellIcon(status)}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : matrixData ? (
        <Card><CardContent className="py-12 text-center"><AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">Ingen kompetansemål funnet for denne faggruppen</p></CardContent></Card>
      ) : null}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800"><span className="font-semibold">Tips:</span> Klikk på grå eller oransje celler for å registrere en vurdering direkte. Matrisen oppdateres automatisk.</div>
        </div>
      </div>

      <QuickAssessmentModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedStudent(null); setSelectedGoal(null) }}
        student={selectedStudent || undefined} competenceGoal={selectedGoal || undefined}
        classGroup={currentClassGroup ? { id: currentClassGroup.id, name: currentClassGroup.name, subject: currentClassGroup.subject } : undefined}
        onSuccess={handleModalSuccess} />
    </div>
  )
}
