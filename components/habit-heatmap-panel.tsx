'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import type { Habit, HabitEntry, HabitStats } from '@/lib/types/habit'
import { generateRollingHeatmapData, getRollingDateRange } from '@/lib/utils/date-utils'
import { calculateRollingStats } from '@/lib/utils/stats-utils'
import { getCSSVariables } from '@/lib/utils/color-utils'

// Sub-components
import { YAxisLabels } from './habit-heatmap-panel/y-axis-labels'
import { ContinuousGrid } from './habit-heatmap-panel/continuous-grid'
import { StatsPanel } from './habit-heatmap-panel/stats-panel'
import { CompletedPill } from './habit-heatmap-panel/completed-pill'
import { JournalDrawer } from './habit-heatmap-panel/journal-drawer'
import { ColorPicker } from './habit-heatmap-panel/color-picker'

interface HabitHeatmapPanelProps {
  habit: Habit
  entries: HabitEntry[]
  onChangeColor?: (habitId: string, color: string) => void
  onUpsertEntry?: (entry: HabitEntry) => void
  onDeleteHabit?: () => void
  variant?: 'default' | 'landing'
}

export function HabitHeatmapPanel({
  habit,
  entries,
  onChangeColor,
  onUpsertEntry,
  onDeleteHabit,
  variant = 'default'
}: HabitHeatmapPanelProps) {
  const [isJournalOpen, setIsJournalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter entries for the habit
  const habitEntries = entries.filter(entry => entry.habitId === habit.id)

  // Generate rolling heatmap data
  const { gridDays, monthLabels } = generateRollingHeatmapData(habitEntries)
  
  // Calculate statistics for rolling 365 days
  const stats = calculateRollingStats(habitEntries)

  // Check if today is completed
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = habitEntries.find(entry => entry.date === today)
  const isCompletedToday = todayEntry?.value === 1

  // Get date range for display
  const dateRange = getRollingDateRange()

  // Handle color change
  const handleColorChange = (newColor: string) => {
    onChangeColor?.(habit.id, newColor)
    setShowColorPicker(false)
  }

  // Handle day cell click
  const handleDayClick = (date: string) => {
    setSelectedDate(date)
    setIsJournalOpen(true)
  }

  // Handle journal save
  const handleJournalSave = (entry: Omit<HabitEntry, 'habitId'>) => {
    const fullEntry: HabitEntry = {
      ...entry,
      habitId: habit.id
    }
    onUpsertEntry?.(fullEntry)
    setIsJournalOpen(false)
    setSelectedDate(null)
  }

  const selectedEntry = selectedDate ? habitEntries.find(e => e.date === selectedDate) : null

  // Auto-scroll to current week on mount (mobile)
  useEffect(() => {
    if (scrollContainerRef.current && window.innerWidth < 640) {
      // Scroll to show the last few weeks (right side of the grid)
      const scrollWidth = scrollContainerRef.current.scrollWidth
      const clientWidth = scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollLeft = scrollWidth - clientWidth
    }
  }, [])

  return (
    <section 
      className={`rounded-xl border bg-white p-3 sm:p-6 w-full heatmap-panel ${variant === 'landing' ? 'heatmap-landing' : ''}`}
      style={{
        ...getCSSVariables(habit.color),
        '--cell-size': '17px',
        '--cell-gap': '3px',
        '--cell-total': '20px'
      } as React.CSSProperties}
    >
      <style jsx>{`
        .heatmap-panel {
          --cell-size: 17px;
          --cell-gap: 3px;
          --cell-total: 20px;
        }
        @media (min-width: 640px) {
          .heatmap-panel {
            --cell-size: 23px;
            --cell-gap: 3px;
            --cell-total: 26px;
          }
        }
        @media (min-width: 1024px) {
          .heatmap-panel {
            --cell-size: 30px;
            --cell-gap: 4px;
            --cell-total: 34px;
          }
          .heatmap-panel .heatmap-scroll-container {
            width: 100%;
          }
          .heatmap-landing {
            --cell-size: 34px;
            --cell-gap: 4px;
            --cell-total: 38px;
          }
        }
        .heatmap-scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .heatmap-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .scroll-shadow-left,
        .scroll-shadow-right {
          transition: opacity 0.3s ease;
          z-index: 10;
        }
        @media (max-width: 639px) {
          .scroll-shadow-left {
            background: linear-gradient(to right, white, transparent);
          }
          .scroll-shadow-right {
            background: linear-gradient(to left, white, transparent);
          }
        }
      `}</style>
      {/* Header */}
      <header className="flex items-center justify-between mb-2 sm:mb-0">
        <h2 className="text-lg sm:text-2xl font-semibold truncate pr-2">{habit.name}</h2>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-500">2025</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
                Change Color
              </DropdownMenuItem>
              {onDeleteHabit && (
                <DropdownMenuItem 
                  onClick={onDeleteHabit}
                  className="text-red-600 hover:text-red-600 focus:text-red-600"
                >
                  Delete Habit
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Unified heatmap container */}
      <div className="mt-4">
        <div className="flex">
          {/* Fixed Y-axis area */}
          <div className="flex flex-col">
            {/* Spacer for month headers */}
            <div className="h-5 sm:h-6 mb-1" />
            <YAxisLabels />
          </div>
          
          {/* Scrollable content area */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto lg:overflow-x-visible heatmap-scroll-container relative"
          >
            <div className="min-w-max lg:min-w-full lg:w-full">
              {/* Month labels */}
              <div className="relative h-5 sm:h-6 mb-1 text-xs text-gray-500">
                {monthLabels.map((label, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `calc(${label.column} * var(--cell-total))`,
                      minWidth: 'max-content'
                    }}
                  >
                    {label.name}
                  </div>
                ))}
              </div>
              
              {/* Continuous heatmap grid */}
              <ContinuousGrid 
                gridDays={gridDays}
                onDayClick={handleDayClick}
              />
            </div>
            
            {/* Scroll indicator shadows for mobile */}
            <div className="absolute inset-y-0 left-0 w-6 sm:w-8 pointer-events-none scroll-shadow-left" />
            <div className="absolute inset-y-0 right-0 w-6 sm:w-8 pointer-events-none scroll-shadow-right" />
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <footer className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <StatsPanel stats={stats} />
        <CompletedPill isCompleted={isCompletedToday} />
      </footer>

      {/* Journal Drawer */}
      {isJournalOpen && selectedDate && (
        <JournalDrawer
          isOpen={isJournalOpen}
          onClose={() => {
            setIsJournalOpen(false)
            setSelectedDate(null)
          }}
          habitName={habit.name}
          date={selectedDate}
          entry={selectedEntry}
          onSave={handleJournalSave}
        />
      )}

      {/* Color Picker */}
      {showColorPicker && (
        <ColorPicker
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          currentColor={habit.color}
          onColorChange={handleColorChange}
        />
      )}
    </section>
  )
}