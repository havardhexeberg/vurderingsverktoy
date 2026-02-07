"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  Users,
  Loader2,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { StatusDot } from "@/components/dashboard/scannable"

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

const PRIORITY_STATUS = {
  CRITICAL: "crit" as const,
  SOON: "warn" as const,
  LATER: "ok" as const,
}

const PRIORITY_LABELS = {
  CRITICAL: "Haster",
  SOON: "Snart",
  LATER: "Planlegg",
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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const filteredTasks = priorityFilter
    ? generatedTasks.filter((t) => t.priority === priorityFilter)
    : generatedTasks

  const criticalTasks = filteredTasks.filter((t) => t.priority === "CRITICAL")
  const soonTasks = filteredTasks.filter((t) => t.priority === "SOON")
  const laterTasks = filteredTasks.filter((t) => t.priority === "LATER")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-scan-text">Oppgaver</h1>
          <p className="text-sm text-scan-text2">
            Automatisk genererte påminnelser
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-scan-border text-scan-text2"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Oppdater
        </Button>
      </div>

      {/* Summary row */}
      {summary && (
        <div className="flex gap-2">
          {(["CRITICAL", "SOON", "LATER"] as const).map((priority) => {
            const count = priority === "CRITICAL" ? summary.critical : priority === "SOON" ? summary.soon : summary.later
            const isActive = priorityFilter === priority
            return (
              <button
                key={priority}
                onClick={() => setPriorityFilter(isActive ? null : priority)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 border-brand-300 text-brand-700"
                    : "bg-scan-surface border-scan-border text-scan-text2 hover:border-brand-300"
                }`}
              >
                <StatusDot status={PRIORITY_STATUS[priority]} />
                <span className="font-medium">{PRIORITY_LABELS[priority]}</span>
                <span className="font-mono text-xs">{count}</span>
              </button>
            )
          })}
          <span className="flex items-center px-3 text-sm font-mono text-scan-text3">
            {summary.critical + summary.soon + summary.later} totalt
          </span>
        </div>
      )}

      {/* Task groups */}
      {criticalTasks.length > 0 && (
        <TaskGroup label="Haster" status="crit" tasks={criticalTasks} />
      )}
      {soonTasks.length > 0 && (
        <TaskGroup label="Snart" status="warn" tasks={soonTasks} />
      )}
      {laterTasks.length > 0 && (
        <TaskGroup label="Planlegg" status="ok" tasks={laterTasks} />
      )}

      {/* No tasks */}
      {generatedTasks.length === 0 && (
        <div className="bg-scan-surface border border-scan-border rounded-xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-status-ok mx-auto mb-3" />
          <h3 className="text-base font-medium text-scan-text">Alt i orden!</h3>
          <p className="text-sm text-scan-text3 mt-1">
            Ingen oppgaver som krever handling akkurat nå.
          </p>
        </div>
      )}
    </div>
  )
}

function TaskGroup({
  label,
  status,
  tasks,
}: {
  label: string
  status: "ok" | "warn" | "crit"
  tasks: GeneratedTask[]
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={status} size="md" />
        <h2 className="text-sm font-medium text-scan-text2 uppercase tracking-wider">
          {label} ({tasks.length})
        </h2>
      </div>
      <div className="bg-scan-surface border border-scan-border rounded-xl divide-y divide-scan-border">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-scan-text">{task.title}</div>
              <div className="text-sm text-scan-text2 mt-0.5">{task.description}</div>
              {task.dueDate && (
                <div className="font-mono text-xs text-scan-text3 mt-1">
                  Frist: {new Date(task.dueDate).toLocaleDateString("nb-NO")}
                </div>
              )}
            </div>
            {task.studentId && task.classGroupId && (
              <Link href={`/faggrupper/${task.classGroupId}`}>
                <Button variant="outline" size="sm" className="border-scan-border text-scan-text2 flex-shrink-0">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  Se elev
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
