import { normalCdf, normalInvCdf } from '@/domain/math/distributions.ts'

/** Small, fast, seeded RNG (mulberry32) for reproducible simulations. */
export function makeRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function gaussian(rng: () => number): number {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function gaussianVector(
  rng: () => number,
  count: number,
): Array<number> {
  const out: Array<number> = []
  for (let i = 0; i < count; i += 1) {
    out.push(gaussian(rng))
  }
  return out
}

/** AR(1) process with pole a, unit-variance innovations. */
export function ar1(
  rng: () => number,
  count: number,
  a: number,
): Array<number> {
  const out: Array<number> = []
  let prev = gaussian(rng) / Math.sqrt(Math.max(1 - a * a, 1e-6))
  for (let i = 0; i < count; i += 1) {
    prev = a * prev + gaussian(rng)
    out.push(prev * Math.sqrt(1 - a * a))
  }
  return out
}

/** Real tone of amplitude A at frequency f (cycles/sample) plus white noise of std sigma. */
export function toneInNoise(
  rng: () => number,
  count: number,
  amplitude: number,
  frequency: number,
  sigma: number,
  phase: number,
): Array<number> {
  const out: Array<number> = []
  for (let n = 0; n < count; n += 1) {
    out.push(
      amplitude * Math.cos(2 * Math.PI * frequency * n + phase) +
        sigma * gaussian(rng),
    )
  }
  return out
}

/** Biased sample autocorrelation r̂(m) = (1/N) Σ x(n+m)x(n) for m = 0..maxLag. */
export function sampleAutocorrelation(
  x: ReadonlyArray<number>,
  maxLag: number,
): Array<number> {
  const n = x.length
  const out: Array<number> = []
  for (let m = 0; m <= maxLag; m += 1) {
    let acc = 0
    for (let i = 0; i + m < n; i += 1) {
      acc += (x[i + m] ?? 0) * (x[i] ?? 0)
    }
    out.push(acc / n)
  }
  return out
}

/** Periodogram value |Σ x(n) e^{-j2πfn}|² / N at one frequency. */
export function periodogramAt(x: ReadonlyArray<number>, f: number): number {
  let re = 0
  let im = 0
  for (let n = 0; n < x.length; n += 1) {
    const angle = -2 * Math.PI * f * n
    re += (x[n] ?? 0) * Math.cos(angle)
    im += (x[n] ?? 0) * Math.sin(angle)
  }
  return (re * re + im * im) / x.length
}

/** PSD of the biased autocorrelation estimate, evaluated on a frequency grid. */
export function psdFromAutocorrelation(
  r: ReadonlyArray<number>,
  frequencies: ReadonlyArray<number>,
): Array<number> {
  return frequencies.map((f) => {
    let s = r[0] ?? 0
    for (let m = 1; m < r.length; m += 1) {
      s += 2 * (r[m] ?? 0) * Math.cos(2 * Math.PI * f * m)
    }
    return Math.max(s, 0)
  })
}

export function qFunc(x: number): number {
  return 1 - normalCdf(x, 0, 1)
}

export function qInv(p: number): number {
  return normalInvCdf(1 - p)
}

function logGamma(z: number): number {
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
  }
  const zz = z - 1
  let acc = c[0] ?? 0
  for (let i = 1; i < g + 2; i += 1) {
    acc += (c[i] ?? 0) / (zz + i)
  }
  const t = zz + g + 0.5
  return (
    0.5 * Math.log(2 * Math.PI) + (zz + 0.5) * Math.log(t) - t + Math.log(acc)
  )
}

/** Regularized lower incomplete gamma P(a, x). */
function regularizedGammaP(a: number, x: number): number {
  if (x <= 0) {
    return 0
  }
  if (x < a + 1) {
    let term = 1 / a
    let sum = term
    for (let k = 1; k < 300; k += 1) {
      term *= x / (a + k)
      sum += term
      if (term < sum * 1e-12) {
        break
      }
    }
    return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - logGamma(a)))
  }
  let b = x + 1 - a
  let c0 = 1e300
  let d = 1 / b
  let h = d
  for (let k = 1; k < 300; k += 1) {
    const an = -k * (k - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < 1e-300) {
      d = 1e-300
    }
    c0 = b + an / c0
    if (Math.abs(c0) < 1e-300) {
      c0 = 1e-300
    }
    d = 1 / d
    const delta = d * c0
    h *= delta
    if (Math.abs(delta - 1) < 1e-12) {
      break
    }
  }
  return Math.max(0, 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h)
}

/** Chi-squared pdf with k degrees of freedom, unit-variance components. */
export function chi2Pdf(x: number, k: number): number {
  if (x <= 0) {
    return 0
  }
  return Math.exp(
    (k / 2 - 1) * Math.log(x) -
      x / 2 -
      ((k / 2) * Math.log(2) + logGamma(k / 2)),
  )
}

/** Right tail Pr(χ²_k > x). */
export function chi2Tail(x: number, k: number): number {
  return 1 - regularizedGammaP(k / 2, x / 2)
}

/** Inverse of the right tail: threshold x with Pr(χ²_k > x) = p (bisection). */
export function chi2TailInv(p: number, k: number): number {
  let lo = 0
  let hi = k + 40 * Math.sqrt(2 * k) + 40
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2
    if (chi2Tail(mid, k) > p) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

export function binomialPmf(n: number, k: number, p: number): number {
  if (k < 0 || k > n) {
    return 0
  }
  const logCoef = logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1)
  const logP =
    k * Math.log(Math.max(p, 1e-12)) +
    (n - k) * Math.log(Math.max(1 - p, 1e-12))
  return Math.exp(logCoef + logP)
}

export type Matrix2 = {
  readonly a: number
  readonly b: number
  readonly c: number
  readonly d: number
}

export type Eigen2 = {
  readonly lambda1: number
  readonly lambda2: number
  /** Unit eigenvector for lambda1 (the larger eigenvalue). */
  readonly u1: readonly [number, number]
  readonly u2: readonly [number, number]
}

/** Eigen-decomposition of a symmetric 2x2 matrix [[a, b], [b, d]]. */
export function eigSym2(a: number, b: number, d: number): Eigen2 {
  const tr = a + d
  const det = a * d - b * b
  const disc = Math.sqrt(Math.max((tr * tr) / 4 - det, 0))
  const lambda1 = tr / 2 + disc
  const lambda2 = tr / 2 - disc
  let v1: readonly [number, number]
  if (Math.abs(b) > 1e-12) {
    v1 = [lambda1 - d, b]
  } else if (a >= d) {
    v1 = [1, 0]
  } else {
    v1 = [0, 1]
  }
  const norm = Math.hypot(v1[0], v1[1]) || 1
  const u1: readonly [number, number] = [v1[0] / norm, v1[1] / norm]
  const u2: readonly [number, number] = [-u1[1], u1[0]]
  return { lambda1, lambda2, u1, u2 }
}

export function quadForm2(m: Matrix2, x: number, y: number): number {
  return m.a * x * x + (m.b + m.c) * x * y + m.d * y * y
}
