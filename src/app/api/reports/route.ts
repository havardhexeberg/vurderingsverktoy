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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 })
    }

    const reportType = request.nextUrl.searchParams.get("type")
    const classGroupId = request.nextUrl.searchParams.get("classGroupId")
    const format = request.nextUrl.searchParams.get("format") || "json"

    if (reportType === "class-overview" && classGroupId) {
      return generateClassOverviewReport(classGroupId, format)
    } else if (reportType === "student-assessments" && classGroupId) {
      const studentId = request.nextUrl.searchParams.get("studentId")
      if (studentId) {
        return generateStudentAssessmentsReport(studentId, classGroupId, format)
      }
    } else if (reportType === "grade-summary" && classGroupId) {
      return generateGradeSummaryReport(classGroupId, format)
    } else if (reportType === "teacher-overview") {
      return generateTeacherOverviewReport(user.id, format)
    }

    return NextResponse.json({ error: "Ugyldig rapporttype" }, { status: 400 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}

async function generateClassOverviewReport(classGroupId: string, format: string) {
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classGroupId },
    include: {
      teacher: { select: { name: true } },
      students: {
        include: {
          student: {
            include: {
              assessments: {
                where: { classGroupId },
                orderBy: { date: "desc" },
              },
            },
          },
        },
      },
    },
  })

  if (!classGroup) {
    return NextResponse.json({ error: "Faggruppe ikke funnet" }, { status: 404 })
  }

  const studentsData = classGroup.students.map((cs) => {
    const status = calculateStudentStatus(cs.student.assessments)
    const grades = cs.student.assessments
      .filter((a) => a.grade !== null)
      .map((a) => a.grade!)

    return {
      name: cs.student.name,
      grade: cs.student.grade,
      assessmentCount: cs.student.assessments.length,
      writtenCount: status.writtenCount,
      oralCount: status.oralCount,
      averageGrade: grades.length > 0
        ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
        : null,
      status: status.status,
      lastAssessment: cs.student.assessments[0]?.date || null,
    }
  })

  const report = {
    title: `Klasseoversikt - ${classGroup.name}`,
    generatedAt: new Date().toISOString(),
    classGroup: {
      name: classGroup.name,
      subject: classGroup.subject,
      grade: classGroup.grade,
      teacher: classGroup.teacher.name,
      schoolYear: classGroup.schoolYear,
    },
    summary: {
      totalStudents: studentsData.length,
      criticalStatus: studentsData.filter((s) => s.status === "CRITICAL").length,
      warningStatus: studentsData.filter((s) => s.status === "WARNING").length,
      okStatus: studentsData.filter((s) => s.status === "OK").length,
    },
    students: studentsData.sort((a, b) => a.name.localeCompare(b.name)),
  }

  if (format === "csv") {
    const csv = generateCSV(report.students, [
      "name", "assessmentCount", "writtenCount", "oralCount", "averageGrade", "status"
    ])
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${classGroup.name}-oversikt.csv"`,
      },
    })
  }

  return NextResponse.json(report)
}

async function generateStudentAssessmentsReport(
  studentId: string,
  classGroupId: string,
  format: string
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      assessments: {
        where: { classGroupId },
        orderBy: { date: "desc" },
        include: {
          competenceGoals: {
            include: { competenceGoal: true },
          },
        },
      },
    },
  })

  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classGroupId },
  })

  if (!student || !classGroup) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 })
  }

  const report = {
    title: `Vurderingsoversikt - ${student.name}`,
    generatedAt: new Date().toISOString(),
    student: {
      name: student.name,
      grade: student.grade,
    },
    classGroup: {
      name: classGroup.name,
      subject: classGroup.subject,
    },
    assessments: student.assessments.map((a) => ({
      date: a.date,
      type: a.type,
      form: a.form,
      grade: a.grade,
      description: a.description,
      feedback: a.feedback,
      competenceGoals: a.competenceGoals.map((cg) => cg.competenceGoal.code),
    })),
    summary: {
      totalAssessments: student.assessments.length,
      averageGrade: calculateAverage(student.assessments.map((a) => a.grade)),
      byType: {
        ONGOING: student.assessments.filter((a) => a.type === "ONGOING").length,
        MIDTERM: student.assessments.filter((a) => a.type === "MIDTERM").length,
        FINAL: student.assessments.filter((a) => a.type === "FINAL").length,
      },
      byForm: {
        WRITTEN: student.assessments.filter((a) => a.form === "WRITTEN").length,
        ORAL: student.assessments.filter((a) => a.form === "ORAL").length,
        ORAL_PRACTICAL: student.assessments.filter((a) => a.form === "ORAL_PRACTICAL").length,
        PRACTICAL: student.assessments.filter((a) => a.form === "PRACTICAL").length,
      },
    },
  }

  if (format === "csv") {
    const csv = generateCSV(report.assessments, [
      "date", "type", "form", "grade", "description"
    ])
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${student.name}-vurderinger.csv"`,
      },
    })
  }

  return NextResponse.json(report)
}

