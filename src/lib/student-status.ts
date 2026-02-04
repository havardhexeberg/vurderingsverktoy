export interface Warning {
  type: string
  message: string
}

export interface StudentStatusResult {
  status: "OK" | "WARNING" | "CRITICAL"
  warnings: Warning[]
  assessmentCount: number
  lastAssessmentDate?: string
  competenceCoverage: number
  writtenCount: number
  oralCount: number
}

interface Assessment {
  id: string
  date: Date | string
  type: string
  form: string
  grade: number | null
}

export function calculateStudentStatus(
  assessments: Assessment[],
  totalCompetenceGoals: number = 10
): StudentStatusResult {
  const warnings: Warning[] = []

  const assessmentCount = assessments.length
  const writtenCount = assessments.filter((a) => a.form === "WRITTEN").length
  const oralCount = assessments.filter((a) =>
    a.form === "ORAL" || a.form === "ORAL_PRACTICAL"
  ).length

  // Sorter for å finne siste vurdering
  const sorted = [...assessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const lastAssessmentDate = sorted[0]?.date?.toString()

  // Beregn kompetansemåldekning (simulert for nå)
  const competenceCoverage = Math.min(100, Math.round((assessmentCount / totalCompetenceGoals) * 100))

  // Sjekk advarsler

  // CRITICAL: Færre enn 2 skriftlige vurderinger
  if (writtenCount < 2) {
    warnings.push({
      type: "MIN_WRITTEN",
      message: `Kun ${writtenCount} skriftlige vurderinger (min. 2 anbefalt)`,
    })
  }

  // WARNING: Kun én vurderingsform
  const forms = new Set(assessments.map((a) => a.form))
  if (forms.size === 1 && assessmentCount > 0) {
    warnings.push({
      type: "SINGLE_FORM",
      message: "Kun én vurderingsform brukt",
    })
  }

  // WARNING: Lav kompetansemåldekning
  if (competenceCoverage < 50) {
    warnings.push({
      type: "LOW_COVERAGE",
      message: `Lav kompetansemåldekning (${competenceCoverage}%)`,
    })
  }

  // WARNING: Lenge siden sist vurdert
  if (lastAssessmentDate) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(lastAssessmentDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLast > 90) {
      warnings.push({
        type: "LONG_TIME",
        message: `Over 3 måneder siden sist vurdert`,
      })
    }
  }

  // Bestem status
  let status: "OK" | "WARNING" | "CRITICAL" = "OK"

  if (assessmentCount === 0 || writtenCount < 2) {
    status = "CRITICAL"
  } else if (warnings.length > 0) {
    status = "WARNING"
  }

  return {
    status,
    warnings,
    assessmentCount,
    lastAssessmentDate,
    competenceCoverage,
    writtenCount,
    oralCount,
  }
}
