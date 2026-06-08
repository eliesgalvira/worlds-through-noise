import { normalCdf, normalPdf } from '@/domain/math/distributions.ts'

export function gaussianLikelihoodRatio(
  x: number,
  h0Mean: number,
  h1Mean: number,
  sd: number,
): number {
  return normalPdf(x, h1Mean, sd) / normalPdf(x, h0Mean, sd)
}

export function gaussianLogLikelihoodRatio(
  x: number,
  h0Mean: number,
  h1Mean: number,
  sd: number,
): number {
  const variance = sd * sd
  return ((h0Mean - h1Mean) * (h0Mean + h1Mean - 2 * x)) / (2 * variance)
}

export function rightTailFalseAlarm(
  threshold: number,
  h0Mean: number,
  sd: number,
): number {
  return 1 - normalCdf(threshold, h0Mean, sd)
}

export function rightTailDetectionProbability(
  threshold: number,
  h1Mean: number,
  sd: number,
): number {
  return 1 - normalCdf(threshold, h1Mean, sd)
}

export function npThresholdRightTail(
  alpha: number,
  h0Mean: number,
  sd: number,
  normalInvCdf: (p: number) => number,
): number {
  return h0Mean + sd * normalInvCdf(1 - alpha)
}

export function bayesGaussianThreshold({
  h0Mean,
  h1Mean,
  sd,
  priorH1,
  missCost,
  falseAlarmCost,
}: {
  readonly h0Mean: number
  readonly h1Mean: number
  readonly sd: number
  readonly priorH1: number
  readonly missCost: number
  readonly falseAlarmCost: number
}): number {
  const priorH0 = 1 - priorH1
  const logTerm = Math.log((falseAlarmCost * priorH0) / (missCost * priorH1))
  return (h0Mean + h1Mean) / 2 + ((sd * sd) / (h1Mean - h0Mean)) * logTerm
}
