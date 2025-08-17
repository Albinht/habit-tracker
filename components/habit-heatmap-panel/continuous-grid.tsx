'use client'

import type { DayData } from '@/lib/types/habit'
import { DayCell } from './day-cell'

interface ContinuousGridProps {
  gridDays: (DayData | null)[][]
  onDayClick: (date: string) => void
}

export function ContinuousGrid({ gridDays, onDayClick }: ContinuousGridProps) {
  return (
    <div className="flex-1 overflow-x-auto">
      <div 
        className="grid gap-0.5"
        style={{
          gridTemplateRows: 'repeat(7, 13px)',
          gridTemplateColumns: 'repeat(53, 13px)',
          gridAutoFlow: 'column',
          minWidth: '750px' // Ensure minimum width for mobile scroll
        }}
      >
        {/* Render all cells in column-first order */}
        {gridDays.map((week, weekIndex) => 
          week.map((day, dayIndex) => {
            if (!day) {
              // Empty cell for padding
              return (
                <div 
                  key={`empty-${weekIndex}-${dayIndex}`}
                  className="w-[13px] h-[13px]"
                />
              )
            }
            
            return (
              <DayCell
                key={day.date}
                day={day}
                onClick={() => onDayClick(day.date)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}