import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateExemptionSchema = z.object({
  type: z.enum(["FULL_SUBJECT", "PARTIAL", "NO_GRADE"]).optional(),
  subject: z.string().optional(),
  subjectArea: z.string().optional().nullable(),
  reason: z.string().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  requiresRenewal: z.boolean().optional(),
  documentationUrl: z.string().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const { id } = await params

    const exemption = await prisma.exemption.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, name: true, grade: true },
        },
      },
    })

    if (!exemption) {
      return NextResponse.json({ error: "Ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(exemption)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = updateExemptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data
    const updateData: Record<string, unknown> = {}

    if (data.type) updateData.type = data.type
    if (data.subject) updateData.subject = data.subject
    if (data.subjectArea !== undefined) updateData.subjectArea = data.subjectArea
    if (data.reason) updateData.reason = data.reason
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom)
    if (data.validTo) updateData.validTo = new Date(data.validTo)
    if (data.requiresRenewal !== undefined) updateData.requiresRenewal = data.requiresRenewal
    if (data.documentationUrl !== undefined) updateData.documentationUrl = data.documentationUrl

    const exemption = await prisma.exemption.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: { id: true, name: true, grade: true },
        },
      },
    })

    return NextResponse.json(exemption)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const { id } = await params

    await prisma.exemption.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
