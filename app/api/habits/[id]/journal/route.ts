import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUserPlan } from '@/lib/auth'

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

    // Check if user has Pro access for journal feature
    const { isPro } = await checkUserPlan(user.id)
    
    if (!isPro) {
      return NextResponse.json(
        { error: 'Journal feature requires Pro subscription' },
        { status: 403 }
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

    const { date, content } = await request.json()

    if (!date || !content) {
      return NextResponse.json(
        { error: 'Date and content are required' },
        { status: 400 }
      )
    }

    // Ensure date is at midnight for consistency
    const journalDate = new Date(date)
    journalDate.setHours(0, 0, 0, 0)

    // Check if journal already exists for this date
    const existingJournal = await prisma.journal.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: journalDate
        }
      }
    })

    if (existingJournal) {
      // Update existing journal
      const updatedJournal = await prisma.journal.update({
        where: { id: existingJournal.id },
        data: { content }
      })
      return NextResponse.json(updatedJournal)
    } else {
      // Create new journal
      const journal = await prisma.journal.create({
        data: {
          habitId: id,
          date: journalDate,
          content
        }
      })
      return NextResponse.json(journal)
    }
  } catch (error) {
    console.error('Create/update journal error:', error)
    return NextResponse.json(
      { error: 'Failed to save journal' },
      { status: 500 }
    )
  }
}