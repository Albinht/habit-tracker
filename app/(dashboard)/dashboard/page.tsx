import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { HabitCardWithHeatmap } from '@/components/habit-card-heatmap'
import { YearOverview } from '@/components/year-overview'
import { NewHabitDropdown } from '@/components/new-habit-dropdown'

// Force revalidation of dashboard data
export const revalidate = 0

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Get date range for last 365 days
  const today = new Date()
  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)

  let habits = []

  // For local development, use mock data if database fails
  if (process.env.NODE_ENV === 'development') {
    // Generate mock entries for the last 30 days
    const mockEntries = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      if (Math.random() > 0.3) { // 70% chance of having an entry
        mockEntries.push({
          id: `mock-entry-${i}`,
          value: Math.floor(Math.random() * 15000) + 5000, // Random steps between 5k-20k
          date: date,
        })
      }
    }

    habits = [
      {
        id: 'mock-habit-1',
        name: 'Walk 10k steps',
        description: 'Daily walking goal',
        color: '#10b981',
        unit: 'steps',
        goalValue: 10000,
        goalType: 'daily',
        createdAt: new Date(),
        entries: mockEntries,
      },
      {
        id: 'mock-habit-2',
        name: 'Drink 8 glasses of water',
        description: 'Stay hydrated',
        color: '#3b82f6',
        unit: 'glasses',
        goalValue: 8,
        goalType: 'daily',
        createdAt: new Date(),
        entries: mockEntries.slice(0, 20), // Less consistent
      },
      {
        id: 'mock-habit-3',
        name: 'Read for 30 minutes',
        description: 'Daily reading habit',
        color: '#f59e0b',
        unit: 'minutes',
        goalValue: 30,
        goalType: 'daily',
        createdAt: new Date(),
        entries: mockEntries.slice(0, 15), // Even less consistent
      },
    ]
  } else {
    // Load habits with all entries from last year for heat map display
    habits = await prisma.habit.findMany({
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
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Habits</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
            Track your daily progress and build consistency
          </p>
        </div>
        <NewHabitDropdown className="w-full sm:w-auto min-h-[44px] text-base" />
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
        <div className="space-y-4 sm:space-y-6">
          {habits.map((habit) => (
            <HabitCardWithHeatmap key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  )
}