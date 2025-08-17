'use client'

/**
 * Client-only Auth Provider
 * Following the video's best practice:
 * - Keep public pages statically rendered
 * - Only load auth on client side
 */

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}