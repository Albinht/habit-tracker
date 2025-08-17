'use client'

import { useState } from 'react'

export interface ColorPalette {
  name: string
  light: string
  medium: string
  dark: string
  primary: string
}

export const MATTE_COLOR_PALETTES: ColorPalette[] = [
  {
    name: 'Green',
    light: '#D1FAE5',
    medium: '#6EE7B7',
    dark: '#10B981',
    primary: '#059669'
  },
  {
    name: 'Blue',
    light: '#DBEAFE',
    medium: '#93C5FD',
    dark: '#3B82F6',
    primary: '#2563EB'
  },
  {
    name: 'Purple',
    light: '#EDE9FE',
    medium: '#C4B5FD',
    dark: '#8B5CF6',
    primary: '#7C3AED'
  },
  {
    name: 'Pink',
    light: '#FCE7F3',
    medium: '#F9A8D4',
    dark: '#EC4899',
    primary: '#DB2777'
  },
  {
    name: 'Orange',
    light: '#FED7AA',
    medium: '#FDBA74',
    dark: '#F97316',
    primary: '#EA580C'
  },
  {
    name: 'Teal',
    light: '#CCFBF1',
    medium: '#7DD3FC',
    dark: '#14B8A6',
    primary: '#0D9488'
  },
  {
    name: 'Indigo',
    light: '#E0E7FF',
    medium: '#A5B4FC',
    dark: '#6366F1',
    primary: '#4F46E5'
  },
  {
    name: 'Yellow',
    light: '#FEF3C7',
    medium: '#FDE68A',
    dark: '#F59E0B',
    primary: '#D97706'
  },
  {
    name: 'Red',
    light: '#FEE2E2',
    medium: '#FCA5A5',
    dark: '#EF4444',
    primary: '#DC2626'
  },
  {
    name: 'Gray',
    light: '#F3F4F6',
    medium: '#D1D5DB',
    dark: '#6B7280',
    primary: '#4B5563'
  },
]

interface ColorPickerPaletteProps {
  selectedPalette: ColorPalette
  onPaletteChange: (palette: ColorPalette) => void
  className?: string
}

export function ColorPickerPalette({ 
  selectedPalette, 
  onPaletteChange, 
  className = '' 
}: ColorPickerPaletteProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <span className="text-sm text-gray-500 mr-3 flex items-center">Colors:</span>
      {MATTE_COLOR_PALETTES.map((palette) => (
        <button
          key={palette.name}
          onClick={() => onPaletteChange(palette)}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
            selectedPalette.name === palette.name 
              ? 'border-gray-400 ring-2 ring-gray-300 ring-offset-2' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ 
            background: `linear-gradient(135deg, ${palette.light} 0%, ${palette.medium} 50%, ${palette.dark} 100%)` 
          }}
          title={palette.name}
        />
      ))}
    </div>
  )
}