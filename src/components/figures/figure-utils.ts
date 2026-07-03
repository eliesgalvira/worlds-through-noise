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
