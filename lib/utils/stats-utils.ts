import type { HabitEntry, HabitStats } from '../types/habit';
import { getAllYearDates, createEntriesMap, formatDateISO } from './date-utils';

/**
 * Calculate longest consecutive streak of completed days (value=1)
 */
export function calculateLongestStreak(
  allDays: string[], 
  entriesMap: Map<string, HabitEntry>
): number {
  let longest = 0;
  let current = 0;
  
  for (const day of allDays) {
    const entry = entriesMap.get(day);
    if (entry && entry.value === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  
  return longest;
}

/**
 * Calculate current streak ending today or yesterday
 */
export function calculateCurrentStreak(
  allDays: string[], 
  entriesMap: Map<string, HabitEntry>
): number {
  const today = formatDateISO(new Date());
  const yesterday = formatDateISO(new Date(Date.now() - 24 * 60 * 60 * 1000));
  
  // Start from today and work backwards
  let current = 0;
  let started = false;
  
  // Check if we have an entry today or yesterday to start counting
  const hasToday = entriesMap.get(today)?.value === 1;
  const hasYesterday = entriesMap.get(yesterday)?.value === 1;
  
  if (!hasToday && !hasYesterday) {
    return 0;
  }
  
  // Work backwards from today
  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];
    const entry = entriesMap.get(day);
    
    // Start counting from today or yesterday
    if (day === today || day === yesterday) {
      started = true;
    }
    
    if (started) {
      if (entry && entry.value === 1) {
        current++;
      } else {
        break;
      }
    }
  }
  
  return current;
}

/**
 * Calculate all habit statistics for a given year
 */
export function calculateHabitStats(entries: HabitEntry[], year: number): HabitStats {
  const allDays = getAllYearDates(year);
  const entriesMap = createEntriesMap(entries);
  
  // Filter entries for this year only
  const yearEntries = entries.filter(entry => entry.date.startsWith(year.toString()));
  
  const values = yearEntries.map(e => e.value);
  const numberOfEntries = yearEntries.length;
  const total = values.reduce((a, b) => a + b, 0);
  const average = numberOfEntries ? total / numberOfEntries : 0;
  
  // Population standard deviation for binary data (0/1)
  const variance = numberOfEntries ? average * (1 - average) : 0;
  const stdDev = Math.sqrt(variance);
  
  const longestStreak = calculateLongestStreak(allDays, entriesMap);
  const currentStreak = calculateCurrentStreak(allDays, entriesMap);
  
  return {
    longestStreak,
    numberOfEntries,
    average,
    stdDev,
    total,
    currentStreak
  };
}

/**
 * Calculate completion percentage for display
 */
export function calculateCompletionPercentage(stats: HabitStats, totalDaysInYear: number): number {
  return totalDaysInYear > 0 ? (stats.total / totalDaysInYear) * 100 : 0;
}

/**
 * Format statistics for display
 */
export function formatStats(stats: HabitStats) {
  return {
    longestStreak: `${stats.longestStreak} days`,
    numberOfEntries: stats.numberOfEntries.toString(),
    average: stats.average.toFixed(2),
    stdDev: stats.stdDev.toFixed(2),
    total: stats.total.toFixed(0),
    currentStreak: `${stats.currentStreak} days`
  };
}