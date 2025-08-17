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
      <div 
        key={`padding-${i}`} 
        style={{ 
          width: 'var(--cell-size)', 
          height: 'var(--cell-size)' 
        }} 
      />
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
      className="grid month-block"
      style={{
        gridTemplateRows: 'repeat(7, var(--cell-size))',
        gridTemplateColumns: `repeat(${totalWeeks}, var(--cell-size))`,
        gridAutoFlow: 'column',
        gap: 'var(--cell-gap)'
      }}
    >
      {gridItems}
    </div>
  )
}