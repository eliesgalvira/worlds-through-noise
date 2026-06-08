import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {
  binomialCdf,
  binomialPmf,
  gammaPdf,
  normalCdf,
  normalInvCdf,
  normalPdf,
} from '@/domain/math/distributions.ts'
import { dot } from '@/domain/math/linear-algebra.ts'
import { weightedGaussianMean } from '@/domain/math/estimation.ts'
import { InvalidParameter, NumericalError } from '@/domain/services/errors.ts'

type NormalInput = {
  readonly x: number
  readonly mean: number
  readonly sd: number
}

type GammaInput = {
  readonly x: number
  readonly shape: number
  readonly scale: number
}

type BinomialInput = {
  readonly k: number
  readonly n: number
  readonly p: number
}

function ensurePositive(parameter: string, value: number) {
  if (value <= 0 || !Number.isFinite(value)) {
    return Effect.fail(
      new InvalidParameter({
        parameter,
        message: 'Expected a positive finite value.',
      }),
    )
  }
  return Effect.succeed(value)
}

function ensureFinite(operation: string, value: number) {
  if (!Number.isFinite(value)) {
    return Effect.fail(
      new NumericalError({
        operation,
        message: 'Computation produced a non-finite value.',
      }),
    )
  }
  return Effect.succeed(value)
}

export class MathKernel extends Context.Service<
  MathKernel,
  {
    readonly normalPdf: (
      input: NormalInput,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly normalCdf: (
      input: NormalInput,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly normalInvCdf: (
      p: number,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly gammaPdf: (
      input: GammaInput,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly binomialPmf: (
      input: BinomialInput,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly binomialCdf: (
      input: BinomialInput,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly dot: (
      a: ReadonlyArray<number>,
      b: ReadonlyArray<number>,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
    readonly weightedGaussianMean: (
      measurements: ReadonlyArray<number>,
      variances: ReadonlyArray<number>,
    ) => Effect.Effect<number, InvalidParameter | NumericalError>
  }
>()('worlds-through-noise/domain/services/math-kernel/MathKernel') {
  static readonly Live = Layer.effect(MathKernel)(
    Effect.succeed({
      normalPdf: Effect.fn('MathKernel.normalPdf')(function* (
        input: NormalInput,
      ) {
        yield* ensurePositive('sd', input.sd)
        return yield* ensureFinite(
          'normalPdf',
          normalPdf(input.x, input.mean, input.sd),
        )
      }),
      normalCdf: Effect.fn('MathKernel.normalCdf')(function* (
        input: NormalInput,
      ) {
        yield* ensurePositive('sd', input.sd)
        return yield* ensureFinite(
          'normalCdf',
          normalCdf(input.x, input.mean, input.sd),
        )
      }),
      normalInvCdf: Effect.fn('MathKernel.normalInvCdf')(function* (p: number) {
        if (p <= 0 || p >= 1 || !Number.isFinite(p)) {
          return yield* new InvalidParameter({
            parameter: 'p',
            message: 'Expected a probability strictly between zero and one.',
          })
        }
        return yield* ensureFinite('normalInvCdf', normalInvCdf(p))
      }),
      gammaPdf: Effect.fn('MathKernel.gammaPdf')(function* (input: GammaInput) {
        yield* ensurePositive('shape', input.shape)
        yield* ensurePositive('scale', input.scale)
        return yield* ensureFinite(
          'gammaPdf',
          gammaPdf(input.x, input.shape, input.scale),
        )
      }),
      binomialPmf: Effect.fn('MathKernel.binomialPmf')(function* (
        input: BinomialInput,
      ) {
        if (input.n < 0 || !Number.isInteger(input.n)) {
          return yield* new InvalidParameter({
            parameter: 'n',
            message: 'Expected a non-negative integer sample count.',
          })
        }
        return yield* ensureFinite(
          'binomialPmf',
          binomialPmf(input.k, input.n, input.p),
        )
      }),
      binomialCdf: Effect.fn('MathKernel.binomialCdf')(function* (
        input: BinomialInput,
      ) {
        if (input.n < 0 || !Number.isInteger(input.n)) {
          return yield* new InvalidParameter({
            parameter: 'n',
            message: 'Expected a non-negative integer sample count.',
          })
        }
        return yield* ensureFinite(
          'binomialCdf',
          binomialCdf(input.k, input.n, input.p),
        )
      }),
      dot: Effect.fn('MathKernel.dot')(function* (
        a: ReadonlyArray<number>,
        b: ReadonlyArray<number>,
      ) {
        if (a.length !== b.length) {
          return yield* new InvalidParameter({
            parameter: 'vectors',
            message: 'Expected equal vector lengths.',
          })
        }
        return yield* ensureFinite('dot', dot(a, b))
      }),
      weightedGaussianMean: Effect.fn('MathKernel.weightedGaussianMean')(
        function* (
          measurements: ReadonlyArray<number>,
          variances: ReadonlyArray<number>,
        ) {
          if (
            measurements.length !== variances.length ||
            measurements.length === 0
          ) {
            return yield* new InvalidParameter({
              parameter: 'measurements',
              message:
                'Expected at least one measurement and matching variances.',
            })
          }
          return yield* ensureFinite(
            'weightedGaussianMean',
            weightedGaussianMean(measurements, variances),
          )
        },
      ),
    }),
  )
}
