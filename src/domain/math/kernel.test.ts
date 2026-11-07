import { describe, expect, it } from 'vitest'
import {
  complexPeriodogramAt,
  complexToneInNoise,
  makeRng,
} from '@/domain/math/kernel.ts'

describe('complex tone periodogram', () => {
  const clean = complexToneInNoise(makeRng(1), 32, 2, 0.25, 0, 0.7)

  it('peaks at N|A|² on the tone frequency', () => {
    expect(complexPeriodogramAt(clean, 0.25)).toBeCloseTo(32 * 4, 6)
  })

  it('is zero on another DFT bin', () => {
    expect(complexPeriodogramAt(clean, 0.25 + 3 / 32)).toBeCloseTo(0, 6)
  })

  it('has no mirror peak at -f, unlike a real tone', () => {
    expect(complexPeriodogramAt(clean, 0.75)).toBeCloseTo(0, 6)
  })
})
