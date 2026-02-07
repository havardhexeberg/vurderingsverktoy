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
import {
  ArrowLeft,
  Plus,
  Users,
  AlertTriangle,
  ListChecks,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
} from "lucide-react"
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

  const writtenCount = assessments.filter((a) => a.form === "WRITTEN").length
  if (writtenCount >= 2) {
    score += 30
  } else if (writtenCount === 1) {
    score += 15
    missing.push(`Mangler ${2 - writtenCount} skriftlig vurdering`)
  } else {
    missing.push("Mangler 2 skriftlige vurderinger")
  }

  const oralCount = assessments.filter(
    (a) => a.form === "ORAL" || a.form === "ORAL_PRACTICAL"
  ).length
  if (oralCount >= 1) {
    score += 25
  } else {
    missing.push("Mangler muntlig vurdering")
  }

  if (assessments.length >= 4) {
    score += 25
  } else if (assessments.length >= 2) {
    score += 15
    missing.push(`Mangler ${4 - assessments.length} underveisvurdering(er)`)
  } else {
    missing.push(`Mangler ${4 - assessments.length} underveisvurdering(er)`)
  }

  const uniqueForms = new Set(assessments.map((a) => a.form)).size
  if (uniqueForms >= 2) {
    score += 20
  } else if (assessments.length > 0) {
    missing.push("Kun én vurderingsform - varier mer")
  }

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

  // Priority filter state
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
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
          type: "ONGOING", // Always Underveisvurdering
          form,
          grade: gradeValue ? parseInt(gradeValue) : null,
          description,
          feedback: feedback || null, // Optional
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
            <h1 className="text-2xl font-bold text-gray-900">
              {classGroup.name}
            </h1>
            <p className="text-gray-600">
              {classGroup.subject} - {classGroup.grade}. trinn -{" "}
              {classGroup.schoolYear}
            </p>
          </div>
        </div>
        <Link href={`/faggrupper/${id}/bulk`}>
          <Button>
            <ListChecks className="h-4 w-4 mr-2" />
            Vurder gruppe
          </Button>
        </Link>
      </div>

      {/* Stats — Only 2: Elever + Uten vurdering (smaller) */}
      <div className="grid gap-4 sm:grid-cols-2">
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

        {/* Elever-fanen: Fjernet karakter fra Siste vurdering */}
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
                              {new Date(
                                lastAssessment.date
                              ).toLocaleDateString("nb-NO")}
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

        {/* Siste vurderinger: Kun 1 gang per elev, vis siste vurdering */}
        <TabsContent value="assessments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Siste vurderinger</CardTitle>
              <CardDescription>
                Siste vurdering per elev i denne faggruppen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.every((s) => s.assessments.length === 0) ? (
                <p className="text-gray-500 text-center py-8">
                  Ingen vurderinger registrert ennå
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Elev</TableHead>
                      <TableHead>Dato</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Karakter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter((s) => s.assessments.length > 0)
                      .map((student) => {
                        // Sort by date descending, pick first (latest)
                        const sorted = [...student.assessments].sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        const latest = sorted[0]
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>
                              {new Date(latest.date).toLocaleDateString(
                                "nb-NO"
                              )}
                            </TableCell>
                            <TableCell>
                              {FORM_LABELS[latest.form]}
                            </TableCell>
                            <TableCell>
                              {latest.grade || "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                      .sort()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prioritering: Lavere statbokser + klikkbar filter */}
        <TabsContent value="priority" className="mt-4 space-y-6">
          {(() => {
            const readinessData = students.map((s) => ({
              student: s,
              ...getStudentReadiness(s),
            }))

            const klar = readinessData.filter((r) => r.readiness === "KLAR")
            const nestenKlar = readinessData.filter(
              (r) => r.readiness === "NESTEN_KLAR"
            )
            const trenger = readinessData.filter(
              (r) => r.readiness === "TRENGER_ARBEID"
            )

            // Apply filter
            const filteredData = priorityFilter
              ? readinessData.filter((r) => r.readiness === priorityFilter)
              : readinessData

            return (
              <>
                {/* Clickable filter stat boxes — compact height */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card
                    className={`border-green-200 bg-green-50 cursor-pointer transition-all hover:shadow-md ${
                      priorityFilter === "KLAR"
                        ? "ring-2 ring-green-500"
                        : ""
                    }`}
                    onClick={() =>
                      setPriorityFilter(
                        priorityFilter === "KLAR" ? null : "KLAR"
                      )
                    }
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Klar for standpunkt
                          </span>
                        </div>
                        <span className="text-xl font-bold text-green-700">
                          {klar.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`border-amber-200 bg-amber-50 cursor-pointer transition-all hover:shadow-md ${
                      priorityFilter === "NESTEN_KLAR"
                        ? "ring-2 ring-amber-500"
                        : ""
                    }`}
                    onClick={() =>
                      setPriorityFilter(
                        priorityFilter === "NESTEN_KLAR"
                          ? null
                          : "NESTEN_KLAR"
                      )
                    }
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            Nesten klar
                          </span>
                        </div>
                        <span className="text-xl font-bold text-amber-700">
                          {nestenKlar.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`border-red-200 bg-red-50 cursor-pointer transition-all hover:shadow-md ${
                      priorityFilter === "TRENGER_ARBEID"
                        ? "ring-2 ring-red-500"
                        : ""
                    }`}
                    onClick={() =>
                      setPriorityFilter(
                        priorityFilter === "TRENGER_ARBEID"
                          ? null
                          : "TRENGER_ARBEID"
                      )
                    }
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            Trenger mer arbeid
                          </span>
                        </div>
                        <span className="text-xl font-bold text-red-700">
                          {trenger.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {priorityFilter && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Filtrert:{" "}
                      {priorityFilter === "KLAR"
                        ? "Klar for standpunkt"
                        : priorityFilter === "NESTEN_KLAR"
                        ? "Nesten klar"
                        : "Trenger mer arbeid"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPriorityFilter(null)}
                    >
                      Vis alle
                    </Button>
                  </div>
                )}

                {/* Priority list */}
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
                          <TableHead className="text-right">
                            Handling
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData
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
                                  <span className="text-sm">
                                    {item.student.assessments.length}
                                  </span>
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
                                      <li
                                        key={i}
                                        className="flex items-start gap-1"
                                      >
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
                                  variant={
                                    item.readiness === "KLAR"
                                      ? "outline"
                                      : "default"
                                  }
                                  onClick={() =>
                                    openAssessmentDialog(item.student)
                                  }
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

                {/* Checklist */}
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
                      {(() => {
                        const needsWritten = readinessData.filter((r) =>
                          r.missing.some((m) =>
                            m.toLowerCase().includes("skriftlig")
                          )
                        )
                        return needsWritten.length > 0 ? (
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-medium text-red-800 mb-2">
                              Mangler skriftlige vurderinger (
                              {needsWritten.length} elever)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {needsWritten.map((r) => (
                                <Badge
                                  key={r.student.id}
                                  variant="outline"
                                  className="text-red-700"
                                >
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

                      {(() => {
                        const needsOral = readinessData.filter((r) =>
                          r.missing.some((m) =>
                            m.toLowerCase().includes("muntlig")
                          )
                        )
                        return needsOral.length > 0 ? (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-800 mb-2">
                              Mangler muntlige vurderinger (
                              {needsOral.length} elever)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {needsOral.map((r) => (
                                <Badge
                                  key={r.student.id}
                                  variant="outline"
                                  className="text-amber-700"
                                >
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

                      {(() => {
                        const needsVariation = readinessData.filter((r) =>
                          r.missing.some((m) =>
                            m.toLowerCase().includes("varier")
                          )
                        )
                        return needsVariation.length > 0 ? (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">
                              Mangler variasjon i vurderingsformer (
                              {needsVariation.length} elever)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {needsVariation.map((r) => (
                                <Badge
                                  key={r.student.id}
                                  variant="outline"
                                  className="text-blue-700"
                                >
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

      {/* Assessment Dialog — Only Underveisvurdering, feedback optional */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrer vurdering</DialogTitle>
            <DialogDescription>{selectedStudent?.name}</DialogDescription>
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
                <Label>Type</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50 text-sm text-gray-700">
                  Underveisvurdering
                </div>
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
                    <SelectItem value="ORAL_PRACTICAL">
                      Muntlig-praktisk
                    </SelectItem>
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
              <Label htmlFor="feedback">
                Tilbakemelding til elev{" "}
                <span className="text-gray-400 font-normal">(valgfritt)</span>
              </Label>
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
