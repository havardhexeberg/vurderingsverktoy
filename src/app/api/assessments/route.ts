import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createAssessmentSchema = z.object({
  studentId: z.string(),
  classGroupId: z.string(),
  date: z.string(),
  type: z.enum(["MIDTERM", "FINAL", "ONGOING"]),
  form: z.enum(["WRITTEN", "ORAL", "ORAL_PRACTICAL", "PRACTICAL"]),
  grade: z.number().int().min(1).max(6).nullable(),
  feedback: z.string().optional(),
  description: z.string().optional(),
  internalNote: z.string().optional(),
  isPublished: z.boolean().optional(),
})

// POST - Opprett ny vurdering
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    // Finn eller opprett bruker
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
    const validation = createAssessmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    const assessment = await prisma.assessment.create({
      data: {
        studentId: data.studentId,
        classGroupId: data.classGroupId,
        date: new Date(data.date),
        type: data.type,
        form: data.form,
        grade: data.grade,
        feedback: data.feedback,
        description: data.description,
        internalNote: data.internalNote,
        isPublished: data.isPublished || false,
        createdById: user.id,
      },
      include: {
        student: true,
      },
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("POST assessment error:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette vurdering" },
      { status: 500 }
    )
  }
}

// GET - Hent vurderinger for en faggruppe
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const classGroupId = searchParams.get("classGroupId")
    const studentId = searchParams.get("studentId")

    const where: Record<string, string> = {}
    if (classGroupId) where.classGroupId = classGroupId
    if (studentId) where.studentId = studentId

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        student: true,
        createdBy: true,
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error("GET assessments error:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente vurderinger" },
      { status: 500 }
    )
  }
}
