import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { checkUserPlan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { isPro: false },
        { status: 200 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { isPro: false },
        { status: 200 }
      )
    }

    const { isPro, isInTrial, trialEndsAt } = await checkUserPlan(user.id)

    return NextResponse.json({
      isPro,
      isInTrial,
      trialEndsAt
    })
  } catch (error) {
    console.error('Pro status check error:', error)
    return NextResponse.json(
      { isPro: false },
      { status: 200 }
    )
  }
}