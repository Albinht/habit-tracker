'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { HeatMap } from '@/components/heat-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Calendar, User, Check } from 'lucide-react'
import { Entry, Habit } from '@prisma/client'
import { Stats } from '@/types'

interface EmbedViewProps {
  habit: Habit & {
    entries: Entry[]
  }
  stats: Stats
  userName: string | null
}

export function EmbedView({ habit, stats, userName }: EmbedViewProps) {
  const [value, setValue] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleDirectLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habit.allowDirectLog) return

    setError('')
    setSuccess(false)
    setIsLogging(true)

    try {
      const response = await fetch(`/api/public/habits/${habit.embedToken}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: parseFloat(value),
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to log entry')
      } else {
        setSuccess(true)
        setValue('')
        setTimeout(() => {
          setSuccess(false)
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {habit.name}
                <div 
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
              </CardTitle>
              {habit.description && (
                <CardDescription className="mt-1">
                  {habit.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-2 mt-2">
                {userName && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {userName}
                  </Badge>
                )}
                {habit.unit && (
                  <Badge variant="secondary" className="text-xs">
                    {habit.unit}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="heatmap" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="heatmap">
                <Calendar className="h-4 w-4 mr-2" />
                Heat Map
              </TabsTrigger>
              <TabsTrigger value="stats">
                <TrendingUp className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="space-y-4">
              <HeatMap 
                entries={habit.entries} 
                color={habit.color}
                unit={habit.unit}
              />

              {habit.allowDirectLog && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Log</CardTitle>
                    <CardDescription>
                      Log today's entry directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4 flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Entry logged successfully!
                      </div>
                    )}

                    <form onSubmit={handleDirectLog} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          step="any"
                          placeholder={`Enter ${habit.unit || 'value'}`}
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          required
                          disabled={isLogging}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLogging || !value}
                      >
                        {isLogging ? 'Logging...' : 'Log Entry'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Current Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.currentStreak}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        days
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Longest Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.longestStreak}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        days
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalEntries}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        logged
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.average}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {habit.unit || 'per entry'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-center mt-4 text-sm text-gray-500">
        Powered by HabitTracker
      </div>
    </div>
  )
}