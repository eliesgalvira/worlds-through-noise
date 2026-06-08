import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { lessonRouteRecords } from '@/domain/lessons/lesson-catalog.ts'
import type {
  LessonModuleRecord,
  LessonRoute,
  LessonRouteRecord,
} from '@/domain/types.ts'
import { UnknownLesson } from '@/domain/services/errors.ts'

export class LessonCatalog extends Context.Service<
  LessonCatalog,
  {
    readonly all: Effect.Effect<ReadonlyArray<LessonRouteRecord>>
    readonly byRoute: (
      route: LessonRoute,
    ) => Effect.Effect<LessonRouteRecord, UnknownLesson>
    readonly moduleById: (
      moduleId: string,
    ) => Effect.Effect<LessonModuleRecord, UnknownLesson>
  }
>()('worlds-through-noise/domain/services/lesson-catalog/LessonCatalog') {
  static readonly Live = Layer.effect(LessonCatalog)(
    Effect.succeed({
      all: Effect.succeed(lessonRouteRecords),
      byRoute: Effect.fn('LessonCatalog.byRoute')(function* (
        route: LessonRoute,
      ) {
        const record = lessonRouteRecords.find(
          (lesson) => lesson.route === route,
        )
        if (record === undefined) {
          return yield* new UnknownLesson({ lessonId: route })
        }
        return record
      }),
      moduleById: Effect.fn('LessonCatalog.moduleById')(function* (
        moduleId: string,
      ) {
        for (const route of lessonRouteRecords) {
          const module = route.modules.find(
            (candidate) => candidate.id === moduleId,
          )
          if (module !== undefined) {
            return module
          }
        }
        return yield* new UnknownLesson({ lessonId: moduleId })
      }),
    }),
  )
}
