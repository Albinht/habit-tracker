import type { HabitEntry } from '@/lib/types/habit'

interface PrismaEntry {
  id: string
  value: number
  date: Date | string
}

interface PrismaHabit {
  id: string
  name: string
  color: string
  goalValue: number | null
  entries: PrismaEntry[]
}

/**
 * Convert Prisma habit entries to HeatmapPanel format
 * Converts numeric values to binary (0/1) based on goal achievement
 */
export function convertHabitEntries(
  habitId: string,
  entries: PrismaEntry[],
  goalValue: number | null
): HabitEntry[] {
  const defaultGoal = goalValue ?? 1 // Use 1 as default if goalValue is null
  return entries.map(entry => ({
    habitId,
    date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : entry.date,
    value: entry.value >= defaultGoal ? 1 : 0, // Binary: 1 if goal met, 0 if not
    // Note: journal entries would need to be added to the Prisma schema
    // journal: entry.journal || undefined
  }))
}

/**
 * Convert Prisma habit to HeatmapPanel format
 */
export function convertHabitToHeatmapFormat(habit: PrismaHabit) {
  return {
    id: habit.id,
    name: habit.name,
    color: habit.color,
    createdAt: new Date().toISOString(),
    entries: convertHabitEntries(habit.id, habit.entries, habit.goalValue)
  }
}

/**
 * Simple seeded random number generator for consistent results
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Generate sample data for landing page demo with consistent seeded randomness
 */
export function generateSampleHabitData(): { habit: any; entries: HabitEntry[] } {
  const habitId = 'sample-habit'
  const today = new Date()
  const entries: HabitEntry[] = []
  
  // Use a fixed seed for consistent results across server/client
  let seed = 12345
  
  // Generate entries for the past 365 days with realistic patterns
  for (let i = 0; i < 365; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    
    // Create realistic completion patterns
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Higher chance of completion on weekdays (85%), lower on weekends (65%)
    const completionChance = isWeekend ? 0.65 : 0.85
    
    // Add some variation based on month (winter months slightly lower)
    const month = date.getMonth()
    const winterPenalty = (month === 11 || month === 0 || month === 1) ? 0.1 : 0
    
    // Use seeded random instead of Math.random()
    const randomValue = seededRandom(seed++)
    const shouldComplete = randomValue > (0.3 + winterPenalty - (completionChance - 0.7))
    
    if (shouldComplete) {
      // Use seeded random for journal entries too
      const journalRandom = seededRandom(seed++)
      entries.push({
        habitId,
        date: dateStr,
        value: 1,
        // Add occasional journal entries
        journal: journalRandom > 0.9 ? getSampleJournalEntry() : undefined
      })
    }
  }
  
  const habit = {
    id: habitId,
    name: 'Morning Meditation',
    color: '#10b981', // Green
    createdAt: new Date().toISOString()
  }
  
  return { habit, entries }
}

function getSampleJournalEntry(): string {
  const entries = [
    'Great session today, felt very focused',
    'Had trouble concentrating but pushed through',
    'Perfect 20 minutes of peace',
    'Mind was busy but managed to observe thoughts',
    'Felt grateful and centered',
    'Quick session but effective',
    'Deep breathing helped me start the day right',
    'Noticed improvement in staying present'
  ]
  
  return entries[Math.floor(Math.random() * entries.length)]
}