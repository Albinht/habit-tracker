'use client'

/**
 * Client-side User Info Component
 * From the video: Display user info without making pages dynamic
 */

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

export function UserInfo() {
  const { data: session, status } = useSession()
  
  // Don't render anything during loading to prevent hydration issues
  if (status === 'loading') {
    return (
      <div className="flex items-center">
        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }
  
  if (!session) {
    return null
  }
  
  return (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 flex items-center gap-2"
      >
        <Image src="/scribble final version-139.svg" alt="Sign out" width={16} height={16} className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}