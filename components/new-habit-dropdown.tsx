'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PlusCircle, Hash, CheckSquare, ChevronDown } from 'lucide-react'

interface NewHabitDropdownProps {
  className?: string
  variant?: 'default' | 'first-habit'
}

export function NewHabitDropdown({ className, variant = 'default' }: NewHabitDropdownProps) {
  const isFirstHabit = variant === 'first-habit'
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isFirstHabit ? 'Create Your First Habit' : 'New Habit'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <Link href="/dashboard/habits/new/number">
          <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
            <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
              <Hash className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Number Habit</div>
              <div className="text-xs text-gray-600 mt-1">
                Track measurable quantities like pages read, miles walked, or minutes meditated
              </div>
            </div>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/dashboard/habits/new/checkbox">
          <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
            <div className="p-2 bg-green-100 rounded-lg mt-0.5">
              <CheckSquare className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Checkbox Habit</div>
              <div className="text-xs text-gray-600 mt-1">
                Simple done/not done tracking for habits like going to the gym or waking up early
              </div>
            </div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}