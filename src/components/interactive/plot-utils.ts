export type PlotPoint = {
  readonly x: number
  readonly y: number
}

export function scaleLinear({
  value,
  domainMin,
  domainMax,
  rangeMin,
  rangeMax,
}: {
  readonly value: number
  readonly domainMin: number
  readonly domainMax: number
  readonly rangeMin: number
  readonly rangeMax: number
}): number {
  if (domainMax === domainMin) {
    return rangeMin
  }
  const t = (value - domainMin) / (domainMax - domainMin)
  return rangeMin + t * (rangeMax - rangeMin)
}

export function pathFromPoints(points: ReadonlyArray<PlotPoint>): string {
  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    })
    .join(' ')
}

export function areaPathFromPoints(
  points: ReadonlyArray<PlotPoint>,
  baseline: number,
): string {
  const first = points[0]
  const last = points[points.length - 1]
  if (first === undefined || last === undefined) {
    return ''
  }
  return `${pathFromPoints(points)} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} L ${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`
}

export function clampToRange(value: number, min: number, max: number): number {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}
