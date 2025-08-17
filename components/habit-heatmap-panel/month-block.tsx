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
      <div key={`padding-${i}`} style={{ width: '10px', height: '10px' }} />
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
      className="grid gap-px sm:gap-0.5"
      style={{
        gridTemplateRows: 'repeat(7, 10px)',
        gridTemplateColumns: `repeat(${totalWeeks}, 10px)`,
        gridAutoFlow: 'column',
        minWidth: `${totalWeeks * 12}px` // 10px cell + 2px gap
      }}
    >
      {gridItems}
    </div>
  )
}