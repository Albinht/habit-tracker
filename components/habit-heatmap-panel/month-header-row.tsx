import type { MonthData } from '@/lib/types/habit'

interface MonthHeaderRowProps {
  monthsData: MonthData[]
}

export function MonthHeaderRow({ monthsData }: MonthHeaderRowProps) {
  return (
    <div className="flex text-xs text-gray-500">
      {/* Month labels */}
      {monthsData.map((monthData) => {
        const monthWidth = monthData.totalWeeks * 12 // 10px cell + 2px gap
        
        return (
          <div 
            key={`${monthData.year}-${monthData.month}`}
            className="font-medium text-xs"
            style={{ width: `${monthWidth}px`, minWidth: '16px' }}
          >
            {monthData.name}
          </div>
        )
      })}
    </div>
  )
}