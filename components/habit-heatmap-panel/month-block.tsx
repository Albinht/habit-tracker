import type { MonthData } from '@/lib/types/habit'
import { DayCell } from './day-cell'

interface MonthBlockProps {
  monthData: MonthData
  onDayClick: (date: string) => void
}

export function MonthBlock({ monthData, onDayClick }: MonthBlockProps) {
  const { days, startOffset, totalWeeks } = monthData

  // Create grid items including padding
  const gridItems = []
  
  // Add padding cells for start offset
  for (let i = 0; i < startOffset; i++) {
    gridItems.push(
      <div key={`padding-${i}`} className="w-3.5 h-3.5" />
    )
  }
  
  // Add day cells
  days.forEach((day) => {
    gridItems.push(
      <DayCell
        key={day.date}
        day={day}
        onClick={() => onDayClick(day.date)}
      />
    )
  })

  return (
    <div
      className="grid gap-0.5"
      style={{
        gridTemplateRows: 'repeat(7, 13px)',
        gridTemplateColumns: `repeat(${totalWeeks}, 13px)`,
        gridAutoFlow: 'column',
        minWidth: `${totalWeeks * 15}px` // 13px cell + 2px gap
      }}
    >
      {gridItems}
    </div>
  )
}