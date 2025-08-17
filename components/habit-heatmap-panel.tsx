'use client'

import { useState } from 'react'
import { Calendar, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import type { Habit, HabitEntry, HabitStats } from '@/lib/types/habit'
import { generateMonthData } from '@/lib/utils/date-utils'
import { calculateHabitStats } from '@/lib/utils/stats-utils'
import { getCSSVariables } from '@/lib/utils/color-utils'

// Sub-components
import { MonthHeaderRow } from './habit-heatmap-panel/month-header-row'
import { YAxisLabels } from './habit-heatmap-panel/y-axis-labels'
import { HeatmapGrid } from './habit-heatmap-panel/heatmap-grid'
import { StatsPanel } from './habit-heatmap-panel/stats-panel'
import { CompletedPill } from './habit-heatmap-panel/completed-pill'
import { JournalDrawer } from './habit-heatmap-panel/journal-drawer'
import { ColorPicker } from './habit-heatmap-panel/color-picker'

interface HabitHeatmapPanelProps {
  habit: Habit
  year?: number
  entries: HabitEntry[]
  onChangeColor?: (habitId: string, color: string) => void
  onUpsertEntry?: (entry: HabitEntry) => void
  variant?: 'default' | 'landing'
}

export function HabitHeatmapPanel({
  habit,
  year = new Date().getFullYear(),
  entries,
  onChangeColor,
  onUpsertEntry,
  variant = 'default'
}: HabitHeatmapPanelProps) {
  const [selectedYear, setSelectedYear] = useState(year)
  const [isJournalOpen, setIsJournalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Filter entries for the selected year
  const yearEntries = entries.filter(entry => 
    entry.habitId === habit.id && entry.date.startsWith(selectedYear.toString())
  )

  // Generate month data for rendering
  const monthsData = generateMonthData(selectedYear, yearEntries)
  
  // Calculate statistics
  const stats = calculateHabitStats(yearEntries, selectedYear)

  // Check if today is completed
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = yearEntries.find(entry => entry.date === today)
  const isCompletedToday = todayEntry?.value === 1

  // Handle year change
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear)
  }

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

  // Generate available years (current year ± 5)
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from(
    { length: 11 }, 
    (_, i) => currentYear - 5 + i
  )

  const selectedEntry = selectedDate ? yearEntries.find(e => e.date === selectedDate) : null

  return (
    <section 
      className={`rounded-xl border bg-white p-3 sm:p-6 w-full heatmap-panel ${variant === 'landing' ? 'heatmap-landing' : ''}`}
      style={{
        ...getCSSVariables(habit.color),
        '--cell-size': '8px',
        '--cell-gap': '1px',
        '--cell-total': '9px'
      } as React.CSSProperties}
    >
      <style jsx>{`
        .heatmap-panel {
          --cell-size: 8px;
          --cell-gap: 1px;
          --cell-total: 9px;
        }
        @media (min-width: 768px) {
          .heatmap-panel {
            --cell-size: 10px;
            --cell-gap: 1px;
            --cell-total: 11px;
          }
        }
        @media (min-width: 1024px) {
          .heatmap-panel {
            --cell-size: 13px;
            --cell-gap: 2px;
            --cell-total: 15px;
          }
          .heatmap-landing {
            --cell-size: 16px;
            --cell-gap: 2px;
            --cell-total: 18px;
          }
        }
        .heatmap-scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }
        .heatmap-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .heatmap-scroll-container:not(:hover) .scroll-shadow-left,
        .heatmap-scroll-container:not(:hover) .scroll-shadow-right {
          transition: opacity 0.3s ease;
        }
        .heatmap-scroll-container.can-scroll-left .scroll-shadow-left {
          opacity: 1;
        }
        .heatmap-scroll-container.can-scroll-right .scroll-shadow-right {
          opacity: 1;
        }
      `}</style>
      {/* Header */}
      <header className="flex items-center justify-between mb-2 sm:mb-0">
        <h2 className="text-lg sm:text-2xl font-semibold truncate pr-2">{habit.name}</h2>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-500">{selectedYear}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Open calendar"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableYears.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={selectedYear === year ? 'bg-gray-100' : ''}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            <div className="h-6 mb-2" />
            <YAxisLabels />
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-x-auto heatmap-scroll-container relative">
            <div className="min-w-max px-1">
              {/* Month headers */}
              <div className="mb-2">
                <MonthHeaderRow monthsData={monthsData} />
              </div>
              
              {/* Heatmap grid */}
              <HeatmapGrid 
                monthsData={monthsData}
                onDayClick={handleDayClick}
              />
            </div>
            
            {/* Scroll indicator shadows */}
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none scroll-shadow-left opacity-0" />
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none scroll-shadow-right" />
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