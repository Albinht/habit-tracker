import type { HabitStats } from '@/lib/types/habit'
import { formatStats } from '@/lib/utils/stats-utils'

interface StatsPanelProps {
  stats: HabitStats
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const formattedStats = formatStats(stats)
  
  return (
    <dl className="text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
      <div>
        <dt className="inline text-gray-500">Longest streak: </dt>
        <dd className="inline font-semibold" style={{ color: 'var(--habit-accent)' }}>
          {formattedStats.longestStreak}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Entries: </dt>
        <dd className="inline font-semibold text-gray-700">
          {formattedStats.numberOfEntries}
        </dd>
      </div>
      <div className="hidden sm:block">
        <dt className="inline text-gray-500">Average: </dt>
        <dd className="inline font-semibold text-gray-700">
          {formattedStats.average}
        </dd>
      </div>
      <div className="hidden sm:block">
        <dt className="inline text-gray-500">Standard deviation: </dt>
        <dd className="inline font-semibold text-gray-700">
          {formattedStats.stdDev}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Total: </dt>
        <dd className="inline font-semibold text-gray-700">
          {formattedStats.total}
        </dd>
      </div>
    </dl>
  )
}