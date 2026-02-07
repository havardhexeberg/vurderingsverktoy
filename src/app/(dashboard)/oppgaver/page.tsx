"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw,
  Users,
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
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setGeneratedTasks(data.generated || [])
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster oppgaver...</div>
  }

  // Apply filter
  const filteredTasks = priorityFilter
    ? generatedTasks.filter((t) => t.priority === priorityFilter)
    : generatedTasks

  const criticalTasks = filteredTasks.filter((t) => t.priority === "CRITICAL")
  const soonTasks = filteredTasks.filter((t) => t.priority === "SOON")
  const laterTasks = filteredTasks.filter((t) => t.priority === "LATER")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mine oppgaver</h1>
          <p className="text-gray-600">
            Automatisk genererte påminnelser og oppgaver
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Oppdater
        </Button>
      </div>

      {/* Summary cards — compact, clickable as filters */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card
            className={`border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-md ${
              priorityFilter === "CRITICAL" ? "ring-2 ring-red-500" : ""
            }`}
            onClick={() =>
              setPriorityFilter(
                priorityFilter === "CRITICAL" ? null : "CRITICAL"
              )
            }
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  Kritisk
                </span>
                <span className="text-xl font-bold text-red-600">
                  {summary.critical}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`border-l-4 border-l-amber-500 cursor-pointer transition-all hover:shadow-md ${
              priorityFilter === "SOON" ? "ring-2 ring-amber-500" : ""
            }`}
            onClick={() =>
              setPriorityFilter(priorityFilter === "SOON" ? null : "SOON")
            }
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Snart
                </span>
                <span className="text-xl font-bold text-amber-600">
                  {summary.soon}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`border-l-4 border-l-blue-500 cursor-pointer transition-all hover:shadow-md ${
              priorityFilter === "LATER" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() =>
              setPriorityFilter(priorityFilter === "LATER" ? null : "LATER")
            }
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                  Senere
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {summary.later}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Totalt</span>
                <span className="text-xl font-bold">
                  {summary.critical + summary.soon + summary.later}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {priorityFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Filtrert:{" "}
            {priorityFilter === "CRITICAL"
              ? "Kritisk"
              : priorityFilter === "SOON"
              ? "Snart"
              : "Senere"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPriorityFilter(null)}
          >
            Vis alle
          </Button>
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
                Frist:{" "}
                {new Date(task.dueDate).toLocaleDateString("nb-NO")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Removed "Åpne" button — only "Se elev" remains */}
          {task.studentId && task.classGroupId && (
            <Link
              href={`/faggrupper/${task.classGroupId}/elev/${task.studentId}`}
            >
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
