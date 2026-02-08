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

    if (!user) {
      return NextResponse.json({
        classGroups: 0,
        students: 0,
        assessments: 0,
        warnings: 0,
      })
    }

    // Hent statistikk
    const classGroups = await prisma.classGroup.count({
      where: { teacherId: user.id },
    })

    const classGroupIds = await prisma.classGroup.findMany({
      where: { teacherId: user.id },
      select: { id: true },
    })

    const ids = classGroupIds.map((cg) => cg.id)

    const students = await prisma.classGroupStudent.count({
      where: { classGroupId: { in: ids } },
    })

    const assessments = await prisma.assessment.count({
      where: { classGroupId: { in: ids } },
    })

    // Enkel varselslogikk: elever med færre enn 2 vurderinger
    const studentsWithFewAssessments = await prisma.student.count({
      where: {
        classGroups: {
          some: { classGroupId: { in: ids } },
        },
        assessments: {
          none: {},
        },
      },
    })

    return NextResponse.json({
      classGroups,
      students,
      assessments,
      warnings: studentsWithFewAssessments,
      kontaktlaererKlasse: user.kontaktlaererKlasse || null,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente statistikk" },
      { status: 500 }
    )
  }
}
