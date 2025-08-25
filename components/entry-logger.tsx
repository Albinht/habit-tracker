'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarIcon, Check, BookOpen, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface EntryLoggerProps {
  habitId: string
  unit: string | null
}

export function EntryLogger({ habitId, unit }: EntryLoggerProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [value, setValue] = useState('')
  const [journal, setJournal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
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
      }
    }
    checkProStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          value: parseFloat(value),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Entry save failed:', data)
        setError(data.error || 'Failed to log entry')
        return
      }

      // Verify entry was actually saved
      console.log('Entry saved successfully:', data)

      // If journal entry exists, save it
      if (journal) {
        const journalResponse = await fetch(`/api/habits/${habitId}/journal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date,
            content: journal,
          }),
        })
        
        if (!journalResponse.ok) {
          const journalData = await journalResponse.json()
          console.error('Failed to save journal entry:', journalData)
          // Don't fail the whole operation if just journal fails
        }
      }
      
      setSuccess(true)
      setValue('')
      setJournal('')
      setShowJournal(false)
      setTimeout(() => setSuccess(false), 3000)
      
      // Force a hard refresh to ensure data is reloaded
      window.location.reload()
      
    } catch (error) {
      console.error('Entry logging error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLog = async (quickValue: number) => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
    setValue(quickValue.toString())
    
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          value: quickValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Quick log failed:', data)
        setError(data.error || 'Failed to log entry')
        return
      }

      console.log('Quick log saved successfully:', data)
      setSuccess(true)
      setValue('')
      setTimeout(() => setSuccess(false), 3000)
      
      // Force a hard refresh to ensure data is reloaded
      window.location.reload()
      
    } catch (error) {
      console.error('Quick log error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Entry</CardTitle>
        <CardDescription>
          Record your progress for this habit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Entry logged successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isLoading}
                  className="min-h-[44px]"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                Value {unit && `(${unit})`}
              </Label>
              <Input
                id="value"
                type="number"
                step="any"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                disabled={isLoading}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {showJournal && (
            <div className="space-y-2">
              <Label htmlFor="journal">
                <BookOpen className="inline h-4 w-4 mr-1" />
                Journal Entry
              </Label>
              <Textarea
                id="journal"
                placeholder="Reflect on your progress, challenges, or victories..."
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {!showJournal && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowJournal(true)}
                disabled={isLoading}
                className="min-h-[44px] text-base sm:text-sm"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Add Journal
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || !value}
              className="flex-1 min-h-[44px] text-base sm:text-sm"
            >
              {isLoading ? 'Logging...' : 'Log Entry'}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">Quick log for today:</p>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLog(1)}
              disabled={isLoading}
              className="min-h-[44px] text-base sm:text-sm"
            >
              +1 {unit}
            </Button>
            {[5, 10, 30].map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLog(val)}
                disabled={isLoading}
                className="min-h-[44px] text-base sm:text-sm"
              >
                +{val} {unit}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}