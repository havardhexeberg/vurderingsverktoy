"use client"

export const dynamic = 'force-dynamic'

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Check, AlertCircle, X } from "lucide-react"
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
      if (!name || name.length < 2) errors.push("Ugyldig navn")
      if (!birthNumber || birthNumber.length !== 11 || !/^\d+$/.test(birthNumber)) errors.push("Fødselsnummer må være 11 siffer")
      if (isNaN(grade) || grade < 8 || grade > 10) errors.push("Trinn må være 8, 9 eller 10")
      parsed.push({ name: name || "", birthNumber: birthNumber || "", grade: isNaN(grade) ? 0 : grade, valid: errors.length === 0, error: errors.length > 0 ? errors.join(", ") : undefined })
    }
    return parsed
  }

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) { toast.error("Kun CSV-filer er støttet"); return }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => { setStudents(parseCSV(e.target?.result as string)) }
    reader.readAsText(f)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleImport = async () => {
    const validStudents = students.filter((s) => s.valid)
    if (validStudents.length === 0) { toast.error("Ingen gyldige elever å importere"); return }
    setIsLoading(true)
    try {
      const response = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: validStudents }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Import feilet")
      toast.success(`${data.imported} elever importert`)
      setFile(null); setStudents([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import feilet")
    } finally { setIsLoading(false) }
  }

  const clearFile = () => { setFile(null); setStudents([]) }
  const validCount = students.filter((s) => s.valid).length
  const invalidCount = students.filter((s) => !s.valid).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Importer elever</h1>
        <p className="text-sm text-scan-text2 mt-1">Last opp en CSV-fil med kolonner: Navn, Fødselsnummer, Trinn</p>
      </div>

      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`bg-scan-surface border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragOver ? "border-rektor bg-rektor-light" : "border-scan-border hover:border-rektor-border"
          }`}
        >
          <div className="text-3xl mb-3 opacity-40">↥</div>
          <div className="text-sm font-medium text-scan-text">Dra en CSV-fil hit</div>
          <label className="mt-1 block">
            <span className="text-sm text-rektor hover:underline cursor-pointer">eller klikk for å velge fil</span>
            <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
          </label>
        </div>
      ) : (
        <div className="bg-scan-surface border border-scan-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-7 w-7 text-rektor" />
              <div>
                <div className="text-sm font-medium text-scan-text">{file.name}</div>
                <div className="text-xs text-scan-text3">{students.length} rader funnet</div>
              </div>
            </div>
            <button onClick={clearFile} className="p-1 text-scan-text3 hover:text-scan-text"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-status-ok border border-green-200">
              <Check className="h-3 w-3 mr-1" />{validCount} gyldige
            </span>
            {invalidCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-50 text-status-crit border border-red-200">
                <AlertCircle className="h-3 w-3 mr-1" />{invalidCount} ugyldige
              </span>
            )}
          </div>
        </div>
      )}

      {/* Preview table */}
      {students.length > 0 && (
        <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
          <div className="px-4 py-3 border-b border-scan-border">
            <h2 className="text-[15px] font-semibold text-scan-text">Forhåndsvisning</h2>
          </div>
          <div className="grid grid-cols-[40px_1fr_120px_60px_1fr] gap-3 px-4 py-2 border-b border-scan-border">
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider"></span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Navn</span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Fødselsnr.</span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Trinn</span>
            <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Feil</span>
          </div>
          {students.map((s, i) => (
            <div key={i} className={`grid grid-cols-[40px_1fr_120px_60px_1fr] gap-3 px-4 py-2 items-center ${i < students.length - 1 ? "border-b border-gray-100" : ""}`}>
              <span>{s.valid ? <Check className="h-4 w-4 text-status-ok" /> : <AlertCircle className="h-4 w-4 text-status-crit" />}</span>
              <span className="text-sm font-medium text-scan-text">{s.name}</span>
              <span className="font-mono text-xs text-scan-text2">{s.birthNumber.slice(0, 6)}...</span>
              <span className="text-sm text-scan-text2">{s.grade || "–"}</span>
              <span className="text-xs text-status-crit">{s.error}</span>
            </div>
          ))}
          <div className="px-4 py-3 border-t border-scan-border flex justify-end gap-3">
            <Button variant="outline" onClick={clearFile} className="border-scan-border text-scan-text2">Avbryt</Button>
            <Button onClick={handleImport} disabled={isLoading || validCount === 0} className="bg-rektor hover:bg-rektor/90 text-white">
              {isLoading ? "Importerer..." : `Importer ${validCount} elever`}
            </Button>
          </div>
        </div>
      )}

      {/* Format example */}
      <div className="bg-scan-surface rounded-xl border border-scan-border p-4">
        <div className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider mb-2.5">Forventet format</div>
        <div className="font-mono text-[13px] text-scan-text2 leading-relaxed bg-gray-50 p-3 rounded-lg">
          Navn,Fødselsnummer,Trinn<br />
          Emma Hansen,12345678901,10<br />
          Lars Eriksen,23456789012,10<br />
          Sofia Andersen,34567890123,9
        </div>
      </div>
    </div>
  )
}
