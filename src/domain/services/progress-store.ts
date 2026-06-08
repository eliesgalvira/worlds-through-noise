import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'
import { StorageUnavailable } from '@/domain/services/errors.ts'

export type ProgressSnapshot = {
  readonly completedModuleIds: ReadonlyArray<string>
}

export class ProgressStore extends Context.Service<
  ProgressStore,
  {
    readonly load: Effect.Effect<ProgressSnapshot, StorageUnavailable>
    readonly markComplete: (
      moduleId: string,
    ) => Effect.Effect<ProgressSnapshot, StorageUnavailable>
    readonly reset: Effect.Effect<ProgressSnapshot, StorageUnavailable>
  }
>()('worlds-through-noise/domain/services/progress-store/ProgressStore') {
  static readonly Live = Layer.effect(ProgressStore)(
    Effect.gen(function* () {
      const completed = yield* Ref.make<ReadonlyArray<string>>([])
      return {
        load: Effect.map(Ref.get(completed), (completedModuleIds) => ({
          completedModuleIds,
        })),
        markComplete: Effect.fn('ProgressStore.markComplete')(function* (
          moduleId: string,
        ) {
          if (moduleId.length === 0) {
            return yield* new StorageUnavailable({
              reason: 'Cannot store progress for an empty module id.',
            })
          }
          yield* Ref.update(completed, (current) =>
            current.includes(moduleId) ? current : [...current, moduleId],
          )
          const completedModuleIds = yield* Ref.get(completed)
          return { completedModuleIds }
        }),
        reset: Effect.gen(function* () {
          yield* Ref.set(completed, [])
          return { completedModuleIds: [] }
        }),
      }
    }),
  )
}
