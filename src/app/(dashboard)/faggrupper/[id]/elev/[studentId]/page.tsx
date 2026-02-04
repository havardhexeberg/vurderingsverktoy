"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { CompetenceProfile } from "@/components/competence/competence-profile"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  description?: string
  feedback?: string
  isPublished: boolean
}

interface StudentData {
  id: string
  name: string
  grade: number
  assessments: Assessment[]
}

const TYPE_LABELS: Record<string, string> = {
  ONGOING: "Underveisvurdering",
  MIDTERM: "Halvårsvurdering",
  FINAL: "Standpunkt",
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>
}) {
  const { id, studentId } = use(params)
  const [student, setStudent] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStudent()
  }, [id, studentId])

  const fetchStudent = async () => {
    try {
      const response = await fetch(
        `/api/students/${studentId}?classGroupId=${id}`
      )
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
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

  if (!student) {
    return <div className="text-center p-8">Elev ikke funnet</div>
  }

  const writtenCount = student.assessments.filter((a) => a.form === "WRITTEN").length
  const oralCount = student.assessments.filter((a) =>
    a.form === "ORAL" || a.form === "ORAL_PRACTICAL"
  ).length
  const avgGrade = student.assessments.length > 0
    ? (student.assessments.reduce((sum, a) => sum + (a.grade || 0), 0) /
       student.assessments.filter(a => a.grade).length).toFixed(1)
    : "-"

  const getStatus = () => {
    if (student.assessments.length === 0 || writtenCount < 2) {
      return { status: "CRITICAL", label: "Trenger arbeid", icon: AlertTriangle, color: "text-red-600" }
    }
    if (writtenCount < 3 || oralCount === 0) {
      return { status: "WARNING", label: "Nesten klar", icon: Clock, color: "text-amber-600" }
    }
    return { status: "OK", label: "Klar", icon: CheckCircle, color: "text-green-600" }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/faggrupper/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-gray-600">{student.grade}. trinn</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          <Badge variant={status.status === "OK" ? "default" : status.status === "WARNING" ? "secondary" : "destructive"}>
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Vurderinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.assessments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Skriftlige</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writtenCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Muntlige</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oralCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Snitt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGrade}</div>
          </CardContent>
        </Card>
      </div>

      <CompetenceProfile studentId={studentId} classGroupId={id} />

      <Card>
        <CardHeader>
          <CardTitle>Vurderingshistorikk</CardTitle>
          <CardDescription>Alle vurderinger for denne eleven</CardDescription>
        </CardHeader>
        <CardContent>
          {student.assessments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Ingen vurderinger ennå</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dato</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead>Karakter</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      {new Date(assessment.date).toLocaleDateString("nb-NO")}
                    </TableCell>
                    <TableCell>{TYPE_LABELS[assessment.type]}</TableCell>
                    <TableCell>{FORM_LABELS[assessment.form]}</TableCell>
                    <TableCell>{assessment.description || "-"}</TableCell>
                    <TableCell className="font-semibold">
                      {assessment.grade || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assessment.isPublished ? "default" : "secondary"}>
                        {assessment.isPublished ? "Publisert" : "Kladd"}
                      </Badge>
                    </TableCell>
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
