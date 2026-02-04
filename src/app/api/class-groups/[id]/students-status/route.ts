import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateStudentStatus } from "@/lib/student-status"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const { id } = await params

    const classGroup = await prisma.classGroup.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              include: {
                assessments: {
                  where: { classGroupId: id },
                },
              },
            },
          },
        },
      },
    })

    if (!classGroup) {
      return NextResponse.json({ error: "Ikke funnet" }, { status: 404 })
    }

    // Beregn status for hver elev
    const studentsWithStatus = classGroup.students.map((cs) => {
      const status = calculateStudentStatus(cs.student.assessments)
      return {
        student: {
          id: cs.student.id,
          name: cs.student.name,
          grade: cs.student.grade,
        },
        status,
      }
    })

    // Sorter: CRITICAL først, deretter WARNING, så OK
    const statusOrder = { CRITICAL: 0, WARNING: 1, OK: 2 }
    studentsWithStatus.sort(
      (a, b) => statusOrder[a.status.status] - statusOrder[b.status.status]
    )

    return NextResponse.json({
      classGroup: {
        id: classGroup.id,
        name: classGroup.name,
        subject: classGroup.subject,
        grade: classGroup.grade,
      },
      students: studentsWithStatus,
      summary: {
        total: studentsWithStatus.length,
        critical: studentsWithStatus.filter((s) => s.status.status === "CRITICAL").length,
        warning: studentsWithStatus.filter((s) => s.status.status === "WARNING").length,
        ok: studentsWithStatus.filter((s) => s.status.status === "OK").length,
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
