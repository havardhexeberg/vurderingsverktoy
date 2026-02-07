"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Progress } from "@/components/ui/progress"
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ClassGroup {
  id: string
  name: string
  subject: string
}

interface StudentWithStatus {
  student: {
    id: string
    name: string
    grade: number
  }
  status: {
    status: "OK" | "WARNING" | "CRITICAL"
    assessmentCount: number
    competenceCoverage: number
    writtenCount: number
    oralCount: number
  }
  classGroups: ClassGroup[]
}

const STATUS_CONFIG = {
  OK: {
    label: "Klar",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  WARNING: {
    label: "Nesten klar",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  CRITICAL: {
    label: "Trenger arbeid",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
}

type SortField =
  | "name"
  | "classGroups"
  | "status"
  | "assessments"
  | "coverage"
type SortDirection = "asc" | "desc"

export default function MineEleverPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentWithStatus[]>([])
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [classGroupFilter, setClassGroupFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/teacher/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setClassGroups(data.classGroups || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const statusOrder = { CRITICAL: 0, WARNING: 1, OK: 2 }

  const filteredAndSortedStudents = useMemo(() => {
    let result = students.filter((s) => {
      const matchesSearch = s.student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || s.status.status === statusFilter
      const matchesClassGroup =
        classGroupFilter === "all" ||
        s.classGroups.some((cg) => cg.id === classGroupFilter)
      return matchesSearch && matchesStatus && matchesClassGroup
    })

    result.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1
      switch (sortField) {
        case "name":
          return dir * a.student.name.localeCompare(b.student.name, "nb")
        case "classGroups":
          return (
            dir *
            (a.classGroups.length - b.classGroups.length)
          )
        case "status":
          return (
            dir *
            (statusOrder[a.status.status] - statusOrder[b.status.status])
          )
        case "assessments":
          return (
            dir *
            (a.status.assessmentCount - b.status.assessmentCount)
          )
        case "coverage":
          return (
            dir *
            (a.status.competenceCoverage - b.status.competenceCoverage)
          )
        default:
          return 0
      }
    })

    return result
  }, [
    students,
    searchQuery,
    statusFilter,
    classGroupFilter,
    sortField,
    sortDirection,
  ])

  const statusSummary = {
    total: students.length,
    ok: students.filter((s) => s.status.status === "OK").length,
    warning: students.filter((s) => s.status.status === "WARNING").length,
    critical: students.filter((s) => s.status.status === "CRITICAL").length,
  }

  const navigateToStudent = (item: StudentWithStatus) => {
    const primaryClassGroup = item.classGroups[0]
    if (primaryClassGroup) {
      router.push(
        `/faggrupper/${primaryClassGroup.id}/elev/${item.student.id}`
      )
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster elever...</div>
  }

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <TableHead
      className="cursor-pointer hover:text-gray-900 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={`h-3 w-3 ${
            sortField === field ? "text-brand-600" : "text-gray-400"
          }`}
        />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mine elever</h1>
        <p className="text-gray-600">
          Oversikt over alle elever i dine faggrupper
        </p>
      </div>

      {/* Status summary cards — compact height */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Totalt</span>
              <span className="text-xl font-bold">{statusSummary.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                Klar
              </span>
              <span className="text-xl font-bold text-green-600">
                {statusSummary.ok}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Nesten klar
              </span>
              <span className="text-xl font-bold text-amber-600">
                {statusSummary.warning}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                Trenger arbeid
              </span>
              <span className="text-xl font-bold text-red-600">
                {statusSummary.critical}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrer elever</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Søk etter elev..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statuser</SelectItem>
                <SelectItem value="CRITICAL">Trenger arbeid</SelectItem>
                <SelectItem value="WARNING">Nesten klar</SelectItem>
                <SelectItem value="OK">Klar</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={classGroupFilter}
              onValueChange={setClassGroupFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Faggruppe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle faggrupper</SelectItem>
                {classGroups.map((cg) => (
                  <SelectItem key={cg.id} value={cg.id}>
                    {cg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student list — Whole row clickable, sortable columns */}
      <Card>
        <CardHeader>
          <CardTitle>Elever ({filteredAndSortedStudents.length})</CardTitle>
          <CardDescription>
            Klikk på en elev for å se kompetanseutvikling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedStudents.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Ingen elever funnet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="name">Elev</SortableHeader>
                  <SortableHeader field="classGroups">
                    Faggrupper
                  </SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                  <SortableHeader field="assessments">
                    Vurderinger
                  </SortableHeader>
                  <SortableHeader field="coverage">
                    Kompetansedekning
                  </SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStudents.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status.status]
                  const StatusIcon = statusConfig.icon
                  return (
                    <TableRow
                      key={item.student.id}
                      className="cursor-pointer hover:bg-brand-50 transition-colors"
                      onClick={() => navigateToStudent(item)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.student.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.student.grade}. trinn
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.classGroups.map((cg) => (
                            <Badge
                              key={cg.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {cg.subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`h-4 w-4 ${statusConfig.color}`}
                          />
                          <Badge
                            variant={
                              item.status.status === "OK"
                                ? "default"
                                : item.status.status === "WARNING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">
                            {item.status.assessmentCount}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({item.status.writtenCount}S /{" "}
                            {item.status.oralCount}M)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={item.status.competenceCoverage}
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-gray-600">
                            {item.status.competenceCoverage}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
