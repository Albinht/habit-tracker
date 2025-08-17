'use client'

import { useState } from 'react'
import type { DayData } from '@/lib/types/habit'
import { getCellColor } from '@/lib/utils/color-utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from 'date-fns'

interface DayCellProps {
  day: DayData
  onClick: () => void
}

export function DayCell({ day, onClick }: DayCellProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const cellColor = getCellColor(day.value)
  const hasJournal = Boolean(day.journal)
  
  // Format tooltip content
  const formatTooltipDate = (dateStr: string) => {
    return format(new Date(dateStr), 'EEE, MMM d')
  }
  
  const getStatusText = (value: 0 | 1 | null) => {
    switch (value) {
      case 1: return 'Completed'
      case 0: return 'Missed'
      default: return 'No entry'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="relative focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all touch-manipulation day-cell"
            style={{
              width: 'var(--cell-size)',
              height: 'var(--cell-size)',
              backgroundColor: cellColor,
              borderRadius: '2px',
              border: day.isToday && day.value === null ? '1px solid var(--cell-outline)' : '1px solid #e5e7eb',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              minWidth: 'var(--cell-size)',
              minHeight: 'var(--cell-size)',
              padding: '2px',
              margin: '-2px'
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            aria-pressed={day.value === 1}
            aria-label={`${formatTooltipDate(day.date)}, ${getStatusText(day.value)}${hasJournal ? ', Journal present' : ''}`}
          >
            {/* Journal indicator dot */}
            {hasJournal && (
              <div 
                className="absolute bottom-0 right-0 w-1 h-1 rounded-full"
                style={{ backgroundColor: 'var(--habit-accent)' }}
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold">
              {formatTooltipDate(day.date)}
            </div>
            <div>{getStatusText(day.value)}</div>
            {hasJournal && <div className="text-xs text-gray-500">Journal entry</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}