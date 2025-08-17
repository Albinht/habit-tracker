'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EntryLogger } from '@/components/entry-logger'
import { StatsDisplay } from '@/components/stats-display'
import { EmbedSection } from '@/components/embed-section'
import { HeatMap } from '@/components/heat-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Trash2, TrendingUp, Calendar, Code, BarChart3, BookOpen } from 'lucide-react'
import { Entry, Habit, Journal } from '@prisma/client'
import { Stats } from '@/types'
import { useRouter } from 'next/navigation'

interface HabitDetailProps {
  habit: Habit & {
    entries: Entry[]
    journals?: Journal[]
  }
  stats: Stats
  isPro: boolean
}

export function HabitDetail({ habit, stats, isPro }: HabitDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to delete habit:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{habit.name}</CardTitle>
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
              </div>
              {habit.description && (
                <CardDescription>{habit.description}</CardDescription>
              )}
              {habit.unit && (
                <Badge variant="secondary" className="mt-2">
                  Measuring in {habit.unit}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Heat Map</CardTitle>
          <CardDescription>
            Your activity over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeatMap 
            entries={habit.entries} 
            color={habit.color}
            unit={habit.unit}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="log" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-max grid-cols-5 sm:min-w-0">
            <TabsTrigger value="log" className="text-xs sm:text-sm min-w-0 flex-shrink-0">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Log Entry</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm min-w-0 flex-shrink-0">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm min-w-0 flex-shrink-0">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="text-xs sm:text-sm min-w-0 flex-shrink-0">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Journal</span>
              <span className="sm:hidden">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="text-xs sm:text-sm min-w-0 flex-shrink-0">
              <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Embed</span>
              <span className="sm:hidden">Embed</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="log" className="space-y-4">
          <EntryLogger habitId={habit.id} unit={habit.unit} />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {habit.entries.length === 0 ? (
                <p className="text-gray-500">No entries yet. Start logging to see your progress!</p>
              ) : (
                <div className="space-y-2">
                  {habit.entries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="font-semibold">
                        {entry.value} {habit.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <StatsDisplay stats={stats} unit={habit.unit} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Entry History</CardTitle>
            </CardHeader>
            <CardContent>
              {habit.entries.length === 0 ? (
                <p className="text-gray-500">No entries yet. Start logging to see your history!</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {habit.entries.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="font-semibold">
                        {entry.value} {habit.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>
                Your reflections and notes for each habit entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              {habit.journals && habit.journals.length > 0 ? (
                <div className="space-y-4">
                  {habit.journals.map((journal) => (
                    <Card key={journal.id} className="bg-gray-50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {new Date(journal.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <Badge variant="secondary">
                            {(() => {
                              const entry = habit.entries.find(
                                e => new Date(e.date).toDateString() === new Date(journal.date).toDateString()
                              )
                              return entry ? `${entry.value} ${habit.unit || 'logged'}` : 'No entry'
                            })()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {journal.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No journal entries yet. Add notes when logging your daily habits!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <EmbedSection habit={habit} />
        </TabsContent>
      </Tabs>
    </div>
  )
}