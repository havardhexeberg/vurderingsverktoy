"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface StudentDetail {
  id: string
  name: string
  grade: number
  birthNumber: string
  subjects: string[]
  teachers: string[]
  assessmentCount: number
  status: "OK" | "WARNING" | "CRITICAL"
  statusMessage: string
  hasExemptions: boolean
  lastAssessment: string | null
  assessments: Array<{
    id: string
    date: string
    subject: string
    form: string
    grade: number | null
    description: string | null
  }>
}

export default function RektorStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/rektor/students?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        // If API returns array, take the matching one
        const found = Array.isArray(data) ? data.find((s: StudentDetail) => s.id === id) : data
        setStudent(found || null)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFormLabel = (form: string) => {
    const labels: Record<string, string> = {
      WRITTEN: "Skriftlig",
      ORAL: "Muntlig",
      ORAL_PRACTICAL: "Muntlig-praktisk",
      PRACTICAL: "Praktisk",
    }
    return labels[form] || form
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Klar</Badge>
      case "WARNING":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Nesten klar</Badge>
      case "CRITICAL":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Kritisk</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Elev ikke funnet</p>
        <Link href="/rektor/elever">
          <Button variant="link">Tilbake til elevliste</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rektor/elever">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-brand-600" />
            {student.name}
          </h1>
          <p className="text-gray-600">{student.grade}. trinn</p>
        </div>
        <div className="ml-auto">{getStatusBadge(student.status)}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Vurderinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.assessmentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Fag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.subjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Sist vurdert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {student.lastAssessment
                ? format(new Date(student.lastAssessment), "d. MMM yyyy", { locale: nb })
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fag og lærere</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {student.subjects.map((subject, i) => (
              <Badge key={i} variant="outline">{subject}</Badge>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Lærere: {student.teachers.join(", ")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statusmelding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{student.statusMessage}</p>
        </CardContent>
      </Card>
    </div>
  )
}
