'use client'

import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ExpirationPickerProps = {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
}

type Preset = '1d' | '3d' | '7d' | '1m' | 'never'

const presets: Array<{ value: Preset; label: string }> = [
  { value: '1d', label: '1 day' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
  { value: '1m', label: '1 month' },
  { value: 'never', label: 'Never' },
]

function presetDate(preset: Preset): string | null {
  if (preset === 'never') return null
  const date = new Date()
  if (preset === '1d') date.setDate(date.getDate() + 1)
  if (preset === '3d') date.setDate(date.getDate() + 3)
  if (preset === '7d') date.setDate(date.getDate() + 7)
  if (preset === '1m') date.setMonth(date.getMonth() + 1)
  return date.toISOString()
}

function displayValue(value: string | null) {
  if (!value) return 'Never'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ExpirationPicker({
  value,
  onChange,
  label = 'Expiration',
}: ExpirationPickerProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 8, left: 8 })
  const selected = value ? new Date(value) : undefined

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(320, window.innerWidth - 16)
    const panelHeight = Math.min(panelRef.current?.scrollHeight ?? 520, window.innerHeight - 16)
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
    const below = rect.bottom + 8
    const top =
      below + panelHeight <= window.innerHeight - 8
        ? below
        : Math.max(8, rect.top - panelHeight - 8)
    setPosition({ top, left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    const handleViewportChange = () => updatePosition()
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, updatePosition])

  return (
    <div>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className="h-9 w-full justify-start gap-2 rounded-full px-3 text-left text-sm"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={label}
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className={cn(!value && 'text-accent')}>{displayValue(value)}</span>
      </Button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100] max-h-[calc(100dvh-1rem)] w-[min(20rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl border border-border/70 bg-popover p-3 text-popover-foreground shadow-2xl"
            style={{ top: position.top, left: position.left }}
            role="dialog"
            aria-label={label}
          >
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={!value && preset.value === 'never' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onChange(presetDate(preset.value))
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="my-3 border-t border-border/60" />
            <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">Choose a date</p>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (!date) return
                date.setHours(23, 59, 59, 999)
                onChange(date.toISOString())
                setOpen(false)
              }}
              disabled={{ before: new Date() }}
            />
          </div>,
          document.body
        )}
    </div>
  )
}
