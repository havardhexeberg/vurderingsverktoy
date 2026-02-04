"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, Plus, ChevronRight } from "lucide-react"
import Link from "next/link"

export interface StudentStatus {
  status: "OK" | "WARNING" | "CRITICAL"
  warnings: { type: string; message: string }[]
  assessmentCount: number
  lastAssessmentDate?: string
  competenceCoverage: number
}

interface StudentCardProps {
  student: {
    id: string
    name: string
  }
  classGroupId: string
  status: StudentStatus
  onAddAssessment?: () => void
}

export function StudentCard({
  student,
  classGroupId,
  status,
  onAddAssessment,
}: StudentCardProps) {
  const getStatusColor = () => {
    switch (status.status) {
      case "OK":
        return "border-l-green-500 bg-green-50/50"
      case "WARNING":
        return "border-l-amber-500 bg-amber-50/50"
      case "CRITICAL":
        return "border-l-red-500 bg-red-50/50"
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "OK":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "WARNING":
        return <Clock className="h-5 w-5 text-amber-600" />
      case "CRITICAL":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusLabel = () => {
    switch (status.status) {
      case "OK":
        return "Klar"
      case "WARNING":
        return "Nesten klar"
      case "CRITICAL":
        return "Trenger arbeid"
    }
  }

  return (
    <Card className={`border-l-4 ${getStatusColor()} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    status.status === "OK"
                      ? "default"
                      : status.status === "WARNING"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {getStatusLabel()}
                </Badge>
                <span className="text-sm text-gray-500">
                  {status.assessmentCount} vurderinger
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onAddAssessment}>
              <Plus className="h-4 w-4" />
            </Button>
            <Link href={`/faggrupper/${classGroupId}/elev/${student.id}`}>
              <Button size="sm" variant="ghost">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {status.warnings.length > 0 && (
          <div className="mt-3 space-y-1">
            {status.warnings.slice(0, 2).map((warning, i) => (
              <p key={i} className="text-sm text-gray-600 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                {warning.message}
              </p>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>Dekning: {status.competenceCoverage}%</span>
          {status.lastAssessmentDate && (
            <span>
              Sist: {new Date(status.lastAssessmentDate).toLocaleDateString("nb-NO")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
