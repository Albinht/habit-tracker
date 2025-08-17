import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    const whereClause: { habitId: string; date?: { gte: Date; lte: Date } } = { habitId: id }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Get entries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
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
          habitId: id,
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
          habitId: id,
          date: entryDate,
          value: parseFloat(value)
        }
      })
      return NextResponse.json(entry)
    }
  } catch (error) {
    console.error('Create/update entry error:', error)
    return NextResponse.json(
      { error: 'Failed to save entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    await prisma.entry.delete({
      where: { id: entryId }
    })

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Delete entry error:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}