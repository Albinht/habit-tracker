'use client'

import { useState } from 'react'
import { HabitHeatmapPanel } from '@/components/habit-heatmap-panel'
import { generateSampleHabitData } from '@/lib/utils/data-conversion'
import type { HabitEntry } from '@/lib/types/habit'

export function LandingPageHeatmap() {
  // Generate sample data
  const sampleData = generateSampleHabitData()
  const [habit, setHabit] = useState(sampleData.habit)
  const [entries, setEntries] = useState<HabitEntry[]>(sampleData.entries)

  // Handle color change for demo
  const handleColorChange = (habitId: string, newColor: string) => {
    setHabit((prev: any) => ({ ...prev, color: newColor }))
  }

  // Handle entry updates for demo
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-0">
      <HabitHeatmapPanel
        habit={habit}
        entries={entries}
        onChangeColor={handleColorChange}
        onUpsertEntry={handleUpsertEntry}
        variant="landing"
      />
    </div>
  )
}