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

    const classGroups = await prisma.classGroup.findMany({
      include: {
        teacher: true,
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
      orderBy: [{ grade: "asc" }, { subject: "asc" }],
    })

    const result = classGroups.map((cg) => {
      let okCount = 0
      let warningCount = 0
      let criticalCount = 0

      for (const cs of cg.students) {
        const assessments = cs.student.assessments.filter(
          (a) => a.classGroupId === cg.id
        )
        const status = calculateStudentStatus(assessments)

        if (status.status === "OK") okCount++
        else if (status.status === "WARNING") warningCount++
        else criticalCount++
      }

      return {
        id: cg.id,
        name: cg.name,
        subject: cg.subject,
        grade: cg.grade,
        teacherName: cg.teacher.name,
        studentCount: cg.students.length,
        assessmentCount: cg._count.assessments,
        okCount,
        warningCount,
        criticalCount,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
