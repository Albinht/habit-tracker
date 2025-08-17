import type { MonthData } from '@/lib/types/habit'
import { MonthBlock } from './month-block'

interface HeatmapGridProps {
  monthsData: MonthData[]
  onDayClick: (date: string) => void
}

export function HeatmapGrid({ monthsData, onDayClick }: HeatmapGridProps) {
  return (
    <div className="flex-1">
      <div className="flex">
        {monthsData.map((monthData) => (
          <MonthBlock
            key={`${monthData.year}-${monthData.month}`}
            monthData={monthData}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  )
}