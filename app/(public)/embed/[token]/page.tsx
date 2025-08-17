import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateStats } from '@/lib/habit-utils'
import { EmbedView } from '@/components/embed-view'

export default async function EmbedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const habit = await prisma.habit.findUnique({
    where: { embedToken: token },
    include: {
      entries: {
        orderBy: { date: 'desc' },
        take: 365
      },
      user: {
        select: {
          name: true
        }
      }
    }
  })

  if (!habit) {
    notFound()
  }

  const stats = calculateStats(habit.entries)

  return (
    <EmbedView 
      habit={habit}
      stats={stats}
      userName={habit.user.name}
    />
  )
}