"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { NotificationBadge } from "./notification-badge"

interface SubjectTabsProps {
  subjects: string[]
  activeSubject: string
  onValueChange: (value: string) => void
  badges?: Record<string, number>
  notifications?: Record<string, number>
  children: React.ReactNode
}

export function SubjectTabs({
  subjects,
  activeSubject,
  onValueChange,
  badges,
  notifications,
  children,
}: SubjectTabsProps) {
  return (
    <Tabs value={activeSubject} onValueChange={onValueChange}>
      <div className="overflow-x-auto">
        <TabsList className="w-max h-auto">
          {subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject} className="relative">
              {subject}
              {badges && badges[subject] !== undefined && (
                <Badge variant="secondary" className="ml-2">
                  {badges[subject]}
                </Badge>
              )}
              {notifications && (notifications[subject] || 0) > 0 && (
                <NotificationBadge count={notifications[subject]} />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  )
}
