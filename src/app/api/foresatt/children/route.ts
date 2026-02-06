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

    // In a real system, this would be based on parent-child relationship
    // For demo, we'll return all students in grade 10
    const students = await prisma.student.findMany({
      where: { grade: 10 },
      take: 2, // Limit to 2 children for demo
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
            }
          },
          orderBy: { date: "desc" },
        },
        competenceProfiles: {
          include: {
            competenceGoal: true,
          }
        },
      },
    })

    const result = students.map((student) => {
      const status = calculateStudentStatus(student.assessments)
      const subjects = [...new Set(student.classGroups.map(cg => cg.classGroup.subject))]

      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        subjects,
        status: status.status,
        assessmentCount: student.assessments.length,
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
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
