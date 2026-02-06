"use client"

export const dynamic = 'force-dynamic'

import { useState, useCallback } from "react"
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
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"

interface ParsedStudent {
  name: string
  birthNumber: string
  grade: number
  valid: boolean
  error?: string
}

export default function RektorImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [students, setStudents] = useState<ParsedStudent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const parseCSV = (text: string): ParsedStudent[] => {
    const lines = text.trim().split("\n")
    const parsed: ParsedStudent[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(",").map((p) => p.trim())
      const [name, birthNumber, gradeStr] = parts

      const grade = parseInt(gradeStr, 10)
      const errors: string[] = []

      if (!name || name.length < 2) {
        errors.push("Ugyldig navn")
      }

      if (!birthNumber || birthNumber.length !== 11 || !/^\d+$/.test(birthNumber)) {
        errors.push("Fodselsnummer ma vaere 11 siffer")
      }

      if (isNaN(grade) || grade < 8 || grade > 10) {
        errors.push("Trinn ma vaere 8, 9 eller 10")
      }

      parsed.push({
        name: name || "",
        birthNumber: birthNumber || "",
        grade: isNaN(grade) ? 0 : grade,
        valid: errors.length === 0,
        error: errors.length > 0 ? errors.join(", ") : undefined,
      })
    }

    return parsed
  }

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Kun CSV-filer er stottet")
      return
    }

    setFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setStudents(parsed)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [handleFile]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const handleImport = async () => {
    const validStudents = students.filter((s) => s.valid)
    if (validStudents.length === 0) {
      toast.error("Ingen gyldige elever a importere")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: validStudents }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Import feilet")
      }

      toast.success(`${data.imported} elever importert`)
      setFile(null)
      setStudents([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import feilet")
    } finally {
      setIsLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setStudents([])
  }

  const validCount = students.filter((s) => s.valid).length
  const invalidCount = students.filter((s) => !s.valid).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importer elever</h1>
        <p className="text-gray-600 mt-1">
          Last opp en CSV-fil med elevdata for a importere til systemet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last opp fil</CardTitle>
          <CardDescription>
            CSV-format: Navn, Fodselsnummer, Trinn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                Dra og slipp en CSV-fil her, eller
              </p>
              <label className="mt-2 inline-block">
                <span className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                  velg fil
                </span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {students.length} rader funnet
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  {validCount} gyldige
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {invalidCount} ugyldige
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Forhandsvisning</CardTitle>
            <CardDescription>
              Gjennomga dataene for du importerer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Navn</TableHead>
                    <TableHead>Fodselsnummer</TableHead>
                    <TableHead>Trinn</TableHead>
                    <TableHead>Feil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {student.valid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.birthNumber.slice(0, 6)}...
                      </TableCell>
                      <TableCell>{student.grade || "-"}</TableCell>
                      <TableCell className="text-red-600 text-sm">
                        {student.error}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={clearFile}>
                Avbryt
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading || validCount === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Importerer..." : `Importer ${validCount} elever`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CSV-format</CardTitle>
          <CardDescription>
            Filen ma folge dette formatet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <p className="text-gray-600">Navn,Fodselsnummer,Trinn</p>
            <p>Emma Hansen,12345678901,10</p>
            <p>Oliver Andersen,12345678902,10</p>
            <p>Nora Johansen,12345678903,9</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
