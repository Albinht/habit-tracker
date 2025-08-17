'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit2, Trash2, MoreVertical, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { Entry } from '@prisma/client'
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'

interface EntryManagerProps {
  entries: Entry[]
  habitId: string
  unit: string | null
}

export function EntryManager({ entries, habitId, unit }: EntryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('week')
  const router = useRouter()

  // Filter entries based on selected time period
  const filteredEntries = entries.filter(entry => {
    const entryDate = parseISO(entry.date.toString())
    const now = new Date()
    const daysDiff = differenceInDays(now, entryDate)
    
    if (filter === 'week') return daysDiff <= 7
    if (filter === 'month') return daysDiff <= 30
    return true
  })

  // Calculate trends
  const getTrend = (index: number): 'up' | 'down' | 'same' | null => {
    if (index >= filteredEntries.length - 1) return null
    const current = filteredEntries[index].value
    const previous = filteredEntries[index + 1].value
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'same'
  }

  const handleEdit = async (entryId: string, newValue: number) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/entries/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditValue('')
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    setDeletingId(entryId)
    try {
      const response = await fetch(`/api/habits/${habitId}/entries?entryId=${entryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMM d, yyyy')
  }

  const getDayOfWeek = (date: string | Date) => {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'EEEE')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Entry History</CardTitle>
            <CardDescription>
              Manage and edit your logged entries
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('week')}
            >
              Week
            </Button>
            <Button
              variant={filter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('month')}
            >
              Month
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No entries in this time period
          </p>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map((entry, index) => {
              const trend = getTrend(index)
              const isEditing = editingId === entry.id
              
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(entry.date)}</div>
                      <div className="text-gray-500 text-xs">{getDayOfWeek(entry.date)}</div>
                    </div>
                    {isToday(parseISO(entry.date.toString())) && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Today
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {trend && (
                      <div className="flex items-center">
                        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 h-8"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEdit(entry.id, parseFloat(editValue))}
                          disabled={!editValue}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditValue('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-lg min-w-[100px] text-right">
                          {entry.value} {unit}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={deletingId === entry.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingId(entry.id)
                                setEditValue(entry.value.toString())
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {filteredEntries.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total entries: {filteredEntries.length}</span>
              <span>
                Average: {(filteredEntries.reduce((acc, e) => acc + e.value, 0) / filteredEntries.length).toFixed(1)} {unit}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}