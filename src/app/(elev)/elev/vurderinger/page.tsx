"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { BookOpen, Bell } from "lucide-react"
import { SubjectTabs } from "@/components/shared/subject-tabs"
import { AssessmentTable } from "@/components/shared/assessment-table"

interface Assessment {
  id: string
  date: string
  type: string
  form: string
  grade: number | null
  feedback: string | null
  description: string | null
  classGroup: {
    subject: string
  }
  competenceGoals: Array<{
    competenceGoal: {
      code: string
      description: string
    }
  }>
}

interface StudentProfile {
  subjects: string[]
  assessmentsBySubject: Record<string, Assessment[]>
  totalAssessments: number
}

export default function VurderingerPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState<string>("")
  const [newCounts, setNewCounts] = useState<Record<string, number>>({})
  const [hasNewAssessments, setHasNewAssessments] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile && profile.subjects.length > 0 && !activeSubject) {
      setActiveSubject(profile.subjects[0])
    }
  }, [profile])

  useEffect(() => {
    if (profile) {
      const lastLogin = localStorage.getItem("lastLoginAt")
      if (lastLogin) {
        const lastLoginDate = new Date(lastLogin)
        const counts: Record<string, number> = {}
        let totalNew = 0
        profile.subjects.forEach((subject) => {
          const assessments = profile.assessmentsBySubject[subject] || []
          const newCount = assessments.filter(
            (a) => new Date(a.date) > lastLoginDate
          ).length
          counts[subject] = newCount
          totalNew += newCount
        })
        setNewCounts(counts)
        setHasNewAssessments(totalNew > 0)
      }
      localStorage.setItem("lastLoginAt", new Date().toISOString())
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/elev/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
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

  if (!profile) {
    return <div className="text-center p-8">Kunne ikke laste data</div>
  }

  const badges: Record<string, number> = {}
  profile.subjects.forEach((subject) => {
    badges[subject] = profile.assessmentsBySubject[subject]?.length || 0
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-cyan-600" />
          Mine vurderinger
        </h1>
        <p className="text-gray-600">Alle publiserte vurderinger fra lærerne dine</p>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="pt-6">
          {hasNewAssessments ? (
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-800">Du har nye vurderinger!</span>
            </div>
          ) : null}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{profile.totalAssessments}</div>
              <div className="text-sm text-gray-600">Totalt</div>
            </div>
            {profile.subjects.slice(0, 3).map((subject) => {
              const count = profile.assessmentsBySubject[subject]?.length || 0
              return (
                <div key={subject} className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">{count}</div>
                  <div className="text-sm text-gray-600">{subject}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subject tabs */}
      <SubjectTabs
        subjects={profile.subjects}
        activeSubject={activeSubject}
        onValueChange={setActiveSubject}
        badges={badges}
        notifications={newCounts}
      >
        {profile.subjects.map((subject) => {
          const assessments = profile.assessmentsBySubject[subject] || []

          return (
            <TabsContent key={subject} value={subject} className="space-y-6">
              {assessments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Ingen vurderinger ennå</h3>
                    <p className="text-gray-500">Du har ingen publiserte vurderinger i dette faget.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Vurderinger i {subject}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AssessmentTable assessments={assessments} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        })}
      </SubjectTabs>
    </div>
  )
}
