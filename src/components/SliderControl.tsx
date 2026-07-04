import { useId } from 'react'
import { MathText } from '@/components/MathText.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Slider } from '@/components/ui/slider.tsx'
import { cn } from '@/lib/utils.ts'

type SliderControlProps = {
  /** Human label, e.g. "Detection threshold". */
  readonly label: string
  /** The mathematical variable, rendered in mono, e.g. "γ". */
  readonly variable?: string
  /** One-line, plain-English meaning of the control. */
  readonly meaning?: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step?: number
  readonly unit?: string
  readonly onValueChange: (value: number) => void
  readonly format?: (value: number) => string
  readonly className?: string
}

function SliderControl({
  label,
  variable,
  meaning,
  value,
  min,
  max,
  step = 1,
  unit,
  onValueChange,
  format,
  className,
}: SliderControlProps) {
  const id = useId()
  const display =
    format !== undefined
      ? format(value)
      : `${value}${unit !== undefined ? ` ${unit}` : ''}`

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="flex items-center gap-2">
          {label}
          {variable !== undefined ? (
            <span className="font-mono text-xs text-muted-foreground">
              {variable}
            </span>
          ) : null}
        </Label>
        <output
          htmlFor={id}
          className="rounded-full bg-muted/70 px-2 py-0.5 font-mono text-xs tabular-nums text-foreground"
        >
          {display}
        </output>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onValueChange={(values) => {
          const next = values[0]
          if (next !== undefined) {
            onValueChange(next)
          }
        }}
      />
      {meaning !== undefined ? (
        <p className="text-xs leading-5 text-muted-foreground">
          <MathText text={meaning} />
        </p>
      ) : null}
    </div>
  )
}

export { SliderControl }
