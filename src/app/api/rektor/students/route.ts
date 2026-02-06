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

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const grade = searchParams.get("grade")
    const status = searchParams.get("status")

    const students = await prisma.student.findMany({
      where: {
        AND: [
          search ? {
            name: { contains: search, mode: "insensitive" }
          } : {},
          grade ? { grade: parseInt(grade) } : {},
        ]
      },
      include: {
        classGroups: {
          include: {
            classGroup: {
              include: {
                teacher: true,
              }
            }
          }
        },
        assessments: {
          include: {
            classGroup: true,
          }
        },
        exemptions: true,
      },
      orderBy: [{ grade: "asc" }, { name: "asc" }],
    })

    const result = students.map((student) => {
      const studentStatus = calculateStudentStatus(student.assessments)

      const subjects = [...new Set(student.classGroups.map(cg => cg.classGroup.subject))]
      const teachers = [...new Set(student.classGroups.map(cg => cg.classGroup.teacher.name))]

      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        subjects,
        teachers,
        assessmentCount: student.assessments.length,
        status: studentStatus.status,
        statusMessage: studentStatus.warnings.length > 0 ? studentStatus.warnings[0].message : "Alt i orden",
        hasExemptions: student.exemptions.length > 0,
        lastAssessment: student.assessments.length > 0
          ? student.assessments.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].date
          : null,
      }
    })

    // Filter by status if provided
    const filteredResult = status
      ? result.filter(s => s.status === status)
      : result

    return NextResponse.json(filteredResult)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
