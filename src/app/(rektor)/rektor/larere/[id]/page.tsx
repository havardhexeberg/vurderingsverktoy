"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"

interface TeacherDetail {
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

export default function RektorTeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTeacher()
  }, [id])

  const fetchTeacher = async () => {
    try {
      const response = await fetch("/api/rektor/teachers")
      if (response.ok) {
        const data = await response.json()
        const teachers = Array.isArray(data) ? data : data.teachers || []
        const found = teachers.find((t: TeacherDetail) => t.id === id)
        setTeacher(found || null)
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

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lærer ikke funnet</p>
        <Link href="/rektor/larere">
          <Button variant="link">Tilbake til lærerliste</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rektor/larere">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-600" />
            {teacher.name}
          </h1>
          <p className="text-gray-600">{teacher.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Faggrupper</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.classGroups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Elever</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Vurderinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.totalAssessments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Klar</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xl font-bold text-green-600">{teacher.okStudents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nesten klar</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-xl font-bold text-amber-600">{teacher.warningStudents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kritisk</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-xl font-bold text-red-600">{teacher.criticalStudents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class groups */}
      <Card>
        <CardHeader>
          <CardTitle>Faggrupper</CardTitle>
          <CardDescription>Alle faggrupper for {teacher.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teacher.classGroups.map((cg) => (
              <Link key={cg.id} href={`/rektor/faggrupper/${cg.id}`}>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-brand-600" />
                    <div>
                      <div className="font-medium">{cg.name}</div>
                      <div className="text-sm text-gray-500">{cg.subject}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{cg.studentCount} elever</Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
