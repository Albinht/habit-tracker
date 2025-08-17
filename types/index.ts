import { User, Habit, Entry, Journal, Subscription } from '@prisma/client'

export type SafeUser = Omit<User, 'password'>

export type HabitWithEntries = Habit & {
  entries: Entry[]
  journals?: Journal[]
  _count?: {
    entries: number
    journals: number
  }
}

export type UserWithSubscription = User & {
  subscription: Subscription | null
}

export type HeatMapData = {
  date: string
  value: number
  journal?: string
}

export type Stats = {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  average: number
  standardDeviation: number
}