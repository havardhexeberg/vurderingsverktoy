"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface ChildData {
  id: string
  name: string
  grade: number
  subjects: string[]
  status: "OK" | "WARNING" | "CRITICAL"
  assessmentCount: number
}

export default function MineBarnPage() {
  const [children, setChildren] = useState<ChildData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/foresatt/children")
      if (response.ok) {
        const data = await response.json()
        setChildren(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            God oversikt
          </Badge>
        )
      case "WARNING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pågående
          </Badge>
        )
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Følg opp
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-brand-600" />
          Mine barn
        </h1>
        <p className="text-gray-600">Oversikt over dine barns vurderinger</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Ingen barn registrert</h3>
            <p className="text-gray-500">Kontakt skolen for å få tilgang.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-600" />
                      {child.name}
                    </CardTitle>
                    <CardDescription>
                      {child.grade}. trinn
                    </CardDescription>
                  </div>
                  {getStatusBadge(child.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Fag</div>
                      <div className="font-medium">{child.subjects.join(", ")}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Vurderinger</div>
                      <div className="font-medium">{child.assessmentCount}</div>
                    </div>
                  </div>

                  <Link href={`/foresatt/barn/${child.id}`}>
                    <Button className="w-full cursor-pointer">
                      Se elev
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
