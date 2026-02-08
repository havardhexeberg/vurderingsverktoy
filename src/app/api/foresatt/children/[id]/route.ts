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

    if (session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classGroups: {
          include: {
            classGroup: {
              include: { teacher: true }
            }
          }
        },
        assessments: {
          where: { isPublished: true },
          include: {
            classGroup: true,
            competenceGoals: {
              include: { competenceGoal: true }
            },
            createdBy: true,
          },
          orderBy: { date: "desc" },
        },
        exemptions: {
          where: { validTo: { gte: new Date() } }
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Elev ikke funnet" }, { status: 404 })
    }

    const subjects = [...new Set(student.classGroups.map(cg => cg.classGroup.subject))]

    // Get all competence goals for student's subjects
    const competenceGoals = await prisma.competenceGoal.findMany({
      where: { subject: { in: subjects }, grade: student.grade },
      orderBy: [{ subject: "asc" }, { area: "asc" }, { code: "asc" }],
    })

    // Build kompetansemål with linked assessments per subject
    const kompetansemalBySubject: Record<string, {
      goal: { id: string; code: string; area: string; description: string }
      assessmentCount: number
      assessments: {
        id: string; date: Date; description: string | null
        grade: number | null; feedback: string | null; form: string; type: string
      }[]
      averageGrade: number | null
    }[]> = {}

    competenceGoals.forEach(goal => {
      if (!kompetansemalBySubject[goal.subject]) {
        kompetansemalBySubject[goal.subject] = []
      }

      const assessmentsForGoal = student.assessments.filter(a =>
        a.competenceGoals.some(cg => cg.competenceGoalId === goal.id)
      )

      const gradedAssessments = assessmentsForGoal.filter(a => a.grade !== null)
      const averageGrade = gradedAssessments.length > 0
        ? Math.round(gradedAssessments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssessments.length * 10) / 10
        : null

      kompetansemalBySubject[goal.subject].push({
        goal: { id: goal.id, code: goal.code, area: goal.area, description: goal.description },
        assessmentCount: assessmentsForGoal.length,
        assessments: assessmentsForGoal.map(a => ({
          id: a.id, date: a.date, description: a.description,
          grade: a.grade, feedback: a.feedback, form: a.form, type: a.type,
        })),
        averageGrade,
      })
    })

    // Group assessments by subject
    const assessmentsBySubject: Record<string, typeof student.assessments> = {}
    student.assessments.forEach(a => {
      const subject = a.classGroup.subject
      if (!assessmentsBySubject[subject]) assessmentsBySubject[subject] = []
      assessmentsBySubject[subject].push(a)
    })

    // Per-subject coverage stats
    const fagDekning: Record<string, { antallMal: number; dekkedeMal: number; antallVurderinger: number; laerer: string }> = {}
    subjects.forEach(subject => {
      const goals = kompetansemalBySubject[subject] || []
      const teacher = student.classGroups.find(cg => cg.classGroup.subject === subject)?.classGroup.teacher
      fagDekning[subject] = {
        antallMal: goals.length,
        dekkedeMal: goals.filter(g => g.assessmentCount > 0).length,
        antallVurderinger: (assessmentsBySubject[subject] || []).length,
        laerer: teacher?.name || "",
      }
    })

    return NextResponse.json({
      id: student.id,
      name: student.name,
      grade: student.grade,
      subjects,
      teachers: student.classGroups.map(cg => ({
        name: cg.classGroup.teacher.name,
        subject: cg.classGroup.subject,
      })),
      assessmentsBySubject,
      kompetansemalBySubject,
      fagDekning,
      exemptions: student.exemptions.map(e => ({
        subject: e.subject,
        subjectArea: e.subjectArea,
        type: e.type,
        validTo: e.validTo,
      })),
      totalAssessments: student.assessments.length,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
