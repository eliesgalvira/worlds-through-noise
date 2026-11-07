import { describe, expect, it } from 'vitest'
import { niceTicks } from '@/components/figures/figure-utils.ts'

describe('niceTicks', () => {
  it('uses a 1, 2 or 5 step and stays inside the range', () => {
    expect(niceTicks(12.3, 4)).toEqual([0, 5, 10])
    expect(niceTicks(64, 4)).toEqual([0, 20, 40, 60])
    expect(niceTicks(0.9, 3)).toEqual([0, 0.5])
  })

  it('returns only zero for an empty range', () => {
    expect(niceTicks(0, 4)).toEqual([0])
  })
})
