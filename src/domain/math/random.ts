export type RngState = {
  readonly seed: number
}

const MODULUS = 2147483647
const MULTIPLIER = 48271

function normalizeSeed(seed: number): number {
  const value = Math.floor(Math.abs(seed)) % MODULUS
  return value === 0 ? 1 : value
}

export function nextSeed(seed: number): number {
  return (normalizeSeed(seed) * MULTIPLIER) % MODULUS
}

export function uniform01(seed: number): {
  readonly value: number
  readonly next: RngState
} {
  const next = nextSeed(seed)
  return {
    value: next / MODULUS,
    next: { seed: next },
  }
}

export function normalSample(seed: number): {
  readonly value: number
  readonly next: RngState
} {
  const first = uniform01(seed)
  const second = uniform01(first.next.seed)
  const radius = Math.sqrt(-2 * Math.log(Math.max(first.value, 1e-12)))
  const angle = 2 * Math.PI * second.value
  return {
    value: radius * Math.cos(angle),
    next: second.next,
  }
}

export function normalSamples(
  seed: number,
  count: number,
): {
  readonly values: ReadonlyArray<number>
  readonly next: RngState
} {
  const values: Array<number> = []
  let current = normalizeSeed(seed)
  for (let index = 0; index < count; index += 1) {
    const sample = normalSample(current)
    values.push(sample.value)
    current = sample.next.seed
  }
  return {
    values,
    next: { seed: current },
  }
}
