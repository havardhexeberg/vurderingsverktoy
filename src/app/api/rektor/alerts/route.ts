import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateStudentStatus } from "@/lib/student-status"

interface Alert {
  type: string
  priority: "CRITICAL" | "WARNING" | "INFO"
  title: string
  description: string
  teacherName?: string
  classGroupName?: string
  studentCount?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    const alerts: Alert[] = []

    // Get all class groups with their data
    const classGroups = await prisma.classGroup.findMany({
      include: {
        teacher: true,
        students: {
          include: {
            student: {
              include: {
                assessments: true,
                exemptions: true,
              },
            },
          },
        },
      },
    })

    // Check each class group
    for (const cg of classGroups) {
      let criticalCount = 0
      let warningCount = 0

      for (const cs of cg.students) {
        const assessments = cs.student.assessments.filter(
          (a) => a.classGroupId === cg.id
        )
        const status = calculateStudentStatus(assessments)

        if (status.status === "CRITICAL") criticalCount++
        else if (status.status === "WARNING") warningCount++

        // Check for expiring exemptions
        for (const exemption of cs.student.exemptions) {
          const daysUntilExpiry = Math.floor(
            (new Date(exemption.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )

          if (daysUntilExpiry <= 0) {
            alerts.push({
              type: "EXEMPTION_EXPIRED",
              priority: "CRITICAL",
              title: `Fritak utløpt: ${cs.student.name}`,
              description: `Fritaket for ${exemption.subject} har utløpt og må fornyes.`,
              teacherName: cg.teacher.name,
              classGroupName: cg.name,
            })
          } else if (daysUntilExpiry <= 14) {
            alerts.push({
              type: "EXEMPTION_EXPIRING",
              priority: "WARNING",
              title: `Fritak utløper snart: ${cs.student.name}`,
              description: `Fritaket for ${exemption.subject} utløper om ${daysUntilExpiry} dager.`,
              teacherName: cg.teacher.name,
              classGroupName: cg.name,
            })
          }
        }
      }

      // Alert if many students have critical status
      if (criticalCount >= 5) {
        alerts.push({
          type: "HIGH_CRITICAL_COUNT",
          priority: "CRITICAL",
          title: `Mange elever med kritisk status i ${cg.name}`,
          description: `${criticalCount} elever trenger flere vurderinger.`,
          teacherName: cg.teacher.name,
          classGroupName: cg.name,
          studentCount: criticalCount,
        })
      } else if (criticalCount > 0) {
        alerts.push({
          type: "CRITICAL_STUDENTS",
          priority: "WARNING",
          title: `Elever med kritisk status i ${cg.name}`,
          description: `${criticalCount} elever trenger flere vurderinger.`,
          teacherName: cg.teacher.name,
          classGroupName: cg.name,
          studentCount: criticalCount,
        })
      }

      // Alert if no assessments in a while
      const recentAssessments = cg.students.flatMap((s) =>
        s.student.assessments.filter(
          (a) =>
            a.classGroupId === cg.id &&
            new Date(a.date) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        )
      )

      if (recentAssessments.length === 0 && cg.students.length > 0) {
        alerts.push({
          type: "NO_RECENT_ASSESSMENTS",
          priority: "WARNING",
          title: `Ingen nylige vurderinger i ${cg.name}`,
          description: "Ingen vurderinger registrert de siste 60 dagene.",
          teacherName: cg.teacher.name,
          classGroupName: cg.name,
        })
      }
    }

    // Check for midterm/final deadlines (simplified)
    const now = new Date()
    const month = now.getMonth()

    if (month === 11) {
      // December
      alerts.push({
        type: "MIDTERM_DEADLINE",
        priority: "INFO",
        title: "Halvårsvurdering nærmer seg",
        description: "Husk å følge opp at alle lærere har registrert halvårsvurderinger.",
      })
    }

    if (month === 5) {
      // June
      alerts.push({
        type: "FINAL_DEADLINE",
        priority: "CRITICAL",
        title: "Standpunktkarakter-frist",
        description: "Sørg for at alle standpunktkarakterer er registrert før fristen.",
      })
    }

    // Sort by priority
    const priorityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 }
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
