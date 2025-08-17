'use client'

import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HABIT_COLOR_PALETTE } from '@/lib/utils/color-utils'

interface ColorPickerProps {
  isOpen: boolean
  onClose: () => void
  currentColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({
  isOpen,
  onClose,
  currentColor,
  onColorChange
}: ColorPickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose habit color
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-6 gap-3 p-4">
          {HABIT_COLOR_PALETTE.map((color) => (
            <button
              key={color}
              className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentColor === color
                  ? 'border-gray-400 ring-2 ring-gray-300'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}