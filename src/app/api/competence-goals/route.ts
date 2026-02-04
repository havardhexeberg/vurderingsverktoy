import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const subject = request.nextUrl.searchParams.get("subject")
    const gradeParam = request.nextUrl.searchParams.get("grade")

    const where: { subject?: string; grade?: number } = {}
    if (subject) where.subject = subject
    if (gradeParam) where.grade = parseInt(gradeParam)

    const goals = await prisma.competenceGoal.findMany({
      where,
      orderBy: [{ area: "asc" }, { code: "asc" }],
    })

    // Group by area for easier display
    const grouped = goals.reduce((acc, goal) => {
      const area = acc.find((a) => a.name === goal.area)
      if (area) {
        area.goals.push(goal)
      } else {
        acc.push({ name: goal.area, goals: [goal] })
      }
      return acc
    }, [] as { name: string; goals: typeof goals }[])

    return NextResponse.json({ goals, grouped })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
