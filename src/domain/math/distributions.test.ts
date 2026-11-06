import { describe, expect, it } from 'vitest'
import {
  binomialCdf,
  binomialPmf,
  normalCdf,
  normalInvCdf,
  normalPdf,
} from '@/domain/math/distributions.ts'

// normalCdf uses Abramowitz and Stegun 7.1.26 (absolute erf error below
// 1.5e-7), so tails are checked to the relative accuracy the readouts print.
function expectRelativelyClose(actual: number, expected: number, tol: number) {
  expect(Math.abs(actual - expected) / expected).toBeLessThan(tol)
}

describe('normal distribution', () => {
  it('matches tabulated Q-function values to three significant figures', () => {
    expect(normalCdf(0, 0, 1)).toBeCloseTo(0.5, 8)
    expectRelativelyClose(1 - normalCdf(1.6449, 0, 1), 0.05, 1e-3)
    expectRelativelyClose(1 - normalCdf(3, 0, 1), 0.0013499, 1e-3)
    expectRelativelyClose(1 - normalCdf(5, 0, 1), 2.8665e-7, 5e-3)
  })

  it('inverts its CDF across the range the figures use', () => {
    for (const p of [1e-6, 0.001, 0.05, 0.3, 0.5, 0.9, 0.999]) {
      expectRelativelyClose(normalCdf(normalInvCdf(p), 0, 1), p, 5e-3)
    }
  })

  it('scales the density with the standard deviation', () => {
    expect(normalPdf(0, 0, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12)
    expect(normalPdf(2, 2, 2)).toBeCloseTo(normalPdf(0, 0, 1) / 2, 12)
  })
})

describe('binomial distribution', () => {
  it('sums to one and accumulates the pmf', () => {
    const n = 7
    const p = 0.3
    let total = 0
    for (let k = 0; k <= n; k += 1) {
      total += binomialPmf(k, n, p)
      expect(binomialCdf(k, n, p)).toBeCloseTo(total, 12)
    }
    expect(total).toBeCloseTo(1, 12)
  })
})
