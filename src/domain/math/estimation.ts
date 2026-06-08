export function sampleMean(values: ReadonlyArray<number>): number {
  if (values.length === 0) {
    return Number.NaN
  }
  let total = 0
  for (const value of values) {
    total += value
  }
  return total / values.length
}

export function weightedGaussianMean(
  measurements: ReadonlyArray<number>,
  variances: ReadonlyArray<number>,
): number {
  if (measurements.length !== variances.length || measurements.length === 0) {
    return Number.NaN
  }
  let weightedTotal = 0
  let precisionTotal = 0
  for (let index = 0; index < measurements.length; index += 1) {
    const measurement = measurements[index]
    const variance = variances[index]
    if (measurement === undefined || variance === undefined || variance <= 0) {
      return Number.NaN
    }
    const precision = 1 / variance
    weightedTotal += measurement * precision
    precisionTotal += precision
  }
  return weightedTotal / precisionTotal
}

export function bias(estimateMean: number, truth: number): number {
  return estimateMean - truth
}

export function variance(values: ReadonlyArray<number>): number {
  if (values.length <= 1) {
    return 0
  }
  const mean = sampleMean(values)
  let total = 0
  for (const value of values) {
    const delta = value - mean
    total += delta * delta
  }
  return total / (values.length - 1)
}

export function mse(biasValue: number, varianceValue: number): number {
  return biasValue * biasValue + varianceValue
}

export function gaussianMeanCrb(
  noiseVariance: number,
  sampleCount: number,
): number {
  return noiseVariance / sampleCount
}

export function gammaScaleMl(
  totalDelay: number,
  sampleCount: number,
  shape: number,
): number {
  return totalDelay / (sampleCount * shape)
}

export function gammaScaleLogLikelihoodIgnoringConstant({
  totalDelay,
  sampleCount,
  shape,
  scale,
}: {
  readonly totalDelay: number
  readonly sampleCount: number
  readonly shape: number
  readonly scale: number
}): number {
  return -totalDelay / scale - sampleCount * shape * Math.log(scale)
}

export function poissonMl(totalCount: number, sampleCount: number): number {
  return totalCount / sampleCount
}

export function normalMeanMap({
  sampleMeanValue,
  sampleCount,
  noiseVariance,
  priorMean,
  priorVariance,
}: {
  readonly sampleMeanValue: number
  readonly sampleCount: number
  readonly noiseVariance: number
  readonly priorMean: number
  readonly priorVariance: number
}): number {
  const dataPrecision = sampleCount / noiseVariance
  const priorPrecision = 1 / priorVariance
  return (
    (sampleMeanValue * dataPrecision + priorMean * priorPrecision) /
    (dataPrecision + priorPrecision)
  )
}

export function normalNormalPosterior({
  priorMean,
  priorSd,
  likelihoodMean,
  likelihoodSd,
}: {
  readonly priorMean: number
  readonly priorSd: number
  readonly likelihoodMean: number
  readonly likelihoodSd: number
}): {
  readonly mean: number
  readonly sd: number
} {
  const priorPrecision = 1 / (priorSd * priorSd)
  const likelihoodPrecision = 1 / (likelihoodSd * likelihoodSd)
  const varianceValue = 1 / (priorPrecision + likelihoodPrecision)
  return {
    mean:
      varianceValue *
      (priorMean * priorPrecision + likelihoodMean * likelihoodPrecision),
    sd: Math.sqrt(varianceValue),
  }
}

export function shrinkageMoments({
  shrinkage,
  truth,
  baseVariance,
}: {
  readonly shrinkage: number
  readonly truth: number
  readonly baseVariance: number
}): {
  readonly biasValue: number
  readonly varianceValue: number
  readonly mseValue: number
} {
  const biasValue = -shrinkage * truth
  const varianceValue = (1 - shrinkage) * (1 - shrinkage) * baseVariance
  return {
    biasValue,
    varianceValue,
    mseValue: mse(biasValue, varianceValue),
  }
}
