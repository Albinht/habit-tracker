import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { UserInfo } from '@/components/user-info'
import { Skeleton } from '@/components/ui/skeleton'
import { MobileNav } from '@/components/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is handled by middleware - not in layout
  // Layouts don't re-render on navigation (anti-pattern)
  // User info is displayed via client component to keep it performant

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-2 sm:px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-green-500 rounded-full p-0.5 flex items-center justify-center">
                <Image 
                  src="/notion-avatar-1755390000172.svg" 
                  alt="niblah Logo" 
                  width={36} 
                  height={36}
                  className="w-9 h-9 sm:w-10 sm:h-10"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">niblah</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <MobileNav>
                <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <Image src="/scribble final version-39.svg" alt="Settings" width={16} height={16} className="h-4 w-4" />
                  Settings
                </Link>
              </MobileNav>
              
              <div className="hidden md:block">
                <Suspense fallback={
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Skeleton className="h-4 w-16 sm:w-24" />
                    <Skeleton className="h-9 w-16 sm:w-20" />
                  </div>
                }>
                  <UserInfo />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  )
}