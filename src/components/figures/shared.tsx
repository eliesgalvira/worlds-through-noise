import { useLayoutEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { MathText } from '@/components/MathText.tsx'
import { cn } from '@/lib/utils.ts'

type FigureShellProps = {
  readonly title: string
  readonly instruction: string
  readonly children: ReactNode
  readonly controls: ReactNode
  readonly readout?: ReactNode
}

/**
 * Frame for every interactive figure. The visual takes the full width, the
 * computed readouts sit right under it, next to what they measure, and the
 * controls follow, so figure, numbers and the hand that moves them share one
 * view.
 */
function FigureShell({
  title,
  instruction,
  children,
  controls,
  readout,
}: FigureShellProps) {
  return (
    <section
      className="rounded-lg border bg-card/80 p-4 sm:p-6"
      aria-label={title}
    >
      <h4 className="max-w-3xl font-serif text-xl font-semibold leading-snug text-foreground">
        <MathText text={title} />
      </h4>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
        <MathText text={instruction} />
      </p>
      <div className="mt-4 min-w-0">{children}</div>
      {readout !== undefined ? (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-4">
          {readout}
        </div>
      ) : null}
      <div className="mt-4 grid items-start justify-items-start gap-x-8 gap-y-5 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {controls}
      </div>
    </section>
  )
}

type PlotProps = {
  readonly viewW: number
  readonly viewH: number
  readonly ariaLabel: string
  readonly children: ReactNode
  readonly className?: string
  readonly onDragPoint?: (x: number, y: number) => void
}

/**
 * SVG plot surface with optional pointer dragging in viewBox coordinates. It
 * never grows taller than `--plot-max-h` (about half the window), and it publishes
 * `--plot-px` (viewBox units per CSS pixel) so the `plot-text-*` utilities
 * render at the same apparent size in every figure and at every width.
 */
function Plot({
  viewW,
  viewH,
  ariaLabel,
  children,
  className,
  onDragPoint,
}: PlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Before paint, so the first frame already has the right text size.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (svg === null) {
      return
    }
    svg.style.setProperty('--plot-aspect', String(viewW / viewH))
    const publish = () => {
      const width = svg.getBoundingClientRect().width
      if (width > 0) {
        svg.style.setProperty('--plot-px', String(viewW / width))
      }
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(svg)
    return () => {
      observer.disconnect()
    }
  }, [viewW, viewH])

  const emit = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (onDragPoint === undefined) {
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    onDragPoint(
      ((event.clientX - rect.left) / rect.width) * viewW,
      ((event.clientY - rect.top) / rect.height) * viewH,
    )
  }
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewW} ${viewH}`}
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'mx-auto block w-full max-w-[calc(var(--plot-max-h,55svh)*var(--plot-aspect))] select-none rounded-md border border-border bg-card',
        onDragPoint !== undefined && 'cursor-crosshair touch-none',
        className,
      )}
      onPointerDown={(event) => {
        if (onDragPoint !== undefined) {
          event.currentTarget.setPointerCapture(event.pointerId)
          emit(event)
        }
      }}
      onPointerMove={(event) => {
        if (
          onDragPoint !== undefined &&
          event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          emit(event)
        }
      }}
    >
      {children}
    </svg>
  )
}

type Tone = 'default' | 'h0' | 'h1' | 'good' | 'bad'

const TONE_CLASS: Readonly<Record<Tone, string>> = {
  default: 'text-foreground',
  h0: 'text-h0',
  h1: 'text-h1-ink',
  good: 'text-detection',
  bad: 'text-false-alarm',
}

type ReadoutRowProps = {
  readonly label: string
  readonly value: string
  readonly tone?: Tone
}

/** One computed number with what it measures: the value leads. */
function ReadoutRow({ label, value, tone = 'default' }: ReadoutRowProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs leading-5 text-muted-foreground">
        <MathText text={label} />
      </p>
      <p
        className={cn(
          'font-mono text-base tabular-nums leading-6',
          TONE_CLASS[tone],
        )}
      >
        {value}
      </p>
    </div>
  )
}

/** A sentence about the readouts, spanning the whole readout row. */
function ReadoutNote({ children }: { readonly children: ReactNode }) {
  return (
    <p className="col-span-full max-w-3xl text-xs leading-5 text-muted-foreground">
      {children}
    </p>
  )
}

type LegendProps = {
  readonly items: ReadonlyArray<{
    readonly label: string
    readonly swatchClass: string
    readonly dash?: boolean
    /** Bars get a filled square instead of a line. */
    readonly square?: boolean
  }>
}

function Legend({ items }: LegendProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          {item.square === true ? (
            <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
              <rect width="10" height="10" className={item.swatchClass} />
            </svg>
          ) : (
            <svg viewBox="0 0 20 6" className="h-1.5 w-5" aria-hidden="true">
              <line
                x1="1"
                y1="3"
                x2="19"
                y2="3"
                strokeWidth="2.5"
                strokeDasharray={item.dash === true ? '5 3' : undefined}
                className={item.swatchClass}
              />
            </svg>
          )}
          <MathText text={item.label} />
        </span>
      ))}
    </div>
  )
}

type AxisTicksProps = {
  /** Baseline y of the axis, in viewBox units. */
  readonly y: number
  readonly ticks: ReadonlyArray<{ readonly x: number; readonly label: string }>
}

/** Small tick marks with their numbers under a horizontal plot axis. */
function AxisTicks({ y, ticks }: AxisTicksProps) {
  return (
    <g className="fill-muted-foreground stroke-muted-foreground">
      {ticks.map((tick) => (
        <g key={tick.label}>
          <line x1={tick.x} y1={y} x2={tick.x} y2={y + 4} strokeWidth={1} />
          <text
            x={tick.x}
            y={y + 14}
            textAnchor="middle"
            stroke="none"
            className="font-mono plot-text-xs"
          >
            {tick.label}
          </text>
        </g>
      ))}
    </g>
  )
}

/** A symbol with a subscript inside SVG text, e.g. P with FA. */
function Sym({ base, sub }: { readonly base: string; readonly sub: string }) {
  return (
    <>
      {base}
      <tspan baselineShift="sub" fontSize="0.75em">
        {sub}
      </tspan>
    </>
  )
}

/**
 * Diagonal hatching for an area drawn over another one (α over P_D): the
 * lower fill stays visible between the lines instead of mixing into brown.
 */
function Hatch({
  id,
  className,
}: {
  readonly id: string
  readonly className: string
}) {
  return (
    <defs>
      <pattern
        id={id}
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="5"
          strokeWidth="2.2"
          className={className}
        />
      </pattern>
    </defs>
  )
}

export {
  AxisTicks,
  FigureShell,
  Hatch,
  Legend,
  Plot,
  ReadoutNote,
  ReadoutRow,
  Sym,
}
