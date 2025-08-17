import { Entry } from '@prisma/client'
import { Stats } from '@/types'
import crypto from 'crypto'

export function generateEmbedToken(): string {
  return `hab_${crypto.randomBytes(16).toString('hex')}`
}

export function calculateStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0

  const sortedEntries = entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let currentDate = new Date(today)

  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date)
    entryDate.setHours(0, 0, 0, 0)

    const diffTime = currentDate.getTime() - entryDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = new Date(entryDate)
    } else {
      break
    }
  }

  return streak
}

export function calculateStats(entries: Entry[]): Stats {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      average: 0,
      standardDeviation: 0,
    }
  }

  const values = entries.map(e => e.value)
  const average = values.reduce((a, b) => a + b, 0) / values.length

  const squaredDifferences = values.map(value => Math.pow(value - average, 2))
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / values.length
  const standardDeviation = Math.sqrt(variance)

  const currentStreak = calculateStreak(entries)
  const longestStreak = calculateLongestStreak(entries)

  return {
    currentStreak,
    longestStreak,
    totalEntries: entries.length,
    average: Number(average.toFixed(2)),
    standardDeviation: Number(standardDeviation.toFixed(2)),
  }
}

function calculateLongestStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0

  const sortedEntries = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i - 1].date)
    const currDate = new Date(sortedEntries[i].date)
    
    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)

    const diffTime = currDate.getTime() - prevDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else if (diffDays > 1) {
      currentStreak = 1
    }
  }

  return maxStreak
}

export function getHeatMapColor(value: number, maxValue: number, color: string): string {
  if (value === 0) return '#f3f4f6'
  
  const intensity = value / maxValue
  const opacity = 0.2 + (intensity * 0.8)
  
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}