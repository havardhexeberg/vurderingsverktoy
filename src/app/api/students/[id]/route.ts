import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const classGroupId = request.nextUrl.searchParams.get("classGroupId")

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        assessments: {
          where: classGroupId ? { classGroupId } : undefined,
          orderBy: { date: "desc" },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
