'use server'

/**
 * Server Actions for Entries
 * All entry operations with proper validation and auth
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  upsertEntry,
  deleteEntry,
  createBulkEntries,
  getHabitEntryStats,
} from '@/lib/dal/entries'
import { ForbiddenError } from '@/lib/dal/base'

// Input validation schemas
const LogEntrySchema = z.object({
  habitId: z.string(),
  date: z.string().datetime().or(z.date()),
  value: z.number().positive(),
})

const BulkEntriesSchema = z.object({
  habitId: z.string(),
  entries: z.array(z.object({
    date: z.string().datetime().or(z.date()),
    value: z.number().positive(),
  })),
})

/**
 * Log an entry for today or specific date
 * Used by the quick-log modal and entry forms
 */
export async function logEntryAction(formData: FormData) {
  try {
    // Parse and validate input
    const habitId = formData.get('habitId') as string
    const dateStr = formData.get('date') as string
    const value = Number(formData.get('value'))
    
    const validatedData = LogEntrySchema.parse({
      habitId,
      date: dateStr || new Date().toISOString(),
      value,
    })
    
    // Convert date string to Date object
    const date = new Date(validatedData.date)
    
    // Create/update entry through DAL (includes auth & ownership check)
    await upsertEntry(
      validatedData.habitId,
      date,
      validatedData.value
    )
    
    // Revalidate relevant pages
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/habits/${validatedData.habitId}`)
    
    return {
      success: true,
      message: 'Entry logged successfully',
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
    
    console.error('Log entry error:', error)
    return {
      error: 'Failed to log entry',
    }
  }
}

/**
 * Quick log entry for today
 * Simplified version for quick logging
 */
export async function quickLogEntryAction(
  habitId: string,
  value: number
) {
  try {
    // Validate input
    if (!habitId || value <= 0) {
      return {
        error: 'Invalid input',
      }
    }
    
    // Log for today
    await upsertEntry(habitId, new Date(), value)
    
    // Revalidate
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/habits/${habitId}`)
    
    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Quick log error:', error)
    return {
      error: 'Failed to log entry',
    }
  }
}

/**
 * Delete an entry
 * CRITICAL: DAL verifies ownership
 */
export async function deleteEntryAction(entryId: string) {
  try {
    if (!entryId) {
      return {
        error: 'Entry ID is required',
      }
    }
    
    // Delete through DAL (includes auth & ownership check)
    await deleteEntry(entryId)
    
    // Revalidate
    revalidatePath('/dashboard')
    
    return {
      success: true,
      message: 'Entry deleted successfully',
    }
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Delete entry error:', error)
    return {
      error: 'Failed to delete entry',
    }
  }
}

/**
 * Import multiple entries at once
 * For CSV import or bulk operations
 */
export async function importEntriesAction(
  habitId: string,
  csvData: string
) {
  try {
    // Parse CSV data (simplified - you'd want a proper CSV parser)
    const lines = csvData.trim().split('\n')
    const entries = []
    
    for (const line of lines.slice(1)) { // Skip header
      const [dateStr, valueStr] = line.split(',')
      if (dateStr && valueStr) {
        entries.push({
          date: new Date(dateStr.trim()),
          value: Number(valueStr.trim()),
        })
      }
    }
    
    // Validate parsed data
    const validatedData = BulkEntriesSchema.parse({
      habitId,
      entries,
    })
    
    // Create entries through DAL
    await createBulkEntries(
      validatedData.habitId,
      validatedData.entries.map(e => ({
        date: new Date(e.date),
        value: e.value,
      }))
    )
    
    // Revalidate
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/habits/${habitId}`)
    
    return {
      success: true,
      message: `Imported ${entries.length} entries successfully`,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Invalid CSV data',
        details: error.issues,
      }
    }
    
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Import entries error:', error)
    return {
      error: 'Failed to import entries',
    }
  }
}

/**
 * Get statistics for a habit
 * Used in the stats display component
 */
export async function getHabitStatsAction(
  habitId: string,
  period: 'week' | 'month' | 'year' = 'month'
) {
  try {
    if (!habitId) {
      return {
        error: 'Habit ID is required',
      }
    }
    
    // Get stats through DAL (includes auth check)
    const stats = await getHabitEntryStats(habitId, period)
    
    return {
      success: true,
      stats,
    }
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        error: error.message,
      }
    }
    
    console.error('Get stats error:', error)
    return {
      error: 'Failed to get statistics',
    }
  }
}