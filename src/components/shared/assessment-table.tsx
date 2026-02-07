"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquare, ChevronDown, ChevronRight, Calendar } from "lucide-react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface AssessmentRow {
  id: string
  date: string
  description: string | null
  form: string
  grade: number | null
  feedback: string | null
  competenceGoals?: Array<{
    competenceGoal: {
      code: string
      description: string
    }
  }>
}

interface AssessmentTableProps {
  assessments: AssessmentRow[]
  showCompetenceGoals?: boolean
}

const FORM_LABELS: Record<string, string> = {
  WRITTEN: "Skriftlig",
  ORAL: "Muntlig",
  ORAL_PRACTICAL: "Muntlig-praktisk",
  PRACTICAL: "Praktisk",
}

function getGradeBadgeColor(grade: number) {
  if (grade >= 5) return "bg-green-100 text-green-800"
  if (grade >= 3) return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

export function AssessmentTable({ assessments, showCompetenceGoals = true }: AssessmentTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (assessments.length === 0) {
    return (
      <p className="text-center py-8 text-gray-500">
        Ingen publiserte vurderinger ennå
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Dato</TableHead>
          <TableHead>Vurdering</TableHead>
          <TableHead>Form</TableHead>
          <TableHead>Karakter</TableHead>
          {showCompetenceGoals && <TableHead>Kompetansemål</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assessments.map((assessment) => {
          const isExpanded = expandedRows.has(assessment.id)
          const hasFeedback = !!assessment.feedback

          return (
            <>
              <TableRow
                key={assessment.id}
                className={hasFeedback ? "cursor-pointer hover:bg-gray-50" : ""}
                onClick={() => hasFeedback && toggleRow(assessment.id)}
              >
                <TableCell className="w-8 pr-0">
                  {hasFeedback && (
                    isExpanded
                      ? <ChevronDown className="h-4 w-4 text-gray-400" />
                      : <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {format(new Date(assessment.date), "d. MMM yyyy", { locale: nb })}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{assessment.description || "-"}</span>
                </TableCell>
                <TableCell>{FORM_LABELS[assessment.form] || assessment.form}</TableCell>
                <TableCell>
                  {assessment.grade !== null ? (
                    <Badge className={getGradeBadgeColor(assessment.grade)}>
                      {assessment.grade}
                    </Badge>
                  ) : (
                    <Badge variant="outline">IV</Badge>
                  )}
                </TableCell>
                {showCompetenceGoals && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {assessment.competenceGoals && assessment.competenceGoals.length > 0 ? (
                        <>
                          {assessment.competenceGoals.slice(0, 3).map((cg, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {cg.competenceGoal.code}
                            </Badge>
                          ))}
                          {assessment.competenceGoals.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{assessment.competenceGoals.length - 3}
                            </Badge>
                          )}
                        </>
                      ) : (
                        "-"
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
              {isExpanded && assessment.feedback && (
                <TableRow key={`${assessment.id}-feedback`}>
                  <TableCell colSpan={showCompetenceGoals ? 6 : 5} className="bg-blue-50 border-t-0">
                    <div className="flex items-start gap-2 p-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900">{assessment.feedback}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )
        })}
      </TableBody>
    </Table>
  )
}
