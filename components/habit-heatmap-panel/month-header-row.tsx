import type { MonthData } from '@/lib/types/habit'

interface MonthHeaderRowProps {
  monthsData: MonthData[]
}

export function MonthHeaderRow({ monthsData }: MonthHeaderRowProps) {
  return (
    <div className="flex text-xs text-gray-500 h-6">
      {/* Month labels */}
      {monthsData.map((monthData, index) => {
        return (
          <div 
            key={`${monthData.year}-${monthData.month}`}
            className="font-medium text-xs month-header"
            style={{
              width: `calc(var(--cell-total) * ${monthData.totalWeeks})`,
              minWidth: 'calc(var(--cell-total) * 2)'
            }}
          >
            {monthData.name}
          </div>
        )
      })}
    </div>
  )
}