"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Users, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface ClassGroupData {
  id: string
  name: string
  subject: string
  grade: number
  teacherName: string
  studentCount: number
  assessmentCount: number
  criticalCount: number
  warningCount: number
  okCount: number
}

export default function FaggrupperPage() {
  const [classGroups, setClassGroups] = useState<ClassGroupData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClassGroups()
  }, [])

  const fetchClassGroups = async () => {
    try {
      const response = await fetch("/api/rektor/class-groups")
      if (response.ok) {
        const data = await response.json()
        setClassGroups(data)
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
        <h1 className="text-2xl font-bold">Faggrupper</h1>
        <p className="text-gray-600">Oversikt over alle faggrupper på skolen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle faggrupper ({classGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {classGroups.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Ingen faggrupper funnet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faggruppe</TableHead>
                  <TableHead>Lærer</TableHead>
                  <TableHead>Elever</TableHead>
                  <TableHead>Vurderinger</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classGroups.map((cg) => (
                  <TableRow key={cg.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{cg.name}</div>
                          <div className="text-sm text-gray-500">
                            {cg.subject} | {cg.grade}. trinn
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{cg.teacherName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        {cg.studentCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {cg.assessmentCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {cg.okCount > 0 && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {cg.okCount}
                          </Badge>
                        )}
                        {cg.warningCount > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {cg.warningCount}
                          </Badge>
                        )}
                        {cg.criticalCount > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {cg.criticalCount}
                          </Badge>
                        )}
                      </div>
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
