"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ClipboardCheck, AlertTriangle, Check } from "lucide-react"
import Link from "next/link"

interface Stats {
  classGroups: number
  students: number
  assessments: number
  warnings: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    classGroups: 0,
    students: 0,
    assessments: 0,
    warnings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      num: 1,
      title: "Importer elever",
      desc: "Last opp en CSV-fil med elevdata",
      href: "/import",
      done: stats.students > 0 || stats.classGroups > 0,
    },
    {
      num: 2,
      title: "Opprett faggruppe",
      desc: "Opprett en faggruppe og legg til elever",
      href: "/faggrupper",
      done: stats.classGroups > 0,
    },
    {
      num: 3,
      title: "Registrer vurderinger",
      desc: "Begynn å registrere vurderinger",
      href: "/faggrupper",
      done: stats.assessments > 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Velkommen, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Her er en oversikt over dine faggrupper og oppgaver.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Faggrupper
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.classGroups}
            </div>
            <p className="text-xs text-gray-500">Aktive faggrupper</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Elever
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.students}
            </div>
            <p className="text-xs text-gray-500">Totalt i dine grupper</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vurderinger
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.assessments}
            </div>
            <p className="text-xs text-gray-500">Registrert totalt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Advarsler
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.warnings}
            </div>
            <p className="text-xs text-gray-500">Elever uten vurdering</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kom i gang</CardTitle>
            <CardDescription>
              Følg disse stegene for å sette opp verktøyet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step) => (
                <Link
                  key={step.num}
                  href={step.href}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    step.done
                      ? "bg-green-50 border-green-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step.done ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {step.num}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mine oppgaver</CardTitle>
            <CardDescription>
              Oppgaver som krever oppmerksomhet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.warnings > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      {stats.warnings} elever uten vurdering
                    </p>
                    <p className="text-sm text-amber-700">
                      Gå til faggruppen for å registrere vurderinger
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p>Ingen oppgaver akkurat nå</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
