import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const classGroupId = searchParams.get("classGroupId")
  const term = searchParams.get("term") || "all" // all, autumn, spring

  if (!classGroupId) {
    return NextResponse.json({ error: "classGroupId is required" }, { status: 400 })
  }

  try {
    // Get the class group with students and subject info
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classGroupId },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    })

    if (!classGroup) {
      return NextResponse.json({ error: "Class group not found" }, { status: 404 })
    }

    // Get competence goals for this subject and grade
    const competenceGoals = await prisma.competenceGoal.findMany({
      where: {
        subject: classGroup.subject,
        grade: classGroup.grade,
      },
      orderBy: [
        { area: "asc" },
        { code: "asc" },
      ],
    })

    // Calculate date range based on term
    const now = new Date()
    const currentYear = now.getFullYear()
    let dateFrom: Date
    let dateTo: Date

    if (term === "autumn") {
      dateFrom = new Date(currentYear, 7, 1) // August 1
      dateTo = new Date(currentYear, 11, 31) // December 31
    } else if (term === "spring") {
      dateFrom = new Date(currentYear, 0, 1) // January 1
      dateTo = new Date(currentYear, 5, 30) // June 30
    } else {
      // all - entire school year
      dateFrom = new Date(currentYear - 1, 7, 1) // August 1 previous year
      dateTo = new Date(currentYear, 5, 30) // June 30 current year
    }

    // Get all assessments for this class group within date range
    const assessments = await prisma.assessment.findMany({
      where: {
        classGroupId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        competenceGoals: {
          include: {
            competenceGoal: true,
          },
        },
      },
    })

    // Build the matrix
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56) // 8 weeks

    const matrix: Record<string, Record<string, "assessed" | "outdated" | "missing">> = {}

    // Initialize matrix with all students and goals
    for (const studentRel of classGroup.students) {
      matrix[studentRel.studentId] = {}
      for (const goal of competenceGoals) {
        matrix[studentRel.studentId][goal.id] = "missing"
      }
    }

    // Fill in the matrix based on assessments
    for (const assessment of assessments) {
      const studentId = assessment.studentId
      if (!matrix[studentId]) continue

      for (const acg of assessment.competenceGoals) {
        const goalId = acg.competenceGoalId
        if (!matrix[studentId][goalId]) continue

        const assessmentDate = new Date(assessment.date)
        const currentStatus = matrix[studentId][goalId]

        if (assessmentDate >= eightWeeksAgo) {
          // Recent assessment - always assessed
          matrix[studentId][goalId] = "assessed"
        } else if (currentStatus === "missing") {
          // Old assessment but better than nothing
          matrix[studentId][goalId] = "outdated"
        }
        // If already "assessed", keep it
      }
    }

    // Calculate summary
    let assessed = 0
    let outdated = 0
    let missing = 0

    for (const studentId of Object.keys(matrix)) {
      for (const goalId of Object.keys(matrix[studentId])) {
        const status = matrix[studentId][goalId]
        if (status === "assessed") assessed++
        else if (status === "outdated") outdated++
        else missing++
      }
    }

    const total = assessed + outdated + missing

    return NextResponse.json({
      classGroup: {
        id: classGroup.id,
        name: classGroup.name,
        subject: classGroup.subject,
        grade: classGroup.grade,
      },
      students: classGroup.students.map((s) => ({
        id: s.student.id,
        name: s.student.name,
      })),
      competenceGoals: competenceGoals.map((g) => ({
        id: g.id,
        code: g.code,
        description: g.description,
        area: g.area,
      })),
      matrix,
      summary: {
        total,
        assessed,
        outdated,
        missing,
        coverage: total > 0 ? Math.round((assessed / total) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching competence matrix:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
