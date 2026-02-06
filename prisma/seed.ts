import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Read JSON files
const mathGoals = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'competence_goals_math.json'), 'utf-8')
)
const allGoals = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'competence_goals_all.json'), 'utf-8')
)

// Helper to pick random elements
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Helper to generate random grade
function randomGrade(): number {
  const weights = [3, 3, 4, 4, 4, 5, 5, 6]
  return weights[Math.floor(Math.random() * weights.length)]
}

// All subjects in Norwegian ungdomsskole
const SUBJECTS = [
  'Matematikk', 'Norsk', 'Engelsk', 'Naturfag', 'Samfunnsfag',
  'KRLE', 'Spansk', 'Kunst og handverk', 'Musikk', 'Mat og helse', 'Kroppsoving'
]

const FORMS = ['WRITTEN', 'ORAL', 'ORAL_PRACTICAL', 'PRACTICAL']

async function main() {
  console.log('Starting comprehensive seed...')

  // ============================================
  // 1. CREATE USERS
  // ============================================

  const principal = await prisma.user.upsert({
    where: { email: 'rektor@test.no' },
    update: {},
    create: {
      email: 'rektor@test.no',
      name: 'Kari Nordmann',
      role: 'PRINCIPAL',
    },
  })
  console.log('Rektor created:', principal.name)

  // Create teachers
  const teacherData = [
    { email: 'larer@test.no', name: 'Ole Hansen', subjects: ['Matematikk'] },
    { email: 'norsk.larer@test.no', name: 'Anna Larsen', subjects: ['Norsk'] },
    { email: 'engelsk.larer@test.no', name: 'Erik Berg', subjects: ['Engelsk'] },
    { email: 'spansk.larer@test.no', name: 'Maria Garcia', subjects: ['Spansk'] },
    { email: 'naturfag.larer@test.no', name: 'Per Olsen', subjects: ['Naturfag'] },
    { email: 'samfunn.larer@test.no', name: 'Line Johansen', subjects: ['Samfunnsfag', 'KRLE'] },
    { email: 'kunst.larer@test.no', name: 'Kristin Vik', subjects: ['Kunst og handverk', 'Musikk'] },
    { email: 'gym.larer@test.no', name: 'Thomas Moe', subjects: ['Kroppsoving', 'Mat og helse'] },
  ]

  const subjectToTeacher: Record<string, string> = {}

  for (const t of teacherData) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        name: t.name,
        role: 'TEACHER',
      },
    })
    for (const subject of t.subjects) {
      subjectToTeacher[subject] = teacher.id
    }
  }
  console.log('8 teachers created')

  // Create parent and student users
  const parent = await prisma.user.upsert({
    where: { email: 'foresatt@test.no' },
    update: {},
    create: { email: 'foresatt@test.no', name: 'Trude Hansen', role: 'PARENT' },
  })

  await prisma.user.upsert({
    where: { email: 'elev@test.no' },
    update: {},
    create: { email: 'elev@test.no', name: 'Emma Hansen', role: 'STUDENT' },
  })
  console.log('Parent and student users created')

  // ============================================
  // 2. CREATE COMPETENCE GOALS
  // ============================================
  console.log('Creating competence goals...')
  const allCompetenceGoals = [...mathGoals, ...allGoals]

  for (const goal of allCompetenceGoals) {
    await prisma.competenceGoal.upsert({
      where: { code: goal.code },
      update: {},
      create: {
        subject: goal.subject,
        grade: goal.grade,
        area: goal.area,
        code: goal.code,
        description: goal.description,
      },
    })
  }
  console.log(`${allCompetenceGoals.length} competence goals created`)

  // ============================================
  // 3. CREATE STUDENTS
  // ============================================
  console.log('Creating students...')

  const studentsList = [
    // 10A (10 students)
    { name: 'Emma Hansen', bn: '01010810001', grade: 10, cls: '10A' },
    { name: 'Oliver Andersen', bn: '15020810002', grade: 10, cls: '10A' },
    { name: 'Noah Pettersen', bn: '22030810003', grade: 10, cls: '10A' },
    { name: 'Sophia Olsen', bn: '08040810004', grade: 10, cls: '10A' },
    { name: 'Liam Berg', bn: '19050810005', grade: 10, cls: '10A' },
    { name: 'Isabella Johansen', bn: '25060810006', grade: 10, cls: '10A' },
    { name: 'Lucas Nilsen', bn: '11070810007', grade: 10, cls: '10A' },
    { name: 'Mia Karlsen', bn: '28080810008', grade: 10, cls: '10A' },
    { name: 'Emil Larsen', bn: '14090810009', grade: 10, cls: '10A' },
    { name: 'Ella Pedersen', bn: '03100810010', grade: 10, cls: '10A' },
    // 10B (8 students)
    { name: 'Aksel Kristiansen', bn: '17110810011', grade: 10, cls: '10B' },
    { name: 'Sofie Johnsen', bn: '29120810012', grade: 10, cls: '10B' },
    { name: 'Markus Dahl', bn: '04010810013', grade: 10, cls: '10B' },
    { name: 'Aurora Lie', bn: '18020810014', grade: 10, cls: '10B' },
    { name: 'Benjamin Strand', bn: '25030810015', grade: 10, cls: '10B' },
    { name: 'Hedda Moe', bn: '09040810016', grade: 10, cls: '10B' },
    { name: 'Elias Haugen', bn: '21050810017', grade: 10, cls: '10B' },
    { name: 'Linnea Bakke', bn: '07060810018', grade: 10, cls: '10B' },
    // 10C (8 students)
    { name: 'Tobias Holm', bn: '14070810019', grade: 10, cls: '10C' },
    { name: 'Vilde Nordby', bn: '28080810020', grade: 10, cls: '10C' },
    { name: 'Kasper Aas', bn: '11090810021', grade: 10, cls: '10C' },
    { name: 'Selma Lund', bn: '25100810022', grade: 10, cls: '10C' },
    { name: 'Viktor Berge', bn: '08110810023', grade: 10, cls: '10C' },
    { name: 'Ingrid Solheim', bn: '22120810024', grade: 10, cls: '10C' },
    { name: 'Nikolai Hagen', bn: '05010810025', grade: 10, cls: '10C' },
    { name: 'Thea Vik', bn: '19020810026', grade: 10, cls: '10C' },
    // 9B (10 students)
    { name: 'William Hansen', bn: '06010910013', grade: 9, cls: '9B' },
    { name: 'Olivia Eriksen', bn: '21020910014', grade: 9, cls: '9B' },
    { name: 'Jakob Sorensen', bn: '13030910015', grade: 9, cls: '9B' },
    { name: 'Amelia Solberg', bn: '30040910016', grade: 9, cls: '9B' },
    { name: 'Filip Andreassen', bn: '09050910017', grade: 9, cls: '9B' },
    { name: 'Emilie Berg', bn: '24060910018', grade: 9, cls: '9B' },
    { name: 'Magnus Olsen', bn: '16070910019', grade: 9, cls: '9B' },
    { name: 'Leah Johansen', bn: '02080910020', grade: 9, cls: '9B' },
    { name: 'Mathias Nilsen', bn: '18090910021', grade: 9, cls: '9B' },
    { name: 'Nora Karlsen', bn: '27100910022', grade: 9, cls: '9B' },
    // 9D (8 students)
    { name: 'Herman Dahl', bn: '11110910023', grade: 9, cls: '9D' },
    { name: 'Ida Bakken', bn: '25120910024', grade: 9, cls: '9D' },
    { name: 'Sebastian Lie', bn: '08010910025', grade: 9, cls: '9D' },
    { name: 'Tuva Haugen', bn: '22020910026', grade: 9, cls: '9D' },
    { name: 'Adrian Moe', bn: '05030910027', grade: 9, cls: '9D' },
    { name: 'Julie Strand', bn: '19040910028', grade: 9, cls: '9D' },
    { name: 'Sander Nordby', bn: '02050910029', grade: 9, cls: '9D' },
    { name: 'Frida Lund', bn: '16060910030', grade: 9, cls: '9D' },
    // 8A (8 students)
    { name: 'Oskar Larsen', bn: '12110811023', grade: 8, cls: '8A' },
    { name: 'Sara Pedersen', bn: '05120811024', grade: 8, cls: '8A' },
    { name: 'Henrik Dahl', bn: '08010811025', grade: 8, cls: '8A' },
    { name: 'Ingrid Moe', bn: '19020811026', grade: 8, cls: '8A' },
    { name: 'Jonas Berg', bn: '27030811027', grade: 8, cls: '8A' },
    { name: 'Thea Hansen', bn: '14040811028', grade: 8, cls: '8A' },
    { name: 'Adrian Lie', bn: '22050811029', grade: 8, cls: '8A' },
    { name: 'Maja Strand', bn: '09060811030', grade: 8, cls: '8A' },
    // 8B (8 students)
    { name: 'Martin Vik', bn: '23070811031', grade: 8, cls: '8B' },
    { name: 'Astrid Hagen', bn: '07080811032', grade: 8, cls: '8B' },
    { name: 'Simen Berge', bn: '21090811033', grade: 8, cls: '8B' },
    { name: 'Karoline Solheim', bn: '04100811034', grade: 8, cls: '8B' },
    { name: 'Daniel Aas', bn: '18110811035', grade: 8, cls: '8B' },
    { name: 'Synne Bakke', bn: '01120811036', grade: 8, cls: '8B' },
    { name: 'Kristian Holm', bn: '15010811037', grade: 8, cls: '8B' },
    { name: 'Live Nordby', bn: '29020811038', grade: 8, cls: '8B' },
    // 8C (8 students)
    { name: 'Erik Haugen', bn: '12030811039', grade: 8, cls: '8C' },
    { name: 'Hannah Lund', bn: '26040811040', grade: 8, cls: '8C' },
    { name: 'Lars Moe', bn: '09050811041', grade: 8, cls: '8C' },
    { name: 'Martine Solberg', bn: '23060811042', grade: 8, cls: '8C' },
    { name: 'Oscar Strand', bn: '06070811043', grade: 8, cls: '8C' },
    { name: 'Emilie Dahl', bn: '20080811044', grade: 8, cls: '8C' },
    { name: 'Johannes Lie', bn: '03090811045', grade: 8, cls: '8C' },
    { name: 'Silje Bakken', bn: '17100811046', grade: 8, cls: '8C' },
  ]

  const students: Record<string, { id: string; name: string; grade: number; cls: string }> = {}

  for (const s of studentsList) {
    const student = await prisma.student.upsert({
      where: { birthNumber: s.bn },
      update: {},
      create: { name: s.name, birthNumber: s.bn, grade: s.grade },
    })
    students[s.bn] = { ...student, cls: s.cls }
  }
  console.log(`${studentsList.length} students created`)

  // ============================================
  // 4. CREATE CLASS GROUPS
  // ============================================
  console.log('Creating class groups...')

  const schoolYear = '2025/2026'
  const classes = ['10A', '10B', '10C', '9B', '9D', '8A', '8B', '8C']
  const classGrades: Record<string, number> = {
    '10A': 10, '10B': 10, '10C': 10,
    '9B': 9, '9D': 9,
    '8A': 8, '8B': 8, '8C': 8
  }
  const classGroups: Record<string, string> = {}

  for (const cls of classes) {
    for (const subject of SUBJECTS) {
      const id = `${subject.toLowerCase().replace(/ /g, '-')}-${cls.toLowerCase()}-2025`
      const teacherId = subjectToTeacher[subject]
      if (!teacherId) continue

      await prisma.classGroup.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: `${subject} ${cls}`,
          subject,
          grade: classGrades[cls],
          schoolYear,
          teacherId,
        },
      })
      classGroups[`${subject}-${cls}`] = id
    }
  }
  console.log('88 class groups created')

  // ============================================
  // 5. ADD STUDENTS TO CLASS GROUPS (batch per class)
  // ============================================
  console.log('Adding students to class groups...')

  for (const s of studentsList) {
    const student = students[s.bn]
    for (const subject of SUBJECTS) {
      const cgId = classGroups[`${subject}-${s.cls}`]
      if (!cgId) continue

      await prisma.classGroupStudent.upsert({
        where: {
          studentId_classGroupId: { studentId: student.id, classGroupId: cgId },
        },
        update: {},
        create: { studentId: student.id, classGroupId: cgId },
      })
    }
  }
  console.log('Students added to class groups')

  // ============================================
  // 6. CREATE ASSESSMENTS (simplified - 2 per student per subject)
  // ============================================
  console.log('Creating assessments...')

  const competenceGoalsDb = await prisma.competenceGoal.findMany()
  const goalsBySubjectGrade: Record<string, typeof competenceGoalsDb> = {}
  for (const goal of competenceGoalsDb) {
    const key = `${goal.subject}-${goal.grade}`
    if (!goalsBySubjectGrade[key]) goalsBySubjectGrade[key] = []
    goalsBySubjectGrade[key].push(goal)
  }

  const descriptions: Record<string, string[]> = {
    'Matematikk': ['Prove i algebra', 'Muntlig presentasjon'],
    'Norsk': ['Stiloppgave', 'Muntlig presentasjon'],
    'Engelsk': ['Written test', 'Oral presentation'],
    'Naturfag': ['Laboratorieoppgave', 'Muntlig prove'],
    'Samfunnsfag': ['Prosjektarbeid', 'Skriftlig prove'],
    'KRLE': ['Presentasjon', 'Skriftlig prove'],
    'Spansk': ['Muntlig samtale', 'Skriftlig prove'],
    'Kunst og handverk': ['Praktisk oppgave', 'Utstilling'],
    'Musikk': ['Praktisk opptreden', 'Samspill'],
    'Mat og helse': ['Praktisk matlaging', 'Ernaering prove'],
    'Kroppsoving': ['Ballspill', 'Friidrett'],
  }

  const feedback = ['Godt arbeid!', 'Viser god forstaelse.', 'Fortsett slik!', 'Solid prestasjon.']

  let count = 0
  for (const s of studentsList) {
    const student = students[s.bn]

    for (const subject of SUBJECTS) {
      const cgId = classGroups[`${subject}-${s.cls}`]
      if (!cgId) continue

      const teacherId = subjectToTeacher[subject]
      if (!teacherId) continue

      const goals = goalsBySubjectGrade[`${subject}-${student.grade}`] || []
      const desc = descriptions[subject] || ['Vurdering']

      // Create 2 assessments per subject
      for (let i = 0; i < 2; i++) {
        const date = new Date(`2025-${9 + i * 2}-${10 + Math.floor(Math.random() * 15)}`)
        const selectedGoals = goals.length > 0 ? pickRandom(goals, Math.min(2, goals.length)) : []

        await prisma.assessment.create({
          data: {
            date,
            type: i === 1 && student.grade === 10 ? 'MIDTERM' : 'ONGOING',
            form: FORMS[i % FORMS.length],
            grade: randomGrade(),
            description: desc[i % desc.length],
            feedback: feedback[Math.floor(Math.random() * feedback.length)],
            isPublished: true,
            studentId: student.id,
            classGroupId: cgId,
            createdById: teacherId,
            competenceGoals: {
              create: selectedGoals.map(g => ({ competenceGoalId: g.id })),
            },
          },
        })
        count++
      }
    }
  }
  console.log(`${count} assessments created`)

  // ============================================
  // 7. CREATE TASKS
  // ============================================
  console.log('Creating tasks...')

  const noah = students['22030810003']
  await prisma.task.create({
    data: {
      type: 'FORM_VARIETY',
      priority: 'SOON',
      title: 'Mangler muntlig vurdering',
      description: `${noah.name} trenger muntlig vurdering for standpunkt.`,
      studentId: noah.id,
      classGroupId: classGroups['Matematikk-10A'],
    },
  })

  const oskar = students['12110811023']
  await prisma.task.create({
    data: {
      type: 'ASSESSMENT_MISSING',
      priority: 'SOON',
      title: 'Elev mangler vurdering',
      description: `${oskar.name} har ikke blitt vurdert i Spansk.`,
      dueDate: new Date('2025-10-15'),
      studentId: oskar.id,
      classGroupId: classGroups['Spansk-8A'],
    },
  })
  console.log('Tasks created')

  // Note: Parent-Student linking would require schema changes
  console.log('Seed completed - parent link skipped (requires schema update)')

  console.log(`
Seed completed!
- 1 principal
- 8 teachers
- ${studentsList.length} students
- 88 class groups
- ${count} assessments
  `)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
