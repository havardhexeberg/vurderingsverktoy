"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, AlertTriangle, Clock, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  grade: number
}

interface Exemption {
  id: string
  type: string
  subject: string
  subjectArea?: string
  reason: string
  validFrom: string
  validTo: string
  requiresRenewal: boolean
  student: Student
}

const TYPE_LABELS: Record<string, string> = {
  FULL_SUBJECT: "Helt fritak",
  PARTIAL: "Delvis fritak",
  NO_GRADE: "Ikke vurdering med karakter",
}

const SUBJECTS = [
  "Norsk",
  "Norsk sidemål",
  "Matematikk",
  "Engelsk",
  "Naturfag",
  "Samfunnsfag",
  "KRLE",
  "Kroppsøving",
  "Kunst og håndverk",
  "Musikk",
  "Mat og helse",
  "Fremmedspråk",
]

export default function FritakPage() {
  const [exemptions, setExemptions] = useState<Exemption[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [includeExpired, setIncludeExpired] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    type: "PARTIAL",
    subject: "",
    subjectArea: "",
    reason: "",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    requiresRenewal: true,
  })

  useEffect(() => {
    fetchData()
  }, [includeExpired])

  const fetchData = async () => {
    try {
      const [exemptionsRes, studentsRes] = await Promise.all([
        fetch(`/api/exemptions?includeExpired=${includeExpired}`),
        fetch("/api/students"),
      ])

      if (exemptionsRes.ok) {
        setExemptions(await exemptionsRes.json())
      }
      if (studentsRes.ok) {
        setStudents(await studentsRes.json())
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/exemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke opprette fritak")
      }

      toast.success("Fritak opprettet")
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Feil ved opprettelse")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/exemptions/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Kunne ikke slette fritak")
      }

      toast.success("Fritak slettet")
      setDeleteId(null)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Feil ved sletting")
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      type: "PARTIAL",
      subject: "",
      subjectArea: "",
      reason: "",
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      requiresRenewal: true,
    })
  }

  const isExpiringSoon = (validTo: string) => {
    const daysUntilExpiry = Math.floor(
      (new Date(validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const expiringSoon = exemptions.filter((e) => isExpiringSoon(e.validTo))
  const activeCount = exemptions.filter((e) => !isExpired(e.validTo)).length

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fritak</h1>
          <p className="text-gray-600">Administrer fritak fra vurdering</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nytt fritak
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Opprett nytt fritak</DialogTitle>
              <DialogDescription>
                Registrer fritak fra vurdering for en elev
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Elev</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(v) => setFormData({ ...formData, studentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg elev" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.grade}. trinn)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type fritak</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_SUBJECT">Helt fritak</SelectItem>
                    <SelectItem value="PARTIAL">Delvis fritak</SelectItem>
                    <SelectItem value="NO_GRADE">Ikke vurdering med karakter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fag</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(v) => setFormData({ ...formData, subject: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg fag" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "PARTIAL" && (
                <div className="space-y-2">
                  <Label>Fagområde (valgfritt)</Label>
                  <Input
                    placeholder="f.eks. sidemål"
                    value={formData.subjectArea}
                    onChange={(e) => setFormData({ ...formData, subjectArea: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Begrunnelse</Label>
                <Input
                  placeholder="Kort begrunnelse"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gyldig fra</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gyldig til</Label>
                  <Input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Avbryt
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.studentId || !formData.subject || !formData.reason}
              >
                Opprett
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning cards */}
      {expiringSoon.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Fritak som utløper snart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span>
                    {e.student.name} - {e.subject}
                    {e.subjectArea && ` (${e.subjectArea})`}
                  </span>
                  <Badge variant="secondary">
                    Utløper {new Date(e.validTo).toLocaleDateString("nb-NO")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Aktive fritak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Utløper snart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{expiringSoon.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Totalt registrert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exemptions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Exemptions list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alle fritak</CardTitle>
              <CardDescription>Oversikt over registrerte fritak</CardDescription>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeExpired}
                onChange={(e) => setIncludeExpired(e.target.checked)}
                className="rounded"
              />
              Vis utløpte
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {exemptions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Ingen fritak registrert</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Elev</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fag</TableHead>
                  <TableHead>Begrunnelse</TableHead>
                  <TableHead>Gyldig til</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exemptions.map((exemption) => (
                  <TableRow key={exemption.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exemption.student.name}</div>
                        <div className="text-sm text-gray-500">
                          {exemption.student.grade}. trinn
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{TYPE_LABELS[exemption.type]}</TableCell>
                    <TableCell>
                      {exemption.subject}
                      {exemption.subjectArea && (
                        <span className="text-gray-500"> ({exemption.subjectArea})</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {exemption.reason}
                    </TableCell>
                    <TableCell>
                      {new Date(exemption.validTo).toLocaleDateString("nb-NO")}
                    </TableCell>
                    <TableCell>
                      {isExpired(exemption.validTo) ? (
                        <Badge variant="destructive">Utløpt</Badge>
                      ) : isExpiringSoon(exemption.validTo) ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Utløper snart
                        </Badge>
                      ) : (
                        <Badge variant="default">Aktiv</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(exemption.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett fritak?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette dette fritaket? Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
