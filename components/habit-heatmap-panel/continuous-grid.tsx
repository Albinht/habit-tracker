'use client'

import type { DayData } from '@/lib/types/habit'
import { DayCell } from './day-cell'

interface ContinuousGridProps {
  gridDays: (DayData | null)[][]
  onDayClick: (date: string) => void
}

export function ContinuousGrid({ gridDays, onDayClick }: ContinuousGridProps) {
  return (
    <div 
      className="grid gap-[var(--cell-gap)] lg:w-full"
      style={{
        gridTemplateRows: 'repeat(7, var(--cell-size))',
        gridTemplateColumns: `repeat(53, var(--cell-size))`,
        gridAutoFlow: 'column',
        minWidth: 'calc(53 * var(--cell-total))'
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
                style={{
                  width: 'var(--cell-size)',
                  height: 'var(--cell-size)'
                }}
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
  )
}