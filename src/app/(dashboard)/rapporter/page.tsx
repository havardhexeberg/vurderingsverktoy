"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  FileText,
  Download,
  BarChart3,
  Users,
  BookOpen,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
}

interface ReportData {
  title?: string
  classGroup?: {
    name: string
    subject: string
    grade: number
    teacher?: string
  }
  summary?: {
    totalStudents?: number
    criticalStatus?: number
    warningStatus?: number
    okStatus?: number
  }
  students?: Array<{
    name: string
    assessmentCount: number
    writtenCount: number
    oralCount: number
    averageGrade: number | null
    status: string
  }>
  classGroups?: Array<{
    name: string
    subject: string
    studentCount: number
    criticalCount: number
    warningCount: number
    okCount: number
  }>
}

export default function RapporterPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("")
  const [reportType, setReportType] = useState<string>("")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchClassGroups()
  }, [])

  const fetchClassGroups = async () => {
    try {
      const response = await fetch("/api/class-groups")
      if (response.ok) {
        const data = await response.json()
        setClassGroups(data)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const generateReport = async () => {
    if (!reportType) {
      toast.error("Velg en rapporttype")
      return
    }
    if (reportType !== "teacher-overview" && !selectedClassGroup) {
      toast.error("Velg en faggruppe")
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ type: reportType })
      if (selectedClassGroup) {
        params.append("classGroupId", selectedClassGroup)
      }

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        throw new Error("Kunne ikke generere rapport")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Feil ved generering"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = async () => {
    if (
      !reportType ||
      (!selectedClassGroup && reportType !== "teacher-overview")
    ) {
      return
    }

    const params = new URLSearchParams({
      type: reportType,
      format: "csv",
    })
    if (selectedClassGroup) {
      params.append("classGroupId", selectedClassGroup)
    }

    window.open(`/api/reports?${params}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapporter</h1>
        <p className="text-gray-600">Generer og eksporter rapporter</p>
      </div>

      {/* Report configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Velg rapport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rapporttype</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class-overview">
                    Klasseoversikt
                  </SelectItem>
                  <SelectItem value="teacher-overview">
                    Min oversikt
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType !== "teacher-overview" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Faggruppe</label>
                <Select
                  value={selectedClassGroup}
                  onValueChange={setSelectedClassGroup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg faggruppe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classGroups.map((cg) => (
                      <SelectItem key={cg.id} value={cg.id}>
                        {cg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button onClick={generateReport} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Generer
              </Button>
              {reportData && reportType !== "teacher-overview" && (
                <Button variant="outline" onClick={downloadCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report display */}
      {reportData && (
        <>
          {/* Class Overview Report — WITHOUT "Snitt" column */}
          {reportType === "class-overview" && reportData.students && (
            <Card>
              <CardHeader>
                <CardTitle>{reportData.title}</CardTitle>
                <CardDescription>
                  {reportData.classGroup?.subject} -{" "}
                  {reportData.classGroup?.grade}. trinn
                  {reportData.classGroup?.teacher &&
                    ` | Lærer: ${reportData.classGroup.teacher}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Totalt</div>
                    <div className="text-2xl font-bold">
                      {reportData.summary?.totalStudents}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600">Klar</div>
                    <div className="text-2xl font-bold text-green-700">
                      {reportData.summary?.okStatus}
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="text-sm text-amber-600">Nesten klar</div>
                    <div className="text-2xl font-bold text-amber-700">
                      {reportData.summary?.warningStatus}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600">Trenger arbeid</div>
                    <div className="text-2xl font-bold text-red-700">
                      {reportData.summary?.criticalStatus}
                    </div>
                  </div>
                </div>

                {/* Student table — NO "Snitt" column */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Elev</TableHead>
                      <TableHead>Vurderinger</TableHead>
                      <TableHead>Skriftlig</TableHead>
                      <TableHead>Muntlig</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.students.map((student, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.assessmentCount}</TableCell>
                        <TableCell>{student.writtenCount}</TableCell>
                        <TableCell>{student.oralCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "OK"
                                ? "default"
                                : student.status === "WARNING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {student.status === "OK"
                              ? "Klar"
                              : student.status === "WARNING"
                              ? "Nesten"
                              : "Kritisk"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Teacher Overview Report */}
          {reportType === "teacher-overview" && reportData.classGroups && (
            <Card>
              <CardHeader>
                <CardTitle>{reportData.title}</CardTitle>
                <CardDescription>
                  Oversikt over alle dine faggrupper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.classGroups.map((cg, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{cg.name}</span>
                          <Badge variant="outline">{cg.subject}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {cg.studentCount} elever
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">
                          {cg.okCount} klar
                        </span>
                        <span className="text-amber-600">
                          {cg.warningCount} nesten
                        </span>
                        <span className="text-red-600">
                          {cg.criticalCount} kritisk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
