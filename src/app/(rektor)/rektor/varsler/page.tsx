"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusDot } from "@/components/dashboard/scannable"

interface Alert {
  type: string
  priority: "CRITICAL" | "WARNING" | "INFO"
  title: string
  description: string
  teacherName?: string
  classGroupName?: string
  studentCount?: number
}

function mapPriority(p: string): "ok" | "warn" | "crit" {
  if (p === "CRITICAL") return "crit"
  if (p === "WARNING") return "warn"
  return "ok"
}

function alertBg(p: string) {
  if (p === "CRITICAL") return "bg-red-50 border-red-200"
  if (p === "WARNING") return "bg-amber-50 border-amber-200"
  return "bg-rektor-light border-rektor-border"
}

export default function VarslerPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAlerts = () => {
    fetch("/api/rektor/alerts")
      .then((r) => r.ok ? r.json() : [])
      .then(setAlerts)
      .catch(console.error)
      .finally(() => { setIsLoading(false); setIsRefreshing(false) })
  }

  useEffect(() => { fetchAlerts() }, [])

  const handleRefresh = () => { setIsRefreshing(true); fetchAlerts() }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rektor" />
      </div>
    )
  }

  const criticalAlerts = alerts.filter((a) => a.priority === "CRITICAL")
  const warningAlerts = alerts.filter((a) => a.priority === "WARNING")
  const infoAlerts = alerts.filter((a) => a.priority === "INFO")

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-scan-text tracking-tight">Varsler</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="border-scan-border text-scan-text2">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Oppdater
        </Button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2">
        {[
          { label: "Kritiske", count: criticalAlerts.length, status: "crit" as const },
          { label: "Advarsler", count: warningAlerts.length, status: "warn" as const },
          { label: "Info", count: infoAlerts.length, status: "ok" as const },
        ].map((g) => (
          <div key={g.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-scan-border bg-scan-surface text-sm">
            <StatusDot status={g.status} />
            <span className="font-medium text-scan-text2">{g.label}</span>
            <span className="font-mono text-xs text-scan-text3">{g.count}</span>
          </div>
        ))}
      </div>

      {/* Alerts grouped */}
      {criticalAlerts.length > 0 && (
        <AlertGroup label="Kritiske" alerts={criticalAlerts} />
      )}
      {warningAlerts.length > 0 && (
        <AlertGroup label="Advarsler" alerts={warningAlerts} />
      )}
      {infoAlerts.length > 0 && (
        <AlertGroup label="Informasjon" alerts={infoAlerts} />
      )}

      {alerts.length === 0 && (
        <div className="bg-scan-surface border border-scan-border rounded-xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-status-ok mx-auto mb-3" />
          <h3 className="text-base font-medium text-scan-text">Alt i orden!</h3>
          <p className="text-sm text-scan-text3 mt-1">Ingen varsler som krever handling akkurat nå.</p>
        </div>
      )}
    </div>
  )
}

function AlertGroup({ label, alerts }: { label: string; alerts: Alert[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-medium text-scan-text3 uppercase tracking-wider">{label} ({alerts.length})</h2>
      <div className="flex flex-col gap-2">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-4 rounded-xl border ${alertBg(a.priority)}`}
          >
            <StatusDot status={mapPriority(a.priority)} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-scan-text">{a.title}</div>
              <div className="text-sm text-scan-text2 mt-0.5">{a.description}</div>
              <div className="flex gap-3 mt-1.5 text-xs text-scan-text3">
                {a.teacherName && <span>{a.teacherName}</span>}
                {a.classGroupName && <span>{a.classGroupName}</span>}
                {a.studentCount && <span>{a.studentCount} elever</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
