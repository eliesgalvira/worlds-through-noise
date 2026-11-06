import { describe, expect, it } from 'vitest'
import {
  interactionImage,
  isNeutralName,
  lessonImage,
  sectionSlug,
  tileHeight,
  tiles,
} from './nombres.ts'

describe('tiles', () => {
  it('covers the span exactly with tiles no taller than the cap', () => {
    for (const height of [1, 899, 900, 901, 4321]) {
      const parts = tiles(100, height, 900)
      expect(parts[0]?.y).toBe(100)
      const total = parts.reduce((sum, part) => sum + part.height, 0)
      expect(total).toBe(height)
      for (const part of parts) {
        expect(part.height).toBeLessThanOrEqual(900)
        expect(part.height).toBeGreaterThan(0)
      }
    }
  })

  it('returns nothing for an empty span', () => {
    expect(tiles(0, 0, 900)).toEqual([])
  })
})

describe('tile height', () => {
  it('keeps every tile under the vision downscale limit', () => {
    for (const width of [390, 900, 1440]) {
      expect(Math.max(width, tileHeight(width))).toBeLessThanOrEqual(1568)
    }
  })
})

describe('neutral names', () => {
  it('accepts what the bench writes', () => {
    expect(
      isNeutralName(lessonImage(390, 'resuelto', sectionSlug('D3'), 2)),
    ).toBe(true)
    expect(
      isNeutralName(lessonImage(1440, 'inicial', sectionSlug('exam-bank'), 1)),
    ).toBe(true)
    expect(isNeutralName(interactionImage('d2', 900, 4))).toBe(true)
    expect(isNeutralName('producto-c.png')).toBe(true)
  })

  it('rejects names that leak a round, a stage or a product', () => {
    for (const name of [
      'leccion-1440-inicial-d3-1-ronda2.png',
      'candidato-1440.png',
      'antes-d3.png',
      'producto-brilliant.png',
      'leccion-1280-inicial-d3-1.png',
      'interaccion-d2-900-tira.png',
      'X-overflowing.txt',
    ]) {
      expect(isNeutralName(name)).toBe(false)
    }
  })
})

describe('interaction scripts', () => {
  it('describe actions without saying what should appear', async () => {
    const { INTERACCIONES, describirInteraccion } =
      await import('./interacciones.ts')
    for (const interaccion of Object.values(INTERACCIONES)) {
      const texto = describirInteraccion(interaccion)
      expect(texto.split('\n').filter(Boolean)).toHaveLength(
        interaccion.pasos.length,
      )
      expect(texto).not.toMatch(/watch|mira|verás|should|debería/i)
      expect(interaccion.pasos.length + 1).toBeGreaterThanOrEqual(3)
      expect(interaccion.pasos.length + 1).toBeLessThanOrEqual(5)
    }
  })
})
