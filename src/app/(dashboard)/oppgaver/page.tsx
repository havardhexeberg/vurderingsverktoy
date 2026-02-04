"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Users,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

interface GeneratedTask {
  type: string
  priority: "CRITICAL" | "SOON" | "LATER"
  title: string
  description: string
  dueDate?: string
  studentId?: string
  classGroupId?: string
}

interface ManualTask {
  id: string
  type: string
  priority: string
  title: string
  description: string
  dueDate?: string
  isDone: boolean
  studentId?: string
  classGroupId?: string
}

interface TaskSummary {
  critical: number
  soon: number
  later: number
  manualPending: number
}

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: "Kritisk",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    badge: "destructive" as const,
  },
  SOON: {
    label: "Snart",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    badge: "secondary" as const,
  },
  LATER: {
    label: "Senere",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    badge: "default" as const,
  },
}

export default function OppgaverPage() {
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([])
  const [manualTasks, setManualTasks] = useState<ManualTask[]>([])
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setGeneratedTasks(data.generated || [])
        setManualTasks(data.manual || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchTasks()
  }

  const toggleTaskDone = async (taskId: string, isDone: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone: !isDone }),
      })
      fetchTasks()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster oppgaver...</div>
  }

  const criticalTasks = generatedTasks.filter((t) => t.priority === "CRITICAL")
  const soonTasks = generatedTasks.filter((t) => t.priority === "SOON")
  const laterTasks = generatedTasks.filter((t) => t.priority === "LATER")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mine oppgaver</h1>
          <p className="text-gray-600">Automatisk genererte påminnelser og oppgaver</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Oppdater
        </Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Kritisk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Snart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{summary.soon}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Senere
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.later}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Totalt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.critical + summary.soon + summary.later}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical tasks */}
      {criticalTasks.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Krever umiddelbar handling ({criticalTasks.length})
            </CardTitle>
            <CardDescription className="text-red-700">
              Disse oppgavene bør løses så snart som mulig
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {criticalTasks.map((task, i) => (
                <TaskCard key={`critical-${i}`} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Soon tasks */}
      {soonTasks.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50 rounded-t-lg">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Bør gjøres snart ({soonTasks.length})
            </CardTitle>
            <CardDescription className="text-amber-700">
              Planlegg tid for disse oppgavene
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {soonTasks.map((task, i) => (
                <TaskCard key={`soon-${i}`} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Later tasks */}
      {laterTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Til info ({laterTasks.length})
            </CardTitle>
            <CardDescription>Oppgaver som kan vente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {laterTasks.map((task, i) => (
                <TaskCard key={`later-${i}`} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No tasks */}
      {generatedTasks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Alt i orden!</h3>
              <p className="text-gray-500">
                Du har ingen oppgaver som krever handling akkurat nå.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: GeneratedTask }) {
  const config = PRIORITY_CONFIG[task.priority]
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-lg border ${config.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
          <div>
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            {task.dueDate && (
              <p className="text-xs text-gray-500 mt-2">
                Frist: {new Date(task.dueDate).toLocaleDateString("nb-NO")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.classGroupId && (
            <Link href={`/faggrupper/${task.classGroupId}`}>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-1" />
                Åpne
              </Button>
            </Link>
          )}
          {task.studentId && task.classGroupId && (
            <Link href={`/faggrupper/${task.classGroupId}/elev/${task.studentId}`}>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Se elev
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
