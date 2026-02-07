"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface ClassGroupDetail {
  id: string
  name: string
  subject: string
  grade: number
  schoolYear: string
  students: Array<{
    student: {
      id: string
      name: string
      grade: number
      assessments: Array<{
        id: string
        date: string
        form: string
        grade: number | null
      }>
    }
  }>
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

export default function RektorFaggruppeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [classGroup, setClassGroup] = useState<ClassGroupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  if (!classGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Faggruppe ikke funnet</p>
        <Link href="/rektor/faggrupper">
          <Button variant="link">Tilbake til faggrupper</Button>
        </Link>
      </div>
    )
  }

  const students = classGroup.students.map((s) => s.student)
  const studentsWithoutAssessments = students.filter((s) => s.assessments.length === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rektor/faggrupper">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-600" />
            {classGroup.name}
          </h1>
          <p className="text-gray-600">
            {classGroup.subject} - {classGroup.grade}. trinn - {classGroup.schoolYear}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
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
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Uten vurdering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{studentsWithoutAssessments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elevliste</CardTitle>
          <CardDescription>Alle elever i denne faggruppen</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Siste vurdering</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const count = student.assessments.length
                const lastAssessment = student.assessments.length > 0
                  ? [...student.assessments].sort((a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0]
                  : null
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={count === 0 ? "destructive" : count < 3 ? "secondary" : "default"}
                      >
                        {count} vurdering{count !== 1 ? "er" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lastAssessment ? (
                        <span className="text-sm text-gray-600">
                          {new Date(lastAssessment.date).toLocaleDateString("nb-NO")}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
