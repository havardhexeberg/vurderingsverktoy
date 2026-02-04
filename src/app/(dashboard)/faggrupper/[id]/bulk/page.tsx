"use client"

import { useState, useEffect, use, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Send, Check } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import React from "react"
import { CompetenceGoalSelector } from "@/components/competence/competence-goal-selector"

interface Student {
  id: string
  name: string
}

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
  students: { student: Student }[]
}

interface StudentAssessment {
  studentId: string
  grade: string
  feedback: string
}

// Memoized student row component for performance
const StudentRow = React.memo(function StudentRow({
  student,
  assessment,
  onGradeChange,
  onFeedbackChange,
}: {
  student: Student
  assessment: StudentAssessment
  onGradeChange: (studentId: string, grade: string) => void
  onFeedbackChange: (studentId: string, feedback: string) => void
}) {
  const hasData = assessment.grade || assessment.feedback

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border ${
        hasData ? "bg-green-50 border-green-200" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2 w-8">
        {hasData && <Check className="h-4 w-4 text-green-600" />}
      </div>
      <div className="w-48 font-medium">{student.name}</div>
      <Select
        value={assessment.grade}
        onValueChange={(value) => onGradeChange(student.id, value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Karakter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">-</SelectItem>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="6">6</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Tilbakemelding (valgfritt)"
        value={assessment.feedback}
        onChange={(e) => onFeedbackChange(student.id, e.target.value)}
        className="flex-1"
      />
    </div>
  )
})

export default function BulkAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Common fields
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [type, setType] = useState("ONGOING")
  const [form, setForm] = useState("WRITTEN")
  const [description, setDescription] = useState("")
  const [selectedCompetenceGoals, setSelectedCompetenceGoals] = useState<string[]>([])

  // Per-student assessments
  const [assessments, setAssessments] = useState<Record<string, StudentAssessment>>({})

  useEffect(() => {
    fetchClassGroup()
  }, [id])

  const fetchClassGroup = async () => {
    try {
      const response = await fetch(`/api/class-groups/${id}`)
      if (response.ok) {
        const data = await response.json()
        setClassGroup(data)
        // Initialize assessments for each student
        const initial: Record<string, StudentAssessment> = {}
        data.students.forEach((s: { student: Student }) => {
          initial[s.student.id] = {
            studentId: s.student.id,
            grade: "",
            feedback: "",
          }
        })
        setAssessments(initial)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGradeChange = useCallback((studentId: string, grade: string) => {
    setAssessments((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], grade },
    }))
  }, [])

  const handleFeedbackChange = useCallback((studentId: string, feedback: string) => {
    setAssessments((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], feedback },
    }))
  }, [])

  const handleSubmit = async (publish: boolean) => {
    const assessmentList = Object.values(assessments)
      .filter((a) => a.grade && a.grade !== "none")
      .map((a) => ({
        studentId: a.studentId,
        grade: parseInt(a.grade),
        feedback: a.feedback || undefined,
      }))

    if (assessmentList.length === 0) {
      toast.error("Ingen elever har fått karakter")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/assessments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classGroupId: id,
          commonData: { date, type, form, description },
          assessments: assessmentList,
          competenceGoalIds: selectedCompetenceGoals,
          isPublished: publish,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Feil ved lagring")
      }

      toast.success(
        `${data.created} vurderinger ${publish ? "publisert" : "lagret som kladd"}`
      )

      // Reset form
      const initial: Record<string, StudentAssessment> = {}
      classGroup?.students.forEach((s) => {
        initial[s.student.id] = {
          studentId: s.student.id,
          grade: "",
          feedback: "",
        }
      })
      setAssessments(initial)
      setDescription("")
      setSelectedCompetenceGoals([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunne ikke lagre")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Laster...</p>
      </div>
    )
  }

  if (!classGroup) {
    return <p>Faggruppe ikke funnet</p>
  }

  const students = classGroup.students.map((s) => s.student)
  const completedCount = Object.values(assessments).filter(
    (a) => a.grade && a.grade !== "none"
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/faggrupper/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Bulk-registrering</h1>
            <p className="text-gray-600">{classGroup.name}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {completedCount}/{students.length} elever
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Felles informasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Dato</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONGOING">Underveisvurdering</SelectItem>
                  <SelectItem value="MIDTERM">Halvårsvurdering</SelectItem>
                  <SelectItem value="FINAL">Standpunkt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Form</Label>
              <Select value={form} onValueChange={setForm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WRITTEN">Skriftlig</SelectItem>
                  <SelectItem value="ORAL">Muntlig</SelectItem>
                  <SelectItem value="ORAL_PRACTICAL">Muntlig-praktisk</SelectItem>
                  <SelectItem value="PRACTICAL">Praktisk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Beskrivelse</Label>
              <Input
                placeholder="f.eks. Kapittelprøve 3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label className="mb-2 block">Kompetansemål</Label>
            <CompetenceGoalSelector
              subject={classGroup.subject}
              grade={classGroup.grade}
              selectedIds={selectedCompetenceGoals}
              onSelectionChange={setSelectedCompetenceGoals}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elever</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {students.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              assessment={assessments[student.id]}
              onGradeChange={handleGradeChange}
              onFeedbackChange={handleFeedbackChange}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 sticky bottom-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting || completedCount === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Lagre som kladd
        </Button>
        <Button
          size="lg"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting || completedCount === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          Publiser ({completedCount})
        </Button>
      </div>
    </div>
  )
}
