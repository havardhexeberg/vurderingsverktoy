import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 })
    }

    // Fetch all assessments created by this teacher
    const assessments = await prisma.assessment.findMany({
      where: { createdById: user.id },
      include: {
        student: { select: { id: true, name: true } },
        classGroup: { select: { id: true, name: true, subject: true, grade: true } },
      },
      orderBy: { date: "desc" },
    })

    // Group into batches by (classGroupId + date + description + form)
    const batchMap = new Map<string, {
      classGroupId: string
      classGroupName: string
      subject: string
      grade: number
      description: string | null
      form: string
      type: string
      date: string
      students: { id: string; name: string; grade: number | null; feedback: string | null }[]
    }>()

    assessments.forEach((a) => {
      const dateStr = a.date.toISOString().split("T")[0]
      const key = `${a.classGroupId}|${dateStr}|${a.description || ""}|${a.form}`

      if (!batchMap.has(key)) {
        batchMap.set(key, {
          classGroupId: a.classGroupId,
          classGroupName: a.classGroup.name,
          subject: a.classGroup.subject,
          grade: a.classGroup.grade,
          description: a.description,
          form: a.form,
          type: a.type,
          date: dateStr,
          students: [],
        })
      }

      batchMap.get(key)!.students.push({
        id: a.student.id,
        name: a.student.name,
        grade: a.grade,
        feedback: a.feedback,
      })
    })

    // Sort batches by date (newest first) and convert to array
    const batches = Array.from(batchMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json(batches)
  } catch (error) {
    console.error("Teacher vurderinger error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
