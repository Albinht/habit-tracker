import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const habit = await prisma.habit.findUnique({
      where: { embedToken: token }
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    if (!habit.allowDirectLog) {
      return NextResponse.json(
        { error: 'Direct logging is not enabled for this habit' },
        { status: 403 }
      )
    }

    const { date, value } = await request.json()

    if (!date || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Date and value are required' },
        { status: 400 }
      )
    }

    // Ensure date is at midnight for consistency
    const entryDate = new Date(date)
    entryDate.setHours(0, 0, 0, 0)

    // Check if entry already exists for this date
    const existingEntry = await prisma.entry.findUnique({
      where: {
        habitId_date: {
          habitId: habit.id,
          date: entryDate
        }
      }
    })

    if (existingEntry) {
      // Update existing entry
      const updatedEntry = await prisma.entry.update({
        where: { id: existingEntry.id },
        data: { value: parseFloat(value) }
      })
      return NextResponse.json(updatedEntry)
    } else {
      // Create new entry
      const entry = await prisma.entry.create({
        data: {
          habitId: habit.id,
          date: entryDate,
          value: parseFloat(value)
        }
      })
      return NextResponse.json(entry)
    }
  } catch (error) {
    console.error('Public log entry error:', error)
    return NextResponse.json(
      { error: 'Failed to log entry' },
      { status: 500 }
    )
  }
}