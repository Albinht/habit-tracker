import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateStats } from '@/lib/habit-utils'
import { HabitDetail } from '@/components/habit-detail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { revalidateTag } from 'next/cache'

// Force revalidation of this page data
export const revalidate = 0

export default async function HabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    notFound()
  }

  const habit = await prisma.habit.findFirst({
    where: {
      id: id,
      userId: user.id
    },
    include: {
      entries: {
        orderBy: { date: 'desc' },
        take: 365
      },
      journals: {
        orderBy: { date: 'desc' },
        take: 30
      }
    }
  })

  if (!habit) {
    notFound()
  }

  const stats = calculateStats(habit.entries)

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <HabitDetail 
        habit={habit} 
        stats={stats}
        isPro={true}
      />
    </div>
  )
}