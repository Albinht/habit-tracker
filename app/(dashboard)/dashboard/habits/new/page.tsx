'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Hash, CheckSquare } from 'lucide-react'

export default function NewHabitTypePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Habit</h1>
        <p className="text-lg text-gray-600">Choose the type of habit you want to track</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Number Habit Card */}
        <Link href="/dashboard/habits/new/number">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Hash className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Number</CardTitle>
              <CardDescription className="text-base">
                Customizable unit, i.e. miles walked, pages read, or minutes meditated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Track measurable quantities
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Custom metrics and units
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Detailed statistics and analytics
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Progress visualization
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Checkbox Habit Card */}
        <Link href="/dashboard/habits/new/checkbox">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Checkbox</CardTitle>
              <CardDescription className="text-base">
                Track a task that can only be done once. i.e. Went to the gym, waking up before 7.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Simple done/not done tracking
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Perfect for binary habits
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Focus on consistency
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Quick and easy logging
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Don't worry, you can always modify these settings after creating your habit.
        </p>
      </div>
    </div>
  )
}