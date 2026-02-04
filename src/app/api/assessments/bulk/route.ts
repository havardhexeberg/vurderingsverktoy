import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkAssessmentSchema = z.object({
  classGroupId: z.string(),
  commonData: z.object({
    date: z.string(),
    type: z.enum(["MIDTERM", "FINAL", "ONGOING"]),
    form: z.enum(["WRITTEN", "ORAL", "ORAL_PRACTICAL", "PRACTICAL"]),
    description: z.string().optional(),
  }),
  assessments: z.array(
    z.object({
      studentId: z.string(),
      grade: z.number().int().min(1).max(6).nullable(),
      feedback: z.string().optional(),
    })
  ),
  competenceGoalIds: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name || "Ukjent",
          role: session.user.role || "TEACHER",
        },
      })
    }

    const body = await request.json()
    const validation = bulkAssessmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { classGroupId, commonData, assessments, competenceGoalIds, isPublished } = validation.data

    // Filtrer ut elever uten karakter hvis ønskelig, eller ta med alle
    const assessmentsToCreate = assessments.filter(
      (a) => a.grade !== null || a.feedback
    )

    if (assessmentsToCreate.length === 0) {
      return NextResponse.json(
        { error: "Ingen vurderinger å lagre" },
        { status: 400 }
      )
    }

    // Opprett alle vurderinger
    const createdAssessments = []
    const userId = user.id

    for (const assessment of assessmentsToCreate) {
      const created = await prisma.assessment.create({
        data: {
          studentId: assessment.studentId,
          classGroupId,
          date: new Date(commonData.date),
          type: commonData.type,
          form: commonData.form,
          description: commonData.description,
          grade: assessment.grade,
          feedback: assessment.feedback,
          isPublished: isPublished || false,
          createdById: userId,
        },
      })

      // Link competence goals if provided
      if (competenceGoalIds && competenceGoalIds.length > 0) {
        for (const goalId of competenceGoalIds) {
          await prisma.assessmentCompetenceGoal.create({
            data: {
              assessmentId: created.id,
              competenceGoalId: goalId,
            },
          })
        }
      }

      createdAssessments.push(created)
    }

    const result = createdAssessments

    return NextResponse.json({
      created: result.length,
      message: `${result.length} vurderinger opprettet`,
    })
  } catch (error) {
    console.error("Bulk assessment error:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette vurderinger" },
      { status: 500 }
    )
  }
}
