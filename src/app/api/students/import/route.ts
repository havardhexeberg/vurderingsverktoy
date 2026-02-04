import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const studentSchema = z.object({
  name: z.string().min(2),
  birthNumber: z.string().length(11).regex(/^\d+$/),
  grade: z.number().int().min(8).max(10),
})

const importSchema = z.object({
  students: z.array(studentSchema),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Ikke autentisert" },
        { status: 401 }
      )
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "PRINCIPAL") {
      return NextResponse.json(
        { error: "Ingen tilgang" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = importSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { students } = validation.data

    // Check for duplicate birth numbers
    const existingStudents = await prisma.student.findMany({
      where: {
        birthNumber: {
          in: students.map((s) => s.birthNumber),
        },
      },
      select: { birthNumber: true },
    })

    const existingBirthNumbers = new Set(existingStudents.map((s) => s.birthNumber))
    const newStudents = students.filter(
      (s) => !existingBirthNumbers.has(s.birthNumber)
    )

    if (newStudents.length === 0) {
      return NextResponse.json(
        {
          imported: 0,
          skipped: students.length,
          message: "Alle elever finnes allerede i systemet"
        },
        { status: 200 }
      )
    }

    // Create students in a transaction
    const result = await prisma.$transaction(
      newStudents.map((student) =>
        prisma.student.create({
          data: {
            name: student.name,
            birthNumber: student.birthNumber,
            grade: student.grade,
          },
        })
      )
    )

    return NextResponse.json({
      imported: result.length,
      skipped: students.length - newStudents.length,
      message: `${result.length} elever importert`,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "En feil oppstod under import" },
      { status: 500 }
    )
  }
}
