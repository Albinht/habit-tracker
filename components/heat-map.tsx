'use client'

import { useMemo } from 'react'
import { Entry } from '@prisma/client'
import { getHeatMapColor } from '@/lib/habit-utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { format, startOfYear, eachDayOfInterval, getDay, addDays, subDays } from 'date-fns'

interface HeatMapProps {
  entries: Entry[]
  color?: string
  showMonthLabels?: boolean
  showWeekdayLabels?: boolean
  unit?: string | null
}

export function HeatMap({ 
  entries, 
  color = '#10b981',
  showMonthLabels = true,
  showWeekdayLabels = true,
  unit
}: HeatMapProps) {
  const data = useMemo(() => {
    const today = new Date()
    const yearAgo = subDays(today, 364)
    
    const days = eachDayOfInterval({ start: yearAgo, end: today })
    
    const entryMap = new Map(
      entries.map(entry => [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        entry.value
      ])
    )
    
    const maxValue = Math.max(...entries.map(e => e.value), 1)
    
    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const value = entryMap.get(dateStr) || 0
      
      return {
        date: dateStr,
        value,
        color: getHeatMapColor(value, maxValue, color),
        dayOfWeek: getDay(date),
        week: Math.floor((date.getTime() - yearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000)),
        month: format(date, 'MMM'),
        day: format(date, 'd'),
      }
    })
  }, [entries, color])

  const weeks = useMemo(() => {
    const weekMap = new Map<number, typeof data>()
    
    data.forEach(day => {
      if (!weekMap.has(day.week)) {
        weekMap.set(day.week, [])
      }
      weekMap.get(day.week)?.push(day)
    })
    
    return Array.from(weekMap.values())
  }, [data])

  const months = useMemo(() => {
    const monthPositions: { name: string; position: number }[] = []
    let lastMonth = ''
    
    weeks.forEach((week, weekIndex) => {
      const month = week[0]?.month
      if (month && month !== lastMonth) {
        monthPositions.push({ name: month, position: weekIndex })
        lastMonth = month
      }
    })
    
    return monthPositions
  }, [weeks])

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="inline-block">
          {showMonthLabels && (
            <div className="flex mb-1">
              {showWeekdayLabels && <div className="w-10" />}
              <div className="flex">
                {months.map((month, index) => (
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
          )}
          
          <div className="flex">
            {showWeekdayLabels && (
              <div className="flex flex-col justify-between mr-2 py-1">
                {weekdays.map((day, index) => (
                  <div
                    key={day}
                    className="text-xs text-gray-600 h-3 flex items-center"
                    style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden' }}
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week.find(d => d.dayOfWeek === dayIndex)
                    
                    if (!day) {
                      return <div key={dayIndex} className="w-3 h-3" />
                    }
                    
                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-400 hover:ring-offset-1 transition-all"
                            style={{ backgroundColor: day.color }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-semibold">
                              {format(new Date(day.date), 'MMM d, yyyy')}
                            </div>
                            {day.value > 0 ? (
                              <div>
                                {day.value} {unit || 'logged'}
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
          
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
                <div
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: intensity === 0 
                      ? '#f3f4f6' 
                      : `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${0.2 + intensity * 0.8})`
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}