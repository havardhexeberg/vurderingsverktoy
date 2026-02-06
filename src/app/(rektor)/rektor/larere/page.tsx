"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Users, BookOpen, FileText, AlertTriangle, CheckCircle } from "lucide-react"

interface TeacherData {
  id: string
  name: string
  email: string
  classGroups: Array<{
    id: string
    name: string
    subject: string
    studentCount: number
  }>
  totalStudents: number
  totalAssessments: number
  criticalStudents: number
  warningStudents: number
  okStudents: number
}

export default function LarerePage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/rektor/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lærere</h1>
        <p className="text-gray-600">Oversikt over lærere og deres faggrupper</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Antall lærere</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Totalt faggrupper</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.reduce((sum, t) => sum + t.classGroups.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Totalt vurderinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.reduce((sum, t) => sum + t.totalAssessments, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher list */}
      <Card>
        <CardHeader>
          <CardTitle>Alle lærere</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Ingen lærere funnet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lærer</TableHead>
                  <TableHead>Faggrupper</TableHead>
                  <TableHead>Elever</TableHead>
                  <TableHead>Vurderinger</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => {
                  const totalWithStatus =
                    teacher.okStudents + teacher.warningStudents + teacher.criticalStudents
                  const okPercentage =
                    totalWithStatus > 0
                      ? Math.round((teacher.okStudents / totalWithStatus) * 100)
                      : 0

                  return (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-gray-500">{teacher.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.classGroups.slice(0, 3).map((cg) => (
                            <Badge key={cg.id} variant="outline" className="text-xs">
                              {cg.subject}
                            </Badge>
                          ))}
                          {teacher.classGroups.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{teacher.classGroups.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{teacher.totalStudents}</TableCell>
                      <TableCell>{teacher.totalAssessments}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {teacher.criticalStudents > 0 ? (
                            <Badge variant="destructive">
                              {teacher.criticalStudents} kritisk
                            </Badge>
                          ) : teacher.warningStudents > 0 ? (
                            <Badge variant="secondary">
                              {teacher.warningStudents} nesten
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          )}
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
