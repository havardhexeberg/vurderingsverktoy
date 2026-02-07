"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { BookOpen, Filter } from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface Assessment {
  id: string
  date: string
  subject: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
  childName: string
}

interface ChildData {
  id: string
  name: string
  recentAssessments: Array<{
    id: string
    date: string
    subject: string
    type: string
    form: string
    grade: number | null
    feedback: string | null
  }>
}

export default function AlleVurderingerPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [children, setChildren] = useState<ChildData[]>([])
  const [selectedChild, setSelectedChild] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/foresatt/children")
      if (response.ok) {
        const data: ChildData[] = await response.json()
        setChildren(data)

        // Combine all assessments
        const allAssessments: Assessment[] = []
        data.forEach((child) => {
          child.recentAssessments.forEach((a) => {
            allAssessments.push({
              ...a,
              childName: child.name,
            })
          })
        })

        // Sort by date descending
        allAssessments.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        setAssessments(allAssessments)
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ONGOING: "Underveisvurdering",
      MIDTERM: "Halvårsvurdering",
      FINAL: "Standpunkt",
    }
    return labels[type] || type
  }

  const filteredAssessments = assessments.filter((a) => {
    if (selectedChild !== "all") {
      const child = children.find((c) => c.id === selectedChild)
      if (child && a.childName !== child.name) return false
    }
    if (selectedSubject !== "all" && a.subject !== selectedSubject) return false
    return true
  })

  const allSubjects = [...new Set(assessments.map((a) => a.subject))]

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-brand-600" />
          Alle vurderinger
        </h1>
        <p className="text-gray-600">Samlet oversikt over alle publiserte vurderinger</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Velg barn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle barn</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Velg fag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle fag</SelectItem>
                {allSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments table */}
      <Card>
        <CardHeader>
          <CardTitle>Vurderinger ({filteredAssessments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Ingen publiserte vurderinger funnet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dato</TableHead>
                  <TableHead>Barn</TableHead>
                  <TableHead>Fag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Karakter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      {format(new Date(assessment.date), "d. MMM yyyy", { locale: nb })}
                    </TableCell>
                    <TableCell className="font-medium">{assessment.childName}</TableCell>
                    <TableCell>{assessment.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(assessment.type)}</Badge>
                    </TableCell>
                    <TableCell>{getFormLabel(assessment.form)}</TableCell>
                    <TableCell>
                      {assessment.grade !== null ? (
                        <Badge>{assessment.grade}</Badge>
                      ) : (
                        <Badge variant="outline">IV</Badge>
                      )}
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
