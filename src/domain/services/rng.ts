import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { normalSamples, uniform01 } from '@/domain/math/random.ts'
import { InvalidParameter } from '@/domain/services/errors.ts'

export class Rng extends Context.Service<
  Rng,
  {
    readonly uniforms: (
      seed: number,
      count: number,
    ) => Effect.Effect<ReadonlyArray<number>, InvalidParameter>
    readonly normals: (
      seed: number,
      count: number,
    ) => Effect.Effect<ReadonlyArray<number>, InvalidParameter>
  }
>()('worlds-through-noise/domain/services/rng') {
  static readonly Live = Layer.effect(Rng)(
    Effect.succeed({
      uniforms: Effect.fn('Rng.uniforms')(function* (
        seed: number,
        count: number,
      ) {
        if (count < 0 || !Number.isInteger(count)) {
          return yield* new InvalidParameter({
            parameter: 'count',
            message: 'Expected a non-negative integer count.',
          })
        }
        const values: Array<number> = []
        let current = seed
        for (let index = 0; index < count; index += 1) {
          const sample = uniform01(current)
          values.push(sample.value)
          current = sample.next.seed
        }
        return values
      }),
      normals: Effect.fn('Rng.normals')(function* (
        seed: number,
        count: number,
      ) {
        if (count < 0 || !Number.isInteger(count)) {
          return yield* new InvalidParameter({
            parameter: 'count',
            message: 'Expected a non-negative integer count.',
          })
        }
        return normalSamples(seed, count).values
      }),
    }),
  )
}
