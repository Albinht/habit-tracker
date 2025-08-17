'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  ChevronRight,
  ArrowRight,
  Calendar,
  Trash2
} from 'lucide-react'
import { format, subDays, eachDayOfInterval, getDay, isToday } from 'date-fns'
import { Habit, Entry } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface HabitCardWithHeatmapProps {
  habit: Pick<Habit, 'id' | 'name' | 'description' | 'color' | 'unit' | 'goalValue' | 'goalType'> & {
    entries: Pick<Entry, 'id' | 'value' | 'date'>[]
  }
}

export function HabitCardWithHeatmap({ habit }: HabitCardWithHeatmapProps) {
  const [logValue, setLogValue] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const router = useRouter()

  // Calculate statistics
  const calculateStats = () => {
    const entries = habit.entries
    const totalEntries = entries.length
    const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0)
    const average = totalEntries > 0 ? totalValue / totalEntries : 0
    
    // Calculate standard deviation
    const variance = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + Math.pow(entry.value - average, 2), 0) / totalEntries
      : 0
    const standardDeviation = Math.sqrt(variance)

    // Calculate streaks
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd')
    
    // Check if there's an entry today or yesterday to start current streak
    const hasEntryToday = sortedEntries.some(e => format(new Date(e.date), 'yyyy-MM-dd') === todayStr)
    const hasEntryYesterday = sortedEntries.some(e => format(new Date(e.date), 'yyyy-MM-dd') === yesterdayStr)
    
    if (hasEntryToday || hasEntryYesterday) {
      let checkDate = hasEntryToday ? today : subDays(today, 1)
      
      while (true) {
        const checkDateStr = format(checkDate, 'yyyy-MM-dd')
        const hasEntry = sortedEntries.some(e => format(new Date(e.date), 'yyyy-MM-dd') === checkDateStr)
        
        if (hasEntry) {
          currentStreak++
          checkDate = subDays(checkDate, 1)
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    const entryDates = new Set(entries.map(e => format(new Date(e.date), 'yyyy-MM-dd')))
    const allDates = eachDayOfInterval({ start: subDays(today, 365), end: today })
    
    for (const date of allDates) {
      const dateStr = format(date, 'yyyy-MM-dd')
      if (entryDates.has(dateStr)) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return {
      totalEntries,
      totalValue,
      average,
      standardDeviation,
      currentStreak,
      longestStreak
    }
  }

  const stats = calculateStats()

  const handleQuickLog = async () => {
    if (!logValue || isLogging) return
    
    setIsLogging(true)
    try {
      const response = await fetch(`/api/habits/${habit.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          value: parseFloat(logValue),
        }),
      })

      if (response.ok) {
        setLogValue('')
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to log entry:', error)
    } finally {
      setIsLogging(false)
    }
  }

  const renderHeatMap = () => {
    const today = new Date()
    const yearAgo = subDays(today, 364)
    const days = eachDayOfInterval({ start: yearAgo, end: today })

    // Create a map for quick lookup
    const entryMap = new Map(
      habit.entries.map(entry => [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        entry.value
      ])
    )

    // Calculate max value for intensity scaling
    const maxValue = Math.max(...habit.entries.map(e => e.value), 1)

    // Group days by weeks
    const weeks: Array<Array<{ date: string; value: number; intensity: number; dayOfWeek: number }>> = []
    let currentWeek: Array<{ date: string; value: number; intensity: number; dayOfWeek: number }> = []

    days.forEach((date, index) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const value = entryMap.get(dateStr) || 0
      const intensity = value > 0 ? (value / maxValue) : 0

      // Start new week on Sunday (day 0)
      if (getDay(date) === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push({
        date: dateStr,
        value,
        intensity,
        dayOfWeek: getDay(date)
      })

      // Push the last week
      if (index === days.length - 1) {
        weeks.push(currentWeek)
      }
    })

    // Reverse weeks array so recent dates appear on the left
    weeks.reverse()

    // Get month labels (account for reversed order)
    const monthLabels: { name: string; position: number }[] = []
    let lastMonth = ''
    weeks.forEach((week, weekIndex) => {
      // Since weeks are reversed, use the last day of week for month check
      const lastDayOfWeek = week[week.length - 1]
      const month = format(new Date(lastDayOfWeek.date), 'MMM')
      if (month !== lastMonth) {
        monthLabels.push({ name: month, position: weekIndex })
        lastMonth = month
      }
    })

    // Function to convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    // Function to create color with opacity/lightness
    const getColorWithIntensity = (baseColor: string, intensity: number) => {
      const rgb = hexToRgb(baseColor)
      // Mix with white for lighter shades
      const mixRatio = 0.2 + (intensity * 0.8) // Range from 20% to 100% color intensity
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${mixRatio})`
    }

    const getColor = (intensity: number, value: number) => {
      if (value === 0) return '#f3f4f6' // Light gray for no entry
      
      // Use the habit's color with varying intensity
      return getColorWithIntensity(habit.color, intensity)
    }

    const weekdays = ['Mon', '', 'Wed', '', 'Fri', '', '']

    return (
      <TooltipProvider>
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-[800px] sm:min-w-full">
            {/* Month labels */}
            <div className="flex mb-2">
              <div className="w-8" />
              <div className="flex">
                {monthLabels.map((month, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600"
                    style={{
                      marginLeft: index === 0 ? `${month.position * 12}px` : '12px',
                      minWidth: '36px'
                    }}
                  >
                    {month.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex">
              {/* Weekday labels */}
              <div className="flex flex-col justify-between mr-2">
                {weekdays.map((day, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-500 h-3 flex items-center"
                    style={{ visibility: day ? 'visible' : 'hidden' }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Heat map grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = week.find(d => d.dayOfWeek === dayIndex)
                      
                      if (!day) {
                        return <div key={dayIndex} className="w-3 h-3" />
                      }

                      const isCurrentDay = isToday(new Date(day.date))

                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-400 hover:ring-offset-1 transition-all ${
                                isCurrentDay ? 'ring-2 ring-black' : ''
                              }`}
                              style={{ 
                                backgroundColor: getColor(day.intensity, day.value),
                                border: '1px solid #e5e7eb'
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-semibold">
                                {format(new Date(day.date), 'MMM d, yyyy')}
                              </div>
                              {day.value > 0 ? (
                                <div>
                                  {day.value} {habit.unit || 'logged'}
                                </div>
                              ) : (
                                <div className="text-gray-500">No entry</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl text-gray-900 truncate">{habit.name}</CardTitle>
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
          </div>
          <Link href={`/dashboard/habits/${habit.id}`}>
            <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px] p-2">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {habit.description && (
          <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Heat Map */}
        <div>
          {renderHeatMap()}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-600">
          <div>
            <span className="font-medium block sm:inline">Longest streak:</span>{' '}
            <span className="text-gray-900">{stats.longestStreak} days</span>
          </div>
          <div>
            <span className="font-medium block sm:inline">Streak:</span>{' '}
            <span className="text-gray-900">{stats.currentStreak} days</span>
          </div>
          <div>
            <span className="font-medium block sm:inline">Entries:</span>{' '}
            <span className="text-gray-900">{stats.totalEntries}</span>
          </div>
          <div>
            <span className="font-medium block sm:inline">Average:</span>{' '}
            <span className="text-gray-900">{stats.average.toFixed(2)}</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-medium">Std dev:</span>{' '}
            <span className="text-gray-900">{stats.standardDeviation.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-medium block sm:inline">Total:</span>{' '}
            <span className="text-gray-900">
              {stats.totalValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick Log Section */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <Label htmlFor={`quick-log-${habit.id}`} className="sr-only">
                Log today's value
              </Label>
              <Input
                id={`quick-log-${habit.id}`}
                type="number"
                placeholder={`Enter ${habit.unit || 'value'} for today`}
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                className="text-sm min-h-[44px]"
              />
            </div>
            <Button 
              onClick={handleQuickLog}
              disabled={!logValue || isLogging}
              className="bg-black text-white hover:bg-gray-800 min-h-[44px] text-base sm:text-sm"
            >
              {isLogging ? 'Logging...' : 'Log today'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}