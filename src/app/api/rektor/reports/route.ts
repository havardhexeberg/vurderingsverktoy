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

    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    const reportType = request.nextUrl.searchParams.get("type")

    switch (reportType) {
      case "school-overview":
        return generateSchoolOverview()
      case "teacher-performance":
        return generateTeacherPerformance()
      case "grade-distribution":
        return generateGradeDistribution()
      case "assessment-coverage":
        return generateAssessmentCoverage()
      default:
        return NextResponse.json({ error: "Ugyldig rapporttype" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}

async function generateSchoolOverview() {
  const [teachers, students, classGroups, assessments] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.student.count(),
    prisma.classGroup.count(),
    prisma.assessment.count(),
  ])

  const byGrade = await prisma.student.groupBy({
    by: ["grade"],
    _count: true,
    orderBy: { grade: "asc" },
  })

  return NextResponse.json({
    title: "Skoleoversikt",
    generatedAt: new Date().toISOString(),
    summary: {
      totalTeachers: teachers,
      totalStudents: students,
      totalClassGroups: classGroups,
      totalAssessments: assessments,
    },
    studentsByGrade: byGrade.map((g) => ({
      grade: g.grade,
      count: g._count,
    })),
  })
}

async function generateTeacherPerformance() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: {
      classGroups: {
        include: {
          _count: { select: { assessments: true, students: true } },
        },
      },
    },
  })

  const performance = teachers.map((t) => ({
    name: t.name,
    email: t.email,
    classGroupCount: t.classGroups.length,
    totalStudents: t.classGroups.reduce((sum, cg) => sum + cg._count.students, 0),
    totalAssessments: t.classGroups.reduce((sum, cg) => sum + cg._count.assessments, 0),
    avgAssessmentsPerStudent:
      t.classGroups.reduce((sum, cg) => sum + cg._count.students, 0) > 0
        ? Math.round(
            (t.classGroups.reduce((sum, cg) => sum + cg._count.assessments, 0) /
              t.classGroups.reduce((sum, cg) => sum + cg._count.students, 0)) *
              10
          ) / 10
        : 0,
  }))

  return NextResponse.json({
    title: "Lærerstatistikk",
    generatedAt: new Date().toISOString(),
    teachers: performance.sort((a, b) => b.totalAssessments - a.totalAssessments),
  })
}

async function generateGradeDistribution() {
  const assessments = await prisma.assessment.findMany({
    where: { grade: { not: null } },
    select: { grade: true },
  })

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  for (const a of assessments) {
    if (a.grade) {
      distribution[a.grade] = (distribution[a.grade] || 0) + 1
    }
  }

  const total = assessments.length
  const avg =
    total > 0
      ? Math.round(
          (assessments.reduce((sum, a) => sum + (a.grade || 0), 0) / total) * 10
        ) / 10
      : 0

  return NextResponse.json({
    title: "Karakterfordeling",
    generatedAt: new Date().toISOString(),
    distribution,
    statistics: {
      total,
      average: avg,
    },
  })
}

async function generateAssessmentCoverage() {
  const classGroups = await prisma.classGroup.findMany({
    include: {
      teacher: true,
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

  const coverage = []
  let totalOk = 0
  let totalWarning = 0
  let totalCritical = 0

  for (const cg of classGroups) {
    let ok = 0
    let warning = 0
    let critical = 0

    for (const cs of cg.students) {
      const assessments = cs.student.assessments.filter(
        (a) => a.classGroupId === cg.id
      )
      const status = calculateStudentStatus(assessments)

      if (status.status === "OK") ok++
      else if (status.status === "WARNING") warning++
      else critical++
    }

    totalOk += ok
    totalWarning += warning
    totalCritical += critical

    coverage.push({
      classGroup: cg.name,
      teacher: cg.teacher.name,
      subject: cg.subject,
      grade: cg.grade,
      students: cg.students.length,
      ok,
      warning,
      critical,
      coveragePercent:
        cg.students.length > 0
          ? Math.round((ok / cg.students.length) * 100)
          : 0,
    })
  }

  return NextResponse.json({
    title: "Vurderingsdekning",
    generatedAt: new Date().toISOString(),
    summary: {
      totalStudents: totalOk + totalWarning + totalCritical,
      ok: totalOk,
      warning: totalWarning,
      critical: totalCritical,
      overallCoverage:
        totalOk + totalWarning + totalCritical > 0
          ? Math.round(
              (totalOk / (totalOk + totalWarning + totalCritical)) * 100
            )
          : 0,
    },
    byClassGroup: coverage.sort((a, b) => a.coveragePercent - b.coveragePercent),
  })
}
