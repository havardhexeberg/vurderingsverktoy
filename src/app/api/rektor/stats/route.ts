import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateStudentStatus } from "@/lib/student-status"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    // Check if user is a principal
    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    // Get all teachers
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      include: {
        classGroups: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    assessments: true,
                  },
                },
              },
            },
            _count: {
              select: { assessments: true },
            },
          },
        },
      },
    })

    // Get total counts
    const totalStudents = await prisma.student.count()
    const totalAssessments = await prisma.assessment.count()
    const totalClassGroups = await prisma.classGroup.count()

    // Calculate status for all students
    let okCount = 0
    let warningCount = 0
    let criticalCount = 0

    const teacherStats = teachers.map((teacher) => {
      let teacherCritical = 0

      for (const cg of teacher.classGroups) {
        for (const cs of cg.students) {
          const assessments = cs.student.assessments.filter(
            (a) => a.classGroupId === cg.id
          )
          const status = calculateStudentStatus(assessments)

          if (status.status === "OK") okCount++
          else if (status.status === "WARNING") warningCount++
          else if (status.status === "CRITICAL") {
            criticalCount++
            teacherCritical++
          }
        }
      }

      return {
        name: teacher.name,
        classGroups: teacher.classGroups.length,
        assessmentCount: teacher.classGroups.reduce(
          (sum, cg) => sum + cg._count.assessments,
          0
        ),
        criticalStudents: teacherCritical,
      }
    })

    // Sort teachers by critical students (descending)
    teacherStats.sort((a, b) => b.criticalStudents - a.criticalStudents)

    return NextResponse.json({
      totalTeachers: teachers.length,
      totalStudents,
      totalClassGroups,
      totalAssessments,
      statusSummary: {
        ok: okCount,
        warning: warningCount,
        critical: criticalCount,
      },
      teacherStats,
      recentActivity: [], // Would be populated from audit log
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
