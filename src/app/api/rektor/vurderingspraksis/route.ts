import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    if (session.user.role !== "PRINCIPAL") {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
    }

    // Get all teachers with their assessment data
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      include: {
        classGroups: {
          include: {
            students: true,
            assessments: true,
          }
        },
        assessmentsCreated: {
          include: {
            competenceGoals: true,
          }
        },
      },
    })

    // Calculate statistics for each teacher
    const teacherStats = teachers.map((teacher) => {
      const assessments = teacher.assessmentsCreated
      const totalStudents = teacher.classGroups.reduce(
        (sum, cg) => sum + cg.students.length, 0
      )

      // Grade distribution
      const gradeDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      assessments.forEach(a => {
        if (a.grade && a.grade >= 1 && a.grade <= 6) {
          gradeDistribution[a.grade]++
        }
      })

      // Assessment form distribution
      const formDistribution: Record<string, number> = {
        WRITTEN: 0,
        ORAL: 0,
        ORAL_PRACTICAL: 0,
        PRACTICAL: 0,
      }
      assessments.forEach(a => {
        if (formDistribution[a.form] !== undefined) {
          formDistribution[a.form]++
        }
      })

      // Calculate average grade
      const gradedAssessments = assessments.filter(a => a.grade !== null)
      const averageGrade = gradedAssessments.length > 0
        ? gradedAssessments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssessments.length
        : 0

      // Assessments per student
      const assessmentsPerStudent = totalStudents > 0
        ? assessments.length / totalStudents
        : 0

      // Competence goal coverage
      const assessmentsWithGoals = assessments.filter(a => a.competenceGoals.length > 0)
      const competenceGoalCoverage = assessments.length > 0
        ? (assessmentsWithGoals.length / assessments.length) * 100
        : 0

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentAssessments = assessments.filter(
        a => new Date(a.createdAt) > thirtyDaysAgo
      ).length

      return {
        id: teacher.id,
        name: teacher.name,
        classGroupCount: teacher.classGroups.length,
        totalStudents,
        totalAssessments: assessments.length,
        assessmentsPerStudent: Math.round(assessmentsPerStudent * 10) / 10,
        averageGrade: Math.round(averageGrade * 10) / 10,
        gradeDistribution,
        formDistribution,
        competenceGoalCoverage: Math.round(competenceGoalCoverage),
        recentAssessments,
      }
    })

    // Calculate school averages for comparison
    const schoolTotals = teacherStats.reduce(
      (acc, t) => ({
        totalAssessments: acc.totalAssessments + t.totalAssessments,
        totalStudents: acc.totalStudents + t.totalStudents,
        gradeSum: acc.gradeSum + (t.averageGrade * t.totalAssessments),
        gradedCount: acc.gradedCount + (t.averageGrade > 0 ? t.totalAssessments : 0),
      }),
      { totalAssessments: 0, totalStudents: 0, gradeSum: 0, gradedCount: 0 }
    )

    const schoolAverages = {
      assessmentsPerStudent: schoolTotals.totalStudents > 0
        ? Math.round((schoolTotals.totalAssessments / schoolTotals.totalStudents) * 10) / 10
        : 0,
      averageGrade: schoolTotals.gradedCount > 0
        ? Math.round((schoolTotals.gradeSum / schoolTotals.gradedCount) * 10) / 10
        : 0,
    }

    return NextResponse.json({
      teachers: teacherStats,
      schoolAverages,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
