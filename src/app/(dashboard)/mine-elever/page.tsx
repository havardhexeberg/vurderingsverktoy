"use client"

import { useState, useEffect } from "react"
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
import { Search, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

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
  OK: { label: "Klar", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  WARNING: { label: "Nesten klar", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
  CRITICAL: { label: "Trenger arbeid", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
}

export default function MineEleverPage() {
  const [students, setStudents] = useState<StudentWithStatus[]>([])
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [classGroupFilter, setClassGroupFilter] = useState<string>("all")

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

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status.status === statusFilter
    const matchesClassGroup =
      classGroupFilter === "all" || s.classGroups.some((cg) => cg.id === classGroupFilter)
    return matchesSearch && matchesStatus && matchesClassGroup
  })

  const statusSummary = {
    total: students.length,
    ok: students.filter((s) => s.status.status === "OK").length,
    warning: students.filter((s) => s.status.status === "WARNING").length,
    critical: students.filter((s) => s.status.status === "CRITICAL").length,
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster elever...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mine elever</h1>
        <p className="text-gray-600">Oversikt over alle elever i dine faggrupper</p>
      </div>

      {/* Status summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Totalt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusSummary.total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Klar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusSummary.ok}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Nesten klar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{statusSummary.warning}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Trenger arbeid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusSummary.critical}</div>
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
            <Select value={classGroupFilter} onValueChange={setClassGroupFilter}>
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

      {/* Student list */}
      <Card>
        <CardHeader>
          <CardTitle>Elever ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Klikk på en elev for å se kompetanseutvikling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Ingen elever funnet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Elev</TableHead>
                  <TableHead>Faggrupper</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vurderinger</TableHead>
                  <TableHead>Kompetansedekning</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status.status]
                  const StatusIcon = statusConfig.icon
                  const primaryClassGroup = item.classGroups[0]

                  return (
                    <TableRow key={item.student.id}>
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
                            <Badge key={cg.id} variant="outline" className="text-xs">
                              {cg.subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
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
                          <span className="font-medium">{item.status.assessmentCount}</span>
                          <span className="text-gray-500 ml-1">
                            ({item.status.writtenCount}S / {item.status.oralCount}M)
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
                      <TableCell>
                        {primaryClassGroup && (
                          <Link
                            href={`/faggrupper/${primaryClassGroup.id}/elev/${item.student.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Se utvikling
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        )}
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
