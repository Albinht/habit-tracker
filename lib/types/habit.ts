export type HabitId = string;

export type Habit = {
  id: HabitId;
  name: string;                 // e.g., "Waking up before 7:30"
  color: string;                // user-selected HEX (e.g., "#FFB000")
  createdAt: string;            // ISO date
  archived?: boolean;
};

export type HabitEntry = {
  habitId: HabitId;
  date: string;                 // ISO "YYYY-MM-DD" in user's local TZ
  value: 0 | 1;                 // 1 = completed, 0 = missed
  journal?: string;             // optional free text
};

export type HabitStats = {
  longestStreak: number;        // in days
  numberOfEntries: number;      // count of days with any entry (0 or 1)
  average: number;              // mean of value (0..1)
  stdDev: number;               // standard deviation of value
  total: number;                // sum of value (successful days)
  currentStreak: number;        // current consecutive streak
};

export type YearRange = {
  year: number;                 // e.g., 2025
  start: string;                // "2025-01-01"
  end: string;                  // "2025-12-31"
};

export type DayData = {
  date: string;                 // ISO "YYYY-MM-DD"
  value: 0 | 1 | null;         // null = no entry
  journal?: string;
  isToday: boolean;
  weekday: number;              // 1-7 (1=Mon)
};

export type MonthData = {
  month: number;                // 0-11 (0=Jan)
  year: number;
  name: string;                 // "Jan", "Feb", etc.
  days: DayData[];
  startOffset: number;          // days to pad at start (0-6)
  totalWeeks: number;           // number of week columns needed
};

export type ColorRamp = {
  accent: string;               // --habit-accent
  weak: string;                 // --cell-weak
  mid: string;                  // --cell-mid
  strong: string;               // --cell-strong
  outline: string;              // --cell-outline
};