import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'albinht@gmail.com' },
    update: {},
    create: {
      email: 'albinht@gmail.com',
      name: 'Albin',
      password: 'password123',
      isPro: false,
    },
  })

  console.log('✅ Test user created:', testUser.email)

  // Create a sample habit for the test user
  const existingHabit = await prisma.habit.findFirst({
    where: {
      userId: testUser.id,
      name: 'Walk 10k steps',
    },
  })

  const sampleHabit = existingHabit || await prisma.habit.create({
    data: {
      userId: testUser.id,
      name: 'Walk 10k steps',
      description: 'Daily walking goal',
      unit: 'steps',
      color: '#10b981',
      type: 'number',
      goalValue: 10000,
      goalType: 'daily',
      isPrivate: false,
      weekStartDay: 'Monday',
      activeDays: '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]',
      enabledStats: '["streak","longestStreak","average","total","numberOfDays"]',
      embedToken: 'hab_sample_' + Math.random().toString(36).substring(7),
      allowDirectLog: false,
    }
  })

  console.log('✅ Sample habit created:', sampleHabit.name)

  // Add a sample entry for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sampleEntry = await prisma.entry.upsert({
    where: {
      habitId_date: {
        habitId: sampleHabit.id,
        date: today,
      },
    },
    update: {},
    create: {
      habitId: sampleHabit.id,
      date: today,
      value: 8500,
    },
  })

  console.log('✅ Sample entry created for today with value:', sampleEntry.value)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })