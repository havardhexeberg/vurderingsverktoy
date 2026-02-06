"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  GraduationCap,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldOff,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface StudentData {
  id: string
  name: string
  grade: number
  subjects: string[]
  teachers: string[]
  assessmentCount: number
  status: "OK" | "WARNING" | "CRITICAL"
  statusMessage: string
  hasExemptions: boolean
  lastAssessment: string | null
}

export default function RektorEleverPage() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchStudents()
  }, [search, gradeFilter, statusFilter])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (gradeFilter !== "all") params.set("grade", gradeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const response = await fetch(`/api/rektor/students?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Klar
          </Badge>
        )
      case "WARNING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Nesten klar
          </Badge>
        )
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Kritisk
          </Badge>
        )
      default:
        return null
    }
  }

  const statusCounts = {
    ok: students.filter(s => s.status === "OK").length,
    warning: students.filter(s => s.status === "WARNING").length,
    critical: students.filter(s => s.status === "CRITICAL").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-purple-600" />
          Alle elever
        </h1>
        <p className="text-gray-600">Oversikt over alle elever på skolen</p>
      </div>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Klar for standpunkt</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.ok}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nesten klar</p>
                <p className="text-2xl font-bold text-amber-600">{statusCounts.warning}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kritisk</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrer elever
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Søk etter navn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trinn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle trinn</SelectItem>
                <SelectItem value="8">8. trinn</SelectItem>
                <SelectItem value="9">9. trinn</SelectItem>
                <SelectItem value="10">10. trinn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statuser</SelectItem>
                <SelectItem value="OK">Klar</SelectItem>
                <SelectItem value="WARNING">Nesten klar</SelectItem>
                <SelectItem value="CRITICAL">Kritisk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student list */}
      <Card>
        <CardHeader>
          <CardTitle>Elever ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Laster...</div>
          ) : students.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Ingen elever funnet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>Trinn</TableHead>
                  <TableHead>Fag</TableHead>
                  <TableHead>Vurderinger</TableHead>
                  <TableHead>Sist vurdert</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.name}</span>
                        {student.hasExemptions && (
                          <span title="Har fritak">
                            <ShieldOff className="h-4 w-4 text-amber-500" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.grade}. trinn</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {student.subjects.join(", ") || "-"}
                      </div>
                    </TableCell>
                    <TableCell>{student.assessmentCount}</TableCell>
                    <TableCell>
                      {student.lastAssessment
                        ? format(new Date(student.lastAssessment), "d. MMM yyyy", { locale: nb })
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
