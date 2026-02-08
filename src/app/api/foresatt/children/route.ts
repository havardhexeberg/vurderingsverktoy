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

    if (session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    const students = await prisma.student.findMany({
      where: { grade: 10 },
      take: 2,
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
            }
          },
          orderBy: { date: "desc" },
        },
      },
    })

    const result = await Promise.all(students.map(async (student) => {
      const status = calculateStudentStatus(student.assessments)
      const subjects = [...new Set(student.classGroups.map(cg => cg.classGroup.subject))]

      const competenceGoals = await prisma.competenceGoal.findMany({
        where: { subject: { in: subjects }, grade: student.grade },
      })

      const fagDekning: Record<string, { antallMal: number; dekkedeMal: number; antallVurderinger: number; laerer: string }> = {}
      subjects.forEach(subject => {
        const subjectGoals = competenceGoals.filter(g => g.subject === subject)
        const subjectAssessments = student.assessments.filter(a => a.classGroup.subject === subject)
        const assessedGoalIds = new Set(
          subjectAssessments.flatMap(a => a.competenceGoals.map(cg => cg.competenceGoalId))
        )
        const teacher = student.classGroups.find(cg => cg.classGroup.subject === subject)?.classGroup.teacher
        fagDekning[subject] = {
          antallMal: subjectGoals.length,
          dekkedeMal: subjectGoals.filter(g => assessedGoalIds.has(g.id)).length,
          antallVurderinger: subjectAssessments.length,
          laerer: teacher?.name || "",
        }
      })

      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        subjects,
        status: status.status,
        assessmentCount: student.assessments.length,
        totalMal: Object.values(fagDekning).reduce((s, f) => s + f.antallMal, 0),
        totalDekket: Object.values(fagDekning).reduce((s, f) => s + f.dekkedeMal, 0),
        fagDekning,
        recentAssessments: student.assessments.slice(0, 5).map(a => ({
          id: a.id,
          date: a.date,
          subject: a.classGroup.subject,
          type: a.type,
          form: a.form,
          grade: a.grade,
          feedback: a.feedback,
        })),
      }
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
