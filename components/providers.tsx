'use client'

/**
 * Main Providers Component
 * Following video best practices:
 * - Client-only to prevent affecting SSR
 * - Minimal providers in root to keep pages static
 */

import { ReactNode } from 'react'
import { AuthProvider } from './providers/auth-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Only include providers that are truly needed app-wide
  // Auth provider is client-only to keep public pages static
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}