import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !user.kontaktlaererKlasse) {
      return NextResponse.json({ error: "Ikke kontaktlaerer" }, { status: 403 })
    }

    const { id } = await params

    // Verify student is in the teacher's kontaktlaerer class
    const isInClass = await prisma.classGroupStudent.findFirst({
      where: {
        studentId: id,
        classGroup: { name: { endsWith: ` ${user.kontaktlaererKlasse}` } },
      },
    })

    if (!isInClass) {
      return NextResponse.json({ error: "Eleven er ikke i din klasse" }, { status: 403 })
    }

    // Same query as /api/elev/profile but for a specific student
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classGroups: {
          include: {
            classGroup: {
              include: { teacher: true },
            },
          },
        },
        assessments: {
          where: { isPublished: true },
          include: {
            classGroup: true,
            competenceGoals: {
              include: { competenceGoal: true },
            },
          },
          orderBy: { date: "desc" },
        },
        exemptions: {
          where: { validTo: { gte: new Date() } },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Elev ikke funnet" }, { status: 404 })
    }

    const subjects = [...new Set(student.classGroups.map((cg) => cg.classGroup.subject))]
    const competenceGoals = await prisma.competenceGoal.findMany({
      where: { subject: { in: subjects }, grade: student.grade },
      orderBy: [{ subject: "asc" }, { area: "asc" }, { code: "asc" }],
    })

    // Build competence coverage per subject (same as elev/profile)
    const competenceBySubject: Record<string, {
      goal: { id: string; code: string; area: string; description: string }
      assessmentCount: number
      assessments: {
        id: string; date: Date; description: string | null
        grade: number | null; feedback: string | null; form: string; type: string
      }[]
      averageGrade: number | null
      lastAssessmentDate: string | null
    }[]> = {}

    competenceGoals.forEach((goal) => {
      if (!competenceBySubject[goal.subject]) {
        competenceBySubject[goal.subject] = []
      }

      const assessmentsForGoal = student.assessments.filter((a) =>
        a.competenceGoals.some((cg) => cg.competenceGoalId === goal.id)
      )

      const gradedAssessments = assessmentsForGoal.filter((a) => a.grade !== null)
      const averageGrade = gradedAssessments.length > 0
        ? Math.round(gradedAssessments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssessments.length * 10) / 10
        : null

      const lastAssessmentDate = assessmentsForGoal.length > 0
        ? assessmentsForGoal.reduce((latest, a) =>
            new Date(a.date) > new Date(latest) ? a.date.toISOString() : latest,
            assessmentsForGoal[0].date.toISOString()
          )
        : null

      competenceBySubject[goal.subject].push({
        goal: { id: goal.id, code: goal.code, area: goal.area, description: goal.description },
        assessmentCount: assessmentsForGoal.length,
        assessments: assessmentsForGoal.map((a) => ({
          id: a.id, date: a.date, description: a.description,
          grade: a.grade, feedback: a.feedback, form: a.form, type: a.type,
        })),
        averageGrade,
        lastAssessmentDate,
      })
    })

    // Group assessments by subject
    const assessmentsBySubject: Record<string, typeof student.assessments> = {}
    student.assessments.forEach((a) => {
      const subject = a.classGroup.subject
      if (!assessmentsBySubject[subject]) assessmentsBySubject[subject] = []
      assessmentsBySubject[subject].push(a)
    })

    return NextResponse.json({
      id: student.id,
      name: student.name,
      grade: student.grade,
      subjects,
      teachers: student.classGroups.map((cg) => ({
        name: cg.classGroup.teacher.name,
        subject: cg.classGroup.subject,
      })),
      competenceBySubject,
      assessmentsBySubject,
      totalAssessments: student.assessments.length,
      exemptions: student.exemptions,
    })
  } catch (error) {
    console.error("Kontaktlaerer elev detail error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
