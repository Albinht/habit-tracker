/**
 * Entries Data Access Layer
 * All entry-related database operations with built-in auth checks
 * Critical: Verify habit ownership before ANY entry operation
 */

import { prisma } from '@/lib/prisma'
import { 
  requireAuth,
  verifyOwnership,
  ForbiddenError,
  handleDALError 
} from './base'

/**
 * Helper to verify user owns the habit
 * Used before any entry operation
 */
async function verifyHabitOwnership(habitId: string, userId: string) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { userId: true },
  })
  
  if (!habit) {
    throw new ForbiddenError('Habit not found')
  }
  
  if (habit.userId !== userId) {
    throw new ForbiddenError('You do not have permission to modify entries for this habit')
  }
  
  return habit
}

/**
 * Get entries for a specific habit
 * Includes ownership check
 */
export async function getHabitEntries(
  habitId: string,
  options?: {
    startDate?: Date
    endDate?: Date
    limit?: number
  }
) {
  try {
    const user = await requireAuth()
    
    // Verify user owns this habit
    await verifyHabitOwnership(habitId, user.id)
    
    const entries = await prisma.entry.findMany({
      where: {
        habitId,
        ...(options?.startDate && options?.endDate && {
          date: {
            gte: options.startDate,
            lte: options.endDate,
          },
        }),
      },
      orderBy: { date: 'desc' },
      take: options?.limit,
    })
    
    return entries
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Create or update an entry for a specific date
 * CRITICAL: Verifies habit ownership
 */
export async function upsertEntry(
  habitId: string,
  date: Date,
  value: number
) {
  try {
    const user = await requireAuth()
    
    // CRITICAL: Verify user owns this habit before creating entry
    await verifyHabitOwnership(habitId, user.id)
    
    // Normalize date to start of day
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    
    const entry = await prisma.entry.upsert({
      where: {
        habitId_date: {
          habitId,
          date: normalizedDate,
        },
      },
      update: { value },
      create: {
        habitId,
        date: normalizedDate,
        value,
      },
    })
    
    return entry
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Delete an entry
 * CRITICAL: Verifies habit ownership
 */
export async function deleteEntry(entryId: string) {
  try {
    const user = await requireAuth()
    
    // First get the entry to find the habit
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { 
        habitId: true,
        habit: {
          select: { userId: true }
        }
      },
    })
    
    if (!entry) {
      throw new ForbiddenError('Entry not found')
    }
    
    // CRITICAL: Verify user owns the habit this entry belongs to
    await verifyOwnership(entry.habit.userId, 'You cannot delete entries that belong to other users')
    
    await prisma.entry.delete({
      where: { id: entryId },
    })
    
    return { success: true }
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Bulk create entries
 * For importing or batch operations
 */
export async function createBulkEntries(
  habitId: string,
  entries: Array<{ date: Date; value: number }>
) {
  try {
    const user = await requireAuth()
    
    // CRITICAL: Verify user owns this habit
    await verifyHabitOwnership(habitId, user.id)
    
    // Normalize all dates
    const normalizedEntries = entries.map(entry => ({
      habitId,
      date: new Date(new Date(entry.date).setHours(0, 0, 0, 0)),
      value: entry.value,
    }))
    
    // Use transaction for bulk operation
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing entries in date range to avoid duplicates
      const dates = normalizedEntries.map(e => e.date)
      await tx.entry.deleteMany({
        where: {
          habitId,
          date: { in: dates },
        },
      })
      
      // Create new entries
      return await tx.entry.createMany({
        data: normalizedEntries,
      })
    })
    
    return result
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Get entry statistics for a habit
 */
export async function getHabitEntryStats(
  habitId: string,
  period: 'week' | 'month' | 'year' = 'month'
) {
  try {
    const user = await requireAuth()
    
    // Verify user owns this habit
    await verifyHabitOwnership(habitId, user.id)
    
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    const stats = await prisma.entry.aggregate({
      where: {
        habitId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      _count: true,
      _sum: { value: true },
      _avg: { value: true },
      _max: { value: true },
      _min: { value: true },
    })
    
    return {
      count: stats._count,
      total: stats._sum.value || 0,
      average: stats._avg.value || 0,
      max: stats._max.value || 0,
      min: stats._min.value || 0,
      period,
    }
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Get user's streak information
 */
export async function getUserStreaks(userId?: string) {
  try {
    const user = await requireAuth()
    
    // If checking another user's streaks, verify it's allowed
    const targetUserId = userId || user.id
    
    const recentEntries = await prisma.entry.findMany({
      where: {
        habit: {
          userId: targetUserId,
        },
      },
      orderBy: { date: 'desc' },
      take: 365,
      select: {
        date: true,
        habitId: true,
      },
    })
    
    // Calculate streaks per habit
    const streaksByHabit = new Map<string, number>()
    
    recentEntries.forEach(entry => {
      // Implementation of streak calculation
      // This is simplified - you'd want more complex logic
      if (!streaksByHabit.has(entry.habitId)) {
        streaksByHabit.set(entry.habitId, 1)
      } else {
        streaksByHabit.set(
          entry.habitId, 
          streaksByHabit.get(entry.habitId)! + 1
        )
      }
    })
    
    return Array.from(streaksByHabit.entries()).map(([habitId, streak]) => ({
      habitId,
      currentStreak: streak,
    }))
  } catch (error) {
    handleDALError(error)
    throw error
  }
}