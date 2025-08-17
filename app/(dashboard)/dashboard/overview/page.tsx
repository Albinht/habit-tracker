import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Calendar, TrendingUp, Award, Activity } from 'lucide-react'

export default async function YearOverviewPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const currentYear = new Date().getFullYear()
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Year Overview</h1>
        <p className="text-gray-600">Your habit tracking summary for {currentYear}</p>
      </div>

      {/* Year Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-gray-500">Total Days</span>
          </div>
          <div className="text-2xl font-bold">365</div>
          <div className="text-sm text-gray-600">Days in {currentYear}</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="text-xs text-gray-500">Active Days</span>
          </div>
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-gray-600">Days with entries</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-gray-500">Best Streak</span>
          </div>
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-gray-600">Consecutive days</div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-orange-600" />
            <span className="text-xs text-gray-500">Completion</span>
          </div>
          <div className="text-2xl font-bold">0%</div>
          <div className="text-sm text-gray-600">Overall rate</div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Monthly Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, index) => (
            <div key={month} className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">{month}</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500">entries</div>
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habits Summary */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">Habits Summary</h2>
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No habits tracked yet this year</p>
          <p className="text-sm mt-2">Start creating habits to see your yearly progress!</p>
        </div>
      </div>
    </div>
  )
}