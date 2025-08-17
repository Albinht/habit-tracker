'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Palette, Lock, Check } from 'lucide-react'
import { DEFAULT_HABIT_COLORS } from '@/lib/constants'

interface ColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
  isPro?: boolean
  showPreview?: boolean
}

const EXTENDED_COLORS = [
  ...DEFAULT_HABIT_COLORS,
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#78716c', // Stone
]

const COLOR_NAMES: Record<string, string> = {
  '#10b981': 'Emerald',
  '#3b82f6': 'Blue',
  '#8b5cf6': 'Violet',
  '#f59e0b': 'Amber',
  '#ef4444': 'Red',
  '#06b6d4': 'Cyan',
  '#f97316': 'Orange',
  '#ec4899': 'Pink',
  '#6366f1': 'Indigo',
  '#a855f7': 'Purple',
  '#84cc16': 'Lime',
  '#14b8a6': 'Teal',
  '#f43f5e': 'Rose',
  '#78716c': 'Stone',
}

export function ColorPicker({ currentColor, onColorChange, isPro = false, showPreview = true }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(currentColor)
  const [showCustom, setShowCustom] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>([])

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    if (!EXTENDED_COLORS.includes(color) && !recentColors.includes(color)) {
      setRecentColors(prev => [color, ...prev.slice(0, 4)])
    }
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    if (isPro) {
      onColorChange(color)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Choose Color
            </CardTitle>
            <CardDescription>
              Select a color for your habit's heat map
            </CardDescription>
          </div>
          {showPreview && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Current:</span>
              <div 
                className="w-8 h-8 rounded-md border-2 border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Colors */}
        <div>
          <Label className="text-sm mb-2 block">Preset Colors</Label>
          <div className="grid grid-cols-7 gap-2">
            {EXTENDED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`relative w-full aspect-square rounded-md border-2 transition-all hover:scale-110 ${
                  currentColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={COLOR_NAMES[color]}
              >
                {currentColor === color && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div>
            <Label className="text-sm mb-2 block">Recent Colors</Label>
            <div className="flex gap-2">
              {recentColors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-md border-2 transition-all hover:scale-110 ${
                    currentColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Color */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Custom Color</Label>
            {!isPro && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            )}
          </div>
          
          {isPro ? (
            <div className="flex gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <Button
                onClick={() => handleColorSelect(customColor)}
                variant={currentColor === customColor ? 'default' : 'outline'}
              >
                Apply
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Upgrade to Pro to use custom colors and unlock unlimited color options for your habits.
              </p>
              <Button variant="link" className="p-0 h-auto mt-1">
                Learn more →
              </Button>
            </div>
          )}
        </div>

        {/* Color Preview */}
        {showPreview && (
          <div className="pt-4 border-t">
            <Label className="text-sm mb-2 block">Preview</Label>
            <div className="flex gap-1">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                <div
                  key={intensity}
                  className="flex-1 h-8 rounded"
                  style={{
                    backgroundColor: intensity === 0 
                      ? '#f3f4f6' 
                      : currentColor,
                    opacity: intensity === 0 ? 1 : 0.2 + intensity * 0.8
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Heat map intensity preview
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}