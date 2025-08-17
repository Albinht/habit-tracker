import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id, entryId } = await params
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

    // Verify the habit belongs to the user
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

    // Verify the entry belongs to the habit
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        habitId: id
      }
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    const { value } = await request.json()

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      )
    }

    const updatedEntry = await prisma.entry.update({
      where: { id: entryId },
      data: { value: parseFloat(value) }
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Update entry error:', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id, entryId } = await params
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

    // Verify the habit belongs to the user
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

    // Verify the entry belongs to the habit
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        habitId: id
      }
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
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