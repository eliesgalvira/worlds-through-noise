import type { PointerEvent as ReactPointerEvent } from 'react'

/** Convert a pointer event into viewBox coordinates of the target SVG. */
export function svgPoint(
  event: ReactPointerEvent<SVGSVGElement>,
  viewW: number,
  viewH: number,
): { readonly x: number; readonly y: number } {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * viewW
  const y = ((event.clientY - rect.top) / rect.height) * viewH
  return { x, y }
}

export function formatNumber(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return '—'
  }
  return value.toFixed(digits)
}

export function formatPercentValue(value: number): string {
  if (!Number.isFinite(value)) {
    return '—'
  }
  if (value > 0 && value < 0.001) {
    return '<0.1%'
  }
  return `${(value * 100).toFixed(1)}%`
}

/** Round tick values from 0 up to max, with a 1, 2 or 5 step and about `count` ticks. */
export function niceTicks(max: number, count: number): Array<number> {
  if (!(max > 0)) {
    return [0]
  }
  const raw = max / count
  const power = 10 ** Math.floor(Math.log10(raw))
  const step =
    [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power
  const ticks: Array<number> = []
  for (let k = 0; k * step <= max * (1 + 1e-9); k += 1) {
    ticks.push(k * step)
  }
  return ticks
}
