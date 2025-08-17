'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, Settings, LogOut, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

interface MobileNavProps {
  children: React.ReactNode
}

export function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    closeMenu()
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="p-2 min-w-[44px] min-h-[44px] touch-manipulation"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex space-x-6">
        {children}
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] md:hidden"
          onClick={closeMenu}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[999] md:hidden will-change-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          touchAction: 'pan-y'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMenu}
              className="p-2 min-w-[44px] min-h-[44px] touch-manipulation"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* User Section */}
          {session?.user && (
            <div className="px-4 py-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[48px] touch-manipulation"
              onClick={closeMenu}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[48px] touch-manipulation"
              onClick={closeMenu}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span>Settings</span>
            </Link>
          </nav>
          
          {/* Sign Out Button */}
          {session && (
            <div className="px-4 py-4 border-t">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full justify-start px-3 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 min-h-[48px] touch-manipulation"
              >
                <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}