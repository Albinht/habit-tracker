'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Flame } from 'lucide-react'
import { format } from 'date-fns'

interface JournalEntryModalProps {
  isOpen: boolean
  onClose: () => void
  habitName: string
  habitColor: string
  date: Date
  currentStreak: number
  existingEntry?: { value: number; note?: string }
  onComplete: (value: number, note?: string) => void
}

export function JournalEntryModal({
  isOpen,
  onClose,
  habitName,
  habitColor,
  date,
  currentStreak,
  existingEntry,
  onComplete
}: JournalEntryModalProps) {
  const [note, setNote] = useState(existingEntry?.note || '')
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      // Use existing value or default to 1 for new entries
      const value = existingEntry?.value || 1
      await onComplete(value, note)
      onClose()
    } catch (error) {
      console.error('Failed to complete entry:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md p-0 gap-0 bg-white border border-gray-200 rounded-lg shadow-lg"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="sr-only">
            Journal Entry for {habitName}
          </DialogTitle>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Colored dot indicator */}
              <div 
                className="w-3 h-3 rounded-full mt-1.5"
                style={{ backgroundColor: habitColor }}
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {habitName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Date: {format(date, 'EEE MMM d yyyy')}
                </p>
              </div>
            </div>
            
            {/* ESC pill */}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
            >
              <span>esc</span>
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Journal entry area */}
          <div className="mb-6">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write about your habit progress, thoughts, or reflections..."
              className="min-h-[100px] bg-gray-50 border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bottom section */}
          <div className="flex items-center justify-between">
            {/* Streak indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{currentStreak} day streak</span>
            </div>

            {/* Complete button */}
            <Button 
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-medium"
            >
              {isCompleting ? 'Saving...' : existingEntry ? 'Update' : 'Complete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}