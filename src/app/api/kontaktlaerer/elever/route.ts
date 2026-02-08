import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
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

    const klasse = user.kontaktlaererKlasse

    // Find students in this class via ClassGroup names ending with the class name
    const students = await prisma.student.findMany({
      where: {
        classGroups: {
          some: {
            classGroup: { name: { endsWith: ` ${klasse}` } },
          },
        },
      },
      include: {
        assessments: {
          where: { isPublished: true },
          select: { grade: true },
        },
        classGroups: {
          include: {
            classGroup: { select: { subject: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const result = students.map((s) => {
      const subjects = [...new Set(s.classGroups.map((cg) => cg.classGroup.subject))]
      const graded = s.assessments.filter((a) => a.grade !== null)
      const avgGrade = graded.length > 0
        ? Math.round(graded.reduce((sum, a) => sum + (a.grade || 0), 0) / graded.length * 10) / 10
        : null

      return {
        id: s.id,
        name: s.name,
        grade: s.grade,
        totalAssessments: s.assessments.length,
        subjects,
        avgGrade,
      }
    })

    return NextResponse.json({
      klasse,
      students: result,
    })
  } catch (error) {
    console.error("Kontaktlaerer elever error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
