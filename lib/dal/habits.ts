/**
 * Habits Data Access Layer
 * All habit-related database operations with built-in auth checks
 * Following the video's best practices:
 * - Authentication check before ANY database operation
 * - Authorization check for edit/delete (verify ownership)
 * - Centralized data access pattern
 */

import { prisma } from '@/lib/prisma'
import { generateEmbedToken } from '@/lib/habit-utils'
import { FREE_HABIT_LIMIT } from '@/lib/constants'
import { 
  requireAuth, 
  requireProPlan, 
  verifyOwnership,
  ForbiddenError,
  handleDALError 
} from './base'

/**
 * Get all habits for the authenticated user
 * Includes entry counts and recent entries
 */
export async function getUserHabits() {
  try {
    const user = await requireAuth()
    
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 30 // Last 30 days for performance
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return habits
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Get a single habit by ID
 * Includes authorization check
 */
export async function getHabitById(habitId: string) {
  try {
    const user = await requireAuth()
    
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        entries: {
          orderBy: { date: 'desc' },
        },
        journals: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })
    
    if (!habit) {
      throw new ForbiddenError('Habit not found')
    }
    
    // CRITICAL: Verify ownership before returning data
    await verifyOwnership(habit.userId, 'You do not have permission to view this habit')
    
    return habit
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Create a new habit
 * Checks user's plan limits
 */
export async function createHabit(data: {
  name: string
  description?: string
  unit?: string
  color?: string
  goalValue?: number
  goalType?: string
}) {
  try {
    const user = await requireAuth()
    
    // Check habit limit for free users
    const habitCount = await prisma.habit.count({
      where: { userId: user.id }
    })
    
    const isWithinLimit = user.isPro || 
      (user.trialEndsAt && user.trialEndsAt > new Date()) ||
      habitCount < FREE_HABIT_LIMIT
    
    if (!isWithinLimit) {
      throw new ForbiddenError(
        `Free users can only create ${FREE_HABIT_LIMIT} habits. Upgrade to Pro for unlimited habits.`
      )
    }
    
    const habit = await prisma.habit.create({
      data: {
        ...data,
        userId: user.id,
        embedToken: generateEmbedToken(),
      },
    })
    
    return habit
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Update a habit
 * CRITICAL: Includes ownership verification
 */
export async function updateHabit(
  habitId: string,
  data: {
    name?: string
    description?: string
    unit?: string
    color?: string
    goalValue?: number
    goalType?: string
    allowDirectLog?: boolean
  }
) {
  try {
    const user = await requireAuth()
    
    // First, get the habit to verify ownership
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true },
    })
    
    if (!habit) {
      throw new ForbiddenError('Habit not found')
    }
    
    // CRITICAL: Verify ownership before allowing update
    await verifyOwnership(habit.userId, 'You cannot edit habits that belong to other users')
    
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data,
    })
    
    return updatedHabit
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Delete a habit
 * CRITICAL: Includes ownership verification
 */
export async function deleteHabit(habitId: string) {
  try {
    const user = await requireAuth()
    
    // First, get the habit to verify ownership
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true },
    })
    
    if (!habit) {
      throw new ForbiddenError('Habit not found')
    }
    
    // CRITICAL: Verify ownership before allowing deletion
    await verifyOwnership(habit.userId, 'You cannot delete habits that belong to other users')
    
    // Delete the habit (cascade will delete entries and journals)
    await prisma.habit.delete({
      where: { id: habitId },
    })
    
    return { success: true }
  } catch (error) {
    handleDALError(error)
    throw error
  }
}

/**
 * Get habit statistics for the authenticated user
 */
export async function getUserHabitStats() {
  try {
    const user = await requireAuth()
    
    const stats = await prisma.habit.aggregate({
      where: { userId: user.id },
      _count: true,
      _avg: {
        goalValue: true,
      },
    })
    
    const totalEntries = await prisma.entry.count({
      where: {
        habit: {
          userId: user.id,
        },
      },
    })
    
    return {
      totalHabits: stats._count,
      averageGoal: stats._avg.goalValue,
      totalEntries,
    }
  } catch (error) {
    handleDALError(error)
    throw error
  }
}