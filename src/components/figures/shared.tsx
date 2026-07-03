import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

type FigureShellProps = {
  readonly title: string
  readonly instruction: string
  readonly children: ReactNode
  readonly controls: ReactNode
  readonly readout?: ReactNode
}

/**
 * Frame for every interactive figure: visual on the left, controls in a
 * narrow column, readouts under the controls. The visual is the protagonist.
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
      className="rounded-lg border bg-card/80 p-5 sm:p-6"
      aria-label={title}
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Perform the action
      </p>
      <h4 className="mt-2 max-w-3xl font-serif text-xl font-semibold leading-snug text-foreground">
        {title}
      </h4>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        {instruction}
      </p>
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,19rem)]">
        <div className="min-w-0">{children}</div>
        <div className="space-y-5 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          {controls}
          {readout !== undefined ? (
            <div className="space-y-1.5 border-t border-border pt-4 text-sm leading-6">
              {readout}
            </div>
          ) : null}
        </div>
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

/** SVG plot surface with optional pointer dragging in viewBox coordinates. */
function Plot({
  viewW,
  viewH,
  ariaLabel,
  children,
  className,
  onDragPoint,
}: PlotProps) {
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
      viewBox={`0 0 ${viewW} ${viewH}`}
      role="img"
      aria-label={ariaLabel}
      className={`block w-full select-none rounded-md border border-border bg-card ${onDragPoint !== undefined ? 'touch-none cursor-crosshair' : ''} ${className ?? ''}`}
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

type ReadoutRowProps = {
  readonly label: string
  readonly value: string
  readonly tone?: 'default' | 'h0' | 'h1' | 'good' | 'bad'
}

function ReadoutRow({ label, value, tone = 'default' }: ReadoutRowProps) {
  const toneClass =
    tone === 'h0'
      ? 'text-h0'
      : tone === 'h1'
        ? 'text-h1'
        : tone === 'good'
          ? 'text-detection'
          : tone === 'bad'
            ? 'text-false-alarm'
            : 'text-foreground'
  return (
    <p className="flex items-baseline justify-between gap-3 text-muted-foreground">
      <span>{label}</span>
      <span className={`font-mono text-[13px] ${toneClass}`}>{value}</span>
    </p>
  )
}

type LegendProps = {
  readonly items: ReadonlyArray<{
    readonly label: string
    readonly swatchClass: string
    readonly dash?: boolean
  }>
}

function Legend({ items }: LegendProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 20 6" className="h-1.5 w-5" aria-hidden="true">
            <line
              x1="1"
              y1="3"
              x2="19"
              y2="3"
              strokeWidth="2.5"
              strokeDasharray={item.dash === true ? '3 3' : undefined}
              className={item.swatchClass}
            />
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  )
}

export { FigureShell, Plot, ReadoutRow, Legend }