async function generateGradeSummaryReport(classGroupId: string, format: string) {
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classGroupId },
    include: {
      students: {
        include: {
          student: {
            include: {
              assessments: {
                where: { classGroupId },
              },
            },
          },
        },
      },
    },
  })

  if (!classGroup) {
    return NextResponse.json({ error: "Faggruppe ikke funnet" }, { status: 404 })
  }

  // Calculate grade distribution
  const allGrades = classGroup.students
    .flatMap((cs) => cs.student.assessments)
    .filter((a) => a.grade !== null)
    .map((a) => a.grade!)

  const gradeDistribution = {
    1: allGrades.filter((g) => g === 1).length,
    2: allGrades.filter((g) => g === 2).length,
    3: allGrades.filter((g) => g === 3).length,
    4: allGrades.filter((g) => g === 4).length,
    5: allGrades.filter((g) => g === 5).length,
    6: allGrades.filter((g) => g === 6).length,
  }

  const report = {
    title: `Karaktersammendrag - ${classGroup.name}`,
    generatedAt: new Date().toISOString(),
    classGroup: {
      name: classGroup.name,
      subject: classGroup.subject,
      grade: classGroup.grade,
    },
    gradeDistribution,
    statistics: {
      totalGrades: allGrades.length,
      average: calculateAverage(allGrades),
      median: calculateMedian(allGrades),
      standardDeviation: calculateStdDev(allGrades),
    },
    studentAverages: classGroup.students.map((cs) => {
      const grades = cs.student.assessments
        .filter((a) => a.grade !== null)
        .map((a) => a.grade!)
      return {
        name: cs.student.name,
        average: calculateAverage(grades),
        count: grades.length,
      }
    }).sort((a, b) => (b.average || 0) - (a.average || 0)),
  }

  return NextResponse.json(report)
}

async function generateTeacherOverviewReport(userId: string, format: string) {
  const classGroups = await prisma.classGroup.findMany({
    where: { teacherId: userId },
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

  const report = {
    title: "Læreroversikt",
    generatedAt: new Date().toISOString(),
    classGroups: classGroups.map((cg) => {
      const students = cg.students.map((cs) => {
        const cgAssessments = cs.student.assessments.filter(
          (a) => a.classGroupId === cg.id
        )
        const status = calculateStudentStatus(cgAssessments)
        return { status: status.status }
      })

      return {
        name: cg.name,
        subject: cg.subject,
        grade: cg.grade,
        studentCount: cg.students.length,
        criticalCount: students.filter((s) => s.status === "CRITICAL").length,
        warningCount: students.filter((s) => s.status === "WARNING").length,
        okCount: students.filter((s) => s.status === "OK").length,
      }
    }),
  }

  return NextResponse.json(report)
}

function calculateAverage(numbers: (number | null)[]): number | null {
  const valid = numbers.filter((n): n is number => n !== null)
  if (valid.length === 0) return null
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
}

function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function calculateStdDev(numbers: number[]): number | null {
  if (numbers.length === 0) return null
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length
  const squareDiffs = numbers.map((n) => Math.pow(n - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
  return Math.round(Math.sqrt(avgSquareDiff) * 100) / 100
}

function generateCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",")
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col]
      if (value === null || value === undefined) return ""
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`
      }
      if (value instanceof Date) {
        return value.toISOString().split("T")[0]
      }
      return String(value)
    }).join(",")
  )
  return [header, ...rows].join("\n")
}
