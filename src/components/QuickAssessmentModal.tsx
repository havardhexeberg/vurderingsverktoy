"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Student {
  id: string
  name: string
}

interface CompetenceGoal {
  id: string
  code: string
  description: string
}

interface ClassGroup {
  id: string
  name: string
  subject: string
}

interface QuickAssessmentModalProps {
  open: boolean
  onClose: () => void
  student?: Student
  competenceGoal?: CompetenceGoal
  classGroup?: ClassGroup
  onSuccess?: () => void
}

const ASSESSMENT_TYPES = [
  { value: "ONGOING", label: "Underveisvurdering" },
  { value: "MIDTERM", label: "Halvårsvurdering" },
  { value: "FINAL", label: "Sluttvurdering" },
]

const ASSESSMENT_FORMS = [
  { value: "WRITTEN", label: "Skriftlig" },
  { value: "ORAL", label: "Muntlig" },
  { value: "ORAL_PRACTICAL", label: "Muntlig-praktisk" },
  { value: "PRACTICAL", label: "Praktisk" },
]

const GRADES = [
  { value: "1", label: "1", color: "bg-red-500" },
  { value: "2", label: "2", color: "bg-orange-500" },
  { value: "3", label: "3", color: "bg-yellow-500" },
  { value: "4", label: "4", color: "bg-lime-500" },
  { value: "5", label: "5", color: "bg-green-500" },
  { value: "6", label: "6", color: "bg-emerald-600" },
]

export function QuickAssessmentModal({
  open,
  onClose,
  student,
  competenceGoal,
  classGroup,
  onSuccess,
}: QuickAssessmentModalProps) {
  const [type, setType] = useState("ONGOING")
  const [form, setForm] = useState("WRITTEN")
  const [grade, setGrade] = useState<string>("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setType("ONGOING")
      setForm("WRITTEN")
      setGrade("")
      setFeedback("")
      setError(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!student || !classGroup || !grade) {
      setError("Velg en karakter")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          classGroupId: classGroup.id,
          type,
          form,
          grade: parseInt(grade),
          feedback: feedback || null,
          date: new Date().toISOString(),
          competenceGoalIds: competenceGoal ? [competenceGoal.id] : [],
          isPublished: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Kunne ikke lagre vurdering")
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "En feil oppstod")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Hurtigregistrering</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student and Goal Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {student && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{student.name}</div>
                  {classGroup && (
                    <div className="text-xs text-gray-500">{classGroup.name}</div>
                  )}
                </div>
              </div>
            )}
            {competenceGoal && (
              <div className="pt-2 border-t border-gray-200">
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded">
                  {competenceGoal.code}
                </span>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {competenceGoal.description}
                </p>
              </div>
            )}
          </div>

          {/* Grade Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Karakter
            </Label>
            <div className="flex gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGrade(g.value)}
                  className={`w-10 h-10 rounded-lg text-white font-bold transition-all ${
                    g.color
                  } ${
                    grade === g.value
                      ? "ring-2 ring-offset-2 ring-teal-500 scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type and Form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
                Form
              </Label>
              <Select value={form} onValueChange={setForm}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_FORMS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
              Tilbakemelding (valgfritt)
            </Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Skriv en kort tilbakemelding..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              onClick={handleSubmit}
              disabled={loading || !grade}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Lagrer...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Lagre vurdering
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
