"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  ChevronRight,
  Calculator,
  Languages,
  Globe,
  Microscope,
  Building2,
  BookText,
  Palette,
  Music,
  Utensils,
  Dumbbell,
  Loader2,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  name: string
  grade: number
}

interface ClassGroup {
  id: string
  name: string
  subject: string
  grade: number
  schoolYear: string
  students: { student: Student }[]
  _count: { assessments: number }
}

// Subject icons and colors
const subjectConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  "Matematikk": { icon: Calculator, color: "text-blue-600", bgColor: "bg-blue-50" },
  "Norsk": { icon: BookText, color: "text-red-600", bgColor: "bg-red-50" },
  "Engelsk": { icon: Languages, color: "text-purple-600", bgColor: "bg-purple-50" },
  "Naturfag": { icon: Microscope, color: "text-green-600", bgColor: "bg-green-50" },
  "Samfunnsfag": { icon: Building2, color: "text-amber-600", bgColor: "bg-amber-50" },
  "KRLE": { icon: Globe, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  "Spansk": { icon: Languages, color: "text-orange-600", bgColor: "bg-orange-50" },
  "Kunst og handverk": { icon: Palette, color: "text-pink-600", bgColor: "bg-pink-50" },
  "Musikk": { icon: Music, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  "Mat og helse": { icon: Utensils, color: "text-lime-600", bgColor: "bg-lime-50" },
  "Kroppsoving": { icon: Dumbbell, color: "text-teal-600", bgColor: "bg-teal-50" },
}

const getSubjectConfig = (subject: string) => {
  return subjectConfig[subject] || { icon: BookOpen, color: "text-gray-600", bgColor: "bg-gray-50" }
}

export default function FaggrupperPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const groupsRes = await fetch("/api/class-groups")

      if (groupsRes.ok) {
        const groups = await groupsRes.json()
        setClassGroups(groups)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group class groups by subject
  const groupedBySubject = useMemo(() => {
    const grouped: Record<string, ClassGroup[]> = {}
    classGroups.forEach((group) => {
      if (!grouped[group.subject]) {
        grouped[group.subject] = []
      }
      grouped[group.subject].push(group)
    })
    // Sort groups within each subject by grade
    Object.keys(grouped).forEach((subject) => {
      grouped[subject].sort((a, b) => a.grade - b.grade)
    })
    return grouped
  }, [classGroups])

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = new Set(
      classGroups.flatMap((g) => g.students.map((s) => s.student.id))
    ).size
    return { totalStudents }
  }, [classGroups])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mine faggrupper</h1>
        <p className="text-gray-600 mt-1">
          Organisert etter fag
        </p>
      </div>

      {/* Stats Cards - Compact inline */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <span className="font-medium">{classGroups.length}</span>
          <span className="text-gray-500">faggrupper</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{stats.totalStudents}</span>
          <span className="text-gray-500">unike elever</span>
        </div>
      </div>

      {/* Empty State */}
      {classGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen faggrupper</h3>
            <p className="text-gray-500 mb-4">
              Importer elever og opprett faggrupper via administrasjon
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Grouped by Subject */
        <div className="space-y-8">
          {Object.entries(groupedBySubject).map(([subject, groups]) => {
            const config = getSubjectConfig(subject)
            const Icon = config.icon
            const totalStudents = groups.reduce((sum, g) => sum + g.students.length, 0)

            return (
              <div key={subject} className="space-y-3">
                {/* Subject Header */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bgColor}`}>
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">{subject}</h2>
                    <p className="text-sm text-gray-600">
                      {groups.length} {groups.length === 1 ? "gruppe" : "grupper"} · {totalStudents} elever
                    </p>
                  </div>
                </div>

                {/* Class Group Cards */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pl-4">
                  {groups.map((group) => (
                    <Link key={group.id} href={`/faggrupper/${group.id}`}>
                      <Card className="hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors">
                                {group.name}
                              </h3>
                              <Badge variant="secondary" className="mt-1">
                                {group.grade}. trinn
                              </Badge>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{group.students.length} elever</span>
                            </div>
                            {group._count.assessments > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
