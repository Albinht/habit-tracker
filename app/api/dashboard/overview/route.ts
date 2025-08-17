import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, format } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get date range for last 365 days
    const today = new Date()
    const yearAgo = subDays(today, 365)

    // Get all user's habits with their entries from last 365 days
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        color: true,
        goalValue: true,
        goalType: true,
        entries: {
          where: {
            date: {
              gte: yearAgo,
              lte: today
            }
          },
          select: {
            date: true,
            value: true
          },
          orderBy: { date: 'asc' }
        }
      }
    })

    // Calculate overview statistics
    const totalHabits = habits.length
    const totalEntries = habits.reduce((sum, habit) => sum + habit.entries.length, 0)
    
    // Create daily aggregation
    const dailyData = new Map<string, {
      date: string
      totalValue: number
      completedHabits: number
      totalHabits: number
      completionRate: number
    }>()

    // Initialize all days with zero values
    const initStart = new Date(yearAgo)
    const initEnd = new Date(today)
    
    // Ensure we include today by setting end date to end of today
    initEnd.setHours(23, 59, 59, 999)
    
    for (let d = new Date(initStart); d <= initEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd')
      dailyData.set(dateStr, {
        date: dateStr,
        totalValue: 0,
        completedHabits: 0,
        totalHabits: totalHabits,
        completionRate: 0
      })
    }

    // Aggregate entries by date
    habits.forEach(habit => {
      habit.entries.forEach(entry => {
        const dateStr = format(new Date(entry.date), 'yyyy-MM-dd')
        const dayData = dailyData.get(dateStr)
        
        if (dayData) {
          dayData.totalValue += entry.value
          
          // Consider habit "completed" if it meets goal or has any value (if no goal)
          const isCompleted = habit.goalValue 
            ? entry.value >= habit.goalValue 
            : entry.value > 0
            
          if (isCompleted) {
            dayData.completedHabits += 1
          }
          
          dayData.completionRate = totalHabits > 0 
            ? (dayData.completedHabits / totalHabits) * 100 
            : 0
        }
      })
    })

    // Convert to array and calculate overall stats
    const dailyArray = Array.from(dailyData.values())
    const daysWithActivity = dailyArray.filter(day => day.completedHabits > 0).length
    const averageCompletionRate = dailyArray.length > 0 
      ? dailyArray.reduce((sum, day) => sum + day.completionRate, 0) / dailyArray.length 
      : 0

    // Calculate current streak
    let currentStreak = 0
    for (let i = dailyArray.length - 1; i >= 0; i--) {
      if (dailyArray[i].completionRate >= 50) { // At least 50% of habits completed
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    dailyArray.forEach(day => {
      if (day.completionRate >= 50) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    })

    const overview = {
      totalHabits,
      totalEntries,
      daysWithActivity,
      averageCompletionRate: Math.round(averageCompletionRate),
      currentStreak,
      longestStreak,
      dailyData: dailyArray
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Dashboard overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    )
  }
}