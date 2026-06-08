export type Vector2 = readonly [number, number]
export type Matrix2 = readonly [Vector2, Vector2]

export function dot(
  a: ReadonlyArray<number>,
  b: ReadonlyArray<number>,
): number {
  if (a.length !== b.length) {
    throw new RangeError('dot product requires equal vector lengths')
  }
  let total = 0
  for (let index = 0; index < a.length; index += 1) {
    const av = a[index]
    const bv = b[index]
    if (av === undefined || bv === undefined) {
      throw new RangeError('dot product index out of range')
    }
    total += av * bv
  }
  return total
}

export function matVec2(matrix: Matrix2, vector: Vector2): Vector2 {
  const [[a, b], [c, d]] = matrix
  const [x, y] = vector
  return [a * x + b * y, c * x + d * y]
}

export function inverse2x2(matrix: Matrix2): Matrix2 {
  const [[a, b], [c, d]] = matrix
  const det = a * d - b * c
  if (Math.abs(det) < 1e-12) {
    throw new RangeError('matrix is singular')
  }
  return [
    [d / det, -b / det],
    [-c / det, a / det],
  ]
}

function normalize([x, y]: Vector2): Vector2 {
  const norm = Math.hypot(x, y)
  if (norm <= 1e-12) {
    return [1, 0]
  }
  return [x / norm, y / norm]
}

export function eigenSymmetric2x2(matrix: Matrix2): {
  readonly values: readonly [number, number]
  readonly vectors: readonly [Vector2, Vector2]
} {
  const [[a, b], [, d]] = matrix
  const center = (a + d) / 2
  const spread = Math.hypot((a - d) / 2, b)
  const larger = center + spread
  const smaller = center - spread

  if (Math.abs(b) < 1e-12) {
    const largeVector: Vector2 = a >= d ? [1, 0] : [0, 1]
    const smallVector: Vector2 = a >= d ? [0, 1] : [1, 0]
    return {
      values: [larger, smaller],
      vectors: [largeVector, smallVector],
    }
  }

  return {
    values: [larger, smaller],
    vectors: [normalize([b, larger - a]), normalize([b, smaller - a])],
  }
}
