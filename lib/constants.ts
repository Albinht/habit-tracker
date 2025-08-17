export const FREE_HABIT_LIMIT = 3
export const TRIAL_DAYS = 30

export const PLANS = {
  FREE: {
    name: 'Free',
    habits: FREE_HABIT_LIMIT,
    journals: false,
    customColors: false,
    dataExport: false,
  },
  PRO: {
    name: 'Pro',
    habits: Infinity,
    journals: true,
    customColors: true,
    dataExport: true,
  },
} as const

export const SUBSCRIPTION_PRICES = {
  monthly: {
    amount: 500,
    currency: 'usd',
    interval: 'month' as const,
  },
  yearly: {
    amount: 5000,
    currency: 'usd',
    interval: 'year' as const,
  },
}

export const DEFAULT_HABIT_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
]