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

    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

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

    const teacherData = teachers.map((teacher) => {
      let okStudents = 0
      let warningStudents = 0
      let criticalStudents = 0
      let totalStudents = 0
      let totalAssessments = 0

      const classGroups = teacher.classGroups.map((cg) => {
        totalAssessments += cg._count.assessments

        for (const cs of cg.students) {
          totalStudents++
          const assessments = cs.student.assessments.filter(
            (a) => a.classGroupId === cg.id
          )
          const status = calculateStudentStatus(assessments)

          if (status.status === "OK") okStudents++
          else if (status.status === "WARNING") warningStudents++
          else criticalStudents++
        }

        return {
          id: cg.id,
          name: cg.name,
          subject: cg.subject,
          studentCount: cg.students.length,
        }
      })

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        classGroups,
        totalStudents,
        totalAssessments,
        okStudents,
        warningStudents,
        criticalStudents,
      }
    })

    return NextResponse.json(teacherData)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
