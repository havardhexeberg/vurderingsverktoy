"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  CheckCircle,
} from "lucide-react"

interface Alert {
  type: string
  priority: "CRITICAL" | "WARNING" | "INFO"
  title: string
  description: string
  teacherName?: string
  classGroupName?: string
  studentCount?: number
}

export default function VarslerPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/rektor/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  const criticalAlerts = alerts.filter((a) => a.priority === "CRITICAL")
  const warningAlerts = alerts.filter((a) => a.priority === "WARNING")
  const infoAlerts = alerts.filter((a) => a.priority === "INFO")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Varsler</h1>
          <p className="text-gray-600">Oversikt over situasjoner som krever oppfølging</p>
        </div>
        <Button variant="outline" onClick={() => { setIsLoading(true); fetchAlerts(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Oppdater
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Kritiske
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Advarsler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{warningAlerts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{infoAlerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Kritiske varsler ({criticalAlerts.length})
            </CardTitle>
            <CardDescription className="text-red-700">
              Disse krever umiddelbar oppfølging
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {criticalAlerts.map((alert, i) => (
              <AlertCard key={i} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warning alerts */}
      {warningAlerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50 rounded-t-lg">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Advarsler ({warningAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {warningAlerts.map((alert, i) => (
              <AlertCard key={i} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info alerts */}
      {infoAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Informasjon ({infoAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {infoAlerts.map((alert, i) => (
              <AlertCard key={i} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* No alerts */}
      {alerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Ingen varsler</h3>
            <p className="text-gray-500">Alt ser bra ut på skolen!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        alert.priority === "CRITICAL"
          ? "bg-red-50 border-red-200"
          : alert.priority === "WARNING"
          ? "bg-amber-50 border-amber-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            {alert.teacherName && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {alert.teacherName}
              </span>
            )}
            {alert.classGroupName && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {alert.classGroupName}
              </span>
            )}
            {alert.studentCount && (
              <span>{alert.studentCount} elever berørt</span>
            )}
          </div>
        </div>
        <Badge
          variant={
            alert.priority === "CRITICAL"
              ? "destructive"
              : alert.priority === "WARNING"
              ? "secondary"
              : "default"
          }
        >
          {alert.priority === "CRITICAL"
            ? "Kritisk"
            : alert.priority === "WARNING"
            ? "Advarsel"
            : "Info"}
        </Badge>
      </div>
    </div>
  )
}
