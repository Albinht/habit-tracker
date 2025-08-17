import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Stats } from '@/types'
import { TrendingUp, Target, Activity, Award } from 'lucide-react'

interface StatsDisplayProps {
  stats: Stats
  unit: string | null
}

export function StatsDisplay({ stats, unit }: StatsDisplayProps) {
  const statCards = [
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      unit: 'days',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Longest Streak',
      value: stats.longestStreak,
      unit: 'days',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Entries',
      value: stats.totalEntries,
      unit: 'logged',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Average',
      value: stats.average,
      unit: unit || 'per entry',
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {stat.unit}
                </span>
              </div>
              {stat.title === 'Average' && stats.standardDeviation > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ± {stats.standardDeviation.toFixed(1)} std dev
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}