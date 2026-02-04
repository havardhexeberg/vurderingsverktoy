import { PrismaClient } from '@prisma/client'
import competenceGoalsData from './competence_goals_math.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create test teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'larer@test.no' },
    update: {},
    create: {
      email: 'larer@test.no',
      name: 'Test Lærer',
      role: 'TEACHER',
    },
  })
  console.log('✅ Teacher created:', teacher.name)

  // 2. Create test principal
  const principal = await prisma.user.upsert({
    where: { email: 'rektor@test.no' },
    update: {},
    create: {
      email: 'rektor@test.no',
      name: 'Test Rektor',
      role: 'PRINCIPAL',
    },
  })
  console.log('✅ Principal created:', principal.name)

  // 3. Create competence goals (matematikk)
  console.log('📚 Creating competence goals...')
  for (const goal of competenceGoalsData) {
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
  console.log(`✅ ${competenceGoalsData.length} competence goals created`)

  // 4. Create students
  console.log('👨‍🎓 Creating students...')
  const studentsData = [
    { name: 'Emma Hansen', birthNumber: '01010810001', grade: 10 },
    { name: 'Oliver Andersen', birthNumber: '15020810002', grade: 10 },
    { name: 'Noah Pettersen', birthNumber: '22030810003', grade: 10 },
    { name: 'Sophia Olsen', birthNumber: '08040810004', grade: 10 },
    { name: 'Liam Berg', birthNumber: '19050810005', grade: 10 },
    { name: 'Isabella Johansen', birthNumber: '25060810006', grade: 10 },
    { name: 'Lucas Nilsen', birthNumber: '11070810007', grade: 10 },
    { name: 'Mia Karlsen', birthNumber: '28080810008', grade: 10 },
    { name: 'Emil Larsen', birthNumber: '14090810009', grade: 10 },
    { name: 'Ella Pedersen', birthNumber: '03100810010', grade: 10 },
    { name: 'Aksel Kristiansen', birthNumber: '17110810011', grade: 10 },
    { name: 'Sofie Johnsen', birthNumber: '29120810012', grade: 10 },
    { name: 'William Hansen', birthNumber: '06010810013', grade: 10 },
    { name: 'Olivia Eriksen', birthNumber: '21020810014', grade: 10 },
    { name: 'Jakob Sørensen', birthNumber: '13030810015', grade: 10 },
    { name: 'Amelia Solberg', birthNumber: '30040810016', grade: 10 },
    { name: 'Filip Andreassen', birthNumber: '09050810017', grade: 10 },
    { name: 'Emilie Berg', birthNumber: '24060810018', grade: 10 },
    { name: 'Magnus Olsen', birthNumber: '16070810019', grade: 10 },
    { name: 'Leah Johansen', birthNumber: '02080810020', grade: 10 },
    { name: 'Mathias Nilsen', birthNumber: '18090810021', grade: 10 },
    { name: 'Nora Karlsen', birthNumber: '27100810022', grade: 10 },
    { name: 'Oskar Larsen', birthNumber: '12110810023', grade: 10 },
    { name: 'Sara Pedersen', birthNumber: '05120810024', grade: 10 },
  ]

  const students = []
  for (const studentData of studentsData) {
    const student = await prisma.student.upsert({
      where: { birthNumber: studentData.birthNumber },
      update: {},
      create: studentData,
    })
    students.push(student)
  }
  console.log(`✅ ${students.length} students created`)

  // 5. Create class group (Matematikk 10A)
  const classGroup = await prisma.classGroup.upsert({
    where: { id: 'math-10a-2025' },
    update: {},
    create: {
      id: 'math-10a-2025',
      name: 'Matematikk 10A',
      subject: 'Matematikk',
      grade: 10,
      schoolYear: '2025/2026',
      teacherId: teacher.id,
    },
  })
  console.log('✅ Class group created:', classGroup.name)

  // 6. Add students to class group
  console.log('🔗 Adding students to class group...')
  for (const student of students) {
    await prisma.classGroupStudent.upsert({
      where: {
        studentId_classGroupId: {
          studentId: student.id,
          classGroupId: classGroup.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        classGroupId: classGroup.id,
      },
    })
  }
  console.log(`✅ ${students.length} students added to class group`)

  // 7. Create realistic assessments for 3 students (mix of statuses)
  console.log('📝 Creating sample assessments...')
  
  // Get some competence goals
  const algebraGoals = await prisma.competenceGoal.findMany({
    where: { area: 'Tall og algebra', grade: 10 },
    take: 3,
  })
  const geometryGoals = await prisma.competenceGoal.findMany({
    where: { area: 'Geometri', grade: 10 },
    take: 2,
  })

  // Emma Hansen - READY (many assessments, good coverage)
  const emma = students[0]
  const emmaAssessments = [
    {
      date: new Date('2025-09-15'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 4,
      description: 'Innføringsprøve i algebra',
      feedback: 'Emma viser god forståelse for grunnleggende algebraiske uttrykk.',
      isPublished: true,
    },
    {
      date: new Date('2025-10-20'),
      type: 'ONGOING' as const,
      form: 'ORAL' as const,
      grade: 5,
      description: 'Muntlig presentasjon om funksjoner',
      feedback: 'Meget god gjennomgang av lineære og kvadratiske funksjoner.',
      isPublished: true,
    },
    {
      date: new Date('2025-11-10'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 4,
      description: 'Prøve i likninger',
      feedback: 'Solid prestasjon, mestrer de fleste metoder.',
      isPublished: true,
    },
    {
      date: new Date('2025-12-05'),
      type: 'ONGOING' as const,
      form: 'PRACTICAL' as const,
      grade: 5,
      description: 'Praktisk oppgave: Modellering',
      feedback: 'Utmerket bruk av matematiske modeller for å løse praktiske problemer.',
      isPublished: true,
    },
    {
      date: new Date('2026-01-15'),
      type: 'MIDTERM' as const,
      form: 'WRITTEN' as const,
      grade: 4,
      description: 'Halvårsvurdering',
      feedback: 'Emma viser god progresjon gjennom høsten.',
      isPublished: true,
    },
  ]

  for (const assessment of emmaAssessments) {
    await prisma.assessment.create({
      data: {
        ...assessment,
        studentId: emma.id,
        classGroupId: classGroup.id,
        createdById: teacher.id,
        competenceGoals: {
          create: algebraGoals.slice(0, 2).map(goal => ({
            competenceGoalId: goal.id,
          })),
        },
      },
    })
  }

  // Noah Pettersen - WARNING (few assessments, poor coverage)
  const noah = students[2]
  const noahAssessments = [
    {
      date: new Date('2025-09-20'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 3,
      description: 'Innføringsprøve i algebra',
      feedback: 'Noah sliter litt med grunnleggende begreper.',
      isPublished: true,
    },
    {
      date: new Date('2025-11-15'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 3,
      description: 'Prøve i likninger',
      feedback: 'Viser forbedring, men trenger mer trening.',
      isPublished: true,
    },
  ]

  for (const assessment of noahAssessments) {
    await prisma.assessment.create({
      data: {
        ...assessment,
        studentId: noah.id,
        classGroupId: classGroup.id,
        createdById: teacher.id,
        competenceGoals: {
          create: [{ competenceGoalId: algebraGoals[0].id }],
        },
      },
    })
  }

  // Isabella Johansen - ALMOST READY (good count, but only written)
  const isabella = students[5]
  const isabellaAssessments = [
    {
      date: new Date('2025-09-18'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 5,
      description: 'Innføringsprøve i algebra',
      feedback: 'Meget god prestasjon!',
      isPublished: true,
    },
    {
      date: new Date('2025-10-25'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 5,
      description: 'Prøve i funksjoner',
      feedback: 'Isabella mestrer kvadratiske funksjoner svært godt.',
      isPublished: true,
    },
    {
      date: new Date('2025-11-20'),
      type: 'ONGOING' as const,
      form: 'WRITTEN' as const,
      grade: 4,
      description: 'Prøve i geometri',
      feedback: 'God forståelse for geometriske sammenhenger.',
      isPublished: true,
    },
    {
      date: new Date('2026-01-15'),
      type: 'MIDTERM' as const,
      form: 'WRITTEN' as const,
      grade: 5,
      description: 'Halvårsvurdering',
      feedback: 'Isabella holder et høyt nivå.',
      isPublished: true,
    },
  ]

  for (const assessment of isabellaAssessments) {
    await prisma.assessment.create({
      data: {
        ...assessment,
        studentId: isabella.id,
        classGroupId: classGroup.id,
        createdById: teacher.id,
        competenceGoals: {
          create: assessment.description.includes('geometri')
            ? [{ competenceGoalId: geometryGoals[0].id }]
            : [{ competenceGoalId: algebraGoals[0].id }],
        },
      },
    })
  }

  console.log('✅ Sample assessments created')

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
