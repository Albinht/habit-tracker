'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Flame, Lock, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { Habit } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface QuickLogModalProps {
  habit: Habit
  currentStreak: number
  onClose: () => void
}

export function QuickLogModal({ habit, currentStreak, onClose }: QuickLogModalProps) {
  const [value, setValue] = useState('')
  const [journal, setJournal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [checkingPro, setCheckingPro] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is Pro
    const checkProStatus = async () => {
      try {
        const response = await fetch('/api/user/pro-status')
        if (response.ok) {
          const data = await response.json()
          setIsPro(data.isPro)
        }
      } catch (error) {
        console.error('Failed to check Pro status:', error)
      } finally {
        setCheckingPro(false)
      }
    }
    checkProStatus()
  }, [])

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMM d yyyy')

  const handleSubmit = async () => {
    if (!value) return

    setIsLoading(true)
    try {
      // Log the entry
      const response = await fetch(`/api/habits/${habit.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today.toISOString(),
          value: parseFloat(value),
        }),
      })

      if (response.ok) {
        // If journal entry exists and user is pro, save it
        if (journal && isPro) {
          const journalResponse = await fetch(`/api/habits/${habit.id}/journal`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: today.toISOString(),
              content: journal,
            }),
          })
          
          if (!journalResponse.ok) {
            console.error('Failed to save journal entry')
          }
        }

        setSuccess(true)
        setTimeout(() => {
          router.refresh()
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to log entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSubmit()
    }
  }

  // Calculate progress if goal is set
  const progress = habit.goalValue && value
    ? Math.round((parseFloat(value) / habit.goalValue) * 100)
    : null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {habit.name}
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Entry Logged!</h3>
            <p className="text-gray-600">Great job keeping up your habit.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Date Display */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Date:</span>
              </div>
              <span className="text-sm font-semibold">{formattedDate}</span>
            </div>

            {/* Value Input */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Value {habit.unit && `(${habit.unit})`}
                {habit.goalValue && (
                  <span className="text-xs text-gray-500 ml-2">
                    Goal: {habit.goalValue} {habit.unit}
                  </span>
                )}
              </Label>
              <Input
                id="value"
                type="number"
                step="any"
                placeholder={`Enter ${habit.unit || 'value'}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
              {progress !== null && value && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progress >= 100 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              )}
            </div>

            {/* Journal Entry */}
            <div className="space-y-2">
              <Label htmlFor="journal">Journal entry:</Label>
              {!checkingPro && !isPro && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-amber-800">
                          Upgrade to premium to write bullet journals for each entry.
                        </p>
                        <Link href="/dashboard/billing">
                          <Button variant="link" className="p-0 h-auto text-amber-700 text-sm">
                            Try it FREE for 30 days
                          </Button>
                        </Link>
                        <p className="text-xs text-amber-600 mt-1">
                          You can still log your habits without a journal.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Textarea
                id="journal"
                placeholder={isPro ? "Add notes about today's progress..." : "Upgrade to Pro to add journal entries"}
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                disabled={!isPro || checkingPro}
                className={!isPro ? "opacity-50" : ""}
                rows={3}
              />
            </div>

            {/* Streak Display */}
            <div className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <Flame className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-lg font-bold text-orange-800">
                {currentStreak} days streak
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !value}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Complete'}
              </Button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to close or{' '}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘</kbd>+
              <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to complete
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}