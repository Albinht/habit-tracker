'use server'

/**
 * Server Actions for Habits
 * Using the DAL pattern from the video:
 * - All database access through DAL functions
 * - Input validation with Zod
 * - Proper error handling
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  createHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/dal/habits'
import { ForbiddenError } from '@/lib/dal/base'

// Input validation schemas
const CreateHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  unit: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  goalValue: z.number().positive().optional(),
  goalType: z.enum(['daily', 'weekly', 'monthly']).optional(),
})

const UpdateHabitSchema = CreateHabitSchema.partial().extend({
  allowDirectLog: z.boolean().optional(),
})

/**
 * Create a new habit
 * Called from forms with form data
 */
export async function createHabitAction(formData: FormData) {
  try {
    // Parse and validate input
    const validatedData = CreateHabitSchema.parse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      unit: formData.get('unit') || undefined,
      color: formData.get('color') || '#10b981',
      goalValue: formData.get('goalValue') 
        ? Number(formData.get('goalValue')) 
        : undefined,
      goalType: formData.get('goalType') || 'daily',
    })
    
    // Create habit through DAL (includes auth check)
    const habit = await createHabit(validatedData)
    
    // Revalidate dashboard to show new habit
    revalidatePath('/dashboard')
    
    // Redirect to the new habit page
    redirect(`/dashboard/habits/${habit.id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return {
        error: 'Invalid input',
        details: error.issues,
      }
    }
    
    if (error instanceof ForbiddenError) {
      // User hit their limit or doesn't have permission
      return {
        error: error.message,
      }
    }
    
    // Unexpected error
    console.error('Create habit error:', error)
    return {
      error: 'Failed to create habit',
    }
  }
}

/**
 * Update an existing habit
 */
export async function updateHabitAction(
  habitId: string,
  formData: FormData
) {
  try {
    // Parse and validate input
    const validatedData = UpdateHabitSchema.parse({
      name: formData.get('name') || undefined,
      description: formData.get('description') || undefined,
      unit: formData.get('unit') || undefined,
      color: formData.get('color') || undefined,
      goalValue: formData.get('goalValue') 
        ? Number(formData.get('goalValue')) 
        : undefined,
      goalType: formData.get('goalType') || undefined,
      allowDirectLog: formData.get('allowDirectLog') === 'true',
    })
    
    // Update through DAL (includes auth & ownership check)
    await updateHabit(habitId, validatedData)
    
    // Revalidate the habit page
    revalidatePath(`/dashboard/habits/${habitId}`)
    revalidatePath('/dashboard')
    
    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Invalid input',
        details: error.issues,
      }
    }
    
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Update habit error:', error)
    return {
      error: 'Failed to update habit',
    }
  }
}

/**
 * Delete a habit
 * CRITICAL: DAL verifies ownership
 */
export async function deleteHabitAction(habitId: string) {
  try {
    // Delete through DAL (includes auth & ownership check)
    await deleteHabit(habitId)
    
    // Revalidate dashboard
    revalidatePath('/dashboard')
    
    // Redirect to dashboard after deletion
    redirect('/dashboard')
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Delete habit error:', error)
    return {
      error: 'Failed to delete habit',
    }
  }
}

/**
 * Quick create habit with minimal input
 * For the quick-add feature
 */
export async function quickCreateHabitAction(name: string) {
  try {
    if (!name || name.trim().length === 0) {
      return {
        error: 'Habit name is required',
      }
    }
    
    // Create with default values
    const habit = await createHabit({
      name: name.trim(),
      color: '#10b981',
      goalType: 'daily',
    })
    
    // Revalidate dashboard
    revalidatePath('/dashboard')
    
    return {
      success: true,
      habitId: habit.id,
    }
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Quick create habit error:', error)
    return {
      error: 'Failed to create habit',
    }
  }
}