"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock } from "lucide-react"

interface Student { id: string; name: string; grade: number }
interface Exemption { id: string; type: string; subject: string; subjectArea?: string; reason: string; validFrom: string; validTo: string; requiresRenewal: boolean; student: Student }

const TYPE_LABELS: Record<string, string> = { FULL_SUBJECT: "Helt fritak", PARTIAL: "Delvis fritak", NO_GRADE: "Ikke vurdering med karakter" }

export default function FritakPage() {
  const [exemptions, setExemptions] = useState<Exemption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [includeExpired, setIncludeExpired] = useState(false)

  useEffect(() => { fetchData() }, [includeExpired])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/exemptions?includeExpired=${includeExpired}`)
      if (res.ok) setExemptions(await res.json())
    } catch (error) { console.error("Error:", error) } finally { setIsLoading(false) }
  }

  const isExpiringSoon = (validTo: string) => { const d = Math.floor((new Date(validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)); return d <= 30 && d > 0 }
  const isExpired = (validTo: string) => new Date(validTo) < new Date()
  const expiringSoon = exemptions.filter((e) => isExpiringSoon(e.validTo))
  const activeCount = exemptions.filter((e) => !isExpired(e.validTo)).length

  if (isLoading) return <div className="flex justify-center p-8">Laster...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fritak</h1>
        <p className="text-gray-600">Oversikt over fritak fra vurdering. Kontakt ledelsen for å registrere nye fritak.</p>
      </div>

      {expiringSoon.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Fritak som utløper snart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span>{e.student.name} - {e.subject}{e.subjectArea && ` (${e.subjectArea})`}</span>
                  <Badge variant="secondary">Utløper {new Date(e.validTo).toLocaleDateString("nb-NO")}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="py-3 px-4"><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Aktive fritak</span><span className="text-xl font-bold">{activeCount}</span></div></CardContent></Card>
        <Card><CardContent className="py-3 px-4"><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Utløper snart</span><span className="text-xl font-bold text-amber-600">{expiringSoon.length}</span></div></CardContent></Card>
        <Card><CardContent className="py-3 px-4"><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Totalt registrert</span><span className="text-xl font-bold">{exemptions.length}</span></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Alle fritak</CardTitle><CardDescription>Oversikt over registrerte fritak</CardDescription></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeExpired} onChange={(e) => setIncludeExpired(e.target.checked)} className="rounded" />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {exemptions.map((exemption) => (
                  <TableRow key={exemption.id}>
                    <TableCell><div><div className="font-medium">{exemption.student.name}</div><div className="text-sm text-gray-500">{exemption.student.grade}. trinn</div></div></TableCell>
                    <TableCell>{TYPE_LABELS[exemption.type]}</TableCell>
                    <TableCell>{exemption.subject}{exemption.subjectArea && <span className="text-gray-500"> ({exemption.subjectArea})</span>}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{exemption.reason}</TableCell>
                    <TableCell>{new Date(exemption.validTo).toLocaleDateString("nb-NO")}</TableCell>
                    <TableCell>
                      {isExpired(exemption.validTo) ? <Badge variant="destructive">Utløpt</Badge>
                        : isExpiringSoon(exemption.validTo) ? <Badge variant="secondary" className="bg-amber-100 text-amber-800">Utløper snart</Badge>
                        : <Badge variant="default">Aktiv</Badge>}
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
