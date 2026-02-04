import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateStudentStatus } from "@/lib/student-status"

interface GeneratedTask {
  type: string
  priority: "CRITICAL" | "SOON" | "LATER"
  title: string
  description: string
  dueDate?: Date
  studentId?: string
  classGroupId?: string
}

async function generateAutomaticTasks(userId: string): Promise<GeneratedTask[]> {
  const tasks: GeneratedTask[] = []

  // Get teacher's class groups with students and their assessments
  const classGroups = await prisma.classGroup.findMany({
    where: { teacherId: userId },
    include: {
      students: {
        include: {
          student: {
            include: {
              assessments: true,
              exemptions: true,
            },
          },
        },
      },
    },
  })

  // Check each student's assessment status
  for (const cg of classGroups) {
    for (const cs of cg.students) {
      const assessments = cs.student.assessments.filter(
        (a) => a.classGroupId === cg.id
      )
      const status = calculateStudentStatus(assessments)

      // Generate tasks for students needing assessments
      if (status.status === "CRITICAL") {
        tasks.push({
          type: "MISSING_ASSESSMENTS",
          priority: "CRITICAL",
          title: `${cs.student.name} trenger flere vurderinger`,
          description: `${cs.student.name} har kun ${status.writtenCount} skriftlige vurderinger i ${cg.subject}. Minst 2 anbefales.`,
          studentId: cs.student.id,
          classGroupId: cg.id,
        })
      } else if (status.status === "WARNING") {
        tasks.push({
          type: "LOW_ASSESSMENTS",
          priority: "SOON",
          title: `${cs.student.name} nærmer seg vurderingsgrense`,
          description: `${cs.student.name} har ${status.assessmentCount} vurderinger i ${cg.subject}. Vurder å legge til flere.`,
          studentId: cs.student.id,
          classGroupId: cg.id,
        })
      }

      // Check for expiring exemptions
      for (const exemption of cs.student.exemptions) {
        const daysUntilExpiry = Math.floor(
          (new Date(exemption.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry <= 0) {
          tasks.push({
            type: "EXEMPTION_EXPIRED",
            priority: "CRITICAL",
            title: `Fritak utløpt for ${cs.student.name}`,
            description: `Fritaket for ${exemption.subject} har utløpt og må fornyes.`,
            studentId: cs.student.id,
          })
        } else if (daysUntilExpiry <= 30 && exemption.requiresRenewal) {
          tasks.push({
            type: "EXEMPTION_EXPIRING",
            priority: "SOON",
            title: `Fritak utløper snart for ${cs.student.name}`,
            description: `Fritaket for ${exemption.subject} utløper om ${daysUntilExpiry} dager.`,
            dueDate: new Date(exemption.validTo),
            studentId: cs.student.id,
          })
        }
      }
    }
  }

  // Check for midterm deadlines (simplified - would need actual school calendar)
  const now = new Date()
  const month = now.getMonth()

  // December warning for midterm
  if (month === 11) {
    for (const cg of classGroups) {
      const studentsWithMidterm = new Set(
        cg.students
          .flatMap((s) => s.student.assessments)
          .filter((a) => a.type === "MIDTERM" && a.classGroupId === cg.id)
          .map((a) => a.studentId)
      )

      const studentsMissingMidterm = cg.students.filter(
        (s) => !studentsWithMidterm.has(s.student.id)
      )

      if (studentsMissingMidterm.length > 0) {
        tasks.push({
          type: "MIDTERM_MISSING",
          priority: "CRITICAL",
          title: `Halvårsvurdering mangler i ${cg.name}`,
          description: `${studentsMissingMidterm.length} elever mangler halvårsvurdering.`,
          classGroupId: cg.id,
        })
      }
    }
  }

  // May/June warning for final grades
  if (month === 4 || month === 5) {
    for (const cg of classGroups) {
      const studentsWithFinal = new Set(
        cg.students
          .flatMap((s) => s.student.assessments)
          .filter((a) => a.type === "FINAL" && a.classGroupId === cg.id)
          .map((a) => a.studentId)
      )

      const studentsMissingFinal = cg.students.filter(
        (s) => !studentsWithFinal.has(s.student.id)
      )

      if (studentsMissingFinal.length > 0) {
        tasks.push({
          type: "FINAL_MISSING",
          priority: "CRITICAL",
          title: `Standpunktkarakter mangler i ${cg.name}`,
          description: `${studentsMissingFinal.length} elever mangler standpunktkarakter.`,
          classGroupId: cg.id,
        })
      }
    }
  }

  return tasks
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ tasks: [], generated: [] })
    }

    const showCompleted = request.nextUrl.searchParams.get("showCompleted") === "true"

    // Get manually created tasks
    const manualTasks = await prisma.task.findMany({
      where: showCompleted ? {} : { isDone: false },
      orderBy: [
        { isDone: "asc" },
        { priority: "asc" },
        { dueDate: "asc" },
      ],
    })

    // Generate automatic tasks
    const generatedTasks = await generateAutomaticTasks(user.id)

    // Sort generated tasks by priority
    const priorityOrder = { CRITICAL: 0, SOON: 1, LATER: 2 }
    generatedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return NextResponse.json({
      manual: manualTasks,
      generated: generatedTasks,
      summary: {
        critical: generatedTasks.filter((t) => t.priority === "CRITICAL").length,
        soon: generatedTasks.filter((t) => t.priority === "SOON").length,
        later: generatedTasks.filter((t) => t.priority === "LATER").length,
        manualPending: manualTasks.filter((t) => !t.isDone).length,
      },
    })
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

    const task = await prisma.task.create({
      data: {
        type: body.type || "MANUAL",
        priority: body.priority || "LATER",
        title: body.title,
        description: body.description || "",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        studentId: body.studentId,
        classGroupId: body.classGroupId,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
}
