import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Plus, Eye } from "lucide-react"

interface StudentCardProps {
  student: {
    id: string
    name: string
    status: "OK" | "WARNING" | "CRITICAL"
    assessmentCount: number
    assessmentBreakdown: {
      written: number
      oral: number
      practical: number
    }
    competenceCoverage: {
      covered: number
      total: number
    }
    warnings: string[]
  }
  onViewDetails: () => void
  onAddAssessment: () => void
  onViewChecklist: () => void
}

export function StudentCard({
  student,
  onViewDetails,
  onAddAssessment,
  onViewChecklist,
}: StudentCardProps) {
  // Determine border and badge based on status
  const getBorderColor = () => {
    switch (student.status) {
      case "OK":
        return "border-l-green-500"
      case "WARNING":
        return "border-l-yellow-500"
      case "CRITICAL":
        return "border-l-red-500"
      default:
        return "border-l-gray-300"
    }
  }

  const getStatusBadge = () => {
    switch (student.status) {
      case "OK":
        return <Badge variant="success">Klar</Badge>
      case "WARNING":
        return <Badge variant="warning">Nesten klar</Badge>
      case "CRITICAL":
        return <Badge variant="destructive">Risiko</Badge>
      default:
        return <Badge variant="secondary">Ukjent</Badge>
    }
  }

  return (
    <Card className={`border-l-4 ${getBorderColor()} hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{student.name}</h3>
            <div className="mt-2">{getStatusBadge()}</div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                Vis detaljer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewChecklist}>
                Sjekkliste
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Assessment count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Vurderinger:</span>
          <span className="font-medium">{student.assessmentCount}</span>
        </div>

        {/* Assessment breakdown */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fordeling:</span>
          <span className="text-xs">
            S: {student.assessmentBreakdown.written} | 
            M: {student.assessmentBreakdown.oral} | 
            P: {student.assessmentBreakdown.practical}
          </span>
        </div>

        {/* Competence coverage */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Kompetansemål:</span>
          <span className="font-medium">
            {student.competenceCoverage.covered}/{student.competenceCoverage.total}
          </span>
        </div>

        {/* Warnings */}
        {student.warnings.length > 0 && (
          <div className="mt-3 space-y-1">
            {student.warnings.map((warning, idx) => (
              <p key={idx} className="text-xs text-red-600">
                ⚠️ {warning}
              </p>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <Eye className="h-4 w-4 mr-2" />
          Detaljer
        </Button>
        <Button size="sm" onClick={onAddAssessment}>
          <Plus className="h-4 w-4 mr-2" />
          Legg til vurdering
        </Button>
      </CardFooter>
    </Card>
  )
}
