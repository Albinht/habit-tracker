'use client'

import { useState } from 'react'
import { HabitHeatmapPanel } from '@/components/habit-heatmap-panel'
import type { Habit, HabitEntry } from '@/lib/types/habit'

export default function DemoPage() {
  // Sample habit data
  const [habit, setHabit] = useState<Habit>({
    id: "habit-1",
    name: "Waking up before 7:30",
    color: "#F6A500", // Orange like screenshot
    createdAt: new Date().toISOString()
  })

  // Sample entries data
  const [entries, setEntries] = useState<HabitEntry[]>([
    { habitId: "habit-1", date: "2025-07-12", value: 1, journal: "Up at 7:10" },
    { habitId: "habit-1", date: "2025-07-13", value: 1 },
    { habitId: "habit-1", date: "2025-07-14", value: 1, journal: "Felt easy" },
    { habitId: "habit-1", date: "2025-07-15", value: 0, journal: "Late night" },
    { habitId: "habit-1", date: "2025-07-16", value: 1 },
    { habitId: "habit-1", date: "2025-07-17", value: 1 },
    { habitId: "habit-1", date: "2025-07-18", value: 0 },
    { habitId: "habit-1", date: "2025-07-19", value: 1, journal: "Back on track" },
    { habitId: "habit-1", date: "2025-07-20", value: 1 },
    { habitId: "habit-1", date: "2025-08-01", value: 1 },
    { habitId: "habit-1", date: "2025-08-02", value: 1 },
    { habitId: "habit-1", date: "2025-08-03", value: 0 },
    { habitId: "habit-1", date: "2025-08-04", value: 1 },
    { habitId: "habit-1", date: "2025-08-05", value: 1, journal: "Great week!" },
  ])

  // Handle color change
  const handleChangeColor = (habitId: string, color: string) => {
    console.log('Color changed:', habitId, color)
    setHabit(prev => ({ ...prev, color }))
  }

  // Handle entry upsert
  const handleUpsertEntry = (entry: HabitEntry) => {
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => 
        e.habitId === entry.habitId && e.date === entry.date
      )
      
      if (existingIndex >= 0) {
        // Update existing entry
        const newEntries = [...prev]
        newEntries[existingIndex] = entry
        return newEntries
      } else {
        // Add new entry
        return [...prev, entry]
      }
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Habit Heatmap Panel Demo</h1>
        
        <div className="space-y-8">
          <HabitHeatmapPanel
            habit={habit}
            entries={entries}
            onChangeColor={handleChangeColor}
            onUpsertEntry={handleUpsertEntry}
          />
          
          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Demo Instructions</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click on any day cell to open the journal drawer</li>
              <li>• Use the calendar dropdown to switch between years</li>
              <li>• Click the three dots menu to change the habit color</li>
              <li>• Hover over cells to see tooltips with details</li>
              <li>• The "Longest streak" stat uses the habit accent color</li>
              <li>• Cells with journal entries show a small dot indicator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}