import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const exemptionSchema = z.object({
  studentId: z.string(),
  type: z.enum(["FULL_SUBJECT", "PARTIAL", "NO_GRADE"]),
  subject: z.string(),
  subjectArea: z.string().optional(),
  reason: z.string(),
  validFrom: z.string(),
  validTo: z.string(),
  requiresRenewal: z.boolean().default(true),
  documentationUrl: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const studentId = request.nextUrl.searchParams.get("studentId")
    const includeExpired = request.nextUrl.searchParams.get("includeExpired") === "true"

    const where: {
      studentId?: string
      validTo?: { gte: Date }
    } = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (!includeExpired) {
      where.validTo = { gte: new Date() }
    }

    const exemptions = await prisma.exemption.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, grade: true },
        },
      },
      orderBy: { validTo: "asc" },
    })

    return NextResponse.json(exemptions)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const body = await request.json()
    const validation = exemptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    const exemption = await prisma.exemption.create({
      data: {
        studentId: data.studentId,
        type: data.type,
        subject: data.subject,
        subjectArea: data.subjectArea,
        reason: data.reason,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        requiresRenewal: data.requiresRenewal,
        documentationUrl: data.documentationUrl,
      },
      include: {
        student: {
          select: { id: true, name: true, grade: true },
        },
      },
    })

    return NextResponse.json(exemption, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
