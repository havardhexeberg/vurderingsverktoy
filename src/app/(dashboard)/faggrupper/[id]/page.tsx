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
import { ArrowLeft, Plus, Users, ClipboardCheck, AlertTriangle, ListChecks, CheckCircle2, XCircle, Clock, Target } from "lucide-react"
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

interface ReadinessResult {
  readiness: "KLAR" | "NESTEN_KLAR" | "TRENGER_ARBEID"
  readinessLabel: string
  missing: string[]
  score: number
}

function getStudentReadiness(student: Student): ReadinessResult {
  const assessments = student.assessments
  const missing: string[] = []
  let score = 0

  // Sjekk skriftlige vurderinger (min 2)
  const writtenCount = assessments.filter((a) => a.form === "WRITTEN").length
  if (writtenCount >= 2) {
    score += 30
  } else if (writtenCount === 1) {
    score += 15
    missing.push(`Mangler ${2 - writtenCount} skriftlig vurdering`)
  } else {
    missing.push("Mangler 2 skriftlige vurderinger")
  }

  // Sjekk muntlige vurderinger (min 1)
  const oralCount = assessments.filter((a) =>
    a.form === "ORAL" || a.form === "ORAL_PRACTICAL"
  ).length
  if (oralCount >= 1) {
    score += 25
  } else {
    missing.push("Mangler muntlig vurdering")
  }

  // Sjekk totalt antall vurderinger (min 4)
  if (assessments.length >= 4) {
    score += 25
  } else if (assessments.length >= 2) {
    score += 15
    missing.push(`Mangler ${4 - assessments.length} underveisvurdering(er)`)
  } else {
    missing.push(`Mangler ${4 - assessments.length} underveisvurdering(er)`)
  }

  // Sjekk varierte vurderingsformer
  const uniqueForms = new Set(assessments.map((a) => a.form)).size
  if (uniqueForms >= 2) {
    score += 20
  } else if (assessments.length > 0) {
    missing.push("Kun én vurderingsform - varier mer")
  }

  // Bestem status basert på score
  let readiness: "KLAR" | "NESTEN_KLAR" | "TRENGER_ARBEID"
  let readinessLabel: string

  if (score >= 80 && missing.length === 0) {
    readiness = "KLAR"
    readinessLabel = "Klar for standpunkt"
  } else if (score >= 50) {
    readiness = "NESTEN_KLAR"
    readinessLabel = "Nesten klar"
  } else {
    readiness = "TRENGER_ARBEID"
    readinessLabel = "Trenger mer arbeid"
  }

  return { readiness, readinessLabel, missing, score }
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
          <TabsTrigger value="priority">Prioritering</TabsTrigger>
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

        <TabsContent value="priority" className="mt-4 space-y-6">
          {/* Sammendrag */}
          {(() => {
            const readinessData = students.map((s) => ({
              student: s,
              ...getStudentReadiness(s),
            }))
            const klar = readinessData.filter((r) => r.readiness === "KLAR")
            const nestenKlar = readinessData.filter((r) => r.readiness === "NESTEN_KLAR")
            const trenger = readinessData.filter((r) => r.readiness === "TRENGER_ARBEID")

            return (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Klar for standpunkt
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-700">{klar.length}</div>
                      <p className="text-xs text-green-600">elever</p>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Nesten klar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-700">{nestenKlar.length}</div>
                      <p className="text-xs text-amber-600">elever</p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Trenger mer arbeid
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-700">{trenger.length}</div>
                      <p className="text-xs text-red-600">elever</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Prioriteringsliste - de som trenger arbeid først */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Prioriteringsliste
                    </CardTitle>
                    <CardDescription>
                      Elever sortert etter hvem som trenger mest oppfølging
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Elev</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Vurderinger</TableHead>
                          <TableHead>Hva mangler</TableHead>
                          <TableHead className="text-right">Handling</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {readinessData
                          .sort((a, b) => a.score - b.score)
                          .map((item) => (
                            <TableRow key={item.student.id}>
                              <TableCell className="font-medium">
                                {item.student.name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.readiness === "KLAR"
                                      ? "default"
                                      : item.readiness === "NESTEN_KLAR"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className={
                                    item.readiness === "KLAR"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : item.readiness === "NESTEN_KLAR"
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                      : ""
                                  }
                                >
                                  {item.readinessLabel}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{item.student.assessments.length}</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        item.readiness === "KLAR"
                                          ? "bg-green-500"
                                          : item.readiness === "NESTEN_KLAR"
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{ width: `${item.score}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.missing.length > 0 ? (
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {item.missing.map((m, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <XCircle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                                        {m}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Alt på plass
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant={item.readiness === "KLAR" ? "outline" : "default"}
                                  onClick={() => openAssessmentDialog(item.student)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Vurdering
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Sjekkliste for hva som mangler totalt */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      Samlet sjekkliste - Hva mangler?
                    </CardTitle>
                    <CardDescription>
                      Oversikt over mangler i faggruppen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Skriftlige */}
                      {(() => {
                        const needsWritten = readinessData.filter((r) =>
                          r.missing.some((m) => m.toLowerCase().includes("skriftlig"))
                        )
                        return needsWritten.length > 0 ? (
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-medium text-red-800 mb-2">
                              Mangler skriftlige vurderinger ({needsWritten.length} elever)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {needsWritten.map((r) => (
                                <Badge key={r.student.id} variant="outline" className="text-red-700">
                                  {r.student.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Alle har nok skriftlige vurderinger
                            </h4>
                          </div>
                        )
                      })()}

                      {/* Muntlige */}
                      {(() => {
                        const needsOral = readinessData.filter((r) =>
                          r.missing.some((m) => m.toLowerCase().includes("muntlig"))
                        )
                        return needsOral.length > 0 ? (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-800 mb-2">
                              Mangler muntlige vurderinger ({needsOral.length} elever)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {needsOral.map((r) => (
                                <Badge key={r.student.id} variant="outline" className="text-amber-700">
                                  {r.student.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Alle har muntlig vurdering
                            </h4>
                          </div>
                        )
                      })()}

                      {/* Variasjon */}
                      {(() => {
                        const needsVariation = readinessData.filter((r) =>
                          r.missing.some((m) => m.toLowerCase().includes("varier"))
                        )
                        return needsVariation.length > 0 ? (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">
                              Mangler variasjon i vurderingsformer ({needsVariation.length} elever)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {needsVariation.map((r) => (
                                <Badge key={r.student.id} variant="outline" className="text-blue-700">
                                  {r.student.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          })()}
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
