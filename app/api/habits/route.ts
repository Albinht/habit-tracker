import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateEmbedToken } from '@/lib/habit-utils'
import { FREE_HABIT_LIMIT } from '@/lib/constants'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { habits: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user.habits)
  } catch (error) {
    console.error('Get habits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        habits: true,
        subscription: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check habit limit for free users
    const now = new Date()
    const isInTrial = user.trialEndsAt && user.trialEndsAt > now
    const hasActiveSubscription = user.subscription?.status === 'active'
    const isPro = user.isPro || isInTrial || hasActiveSubscription

    if (!isPro && user.habits.length >= FREE_HABIT_LIMIT) {
      return NextResponse.json(
        { error: `Free plan limited to ${FREE_HABIT_LIMIT} habits. Please upgrade to Pro.` },
        { status: 403 }
      )
    }

    let name, description, unit, color, type, isPrivate, weekStartDay, activeDays, enabledStats
    try {
      const body = await request.json()
      name = body.name
      description = body.description
      unit = body.unit
      color = body.color
      type = body.type
      isPrivate = body.isPrivate
      weekStartDay = body.weekStartDay
      activeDays = body.activeDays
      enabledStats = body.enabledStats
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Habit type is required' },
        { status: 400 }
      )
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        unit: unit || null,
        color: color || '#10b981',
        type: type || 'number',
        isPrivate: isPrivate || false,
        weekStartDay: weekStartDay || 'Monday',
        activeDays: activeDays || '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]',
        enabledStats: enabledStats || '["streak","longestStreak","average","total","numberOfDays"]',
        embedToken: generateEmbedToken(),
        allowDirectLog: false,
      },
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Create habit error:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}