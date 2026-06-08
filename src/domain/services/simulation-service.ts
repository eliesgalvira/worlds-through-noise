import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { linspace, normalPdf } from '@/domain/math/distributions.ts'
import { normalSamples } from '@/domain/math/random.ts'
import { InvalidParameter, NumericalError } from '@/domain/services/errors.ts'

export type DensityPoint = {
  readonly x: number
  readonly h0: number
  readonly h1: number
}

export type EstimateCloudPoint = {
  readonly x: number
  readonly y: number
}

function ensureFinitePoints(
  operation: string,
  points: ReadonlyArray<DensityPoint>,
) {
  for (const point of points) {
    if (
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.h0) ||
      !Number.isFinite(point.h1)
    ) {
      return Effect.fail(
        new NumericalError({
          operation,
          message: 'A simulation point was non-finite.',
        }),
      )
    }
  }
  return Effect.succeed(points)
}

export class SimulationService extends Context.Service<
  SimulationService,
  {
    readonly gaussianDensities: (input: {
      readonly h0Mean: number
      readonly h1Mean: number
      readonly sd: number
      readonly min: number
      readonly max: number
      readonly count: number
    }) => Effect.Effect<
      ReadonlyArray<DensityPoint>,
      InvalidParameter | NumericalError
    >
    readonly estimateCloud: (input: {
      readonly seed: number
      readonly truth: number
      readonly sd: number
      readonly count: number
    }) => Effect.Effect<
      ReadonlyArray<EstimateCloudPoint>,
      InvalidParameter | NumericalError
    >
  }
>()(
  'worlds-through-noise/domain/services/simulation-service/SimulationService',
) {
  static readonly Live = Layer.effect(SimulationService)(
    Effect.succeed({
      gaussianDensities: Effect.fn('SimulationService.gaussianDensities')(
        function* (input: {
          readonly h0Mean: number
          readonly h1Mean: number
          readonly sd: number
          readonly min: number
          readonly max: number
          readonly count: number
        }) {
          if (input.sd <= 0 || input.count <= 1) {
            return yield* new InvalidParameter({
              parameter: 'gaussianDensities',
              message: 'Expected positive sd and at least two points.',
            })
          }
          const points = linspace(input.min, input.max, input.count).map(
            (x) => ({
              x,
              h0: normalPdf(x, input.h0Mean, input.sd),
              h1: normalPdf(x, input.h1Mean, input.sd),
            }),
          )
          return yield* ensureFinitePoints('gaussianDensities', points)
        },
      ),
      estimateCloud: Effect.fn('SimulationService.estimateCloud')(
        function* (input: {
          readonly seed: number
          readonly truth: number
          readonly sd: number
          readonly count: number
        }) {
          if (input.sd <= 0 || input.count < 0) {
            return yield* new InvalidParameter({
              parameter: 'estimateCloud',
              message: 'Expected positive sd and non-negative count.',
            })
          }
          const samples = normalSamples(input.seed, input.count).values
          return samples.map((sample, index) => ({
            x: input.truth + sample * input.sd,
            y: index,
          }))
        },
      ),
    }),
  )
}
