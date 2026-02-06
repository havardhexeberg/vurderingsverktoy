import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createClassGroupSchema = z.object({
  name: z.string().min(2),
  subject: z.string().min(2),
  grade: z.number().int().min(8).max(10),
  schoolYear: z.string(),
  studentIds: z.array(z.string()).optional(),
  teacherId: z.string().optional(), // For rektor to assign to specific teacher
})

// GET - Hent alle faggrupper for innlogget lærer
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    // Finn eller opprett bruker i databasen
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

    const classGroups = await prisma.classGroup.findMany({
      where: { teacherId: user.id },
      include: {
        students: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            assessments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(classGroups)
  } catch (error) {
    console.error("GET class-groups error:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente faggrupper" },
      { status: 500 }
    )
  }
}

// POST - Opprett ny faggruppe
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
    const validation = createClassGroupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, subject, grade, schoolYear, studentIds, teacherId } = validation.data

    // If principal provides teacherId, use that; otherwise use logged-in user
    const assignedTeacherId = (user.role === "PRINCIPAL" && teacherId) ? teacherId : user.id

    const classGroup = await prisma.classGroup.create({
      data: {
        name,
        subject,
        grade,
        schoolYear,
        teacherId: assignedTeacherId,
        students: studentIds
          ? {
              create: studentIds.map((studentId) => ({
                studentId,
              })),
            }
          : undefined,
      },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    })

    return NextResponse.json(classGroup)
  } catch (error) {
    console.error("POST class-groups error:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette faggruppe" },
      { status: 500 }
    )
  }
}
