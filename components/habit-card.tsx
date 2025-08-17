import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Calendar } from 'lucide-react'

interface HabitCardProps {
  habit: {
    id: string
    name: string
    description: string | null
    unit: string | null
    color: string
    _count?: {
      entries: number
    }
  }
}

export function HabitCard({ habit }: HabitCardProps) {
  return (
    <Link href={`/dashboard/habits/${habit.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{habit.name}</CardTitle>
              {habit.description && (
                <CardDescription className="mt-1">
                  {habit.description}
                </CardDescription>
              )}
            </div>
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{habit._count?.entries || 0} entries</span>
              </div>
              {habit.unit && (
                <Badge variant="secondary">
                  {habit.unit}
                </Badge>
              )}
            </div>
            <BarChart3 className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}