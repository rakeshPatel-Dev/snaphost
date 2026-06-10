import React from 'react';
import { cn } from '@/lib/utils';

interface DashedGridProps {
  children?: React.ReactNode;
  className?: string;
  opacity?: number;
  zIndex?: number;
  absolute?: boolean;
}

export default function DashedGrid({
  children,
  className,
  opacity,
  zIndex = 0,
  absolute = true,
}: DashedGridProps) {
  const gridElement = (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-0",
        !children && className
      )}
      style={{
        zIndex: children ? undefined : zIndex,
        opacity: children ? undefined : opacity,
        backgroundImage: `
          linear-gradient(to right, var(--grid-dashed-line) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid-dashed-line) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 0",
        maskImage: `
          repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
          repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
          radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
        `,
        WebkitMaskImage: `
          repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
          repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
          radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
        `,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    />
  );

  if (children) {
    return (
      <div
        className={cn("relative w-full h-full", className)}
        style={{ zIndex, opacity }}
      >
        {gridElement}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        absolute ? "absolute inset-0" : "relative w-full h-full",
        "pointer-events-none",
        className
      )}
      style={{
        zIndex,
        opacity,
        backgroundImage: `
          linear-gradient(to right, var(--grid-dashed-line) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid-dashed-line) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 0",
        maskImage: `
          repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
          repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
          radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
        `,
        WebkitMaskImage: `
          repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
          repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
          radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
        `,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}
