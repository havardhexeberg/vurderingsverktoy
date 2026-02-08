"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, Loader2, BookOpen, Users, ClipboardCheck, Calendar } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ClassGroup { id: string; name: string; subject: string; grade: number; students: { student: { id: string; name: string } }[] }
interface CompetenceGoal { id: string; code: string; description: string; area: string }
interface StudentSelection { id: string; name: string; selected: boolean; grade?: number }

const ASSESSMENT_FORMS = [
  { value: "WRITTEN", label: "Skriftlig", icon: "📝" },
  { value: "ORAL", label: "Muntlig", icon: "🎤" },
  { value: "PRACTICAL", label: "Praktisk", icon: "🔧" },
]

const GRADES = [
  { value: 1, label: "1", color: "bg-red-500" },
  { value: 2, label: "2", color: "bg-orange-500" },
  { value: 3, label: "3", color: "bg-yellow-500" },
  { value: 4, label: "4", color: "bg-lime-500" },
  { value: 5, label: "5", color: "bg-green-500" },
  { value: 6, label: "6", color: "bg-emerald-600" },
]

export default function RegistrerVurderingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [competenceGoals, setCompetenceGoals] = useState<CompetenceGoal[]>([])
  const [students, setStudents] = useState<StudentSelection[]>([])
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("")
  const [form, setForm] = useState("WRITTEN")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [studentGrades, setStudentGrades] = useState<Record<string, number | null>>({})
  const [studentFeedback, setStudentFeedback] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchClassGroups() {
      try {
        const response = await fetch("/api/class-groups")
        if (response.ok) setClassGroups(await response.json())
      } catch (error) { console.error("Failed to fetch class groups:", error) }
      finally { setIsLoading(false) }
    }
    fetchClassGroups()
  }, [])

  useEffect(() => {
    if (!selectedClassGroup) return
    const group = classGroups.find((g) => g.id === selectedClassGroup)
    if (!group) return
    async function fetchGoals() {
      try {
        const response = await fetch(`/api/competence-goals?subject=${encodeURIComponent(group!.subject)}&grade=${group!.grade}`)
        if (response.ok) {
          const data = await response.json()
          setCompetenceGoals(data.goals || data || [])
        }
      } catch (error) { console.error("Failed to fetch competence goals:", error) }
    }
    fetchGoals()
    const studentList = group.students.map((s) => ({ id: s.student.id, name: s.student.name, selected: true }))
    setStudents(studentList)
    const grades: Record<string, number | null> = {}
    studentList.forEach((s) => { grades[s.id] = null })
    setStudentGrades(grades)
  }, [selectedClassGroup, classGroups])

  const currentClassGroup = classGroups.find((g) => g.id === selectedClassGroup)
  const canProceedStep1 = !!selectedClassGroup
  const canProceedStep2 = !!form && !!date
  const canSubmit = Object.values(studentGrades).some((g) => g !== null)

  const handleNextStep = () => { if (step < 3) setStep(step + 1) }
  const handlePrevStep = () => { if (step > 1) setStep(step - 1) }

  const handleSubmit = async () => {
    if (!currentClassGroup) return
    setIsSubmitting(true)
    try {
      const assessments = Object.entries(studentGrades)
        .filter(([_, grade]) => grade !== null)
        .map(([studentId, grade]) => ({
          studentId, classGroupId: selectedClassGroup,
          type: "ONGOING", // Always Underveisvurdering
          form, grade, date: new Date(date).toISOString(),
          description: description || null,
          feedback: studentFeedback[studentId] || null, // Optional
          competenceGoalIds: selectedGoals, isPublished: true,
        }))

      const response = await fetch("/api/assessments/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessments }),
      })

      if (!response.ok) {
        for (const assessment of assessments) {
          await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(assessment) })
        }
      }

      toast.success(`${assessments.length} vurderinger registrert!`)
      router.push(`/faggrupper/${selectedClassGroup}`)
    } catch (error) { toast.error("Kunne ikke lagre vurderinger") }
    finally { setIsSubmitting(false) }
  }

  const toggleGoal = (goalId: string) => { setSelectedGoals((prev) => prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]) }
  const setAllGrades = (grade: number) => { const newGrades: Record<string, number> = {}; students.filter((s) => s.selected).forEach((s) => { newGrades[s.id] = grade }); setStudentGrades(newGrades) }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/faggrupper"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div><h1 className="text-3xl font-bold text-gray-900">Registrer vurdering</h1><p className="text-gray-600">Steg {step} av 3</p></div>
      </div>

      {/* Progress */}
      <div className="relative flex items-start justify-between">
        <div className="absolute top-5 left-0 right-0 flex px-[20px]">
          <div className={`flex-1 h-1 rounded ${step > 1 ? "bg-brand-600" : "bg-gray-200"}`} />
          <div className={`flex-1 h-1 rounded ${step > 2 ? "bg-brand-600" : "bg-gray-200"}`} />
        </div>
        {[
          { num: 1, label: "Velg faggruppe" },
          { num: 2, label: "Vurderingsdetaljer" },
          { num: 3, label: "Karakterer" },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${s.num === step ? "bg-brand-600 text-white" : s.num < step ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-400"}`}>
              {s.num < step ? <Check className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-sm mt-2 ${step >= s.num ? "text-brand-700 font-medium" : "text-gray-400"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-brand-600" /> Velg faggruppe</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {classGroups.length === 0 ? <p className="text-gray-500 text-center py-8">Du har ingen faggrupper. Kontakt ledelsen.</p> : (
              <div className="grid gap-3 md:grid-cols-2">
                {classGroups.map((group) => (
                  <button key={group.id} onClick={() => setSelectedClassGroup(group.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${selectedClassGroup === group.id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"}`}>
                    <div className="font-medium text-gray-900">{group.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{group.subject} · {group.grade}. trinn</div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500"><Users className="w-4 h-4" /><span>{group.students.length} elever</span></div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Only Underveisvurdering */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-brand-600" /> Vurderingsdetaljer</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Type vurdering</Label>
                <div className="p-3 rounded-lg border-2 border-brand-500 bg-brand-50 text-left">
                  <div className="font-medium text-gray-900">Underveisvurdering</div>
                  <div className="text-xs text-gray-500 mt-1">Løpende vurdering i undervisningen</div>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Vurderingsform</Label>
                <div className="flex flex-wrap gap-2">
                  {ASSESSMENT_FORMS.map((f) => (
                    <button key={f.value} onClick={() => setForm(f.value)}
                      className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${form === f.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 hover:border-brand-300"}`}>
                      <span>{f.icon}</span><span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Dato</Label>
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-400" /><Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse <span className="text-gray-400 font-normal">(valgfritt)</span></Label>
                <Input id="description" placeholder="f.eks. Prøve i algebra" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Kompetansemål (valgfritt)</CardTitle></CardHeader>
            <CardContent>
              {competenceGoals.length === 0 ? <p className="text-gray-500 text-sm">Ingen kompetansemål funnet for dette faget og trinnet.</p> : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {competenceGoals.map((goal) => (
                    <div key={goal.id} onClick={() => toggleGoal(goal.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedGoals.includes(goal.id) ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedGoals.includes(goal.id)} className="mt-0.5" />
                        <div><Badge variant="secondary" className="mb-1">{goal.code}</Badge><p className="text-sm text-gray-700 line-clamp-2">{goal.description}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-brand-600" /> Sett karakterer</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sett alle til:</span>
                {GRADES.map((g) => (
                  <button key={g.value} onClick={() => setAllGrades(g.value)} className={`w-8 h-8 rounded text-white font-bold text-sm ${g.color} hover:opacity-80 transition-opacity`}>{g.label}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="p-3 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
                      {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1"><div className="font-medium text-gray-900">{student.name}</div></div>
                    <div className="flex items-center gap-1">
                      {GRADES.map((g) => (
                        <button key={g.value} onClick={() => setStudentGrades((prev) => ({ ...prev, [student.id]: prev[student.id] === g.value ? null : g.value }))}
                          className={`w-9 h-9 rounded font-bold transition-all ${studentGrades[student.id] === g.value ? `${g.color} text-white scale-110` : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>{g.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pl-14">
                    <Input
                      placeholder="Tilbakemelding (valgfritt)"
                      value={studentFeedback[student.id] || ""}
                      onChange={(e) => setStudentFeedback((prev) => ({ ...prev, [student.id]: e.target.value }))}
                      className="text-sm h-9"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <strong>{Object.values(studentGrades).filter((g) => g !== null).length}</strong> av {students.length} elever har fått karakter
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevStep} disabled={step === 1}><ArrowLeft className="w-4 h-4 mr-2" /> Forrige</Button>
        {step < 3 ? (
          <Button onClick={handleNextStep} disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)} className="bg-brand-600 hover:bg-brand-700">Neste <ArrowRight className="w-4 h-4 ml-2" /></Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="bg-brand-600 hover:bg-brand-700">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Lagrer...</> : <><Check className="w-4 h-4 mr-2" /> Lagre vurderinger</>}
          </Button>
        )}
      </div>
    </div>
  )
}
