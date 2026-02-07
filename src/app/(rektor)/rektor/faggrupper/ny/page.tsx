"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Users, BookOpen, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Teacher {
  id: string
  name: string
  email: string
}

interface Student {
  id: string
  name: string
  grade: number
}

const SUBJECTS = [
  "Matematikk",
  "Norsk",
  "Engelsk",
  "Naturfag",
  "Samfunnsfag",
  "KRLE",
  "Spansk",
  "Tysk",
  "Fransk",
  "Kunst og håndverk",
  "Musikk",
  "Mat og helse",
  "Kroppsøving",
]

export default function CreateClassGroupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

  // Form state
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [grade, setGrade] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const schoolYear = "2025/2026"

  useEffect(() => {
    fetchTeachers()
    fetchStudents()
  }, [])

  useEffect(() => {
    // Filter students by grade and search query
    let filtered = students
    if (grade) {
      filtered = filtered.filter((s) => s.grade === parseInt(grade))
    }
    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredStudents(filtered)
  }, [grade, searchQuery, students])

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/rektor/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.teachers || [])
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id)
    setSelectedStudents((prev) => {
      const newSelection = new Set([...prev, ...filteredIds])
      return Array.from(newSelection)
    })
  }

  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredStudents.map((s) => s.id))
    setSelectedStudents((prev) => prev.filter((id) => !filteredIds.has(id)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !subject || !grade || !teacherId) {
      toast.error("Fyll ut alle obligatoriske felt")
      return
    }

    if (selectedStudents.length === 0) {
      toast.error("Velg minst en elev")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/class-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          grade: parseInt(grade),
          schoolYear,
          teacherId,
          studentIds: selectedStudents,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Kunne ikke opprette faggruppe")
      }

      toast.success("Faggruppe opprettet")
      router.push("/rektor/faggrupper")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Noe gikk galt")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rektor/faggrupper">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opprett faggruppe</h1>
          <p className="text-gray-600">
            Opprett en ny faggruppe og tildel elever og lærer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Faggruppeinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn på faggruppe *</Label>
                <Input
                  id="name"
                  placeholder="f.eks. Matematikk 10A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Fag *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg fag" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Trinn *</Label>
                <Select value={grade} onValueChange={setGrade}>
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
              <div className="space-y-2">
                <Label htmlFor="teacher">Lærer *</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg lærer" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skole&#229;r</Label>
              <Input value={schoolYear} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Velg elever
            </CardTitle>
            <CardDescription>
              Velg elevene som skal være med i faggruppen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Søk etter elev..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllFiltered}
              >
                Velg alle
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAllFiltered}
              >
                Fjern alle
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              {selectedStudents.length} elever valgt
              {grade && ` av ${filteredStudents.length} på ${grade}. trinn`}
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Navn</TableHead>
                    <TableHead>Trinn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        {grade
                          ? "Ingen elever funnet på dette trinnet"
                          : "Velg et trinn for å se elever"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className="cursor-pointer"
                        onClick={() => toggleStudent(student.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.grade}. trinn</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/rektor/faggrupper">
            <Button variant="outline">Avbryt</Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isLoading ? "Oppretter..." : "Opprett faggruppe"}
          </Button>
        </div>
      </form>
    </div>
  )
}
