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
            createdBy: true,
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

    // Group assessments by subject
    const assessmentsBySubject: Record<string, typeof student.assessments> = {}
    student.assessments.forEach(a => {
      const subject = a.classGroup.subject
      if (!assessmentsBySubject[subject]) {
        assessmentsBySubject[subject] = []
      }
      assessmentsBySubject[subject].push(a)
    })

    // Group competence profiles by subject
    const competenceBySubject: Record<string, typeof student.competenceProfiles> = {}
    student.competenceProfiles.forEach(cp => {
      const subject = cp.competenceGoal.subject
      if (!competenceBySubject[subject]) {
        competenceBySubject[subject] = []
      }
      competenceBySubject[subject].push(cp)
    })

    return NextResponse.json({
      id: student.id,
      name: student.name,
      grade: student.grade,
      subjects: [...new Set(student.classGroups.map(cg => cg.classGroup.subject))],
      teachers: student.classGroups.map(cg => ({
        name: cg.classGroup.teacher.name,
        subject: cg.classGroup.subject,
      })),
      assessmentsBySubject,
      competenceBySubject,
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
