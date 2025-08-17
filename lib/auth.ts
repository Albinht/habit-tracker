import { getServerSession } from 'next-auth'
import { authOptions } from './auth.config'
import { prisma } from './prisma'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  // For local development, return mock user without database dependency
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'mock-user-id',
      email: 'albinht@gmail.com',
      name: 'Albin',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'password123',
    }
  }

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
  // All users have access to all features now
  return {
    isPro: true,
    canUseFeature: true,
    isInTrial: false,
    hasActiveSubscription: true,
    trialEndsAt: null,
  }
}