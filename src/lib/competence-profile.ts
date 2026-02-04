import { prisma } from "./prisma"

export interface CompetenceGoalStatus {
  id: string
  code: string
  area: string
  description: string
  level: string | null
  assessmentCount: number
  averageGrade: number | null
  lastAssessmentDate: string | null
  isManualOverride: boolean
}

export interface CompetenceProfileResult {
  areas: {
    name: string
    goals: CompetenceGoalStatus[]
    coverage: number
    averageLevel: string | null
  }[]
  totalGoals: number
  assessedGoals: number
  overallCoverage: number
}

function gradeToLevel(avgGrade: number): string {
  if (avgGrade >= 5.5) return "H" // Høy
  if (avgGrade >= 3.5) return "M" // Middels
  return "L" // Lav
}

export async function calculateCompetenceProfile(
  studentId: string,
  classGroupId: string
): Promise<CompetenceProfileResult> {
  // Get the class group to determine subject and grade
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classGroupId },
  })

  if (!classGroup) {
    throw new Error("Class group not found")
  }

  // Get all competence goals for this subject and grade
  const competenceGoals = await prisma.competenceGoal.findMany({
    where: {
      subject: classGroup.subject,
      grade: classGroup.grade,
    },
    orderBy: [{ area: "asc" }, { code: "asc" }],
  })

  // Get all assessments for this student in this class group with competence goal links
  const assessments = await prisma.assessment.findMany({
    where: {
      studentId,
      classGroupId,
    },
    include: {
      competenceGoals: {
        include: {
          competenceGoal: true,
        },
      },
    },
  })

  // Get manual overrides from CompetenceProfile
  const manualProfiles = await prisma.competenceProfile.findMany({
    where: {
      studentId,
      competenceGoalId: { in: competenceGoals.map((g) => g.id) },
    },
  })

  const manualOverrides = new Map(
    manualProfiles.map((p) => [p.competenceGoalId, p])
  )

  // Calculate status for each goal
  const goalStatuses: CompetenceGoalStatus[] = competenceGoals.map((goal) => {
    // Find all assessments linked to this goal
    const linkedAssessments = assessments.filter((a) =>
      a.competenceGoals.some((cg) => cg.competenceGoalId === goal.id)
    )

    const gradesOnly = linkedAssessments
      .filter((a) => a.grade !== null)
      .map((a) => a.grade!)

    const averageGrade =
      gradesOnly.length > 0
        ? gradesOnly.reduce((a, b) => a + b, 0) / gradesOnly.length
        : null

    const lastAssessment = linkedAssessments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const manual = manualOverrides.get(goal.id)

    return {
      id: goal.id,
      code: goal.code,
      area: goal.area,
      description: goal.description,
      level: manual?.level ?? (averageGrade ? gradeToLevel(averageGrade) : null),
      assessmentCount: linkedAssessments.length,
      averageGrade: averageGrade ? Math.round(averageGrade * 10) / 10 : null,
      lastAssessmentDate: lastAssessment?.date?.toISOString() ?? null,
      isManualOverride: manual?.isManualOverride ?? false,
    }
  })

  // Group by area
  const areaMap = new Map<string, CompetenceGoalStatus[]>()
  goalStatuses.forEach((status) => {
    const existing = areaMap.get(status.area) ?? []
    areaMap.set(status.area, [...existing, status])
  })

  const areas = Array.from(areaMap.entries()).map(([name, goals]) => {
    const assessedGoals = goals.filter((g) => g.level !== null)
    const coverage =
      goals.length > 0 ? Math.round((assessedGoals.length / goals.length) * 100) : 0

    // Calculate average level
    const levels = assessedGoals.map((g) => g.level!)
    let averageLevel: string | null = null
    if (levels.length > 0) {
      const levelValues = levels.map((l) =>
        l === "H" ? 3 : l === "M" ? 2 : 1
      )
      const avgValue =
        levelValues.reduce((a, b) => a + b, 0) / levelValues.length
      averageLevel = avgValue >= 2.5 ? "H" : avgValue >= 1.5 ? "M" : "L"
    }

    return {
      name,
      goals,
      coverage,
      averageLevel,
    }
  })

  const totalGoals = goalStatuses.length
  const assessedGoals = goalStatuses.filter((g) => g.level !== null).length
  const overallCoverage =
    totalGoals > 0 ? Math.round((assessedGoals / totalGoals) * 100) : 0

  return {
    areas,
    totalGoals,
    assessedGoals,
    overallCoverage,
  }
}
