'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronDown, ChevronUp, Calendar, Target, Flame, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns'

interface DayData {
  date: string
  totalValue: number
  completedHabits: number
  totalHabits: number
  completionRate: number
}

interface OverviewData {
  totalHabits: number
  totalEntries: number
  daysWithActivity: number
  averageCompletionRate: number
  currentStreak: number
  longestStreak: number
  dailyData: DayData[]
}

export function YearOverview() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchOverview = async () => {
    try {
      setError(null)
      const response = await fetch('/api/dashboard/overview')
      if (!response.ok) {
        throw new Error('Failed to fetch overview data')
      }
      const overview = await response.json()
      setData(overview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [refreshTrigger])

  // Add window focus listener to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (!document.hidden) {
        setRefreshTrigger(prev => prev + 1)
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setRefreshTrigger(prev => prev + 1)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Optional: Add periodic refresh when tab is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && data) {
        setRefreshTrigger(prev => prev + 1)
      }
    }, 30000) // Refresh every 30 seconds when active

    return () => clearInterval(interval)
  }, [data])

  const getActivityColor = (dayData: DayData) => {
    if (dayData.totalValue === 0 && dayData.completedHabits === 0) return '#f3f4f6' // No activity
    
    // Combine completion rate and total activity for more nuanced coloring
    const activity = dayData.totalValue + dayData.completedHabits
    const maxActivity = Math.max(...(data?.dailyData || []).map(d => d.totalValue + d.completedHabits), 1)
    const intensity = activity / maxActivity
    
    // Use a gradient from light to bright colors based on activity
    if (intensity >= 1) return '#f59e0b'      // Bright orange for maximum activity
    if (intensity >= 0.8) return '#fbbf24'   // Medium-bright yellow
    if (intensity >= 0.6) return '#fcd34d'   // Medium yellow  
    if (intensity >= 0.4) return '#fde68a'   // Light yellow
    if (intensity >= 0.2) return '#fef3c7'   // Very light yellow
    return '#fffbeb'                         // Minimal yellow
  }

  const renderHeatMap = () => {
    if (!data) return null

    const today = new Date()
    const yearAgo = subDays(today, 364)
    const days = eachDayOfInterval({ start: yearAgo, end: today })

    // Create a map for quick lookup
    const dataMap = new Map(data.dailyData.map(d => [d.date, d]))

    // Group days by weeks
    const weeks: DayData[][] = []
    let currentWeek: DayData[] = []

    days.forEach((date, index) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayData = dataMap.get(dateStr) || {
        date: dateStr,
        totalValue: 0,
        completedHabits: 0,
        totalHabits: data.totalHabits,
        completionRate: 0
      }

      // Start new week on Sunday (day 0)
      if (getDay(date) === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push(dayData)

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

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <TooltipProvider>
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-[800px] sm:min-w-full">
            {/* Month labels */}
            <div className="flex mb-2">
              <div className="w-8" /> {/* Space for weekday labels */}
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
                    key={day}
                    className="text-xs text-gray-500 h-3 flex items-center"
                    style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden' }}
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
                      const day = week.find(d => getDay(new Date(d.date)) === dayIndex)
                      
                      if (!day) {
                        return <div key={dayIndex} className="w-3 h-3" />
                      }

                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-400 hover:ring-offset-1 transition-all"
                              style={{ 
                                backgroundColor: getActivityColor(day),
                                border: '1px solid #e5e7eb'
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-semibold">
                                {format(new Date(day.date), 'MMM d, yyyy')}
                              </div>
                              <div>
                                {day.completedHabits} of {day.totalHabits} habits logged
                              </div>
                              <div>
                                Total activity: {day.totalValue}
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.round(day.completionRate)}% completion rate
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <span>Less activity</span>
              <div className="flex gap-1">
                {['#f3f4f6', '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'].map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-sm border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span>More activity</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="mb-8 border-red-200 bg-red-50">
        <CardContent className="py-4">
          <p className="text-red-600 text-sm">
            {error || 'Failed to load year overview'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Your Year in Review</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-gray-900">
                <Image src="/scribble final version-104.svg" alt="Total Habits" width={16} height={16} className="h-4 w-4 sm:h-5 sm:w-5" />
                {data.totalHabits}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Total Habits</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-gray-900">
                <Image src="/scribble final version-126.svg" alt="Average Completion" width={16} height={16} className="h-4 w-4 sm:h-5 sm:w-5" />
                {data.averageCompletionRate}%
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Avg Completion</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-gray-900">
                <Image src="/scribble final version-148.svg" alt="Current Streak" width={16} height={16} className="h-4 w-4 sm:h-5 sm:w-5" />
                {data.currentStreak}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Current Streak</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-gray-900">
                <Image src="/scribble final version-05.svg" alt="Best Streak" width={16} height={16} className="h-4 w-4 sm:h-5 sm:w-5" />
                {data.longestStreak}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Best Streak</p>
            </div>
          </div>

          {/* Heat Map */}
          <div className="border-t pt-4 sm:pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 sm:mb-4">
              All Habits Combined - Last 365 Days
            </h4>
            <p className="text-xs text-gray-500 mb-3 sm:mb-4">
              View your combined habit activity across all habits. Darker colors indicate more activity.
            </p>
            {renderHeatMap()}
          </div>
        </CardContent>
      )}
    </Card>
  )
}