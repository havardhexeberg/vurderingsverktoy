"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileBarChart, Download, School, Users, BookOpen, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function RektorRapporterPage() {
  const [reportType, setReportType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null)

  const generateReport = async () => {
    if (!reportType) {
      toast.error("Velg en rapporttype")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/rektor/reports?type=${reportType}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        toast.success("Rapport generert")
      } else {
        throw new Error("Kunne ikke generere rapport")
      }
    } catch (error) {
      toast.error("Feil ved generering av rapport")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapporter</h1>
        <p className="text-gray-600">Generer rapporter for hele skolen</p>
      </div>

      {/* Report selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Velg rapport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Velg rapporttype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school-overview">Skoleoversikt</SelectItem>
                <SelectItem value="teacher-performance">Lærerstatistikk</SelectItem>
                <SelectItem value="grade-distribution">Karakterfordeling</SelectItem>
                <SelectItem value="assessment-coverage">Vurderingsdekning</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport} disabled={isGenerating || !reportType}>
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileBarChart className="h-4 w-4 mr-2" />
              )}
              Generer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report types info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <School className="h-5 w-5 text-purple-600" />
              Skoleoversikt
            </CardTitle>
            <CardDescription>
              Komplett oversikt over alle faggrupper, lærere og elever
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Lærerstatistikk
            </CardTitle>
            <CardDescription>
              Sammenligning av vurderingsaktivitet mellom lærere
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-green-600" />
              Karakterfordeling
            </CardTitle>
            <CardDescription>
              Statistikk over karakterer på tvers av fag og trinn
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              Vurderingsdekning
            </CardTitle>
            <CardDescription>
              Oversikt over elever med manglende vurderinger
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Report display would go here */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Generert rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
