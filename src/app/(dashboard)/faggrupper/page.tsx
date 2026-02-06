"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import {
  Plus,
  Users,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  Calculator,
  Languages,
  Globe,
  Microscope,
  Building2,
  BookText,
  Palette,
  Music,
  Utensils,
  Dumbbell,
  Loader2,
  TrendingUp,
  AlertCircle
} from "lucide-react"
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

// Subject icons and colors
const subjectConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  "Matematikk": { icon: Calculator, color: "text-blue-600", bgColor: "bg-blue-50" },
  "Norsk": { icon: BookText, color: "text-red-600", bgColor: "bg-red-50" },
  "Engelsk": { icon: Languages, color: "text-purple-600", bgColor: "bg-purple-50" },
  "Naturfag": { icon: Microscope, color: "text-green-600", bgColor: "bg-green-50" },
  "Samfunnsfag": { icon: Building2, color: "text-amber-600", bgColor: "bg-amber-50" },
  "KRLE": { icon: Globe, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  "Spansk": { icon: Languages, color: "text-orange-600", bgColor: "bg-orange-50" },
  "Kunst og handverk": { icon: Palette, color: "text-pink-600", bgColor: "bg-pink-50" },
  "Musikk": { icon: Music, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  "Mat og helse": { icon: Utensils, color: "text-lime-600", bgColor: "bg-lime-50" },
  "Kroppsoving": { icon: Dumbbell, color: "text-teal-600", bgColor: "bg-teal-50" },
}

const getSubjectConfig = (subject: string) => {
  return subjectConfig[subject] || { icon: BookOpen, color: "text-gray-600", bgColor: "bg-gray-50" }
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

  // Group class groups by subject
  const groupedBySubject = useMemo(() => {
    const grouped: Record<string, ClassGroup[]> = {}
    classGroups.forEach((group) => {
      if (!grouped[group.subject]) {
        grouped[group.subject] = []
      }
      grouped[group.subject].push(group)
    })
    // Sort groups within each subject by grade
    Object.keys(grouped).forEach((subject) => {
      grouped[subject].sort((a, b) => a.grade - b.grade)
    })
    return grouped
  }, [classGroups])

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = new Set(
      classGroups.flatMap((g) => g.students.map((s) => s.student.id))
    ).size
    const totalAssessments = classGroups.reduce(
      (sum, g) => sum + g._count.assessments,
      0
    )
    return { totalStudents, totalAssessments }
  }, [classGroups])

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
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mine faggrupper</h1>
          <p className="text-gray-600 mt-1">
            Organisert etter fag
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
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
                      {Object.keys(subjectConfig).map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isSubmitting ? "Oppretter..." : "Opprett faggruppe"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-100">Faggrupper</p>
                <p className="text-3xl font-bold">{classGroups.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-teal-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unike elever</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vurderinger</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAssessments}</p>
              </div>
              <ClipboardCheck className="w-10 h-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {classGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen faggrupper</h3>
            <p className="text-gray-500 mb-4">
              {students.length === 0
                ? "Importer elever først, deretter opprett en faggruppe"
                : `${students.length} elever tilgjengelig. Klikk "Ny faggruppe" for å starte.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Grouped by Subject */
        <div className="space-y-8">
          {Object.entries(groupedBySubject).map(([subject, groups]) => {
            const config = getSubjectConfig(subject)
            const Icon = config.icon
            const totalStudents = groups.reduce((sum, g) => sum + g.students.length, 0)
            const totalAssessments = groups.reduce((sum, g) => sum + g._count.assessments, 0)

            return (
              <div key={subject} className="space-y-3">
                {/* Subject Header */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bgColor}`}>
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">{subject}</h2>
                    <p className="text-sm text-gray-600">
                      {groups.length} {groups.length === 1 ? "gruppe" : "grupper"} · {totalStudents} elever · {totalAssessments} vurderinger
                    </p>
                  </div>
                </div>

                {/* Class Group Cards */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pl-4">
                  {groups.map((group) => (
                    <Link key={group.id} href={`/faggrupper/${group.id}`}>
                      <Card className="hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors">
                                {group.name}
                              </h3>
                              <Badge variant="secondary" className="mt-1">
                                {group.grade}. trinn
                              </Badge>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{group.students.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClipboardCheck className="w-4 h-4" />
                              <span>{group._count.assessments}</span>
                            </div>
                            {group._count.assessments > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
