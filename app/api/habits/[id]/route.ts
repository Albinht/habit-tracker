import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateStats } from '@/lib/habit-utils'

export async function GET(
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
      },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 365
        },
        journals: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    const stats = calculateStats(habit.entries)

    return NextResponse.json({
      ...habit,
      stats
    })
  } catch (error) {
    console.error('Get habit error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habit' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { name, description, unit, color, allowDirectLog, goalValue, goalType } = await request.json()

    const updatedHabit = await prisma.habit.update({
      where: { id: id },
      data: {
        name: name || habit.name,
        description: description !== undefined ? description : habit.description,
        unit: unit !== undefined ? unit : habit.unit,
        color: color || habit.color,
        allowDirectLog: allowDirectLog !== undefined ? allowDirectLog : habit.allowDirectLog,
        goalValue: goalValue !== undefined ? goalValue : habit.goalValue,
        goalType: goalType !== undefined ? goalType : habit.goalType
      }
    })

    return NextResponse.json(updatedHabit)
  } catch (error) {
    console.error('Update habit error:', error)
    return NextResponse.json(
      { error: 'Failed to update habit' },
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

    await prisma.habit.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('Delete habit error:', error)
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    )
  }
}