import type { HabitStats } from '@/lib/types/habit'

interface StatsPanelProps {
  stats: HabitStats
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <dl className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
      <div>
        <dt className="inline text-gray-500">Longest streak: </dt>
        <dd className="inline font-medium text-gray-900">
          {stats.longestStreak} days
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Number of entries: </dt>
        <dd className="inline font-medium text-gray-900">
          {stats.numberOfEntries}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Average: </dt>
        <dd className="inline font-medium text-gray-900">
          {stats.average.toFixed(2)}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Standard deviation: </dt>
        <dd className="inline font-medium text-gray-900">
          {stats.stdDev.toFixed(2)}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Total: </dt>
        <dd className="inline font-medium text-gray-900">
          {stats.total.toFixed(2)}
        </dd>
      </div>
    </dl>
  )
}