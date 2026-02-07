"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClassGroupData {
  id: string
  name: string
  subject: string
  grade: number
  teacherName: string
  studentCount: number
  assessmentCount: number
  criticalCount: number
  warningCount: number
  okCount: number
}

export default function FaggrupperPage() {
  const router = useRouter()
  const [classGroups, setClassGroups] = useState<ClassGroupData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rektor/class-groups")
      .then((r) => r.ok ? r.json() : [])
      .then(setClassGroups)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Faggrupper</h1>
        <Link href="/rektor/faggrupper/ny">
          <Button className="bg-rektor hover:bg-rektor/90 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Ny faggruppe
          </Button>
        </Link>
      </div>

      <div className="bg-scan-surface rounded-xl border border-scan-border overflow-hidden">
        <div className="grid grid-cols-[minmax(180px,1fr)_100px_120px_70px] gap-3 px-4 py-2.5 border-b border-scan-border">
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Faggruppe</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Klasse</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider">Lærer</span>
          <span className="text-[11px] font-semibold text-scan-text3 uppercase tracking-wider text-center">Elever</span>
        </div>
        {classGroups.map((cg, i) => (
          <div
            key={cg.id}
            onClick={() => router.push(`/rektor/faggrupper/${cg.id}`)}
            className={`grid grid-cols-[minmax(180px,1fr)_100px_120px_70px] gap-3 px-4 py-2.5 items-center cursor-pointer hover:bg-scan-bg transition-colors ${
              i < classGroups.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <span className="text-sm font-medium text-scan-text">{cg.name}</span>
            <span className="text-[13px] text-scan-text2">{cg.grade}. trinn</span>
            <span className="text-[13px] text-scan-text2 truncate">{cg.teacherName}</span>
            <span className="text-[13px] font-mono text-scan-text2 text-center">{cg.studentCount}</span>
          </div>
        ))}
        {classGroups.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-scan-text3">Ingen faggrupper funnet</div>
        )}
      </div>
    </div>
  )
}
