'use client'

import { useMemo } from 'react'
import { Entry } from '@prisma/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { format, startOfWeek, eachDayOfInterval, subDays, getDay, isToday, startOfMonth, getMonth, getYear } from 'date-fns'

interface HeatMapHorizontalProps {
  entries: Entry[]
  color?: string
  unit?: string | null
  goalValue?: number | null
  compact?: boolean
}

export function HeatMapHorizontal({ 
  entries, 
  color = '#000000',
  unit,
  goalValue,
  compact = false
}: HeatMapHorizontalProps) {
  const data = useMemo(() => {
    const today = new Date()
    const daysToShow = compact ? 90 : 365 // Show fewer days in compact mode
    const startDate = subDays(today, daysToShow - 1)
    
    const days = eachDayOfInterval({ start: startDate, end: today })
    
    const entryMap = new Map(
      entries.map(entry => [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        entry.value
      ])
    )
    
    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const value = entryMap.get(dateStr) || 0
      
      // Calculate intensity based on goal or value
      let intensity = 0
      if (value > 0) {
        if (goalValue && goalValue > 0) {
          intensity = Math.min(value / goalValue, 1)
        } else {
          // No goal set, use relative intensity
          const maxValue = Math.max(...entries.map(e => e.value), 1)
          intensity = value / maxValue
        }
      }
      
      return {
        date: dateStr,
        value,
        intensity,
        dayOfWeek: getDay(date),
        month: getMonth(date),
        year: getYear(date),
        isToday: isToday(date),
        formattedDate: format(date, 'MMM d, yyyy'),
        dayOfMonth: format(date, 'd'),
        weekNumber: Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      }
    })
  }, [entries, goalValue])

  // Group by weeks and organize by day of week
  const calendar = useMemo(() => {
    // Create a 7x53 grid (7 days x 53 weeks max)
    const grid: (typeof data[0] | null)[][] = Array(7).fill(null).map(() => [])
    
    // Map days to Monday = 0, Sunday = 6
    const dayMapping = (day: number) => day === 0 ? 6 : day - 1
    
    data.forEach(day => {
      const mappedDay = dayMapping(day.dayOfWeek)
      grid[mappedDay].push(day)
    })
    
    // Pad beginning with nulls to align first week
    const firstDay = data[0]
    if (firstDay) {
      const mappedFirstDay = dayMapping(firstDay.dayOfWeek)
      for (let i = 0; i < mappedFirstDay; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          grid[i].unshift(null)
        }
      }
    }
    
    return grid
  }, [data])

  // Get month labels and positions
  const monthLabels = useMemo(() => {
    const labels: { name: string; position: number }[] = []
    let lastMonth = -1
    
    calendar[0].forEach((day, index) => {
      if (day && day.month !== lastMonth) {
        labels.push({
          name: format(new Date(day.date), 'MMM'),
          position: index
        })
        lastMonth = day.month
      }
    })
    
    return labels
  }, [calendar])

  const getColor = (intensity: number) => {
    if (intensity === 0) return '#f3f4f6' // Very light gray for empty days
    
    // Use black with precise grayscale progression for goal-based progress
    if (color === '#000000') {
      // More granular progression for better goal visualization
      if (intensity >= 1) return '#000000'     // 100%+ goal achieved - Full black
      if (intensity >= 0.9) return '#1a1a1a'  // 90% goal achieved
      if (intensity >= 0.8) return '#333333'  // 80% goal achieved  
      if (intensity >= 0.7) return '#4d4d4d'  // 70% goal achieved
      if (intensity >= 0.6) return '#666666'  // 60% goal achieved
      if (intensity >= 0.5) return '#808080'  // 50% goal achieved
      if (intensity >= 0.4) return '#999999'  // 40% goal achieved
      if (intensity >= 0.3) return '#b3b3b3'  // 30% goal achieved
      if (intensity >= 0.2) return '#cccccc'  // 20% goal achieved
      if (intensity >= 0.1) return '#e0e0e0'  // 10% goal achieved
      return '#eeeeee'                        // <10% goal achieved
    } else {
      // For colored themes (keeping original logic)
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      const opacity = 0.15 + (intensity * 0.85) // Slightly more contrast
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
  }

  const weekdays = ['Mon', '', 'Wed', '', 'Fri', '', '']

  return (
    <TooltipProvider>
      <div className={`${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="flex gap-3">
          {/* Weekday labels */}
          <div className="flex flex-col justify-between" style={{ paddingTop: '20px' }}>
            {weekdays.map((day, index) => (
              <div
                key={index}
                className="text-gray-500 flex items-center text-xs"
                style={{ height: compact ? '10px' : '13px' }}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Main calendar grid */}
          <div>
            {/* Month labels */}
            <div className="flex mb-1" style={{ paddingLeft: '2px' }}>
              {monthLabels.map((month, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600"
                  style={{
                    marginLeft: index === 0 ? `${month.position * (compact ? 10 : 13)}px` : '10px',
                    minWidth: '30px'
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
            
            {/* Heat map grid */}
            <div className="flex flex-col gap-1">
              {calendar.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {row.map((day, colIndex) => {
                    if (!day) {
                      return <div key={colIndex} className={compact ? "w-2 h-2" : "w-3 h-3"} />
                    }
                    
                    const percentOfGoal = goalValue && day.value > 0 
                      ? Math.round((day.value / goalValue) * 100)
                      : null
                    
                    return (
                      <Tooltip key={colIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-[2px] cursor-pointer hover:ring-1 hover:ring-gray-300 hover:ring-offset-1 transition-all ${
                              day.isToday ? 'ring-1 ring-black' : ''
                            }`}
                            style={{ 
                              backgroundColor: getColor(day.intensity),
                              border: day.isToday ? '1px solid #000000' : '1px solid #e5e7eb'
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-semibold">
                              {day.formattedDate}
                            </div>
                            {day.value > 0 ? (
                              <>
                                <div>
                                  {day.value} {unit || 'logged'}
                                </div>
                                {percentOfGoal !== null && (
                                  <div className="text-xs text-gray-500">
                                    {percentOfGoal}% of goal
                                  </div>
                                )}
                              </>
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