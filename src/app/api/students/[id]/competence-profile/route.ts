import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calculateCompetenceProfile } from "@/lib/competence-profile"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const { id: studentId } = await params
    const classGroupId = request.nextUrl.searchParams.get("classGroupId")

    if (!classGroupId) {
      return NextResponse.json(
        { error: "classGroupId er påkrevd" },
        { status: 400 }
      )
    }

    const profile = await calculateCompetenceProfile(studentId, classGroupId)

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
