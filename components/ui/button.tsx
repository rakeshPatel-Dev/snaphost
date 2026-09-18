import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_14px_-2px_rgba(5,150,105,0.45)] hover:from-emerald-600 hover:to-emerald-700 hover:shadow-[0_6px_18px_-4px_rgba(5,150,105,0.6)] focus-visible:border-emerald-300 focus-visible:ring-emerald-400/40 active:not-aria-[haspopup]:shadow-[0_2px_6px_-2px_rgba(5,150,105,0.35)] dark:shadow-[0_4px_16px_-2px_rgba(16,185,129,0.5)] dark:hover:shadow-[0_6px_20px_-4px_rgba(16,185,129,0.65)]",
        outline:
          "border-foreground/15 bg-gradient-to-b from-background to-muted/50 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] hover:from-muted hover:to-muted hover:text-foreground hover:shadow-[0_6px_18px_-4px_rgba(15,23,42,0.18)] aria-expanded:from-muted aria-expanded:to-muted aria-expanded:text-foreground active:not-aria-[haspopup]:shadow-[0_2px_6px_-2px_rgba(15,23,42,0.1)] dark:border-foreground/20 dark:from-white/[0.08] dark:to-white/[0.02] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.5)] dark:hover:from-white/[0.12] dark:hover:to-white/[0.06] dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.65)] dark:aria-expanded:from-white/[0.12] dark:aria-expanded:to-white/[0.06]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-full px-2 text-xs in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-full px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-full in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-full in-data-[slot=button-group]:rounded-full",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
