import { getServerSession } from 'next-auth'
import { authOptions } from './auth.config'
import { prisma } from './prisma'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        subscription: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function checkUserPlan(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  })

  if (!user) return { isPro: false, canUseFeature: false }

  const now = new Date()
  const isInTrial = user.trialEndsAt && user.trialEndsAt > now
  const hasActiveSubscription = 
    user.subscription?.status === 'active' || 
    user.subscription?.status === 'trialing'

  return {
    isPro: user.isPro || isInTrial || hasActiveSubscription,
    isInTrial,
    hasActiveSubscription,
    trialEndsAt: user.trialEndsAt,
  }
}