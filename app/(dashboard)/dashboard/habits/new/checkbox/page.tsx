'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, CheckSquare, Eye, EyeOff } from 'lucide-react'
import { DEFAULT_HABIT_COLORS } from '@/lib/constants'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const STAT_OPTIONS = [
  { id: 'streak', label: 'Streak', description: 'Number of consecutive entries. Resets to 0 if a day is missed.' },
  { id: 'longestStreak', label: 'Longest streak', description: 'Longest streak ever recorded.' },
  { id: 'average', label: 'Average', description: 'Statistical average of your entries.' },
  { id: 'standardDeviation', label: 'Standard deviation', description: 'Statistical measure of dispersion, how much your entries vary.' },
  { id: 'total', label: 'Total', description: 'Sum of all your entries.' },
  { id: 'numberOfDays', label: 'Number of days', description: 'Number of entries recorded.' },
]

export default function NewCheckboxHabitPage() {
  const [formData, setFormData] = useState({
    title: '',
    weekStartDay: 'Monday',
    isPrivate: false,
    enabledStats: ['streak', 'longestStreak', 'numberOfDays'],
    streakDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    color: DEFAULT_HABIT_COLORS[2] // Green color for checkbox habits
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleStatToggle = (statId: string) => {
    setFormData(prev => ({
      ...prev,
      enabledStats: prev.enabledStats.includes(statId)
        ? prev.enabledStats.filter(id => id !== statId)
        : [...prev.enabledStats, statId]
    }))
  }

  const handleStreakDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      streakDays: prev.streakDays.includes(day)
        ? prev.streakDays.filter(d => d !== day)
        : [...prev.streakDays, day]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          description: null,
          type: 'checkbox',
          isPrivate: formData.isPrivate,
          weekStartDay: formData.weekStartDay,
          activeDays: JSON.stringify(formData.streakDays),
          enabledStats: JSON.stringify(formData.enabledStats),
          color: formData.color,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create habit')
      } else {
        router.push(`/dashboard/habits/${data.id}`)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/habits/new">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Habit Types
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Track a New Habit</CardTitle>
                  <CardDescription>Configure your checkbox habit for simple done/not done tracking</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Enter a title for your habit: *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Went to the gym, Waking up before 7, Meditated"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>


                {/* Week Start Day */}
                <div className="space-y-2">
                  <Label>Pick a day to start your week:</Label>
                  <Select 
                    value={formData.weekStartDay} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weekStartDay: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((day) => (
                        <SelectItem key={day} value={day}>{day}s</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy */}
                <div className="space-y-2">
                  <Label>Privacy option (hides this habit on your profile, even when your profile is public):</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: !!checked }))}
                    />
                    <Label htmlFor="privacy" className="flex items-center gap-2">
                      {formData.isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      Private
                    </Label>
                  </div>
                </div>

                {/* Statistics Selection */}
                <div className="space-y-4">
                  <Label>Select your desired statistics:</Label>
                  <div className="space-y-4">
                    {STAT_OPTIONS.map((stat) => (
                      <div key={stat.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={stat.id}
                            checked={formData.enabledStats.includes(stat.id)}
                            onCheckedChange={() => handleStatToggle(stat.id)}
                          />
                          <Label htmlFor={stat.id} className="font-medium">{stat.label}</Label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">{stat.description}</p>
                        
                        {/* Streak Days Selection */}
                        {stat.id === 'streak' && formData.enabledStats.includes('streak') && (
                          <div className="ml-6 space-y-2">
                            <Label className="text-sm font-medium">Calculate streak only on the following days:</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {WEEKDAYS.map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`streak-${day}`}
                                    checked={formData.streakDays.includes(day)}
                                    onCheckedChange={() => handleStreakDayToggle(day)}
                                  />
                                  <Label htmlFor={`streak-${day}`} className="text-sm">{day}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-2">
                  <Label>Pick a color:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_HABIT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-10 h-10 rounded-md border-2 transition-all ${
                          formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.title}
                    className="flex-1"
                  >
                    {isLoading ? 'Creating...' : 'Create Habit'}
                  </Button>
                  <Link href="/dashboard/habits/new" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your habit will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="font-medium">
                    {formData.title || 'Your habit title'}
                  </span>
                  {formData.isPrivate && <EyeOff className="h-4 w-4 text-gray-400" />}
                </div>
                
                
                <div className="text-sm space-y-1">
                  <p><strong>Type:</strong> Checkbox (Done/Not Done)</p>
                  <p><strong>Week starts:</strong> {formData.weekStartDay}</p>
                  <p><strong>Statistics:</strong> {formData.enabledStats.length} enabled</p>
                  <p><strong>Privacy:</strong> {formData.isPrivate ? 'Private' : 'Public'}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">
                    Checkbox habits focus on consistency. You'll get a simple checkmark for each day you complete the habit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}