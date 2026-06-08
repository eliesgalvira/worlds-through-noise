import type { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

type MetricTone = 'neutral' | 'h0' | 'h1' | 'detection' | 'falseAlarm'

const toneRing: Record<MetricTone, string> = {
  neutral: 'border-border',
  h0: 'border-h0/40',
  h1: 'border-accent/40',
  detection: 'border-detection/40',
  falseAlarm: 'border-false-alarm/40',
}

const toneText: Record<MetricTone, string> = {
  neutral: 'text-foreground',
  h0: 'text-h0',
  h1: 'text-accent',
  detection: 'text-detection',
  falseAlarm: 'text-false-alarm',
}

type MetricStatProps = {
  readonly label: string
  readonly value: ReactNode
  readonly sublabel?: string
  readonly tone?: MetricTone
  readonly className?: string
}

function MetricStat({
  label,
  value,
  sublabel,
  tone = 'neutral',
  className,
}: MetricStatProps) {
  return (
    <div
      className={cn(
        'rounded-md border bg-background px-4 py-3',
        toneRing[tone],
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-mono text-2xl font-semibold tabular-nums leading-none',
          toneText[tone],
        )}
      >
        {value}
      </p>
      {sublabel !== undefined ? (
        <p className="mt-1.5 text-xs leading-4 text-muted-foreground">
          {sublabel}
        </p>
      ) : null}
    </div>
  )
}

export { MetricStat }
