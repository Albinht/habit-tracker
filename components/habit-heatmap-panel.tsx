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
}

export function HabitHeatmapPanel({
  habit,
  year = new Date().getFullYear(),
  entries,
  onChangeColor,
  onUpsertEntry
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
      className="rounded-xl border bg-white p-6 w-full"
      style={getCSSVariables(habit.color)}
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{habit.name}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{selectedYear}</span>
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

      {/* Month labels */}
      <MonthHeaderRow monthsData={monthsData} />

      {/* Heatmap area */}
      <div className="mt-2 flex">
        {/* Y-axis labels */}
        <YAxisLabels />
        
        {/* Grid container */}
        <HeatmapGrid 
          monthsData={monthsData}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Footer stats */}
      <footer className="mt-6 flex items-start justify-between">
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