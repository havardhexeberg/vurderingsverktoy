"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Users, ClipboardCheck, AlertTriangle, ListChecks } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback?: string
  description?: string
  isPublished: boolean
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

const TYPE_LABELS: Record<string, string> = {
  ONGOING: "Underveisvurdering",
  MIDTERM: "Halvårsvurdering",
  FINAL: "Standpunkt",
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

export default function ClassGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [type, setType] = useState("ONGOING")
  const [form, setForm] = useState("WRITTEN")
  const [gradeValue, setGradeValue] = useState("")
  const [description, setDescription] = useState("")
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    fetchClassGroup()
  }, [id])

  const fetchClassGroup = async () => {
    try {
      const response = await fetch(`/api/class-groups/${id}`)
      if (response.ok) {
        const data = await response.json()
        setClassGroup(data)
      }
    } catch (error) {
      console.error("Error fetching class group:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openAssessmentDialog = (student: Student) => {
    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          classGroupId: id,
          date,
          type,
          form,
          grade: gradeValue ? parseInt(gradeValue) : null,
          description,
          feedback,
          isPublished: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke registrere vurdering")
      }

      toast.success(`Vurdering registrert for ${selectedStudent.name}`)
      setIsDialogOpen(false)
      resetForm()
      fetchClassGroup()
    } catch (error) {
      toast.error("Kunne ikke registrere vurdering")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0])
    setType("ONGOING")
    setForm("WRITTEN")
    setGradeValue("")
    setDescription("")
    setFeedback("")
    setSelectedStudent(null)
  }

  const getStudentStatus = (student: Student) => {
    const count = student.assessments.length
    if (count === 0) return { status: "danger", label: "Ingen vurderinger" }
    if (count < 3) return { status: "warning", label: `${count} vurderinger` }
    return { status: "success", label: `${count} vurderinger` }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Laster...</p>
      </div>
    )
  }

  if (!classGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Faggruppe ikke funnet</p>
        <Link href="/faggrupper">
          <Button variant="link">Tilbake til faggrupper</Button>
        </Link>
      </div>
    )
  }

  const students = classGroup.students.map((s) => s.student)
  const totalAssessments = students.reduce(
    (sum, s) => sum + s.assessments.length,
    0
  )
  const studentsWithoutAssessments = students.filter(
    (s) => s.assessments.length === 0
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/faggrupper">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classGroup.name}</h1>
            <p className="text-gray-600">
              {classGroup.subject} - {classGroup.grade}. trinn - {classGroup.schoolYear}
            </p>
          </div>
        </div>
        <Link href={`/faggrupper/${id}/bulk`}>
          <Button>
            <ListChecks className="h-4 w-4 mr-2" />
            Bulk-registrering
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Elever
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Vurderinger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Uten vurdering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {studentsWithoutAssessments}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Elever</TabsTrigger>
          <TabsTrigger value="assessments">Siste vurderinger</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Elevliste</CardTitle>
              <CardDescription>
                Klikk på en elev for å registrere vurdering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Navn</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Siste vurdering</TableHead>
                    <TableHead className="text-right">Handling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const status = getStudentStatus(student)
                    const lastAssessment = student.assessments[0]
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status.status === "success"
                                ? "default"
                                : status.status === "warning"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lastAssessment ? (
                            <span className="text-sm text-gray-600">
                              {new Date(lastAssessment.date).toLocaleDateString("nb-NO")}
                              {lastAssessment.grade && ` - Karakter ${lastAssessment.grade}`}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openAssessmentDialog(student)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Vurdering
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Siste vurderinger</CardTitle>
            </CardHeader>
            <CardContent>
              {totalAssessments === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Ingen vurderinger registrert ennå
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dato</TableHead>
                      <TableHead>Elev</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Karakter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .flatMap((s) =>
                        s.assessments.map((a) => ({ ...a, studentName: s.name }))
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() - new Date(a.date).getTime()
                      )
                      .slice(0, 20)
                      .map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            {new Date(assessment.date).toLocaleDateString("nb-NO")}
                          </TableCell>
                          <TableCell>{assessment.studentName}</TableCell>
                          <TableCell>{TYPE_LABELS[assessment.type]}</TableCell>
                          <TableCell>{FORM_LABELS[assessment.form]}</TableCell>
                          <TableCell>
                            {assessment.grade || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrer vurdering</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Dato</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Karakter</Label>
                <Select value={gradeValue} onValueChange={setGradeValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg karakter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ikke vurdert</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
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
                <Label htmlFor="form">Form</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Input
                id="description"
                placeholder="f.eks. Prøve i likninger"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Tilbakemelding til elev</Label>
              <textarea
                id="feedback"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Skriv tilbakemelding..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : "Lagre vurdering"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
