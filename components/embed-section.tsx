'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Habit } from '@prisma/client'

interface EmbedSectionProps {
  habit: Habit
}

export function EmbedSection({ habit }: EmbedSectionProps) {
  const [copied, setCopied] = useState(false)
  const [allowDirectLog, setAllowDirectLog] = useState(habit.allowDirectLog)
  const [isUpdating, setIsUpdating] = useState(false)

  const embedUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/${habit.embedToken}`
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0"></iframe>`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleDirectLog = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allowDirectLog: !allowDirectLog,
        }),
      })

      if (response.ok) {
        setAllowDirectLog(!allowDirectLog)
      }
    } catch (error) {
      console.error('Failed to update habit:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Embed Settings</CardTitle>
          <CardDescription>
            Share your habit progress anywhere with an embeddable widget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Embed URL</Label>
            <div className="flex gap-2">
              <Input
                value={embedUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(embedUrl)}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="flex gap-2">
              <Input
                value={embedCode}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(embedCode)}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Copy this code to embed in Notion, websites, or any HTML page
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Direct Logging</Label>
                <p className="text-sm text-gray-500">
                  Let anyone log entries through the embed
                </p>
              </div>
              <Button
                variant={allowDirectLog ? 'default' : 'outline'}
                size="sm"
                onClick={toggleDirectLog}
                disabled={isUpdating}
              >
                {allowDirectLog ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label>Embed Token</Label>
            <Badge variant="secondary" className="font-mono mt-1">
              {habit.embedToken}
            </Badge>
            <p className="text-sm text-gray-500 mt-2">
              This token uniquely identifies your habit. Keep it private if direct logging is enabled.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Embed in Notion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-1">
            <li>Copy the embed URL above</li>
            <li>In Notion, type /embed and press Enter</li>
            <li>Paste the URL and click "Embed link"</li>
            <li>Resize the embed as needed</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}