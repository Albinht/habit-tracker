'use client'

import { useState, useEffect } from 'react'
import { X, Save, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import type { HabitEntry } from '@/lib/types/habit'

interface JournalDrawerProps {
  isOpen: boolean
  onClose: () => void
  habitName: string
  date: string
  entry?: HabitEntry | null
  onSave: (entry: Omit<HabitEntry, 'habitId'>) => void
}

export function JournalDrawer({
  isOpen,
  onClose,
  habitName,
  date,
  entry,
  onSave
}: JournalDrawerProps) {
  const [isCompleted, setIsCompleted] = useState(entry?.value === 1 || false)
  const [journal, setJournal] = useState(entry?.journal || '')
  
  useEffect(() => {
    setIsCompleted(entry?.value === 1 || false)
    setJournal(entry?.journal || '')
  }, [entry])

  const handleSave = () => {
    const newEntry: Omit<HabitEntry, 'habitId'> = {
      date,
      value: isCompleted ? 1 : 0,
      journal: journal.trim() || undefined
    }
    onSave(newEntry)
  }

  const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" style={{ color: 'var(--habit-accent)' }} />
            <div>
              <div className="font-semibold">{habitName}</div>
              <div className="text-sm font-normal text-gray-500">{formattedDate}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Completion toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked === true)}
            />
            <Label htmlFor="completed" className="text-sm font-medium">
              Mark as completed
            </Label>
          </div>

          {/* Journal textarea */}
          <div className="space-y-2">
            <Label htmlFor="journal" className="text-sm font-medium">
              Journal entry (optional)
            </Label>
            <Textarea
              id="journal"
              placeholder="How did it go? Any thoughts or reflections..."
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gray-900 hover:bg-gray-800"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}