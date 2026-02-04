"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Users, BookOpen, ClipboardCheck } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Student {
  id: string
  name: string
  grade: number
}

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
  schoolYear: string
  students: { student: Student }[]
  _count: { assessments: number }
}

export default function FaggrupperPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [grade, setGrade] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, studentsRes] = await Promise.all([
        fetch("/api/class-groups"),
        fetch("/api/students"),
      ])

      if (groupsRes.ok) {
        const groups = await groupsRes.json()
        setClassGroups(groups)
      }

      if (studentsRes.ok) {
        const studentData = await studentsRes.json()
        setStudents(studentData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/class-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          grade: parseInt(grade),
          schoolYear: "2025/2026",
          studentIds: selectedStudents,
        }),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke opprette faggruppe")
      }

      toast.success("Faggruppe opprettet!")
      setIsOpen(false)
      setName("")
      setSubject("")
      setGrade("")
      setSelectedStudents([])
      fetchData()
    } catch (error) {
      toast.error("Kunne ikke opprette faggruppe")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudentsForGrade = () => {
    if (!grade) return
    const gradeNum = parseInt(grade)
    const gradeStudents = students.filter((s) => s.grade === gradeNum)
    setSelectedStudents(gradeStudents.map((s) => s.id))
  }

  const filteredStudents = grade
    ? students.filter((s) => s.grade === parseInt(grade))
    : students

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Laster...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mine faggrupper</h1>
          <p className="text-gray-600 mt-1">
            Administrer dine faggrupper og elever
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ny faggruppe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Opprett ny faggruppe</DialogTitle>
              <DialogDescription>
                Fyll ut informasjon og velg elever
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Navn</Label>
                  <Input
                    id="name"
                    placeholder="f.eks. Matematikk 10A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Fag</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg fag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matematikk">Matematikk</SelectItem>
                      <SelectItem value="Norsk">Norsk</SelectItem>
                      <SelectItem value="Engelsk">Engelsk</SelectItem>
                      <SelectItem value="Naturfag">Naturfag</SelectItem>
                      <SelectItem value="Samfunnsfag">Samfunnsfag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Trinn</Label>
                <Select value={grade} onValueChange={setGrade} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg trinn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8. trinn</SelectItem>
                    <SelectItem value="9">9. trinn</SelectItem>
                    <SelectItem value="10">10. trinn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {grade && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Velg elever ({selectedStudents.length} valgt)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllStudentsForGrade}
                    >
                      Velg alle
                    </Button>
                  </div>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {filteredStudents.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Ingen elever på dette trinnet. Importer elever først.
                      </p>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <label
                            htmlFor={student.id}
                            className="text-sm cursor-pointer"
                          >
                            {student.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Avbryt
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Oppretter..." : "Opprett faggruppe"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {classGroups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ingen faggrupper</CardTitle>
            <CardDescription>
              Du har ingen faggrupper ennå. Opprett en ny for å komme i gang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>
                {students.length === 0
                  ? "Importer elever først, deretter opprett en faggruppe"
                  : `${students.length} elever tilgjengelig. Klikk "Ny faggruppe" for å starte.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classGroups.map((group) => (
            <Link key={group.id} href={`/faggrupper/${group.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardDescription>{group.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.students.length} elever</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClipboardCheck className="h-4 w-4" />
                      <span>{group._count.assessments} vurderinger</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {group.grade}. trinn - {group.schoolYear}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
