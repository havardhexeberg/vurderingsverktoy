import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Hent alle elever
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const grade = searchParams.get("grade")

    const students = await prisma.student.findMany({
      where: grade ? { grade: parseInt(grade) } : undefined,
      orderBy: { name: "asc" },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("GET students error:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente elever" },
      { status: 500 }
    )
  }
}
