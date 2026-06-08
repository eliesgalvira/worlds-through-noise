const SQRT_TWO = Math.SQRT2
const SQRT_TWO_PI = Math.sqrt(2 * Math.PI)

export function clampProbability(value: number): number {
  if (!Number.isFinite(value)) {
    return Number.NaN
  }
  if (value <= 0) {
    return 0
  }
  if (value >= 1) {
    return 1
  }
  return value
}

export function linspace(
  start: number,
  end: number,
  count: number,
): ReadonlyArray<number> {
  if (count <= 1) {
    return [start]
  }
  const values: Array<number> = []
  const denominator = count - 1
  for (let index = 0; index < count; index += 1) {
    values.push(start + ((end - start) * index) / denominator)
  }
  return values
}

export function normalPdf(x: number, mean: number, sd: number): number {
  if (sd <= 0) {
    return Number.NaN
  }
  const z = (x - mean) / sd
  return Math.exp(-0.5 * z * z) / (sd * SQRT_TWO_PI)
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const polynomial = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t
  return sign * (1 - polynomial * Math.exp(-ax * ax))
}

export function normalCdf(x: number, mean: number, sd: number): number {
  if (sd <= 0) {
    return Number.NaN
  }
  return clampProbability(0.5 * (1 + erf((x - mean) / (sd * SQRT_TWO))))
}

export function normalInvCdf(p: number): number {
  const probability = clampProbability(p)
  if (probability <= 0) {
    return Number.NEGATIVE_INFINITY
  }
  if (probability >= 1) {
    return Number.POSITIVE_INFINITY
  }

  const a1 = -39.69683028665376
  const a2 = 220.9460984245205
  const a3 = -275.9285104469687
  const a4 = 138.357751867269
  const a5 = -30.66479806614716
  const a6 = 2.506628277459239
  const b1 = -54.47609879822406
  const b2 = 161.5858368580409
  const b3 = -155.6989798598866
  const b4 = 66.80131188771972
  const b5 = -13.28068155288572
  const c1 = -0.007784894002430293
  const c2 = -0.3223964580411365
  const c3 = -2.400758277161838
  const c4 = -2.549732539343734
  const c5 = 4.374664141464968
  const c6 = 2.938163982698783
  const d1 = 0.007784695709041462
  const d2 = 0.3224671290700398
  const d3 = 2.445134137142996
  const d4 = 3.754408661907416
  const low = 0.02425
  const high = 1 - low

  if (probability < low) {
    const q = Math.sqrt(-2 * Math.log(probability))
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    )
  }
  if (probability > high) {
    const q = Math.sqrt(-2 * Math.log(1 - probability))
    return -(
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    )
  }

  const q = probability - 0.5
  const r = q * q
  return (
    ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
    (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
  )
}

function logGamma(z: number): number {
  const coefficients: ReadonlyArray<number> = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.507343278686905, -0.13857109526572012,
    0.000009984369578019572, 0.00000015056327351493116,
  ]
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
  }
  let x = 0.9999999999998099
  let offset = z - 1
  for (const coefficient of coefficients) {
    offset += 1
    x += coefficient / offset
  }
  const t = z + coefficients.length - 1.5
  return 0.5 * Math.log(2 * Math.PI) + (z - 0.5) * Math.log(t) - t + Math.log(x)
}

export function gammaPdf(x: number, shape: number, scale: number): number {
  if (shape <= 0 || scale <= 0) {
    return Number.NaN
  }
  if (x <= 0) {
    return 0
  }
  const logDensity =
    (shape - 1) * Math.log(x) -
    x / scale -
    shape * Math.log(scale) -
    logGamma(shape)
  return Math.exp(logDensity)
}

function logFactorial(n: number): number {
  if (n < 0) {
    return Number.NaN
  }
  let total = 0
  for (let value = 2; value <= n; value += 1) {
    total += Math.log(value)
  }
  return total
}

export function binomialPmf(k: number, n: number, p: number): number {
  const probability = clampProbability(p)
  if (k < 0 || k > n || !Number.isInteger(k) || !Number.isInteger(n)) {
    return 0
  }
  if (probability === 0) {
    return k === 0 ? 1 : 0
  }
  if (probability === 1) {
    return k === n ? 1 : 0
  }
  const logChoose = logFactorial(n) - logFactorial(k) - logFactorial(n - k)
  return Math.exp(
    logChoose + k * Math.log(probability) + (n - k) * Math.log(1 - probability),
  )
}

export function binomialCdf(k: number, n: number, p: number): number {
  if (k < 0) {
    return 0
  }
  if (k >= n) {
    return 1
  }
  let total = 0
  for (let index = 0; index <= Math.floor(k); index += 1) {
    total += binomialPmf(index, n, p)
  }
  return clampProbability(total)
}
