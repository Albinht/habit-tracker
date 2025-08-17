/**
 * Data Access Layer Base
 * Following Next.js best practices from the video:
 * - All database access goes through DAL
 * - Every function includes authentication check
 * - Authorization checks for resource ownership
 */

import { getSession, getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden - You do not have permission to access this resource') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Verify user is authenticated
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    throw new UnauthorizedError('You must be logged in to perform this action')
  }
  
  const user = await getCurrentUser()
  
  if (!user) {
    throw new UnauthorizedError('User not found')
  }
  
  return user
}

/**
 * Verify user is authenticated and on Pro plan
 * For features that require a paid subscription
 */
export async function requireProPlan() {
  const user = await requireAuth()
  
  // Since all features are now free, everyone is considered Pro
  // This check is kept for future use if needed
  const now = new Date()
  const isInTrial = user.trialEndsAt && user.trialEndsAt > now
  const hasActiveSubscription = user.subscription?.status === 'active'
  const isPro = true // All users are Pro for now
  
  if (!isPro && !isInTrial && !hasActiveSubscription) {
    throw new ForbiddenError('This feature requires a Pro subscription')
  }
  
  return user
}

/**
 * Verify user owns a specific resource
 * Critical for edit/delete operations
 */
export async function verifyOwnership(resourceUserId: string, errorMessage?: string) {
  const user = await requireAuth()
  
  if (user.id !== resourceUserId) {
    throw new ForbiddenError(errorMessage || 'You do not have permission to access this resource')
  }
  
  return user
}

/**
 * Handle DAL errors consistently
 */
export function handleDALError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    // In server components, redirect to login
    if (typeof window === 'undefined') {
      redirect('/login')
    }
    throw error
  }
  
  if (error instanceof ForbiddenError) {
    throw error
  }
  
  // Log unexpected errors
  console.error('DAL Error:', error)
  throw new Error('An unexpected error occurred')
}