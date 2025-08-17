'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  
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

  // Handle habit deletion
  const handleDeleteHabit = async () => {
    // Prevent deletion of mock habits
    if (habit.id.startsWith('mock-')) {
      alert('Demo habits cannot be deleted. Create a real habit to test deletion.')
      return
    }

    if (!confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const errorData = await response.text()
        console.error('Failed to delete habit:', response.status, errorData)
        alert('Failed to delete habit. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
      alert('An error occurred while deleting the habit. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <HabitHeatmapPanel
        habit={habit}
        entries={entries}
        onChangeColor={handleColorChange}
        onUpsertEntry={handleUpsertEntry}
        onDeleteHabit={handleDeleteHabit}
      />
    </div>
  )
}