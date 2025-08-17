'use client'

import { useState } from 'react'
import { HabitHeatmapPanel } from '@/components/habit-heatmap-panel'
import { convertHabitToHeatmapFormat } from '@/lib/utils/data-conversion'
import type { HabitEntry } from '@/lib/types/habit'

interface PrismaEntry {
  id: string
  value: number
  date: Date | string
}

interface HabitCardWithHeatmapProps {
  habit: {
    id: string
    name: string
    description: string | null
    color: string
    unit: string | null
    goalValue: number | null
    goalType: string | null
    entries: PrismaEntry[]
  }
}

export function HabitCardWithHeatmap({ habit: prismaHabit }: HabitCardWithHeatmapProps) {
  // Convert Prisma habit format to HeatmapPanel format
  const [habit, setHabit] = useState(() => convertHabitToHeatmapFormat(prismaHabit))
  
  // Convert and manage entries
  const [entries, setEntries] = useState<HabitEntry[]>(() => 
    convertHabitToHeatmapFormat(prismaHabit).entries
  )

  // Handle color change
  const handleColorChange = (habitId: string, newColor: string) => {
    setHabit(prev => ({ ...prev, color: newColor }))
    // In a real app, you would also update the database here
    console.log('Color changed for habit:', habitId, 'to:', newColor)
  }

  // Handle entry upsert (journal entries, value changes)
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
    
    // In a real app, you would also update the database here
    console.log('Entry updated:', entry)
  }

  return (
    <div className="w-full">
      <HabitHeatmapPanel
        habit={habit}
        entries={entries}
        onChangeColor={handleColorChange}
        onUpsertEntry={handleUpsertEntry}
      />
    </div>
  )
}