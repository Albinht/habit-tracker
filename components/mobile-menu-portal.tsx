'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface MobileMenuPortalProps {
  children: React.ReactNode
}

export function MobileMenuPortal({ children }: MobileMenuPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return null
  }

  return createPortal(
    children,
    document.body
  )
}