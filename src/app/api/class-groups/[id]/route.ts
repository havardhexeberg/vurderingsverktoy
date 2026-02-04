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

    const classGroup = await prisma.classGroup.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: {
          include: {
            student: {
              include: {
                assessments: {
                  where: { classGroupId: id },
                  orderBy: { date: "desc" },
                },
              },
            },
          },
        },
        assessments: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    })

    if (!classGroup) {
      return NextResponse.json(
        { error: "Faggruppe ikke funnet" },
        { status: 404 }
      )
    }

    return NextResponse.json(classGroup)
  } catch (error) {
    console.error("GET class-group error:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente faggruppe" },
      { status: 500 }
    )
  }
}
