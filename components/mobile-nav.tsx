'use client'

import { useState } from 'react'
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

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="p-2"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMenu}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* User Section */}
          {session && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <Image src="/scribble final version-139.svg" alt="Sign out" width={16} height={16} className="h-4 w-4 mr-3" />
                Sign out
              </Button>
            </div>
          )}
          
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={closeMenu}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={closeMenu}
            >
              <Image src="/scribble final version-39.svg" alt="Settings" width={20} height={20} className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}