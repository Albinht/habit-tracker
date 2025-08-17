import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { HabitCardWithHeatmap } from '@/components/habit-card-heatmap'
import { YearOverview } from '@/components/year-overview'
import { NewHabitDropdown } from '@/components/new-habit-dropdown'
import { FREE_HABIT_LIMIT } from '@/lib/constants'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Get date range for last 365 days
  const today = new Date()
  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)

  // Load habits with all entries from last year for heat map display
  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      unit: true,
      goalValue: true,
      goalType: true,
      createdAt: true,
      entries: {
        where: {
          date: {
            gte: yearAgo,
            lte: today,
          },
        },
        select: {
          id: true,
          value: true,
          date: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10, // Show only first 10 habits initially
  })

  const isAtLimit = habits.length >= FREE_HABIT_LIMIT && !user.isPro

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Habits</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
            Track your daily progress and build consistency
          </p>
        </div>
        {!isAtLimit && (
          <NewHabitDropdown className="w-full sm:w-auto min-h-[44px] text-base" />
        )}
      </div>

      {/* Year Overview - only show if user has habits */}
      {habits.length > 0 && <YearOverview />}

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first habit to start tracking your progress
            </p>
            <NewHabitDropdown variant="first-habit" />
          </CardContent>
        </Card>
      ) : (
        <>
          {isAtLimit && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="py-4">
                <p className="text-amber-800">
                  You&apos;ve reached the free plan limit of {FREE_HABIT_LIMIT} habits. Upgrade to Pro for unlimited habits and more features.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-6">
            {habits.map((habit) => (
              <HabitCardWithHeatmap key={habit.id} habit={habit} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}