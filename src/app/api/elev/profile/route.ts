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

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    // In a real system, this would fetch the logged-in student's data
    // For demo, we'll return the first student in grade 10
    const student = await prisma.student.findFirst({
      where: { grade: 10 },
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
          where: { isPublished: true },
          include: {
            classGroup: true,
            competenceGoals: {
              include: {
                competenceGoal: true,
              }
            },
          },
          orderBy: { date: "desc" },
        },
        competenceProfiles: {
          include: {
            competenceGoal: true,
          }
        },
        exemptions: {
          where: {
            validTo: { gte: new Date() }
          }
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Elev ikke funnet" }, { status: 404 })
    }

    const status = calculateStudentStatus(student.assessments)

    // Get all competence goals for the student's subjects
    const subjects = [...new Set(student.classGroups.map(cg => cg.classGroup.subject))]
    const competenceGoals = await prisma.competenceGoal.findMany({
      where: {
        subject: { in: subjects },
        grade: student.grade,
      },
      orderBy: [{ subject: "asc" }, { area: "asc" }, { code: "asc" }],
    })

    // Map competence profiles
    const profileMap = new Map(
      student.competenceProfiles.map(cp => [cp.competenceGoalId, cp])
    )

    // Calculate competence coverage per subject with linked assessments
    const competenceBySubject: Record<string, {
      goal: typeof competenceGoals[0]
      profile: typeof student.competenceProfiles[0] | null
      assessmentCount: number
      assessments: {
        id: string
        date: Date
        description: string | null
        grade: number | null
        feedback: string | null
        form: string
        type: string
      }[]
      averageGrade: number | null
    }[]> = {}

    competenceGoals.forEach(goal => {
      if (!competenceBySubject[goal.subject]) {
        competenceBySubject[goal.subject] = []
      }

      const assessmentsForGoal = student.assessments.filter(a =>
        a.competenceGoals.some(cg => cg.competenceGoalId === goal.id)
      )

      // Calculate average grade for this competence goal
      const gradedAssessments = assessmentsForGoal.filter(a => a.grade !== null)
      const averageGrade = gradedAssessments.length > 0
        ? Math.round(gradedAssessments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssessments.length * 10) / 10
        : null

      competenceBySubject[goal.subject].push({
        goal,
        profile: profileMap.get(goal.id) || null,
        assessmentCount: assessmentsForGoal.length,
        assessments: assessmentsForGoal.map(a => ({
          id: a.id,
          date: a.date,
          description: a.description,
          grade: a.grade,
          feedback: a.feedback,
          form: a.form,
          type: a.type,
        })),
        averageGrade,
      })
    })

    // Group assessments by subject
    const assessmentsBySubject: Record<string, typeof student.assessments> = {}
    student.assessments.forEach(a => {
      const subject = a.classGroup.subject
      if (!assessmentsBySubject[subject]) {
        assessmentsBySubject[subject] = []
      }
      assessmentsBySubject[subject].push(a)
    })

    return NextResponse.json({
      id: student.id,
      name: student.name,
      grade: student.grade,
      subjects,
      status: status.status,
      statusMessage: status.warnings.length > 0 ? status.warnings[0].message : "Alt i orden",
      teachers: student.classGroups.map(cg => ({
        name: cg.classGroup.teacher.name,
        subject: cg.classGroup.subject,
      })),
      competenceBySubject,
      assessmentsBySubject,
      totalAssessments: student.assessments.length,
      exemptions: student.exemptions,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
