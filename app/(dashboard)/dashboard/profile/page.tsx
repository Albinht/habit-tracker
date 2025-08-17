import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, Settings } from 'lucide-react'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      {/* User Info Card */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <User className="h-10 w-10 text-gray-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{user.name || 'User'}</h2>
            <p className="text-gray-600 flex items-center mt-2">
              <Mail className="h-4 w-4 mr-2" />
              {user.email}
            </p>
            <p className="text-gray-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2" />
              Member since {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Account Settings
        </h3>
        <div className="space-y-4">
          <div className="pb-4 border-b">
            <label className="text-sm text-gray-600">Display Name</label>
            <p className="mt-1 font-medium">{user.name || 'Not set'}</p>
          </div>
          <div className="pb-4 border-b">
            <label className="text-sm text-gray-600">Email Address</label>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>
          <div className="pb-4 border-b">
            <label className="text-sm text-gray-600">Account Type</label>
            <p className="mt-1 font-medium">Free Plan</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Active Habits</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">0%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}