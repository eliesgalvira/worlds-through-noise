/**
 * Neutral file names for the hill-climb bench and reviewer bundles. A name
 * says width, state and section, never round or stage.
 */

export const WIDTHS = [1440, 900, 390] as const
export type Width = (typeof WIDTHS)[number]

export const STATES = ['inicial', 'extremo', 'resuelto'] as const
export type State = (typeof STATES)[number]

/** Viewport height per width: a laptop, a compact window, a phone. */
export function viewportHeight(width: number): number {
  if (width >= 1200) {
    return 900
  }
  if (width >= 600) {
    return 1100
  }
  return 844
}

/**
 * Tallest tile a reviewer gets. Vision models downscale an image whose long
 * side passes about 1568 px, so a tile never grows past that.
 */
export function tileHeight(width: number): number {
  return Math.max(Math.min(1568, Math.round(width * 1.1)), 900)
}

/** Split a vertical span into tiles no taller than `max`, as even as possible. */
export function tiles(
  top: number,
  height: number,
  max: number,
): ReadonlyArray<{ readonly y: number; readonly height: number }> {
  if (height <= 0) {
    return []
  }
  const count = Math.ceil(height / max)
  const size = Math.ceil(height / count)
  const out: Array<{ readonly y: number; readonly height: number }> = []
  for (let index = 0; index < count; index += 1) {
    const y = top + index * size
    out.push({ y, height: Math.min(size, top + height - y) })
  }
  return out
}

export function sectionSlug(id: string): string {
  return id === 'exam-bank' ? 'cuaderno' : id.toLowerCase()
}

export function lessonImage(
  width: number,
  state: State,
  section: string,
  part: number,
): string {
  return `leccion-${String(width)}-${state}-${section}-${String(part)}.png`
}

export function interactionImage(
  figure: string,
  width: number,
  frame: number,
): string {
  return `interaccion-${figure}-${String(width)}-${String(frame)}.png`
}

export function interactionText(figure: string): string {
  return `interaccion-${figure}.txt`
}
