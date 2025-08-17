import type { MonthData } from '@/lib/types/habit'

interface MonthHeaderRowProps {
  monthsData: MonthData[]
}

export function MonthHeaderRow({ monthsData }: MonthHeaderRowProps) {
  let totalWeeks = 0

  return (
    <div className="mt-4 flex text-xs text-gray-500">
      {/* Offset for Y-axis labels */}
      <div className="mr-2" style={{ width: '28px' }} />
      
      {/* Month labels */}
      <div className="flex">
        {monthsData.map((monthData) => {
          const monthWidth = monthData.totalWeeks * 15 // 13px cell + 2px gap
          totalWeeks += monthData.totalWeeks
          
          return (
            <div 
              key={`${monthData.year}-${monthData.month}`}
              className="font-medium"
              style={{ width: `${monthWidth}px`, minWidth: '20px' }}
            >
              {monthData.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}