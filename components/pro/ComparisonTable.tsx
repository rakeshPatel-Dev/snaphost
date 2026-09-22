import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { features, planColumns, type PlanKey } from '@/data/pricing'

export default function ComparisonTable({ highlightKey = 'pro' }: { highlightKey?: PlanKey }) {
  const isHighlight = (key: PlanKey) => key === highlightKey

  return (
    <div className="rounded-4xl border border-border/60 bg-card/80 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-4 border-b border-border/60 bg-muted/20">
        <div className="p-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Feature
        </div>
        {planColumns.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              'p-4 sm:text-center text-xs font-semibold uppercase tracking-widest',
              isHighlight(plan.key) ? 'text-accent' : 'text-muted-foreground'
            )}
          >
            {plan.name}
          </div>
        ))}
      </div>

      {features.map((feature, i) => (
        <div
          key={feature.label}
          className={cn(
            'grid grid-cols-1 sm:grid-cols-4 border-b border-border/30 last:border-0 transition-colors md:items-center',
            i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
          )}
        >
          <div className="p-3.5 text-xs text-foreground font-medium">{feature.label}</div>
          {planColumns.map((plan, j) => {
            const value = feature[plan.key]
            return (
              <div
                key={plan.key}
                className={cn(
                  'p-3.5 flex items-center justify-between sm:justify-center gap-3',
                  j === 0 ? 'border-t border-border/30 sm:border-0' : '',
                  isHighlight(plan.key) && 'sm:bg-accent/[0.04]'
                )}
              >
                <span className="sm:hidden text-xs text-muted-foreground">{plan.name}</span>
                {value === true ? (
                  <span className="flex items-center justify-center">
                    <Check
                      className={cn(
                        'h-4 w-4',
                        isHighlight(plan.key) ? 'text-accent' : 'text-emerald-500'
                      )}
                    />
                  </span>
                ) : value === false ? (
                  <span className="flex items-center justify-center">
                    <Minus className="h-4 w-4 text-muted-foreground/30" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      'text-xs',
                      isHighlight(plan.key) ? 'text-accent font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {value}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
