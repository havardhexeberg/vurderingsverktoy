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

    // Find the teacher's user record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ students: [], classGroups: [] })
    }

    // Get all class groups for this teacher
    const classGroups = await prisma.classGroup.findMany({
      where: { teacherId: user.id },
      include: {
        students: {
          include: {
            student: {
              include: {
                assessments: true,
              },
            },
          },
        },
      },
    })

    // Build a map of students with their class groups and assessments
    const studentMap = new Map<
      string,
      {
        student: { id: string; name: string; grade: number }
        classGroups: { id: string; name: string; subject: string }[]
        assessments: { id: string; type: string; form: string; grade: number | null; date: Date }[]
      }
    >()

    for (const cg of classGroups) {
      for (const cs of cg.students) {
        const existing = studentMap.get(cs.student.id)
        if (existing) {
          // Add this class group to the student's list
          existing.classGroups.push({
            id: cg.id,
            name: cg.name,
            subject: cg.subject,
          })
          // Add assessments from this class group
          const cgAssessments = cs.student.assessments.filter(
            (a) => a.classGroupId === cg.id
          )
          existing.assessments.push(...cgAssessments)
        } else {
          studentMap.set(cs.student.id, {
            student: {
              id: cs.student.id,
              name: cs.student.name,
              grade: cs.student.grade,
            },
            classGroups: [{ id: cg.id, name: cg.name, subject: cg.subject }],
            assessments: cs.student.assessments.filter(
              (a) => a.classGroupId === cg.id
            ),
          })
        }
      }
    }

    // Calculate status for each student
    const studentsWithStatus = Array.from(studentMap.values()).map((item) => {
      const status = calculateStudentStatus(item.assessments)
      return {
        student: item.student,
        classGroups: item.classGroups,
        status: {
          status: status.status,
          assessmentCount: status.assessmentCount,
          competenceCoverage: status.competenceCoverage,
          writtenCount: status.writtenCount,
          oralCount: status.oralCount,
        },
      }
    })

    // Sort by status priority (CRITICAL first)
    const statusOrder = { CRITICAL: 0, WARNING: 1, OK: 2 }
    studentsWithStatus.sort(
      (a, b) => statusOrder[a.status.status] - statusOrder[b.status.status]
    )

    // Return unique class groups for filtering
    const uniqueClassGroups = classGroups.map((cg) => ({
      id: cg.id,
      name: cg.name,
      subject: cg.subject,
    }))

    return NextResponse.json({
      students: studentsWithStatus,
      classGroups: uniqueClassGroups,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
