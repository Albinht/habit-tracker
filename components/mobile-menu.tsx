'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  Home, 
  User,
  Calendar,
  LogOut, 
  Menu,
  X,
  Twitter
} from 'lucide-react'
import { MobileMenuPortal } from './mobile-menu-portal'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    closeMenu()
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={openMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Portal for Menu and Overlay */}
      <MobileMenuPortal>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/40 md:hidden"
            style={{ zIndex: 2147483646 }}
            onClick={closeMenu}
          />
        )}

        {/* Full Screen Slide-out Menu */}
        <div
          className={`fixed inset-0 md:hidden transform transition-transform duration-300 overflow-hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            backgroundImage: 'none',
            isolation: 'isolate',
            minHeight: '100vh',
            height: '100vh',
            zIndex: 2147483647
          }}
        >
        <div className="h-screen w-full flex flex-col relative" style={{ backgroundColor: 'rgb(255, 255, 255)', backgroundImage: 'none', minHeight: '100vh', zIndex: 1 }}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={closeMenu}
              className="p-1 text-gray-600 hover:text-gray-900"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items - Flex grow to push footer down */}
          <nav className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/dashboard" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Dashboard</span>
                </Link>
              </li>

              <li>
                <Link 
                  href="/dashboard/profile" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Profile</span>
                </Link>
              </li>

              <li>
                <Link 
                  href="/dashboard/overview" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Year Overview</span>
                </Link>
              </li>

              {session && (
                <li className="pt-4 border-t">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Footer with X (Twitter) Link */}
          <div className="border-t p-4" style={{ backgroundColor: '#ffffff' }}>
            <a
              href="https://x.com/Niblahistaken"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Twitter className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Follow me on X</span>
            </a>
          </div>
        </div>
      </div>
      </MobileMenuPortal>
    </>
  )
}