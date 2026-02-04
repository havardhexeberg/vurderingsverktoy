"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Check, BookOpen } from "lucide-react"

interface CompetenceGoal {
  id: string
  code: string
  area: string
  description: string
}

interface CompetenceGoalGroup {
  name: string
  goals: CompetenceGoal[]
}

interface CompetenceGoalSelectorProps {
  subject: string
  grade: number
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function CompetenceGoalSelector({
  subject,
  grade,
  selectedIds,
  onSelectionChange,
}: CompetenceGoalSelectorProps) {
  const [groups, setGroups] = useState<CompetenceGoalGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [subject, grade])

  const fetchGoals = async () => {
    try {
      const response = await fetch(
        `/api/competence-goals?subject=${encodeURIComponent(subject)}&grade=${grade}`
      )
      if (response.ok) {
        const data = await response.json()
        setGroups(data.grouped || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (goalId: string) => {
    if (selectedIds.includes(goalId)) {
      onSelectionChange(selectedIds.filter((id) => id !== goalId))
    } else {
      onSelectionChange([...selectedIds, goalId])
    }
  }

  const totalGoals = groups.reduce((sum, g) => sum + g.goals.length, 0)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>
              {selectedIds.length > 0
                ? `${selectedIds.length} kompetansemål valgt`
                : "Velg kompetansemål"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-medium">Kompetansemål</span>
            <span className="text-sm text-gray-500">
              {selectedIds.length} / {totalGoals} valgt
            </span>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-4">
            {groups.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                {isLoading ? "Laster..." : "Ingen kompetansemål funnet"}
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.name} className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-100 rounded">
                    <span className="font-medium text-sm">{group.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {group.goals.filter((g) => selectedIds.includes(g.id)).length}/
                      {group.goals.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {group.goals.map((goal) => (
                      <label
                        key={goal.id}
                        className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedIds.includes(goal.id)}
                          onCheckedChange={() => handleToggle(goal.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">
                              {goal.code}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {goal.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
            disabled={selectedIds.length === 0}
          >
            Fjern alle
          </Button>
          <Button size="sm" onClick={() => setIsOpen(false)}>
            <Check className="h-4 w-4 mr-2" />
            Ferdig
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
