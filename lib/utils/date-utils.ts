import { format, startOfYear, endOfYear, eachDayOfInterval, getISODay, isToday as dateFnsIsToday, subDays, startOfWeek, addDays } from 'date-fns';
import type { YearRange, DayData, MonthData, HabitEntry } from '../types/habit';

/**
 * Generate all days for a given year
 */
export function generateYearDays(year: number): Date[] {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  return eachDayOfInterval({ start, end });
}

/**
 * Format date to ISO string in local timezone (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsIsToday(dateObj);
}

/**
 * Get ISO weekday (1=Monday, 7=Sunday)
 */
export function getWeekday(date: Date): number {
  return getISODay(date);
}

/**
 * Create YearRange object
 */
export function createYearRange(year: number): YearRange {
  return {
    year,
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
}

/**
 * Get month name abbreviation
 */
export function getMonthName(monthIndex: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
}

/**
 * Calculate how many days to pad at the start of a month
 * for Monday-first calendar layout
 */
export function getMonthStartOffset(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const weekday = getWeekday(firstDay);
  // Convert to 0-6 where 0=Monday
  return (weekday - 1) % 7;
}

/**
 * Calculate total weeks needed for a month
 */
export function getMonthWeekCount(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = getMonthStartOffset(year, month);
  return Math.ceil((daysInMonth + startOffset) / 7);
}

/**
 * Convert entries array to map for quick lookup
 */
export function createEntriesMap(entries: HabitEntry[]): Map<string, HabitEntry> {
  return new Map(entries.map(entry => [entry.date, entry]));
}

/**
 * Generate month data for heatmap rendering
 */
export function generateMonthData(
  year: number, 
  entries: HabitEntry[]
): MonthData[] {
  const entriesMap = createEntriesMap(entries);
  const months: MonthData[] = [];

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = getMonthStartOffset(year, month);
    const totalWeeks = getMonthWeekCount(year, month);
    
    const days: DayData[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateISO(date);
      const entry = entriesMap.get(dateStr);
      
      days.push({
        date: dateStr,
        value: entry ? entry.value : null,
        journal: entry?.journal,
        isToday: isToday(date),
        weekday: getWeekday(date)
      });
    }

    months.push({
      month,
      year,
      name: getMonthName(month),
      days,
      startOffset,
      totalWeeks
    });
  }

  return months;
}

/**
 * Get all dates in a year as strings
 */
export function getAllYearDates(year: number): string[] {
  return generateYearDays(year).map(formatDateISO);
}

/**
 * Generate rolling 365 days ending on today
 */
export function generateRolling365Days(): Date[] {
  const today = new Date();
  const startDate = subDays(today, 364); // 365 days including today
  return eachDayOfInterval({ start: startDate, end: today });
}

/**
 * Generate rolling heatmap data for continuous grid
 * Creates exactly 53 weeks × 7 days grid ending on today
 */
export function generateRollingHeatmapData(entries: HabitEntry[]): {
  gridDays: (DayData | null)[][];
  monthLabels: { name: string; column: number }[];
} {
  const today = new Date();
  
  // Find the Sunday that starts the week containing today
  const endWeekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday = 0
  
  // Go back 52 more weeks to get 53 total weeks
  const startDate = subDays(endWeekStart, 52 * 7);
  
  // Generate all days in the 53-week period
  const allDates = eachDayOfInterval({ 
    start: startDate, 
    end: addDays(endWeekStart, 6) // End on Saturday of this week
  });
  
  // Create entries map for quick lookup
  const entriesMap = createEntriesMap(entries);
  
  // Create 53 weeks × 7 days grid
  const gridDays: (DayData | null)[][] = [];
  
  for (let week = 0; week < 53; week++) {
    const weekDays: (DayData | null)[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dateIndex = week * 7 + day;
      
      if (dateIndex < allDates.length) {
        const date = allDates[dateIndex];
        const dateStr = formatDateISO(date);
        const entry = entriesMap.get(dateStr);
        
        weekDays.push({
          date: dateStr,
          value: entry ? entry.value : null,
          journal: entry?.journal,
          isToday: isToday(date),
          weekday: getWeekday(date)
        });
      } else {
        weekDays.push(null); // Empty cell for padding
      }
    }
    
    gridDays.push(weekDays);
  }
  
  // Calculate month labels positions
  const monthLabels: { name: string; column: number }[] = [];
  let lastMonth = '';
  
  for (let week = 0; week < 53; week++) {
    const firstDayOfWeek = gridDays[week][0];
    if (firstDayOfWeek) {
      const month = format(new Date(firstDayOfWeek.date), 'MMM');
      if (month !== lastMonth) {
        monthLabels.push({ name: month, column: week });
        lastMonth = month;
      }
    }
  }
  
  return { gridDays, monthLabels };
}

/**
 * Get date range string for rolling view
 */
export function getRollingDateRange(): string {
  const today = new Date();
  const startDate = subDays(today, 364);
  return `${format(startDate, 'MMM d, yyyy')} - ${format(today, 'MMM d, yyyy')}`;
}