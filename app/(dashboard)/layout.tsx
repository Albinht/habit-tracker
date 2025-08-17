import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Settings } from 'lucide-react'
import { UserInfo } from '@/components/user-info'
import { Skeleton } from '@/components/ui/skeleton'
import { MobileMenu } from '@/components/mobile-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is handled by middleware - not in layout
  // Layouts don't re-render on navigation (anti-pattern)
  // User info is displayed via client component to keep it performant

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-2 sm:px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image 
                src="/Traqur logo.png" 
                alt="Traqur Logo" 
                width={120} 
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Mobile Menu - Shows avatar button on mobile */}
              <MobileMenu />
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Suspense fallback={
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-20" />
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