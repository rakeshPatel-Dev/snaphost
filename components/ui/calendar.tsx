'use client'

import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Calendar({ className, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn('mx-auto w-full max-w-[18rem] p-1', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous: 'absolute left-1 size-7 rounded-full hover:bg-muted',
        button_next: 'absolute right-1 size-7 rounded-full hover:bg-muted',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'w-9 rounded-md text-[0.75rem] font-normal text-muted-foreground',
        week: 'flex w-full mt-2',
        day: 'size-9 p-0 text-center text-sm',
        day_button:
          'size-9 rounded-md font-normal hover:bg-muted aria-selected:bg-accent aria-selected:text-accent-foreground',
        today: 'bg-muted/60 font-semibold',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  )
}
