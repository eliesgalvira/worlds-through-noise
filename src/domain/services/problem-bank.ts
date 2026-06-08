import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { caseStudyRecords } from '@/domain/problems/case-studies.ts'
import type { CaseStudyRecord, LessonRoute } from '@/domain/types.ts'
import { UnknownProblem } from '@/domain/services/errors.ts'

export class ProblemBank extends Context.Service<
  ProblemBank,
  {
    readonly all: Effect.Effect<ReadonlyArray<CaseStudyRecord>>
    readonly byRoute: (
      route: LessonRoute,
    ) => Effect.Effect<ReadonlyArray<CaseStudyRecord>>
    readonly byId: (
      id: string,
    ) => Effect.Effect<CaseStudyRecord, UnknownProblem>
  }
>()('worlds-through-noise/domain/services/problem-bank/ProblemBank') {
  static readonly Live = Layer.effect(ProblemBank)(
    Effect.succeed({
      all: Effect.succeed(caseStudyRecords),
      byRoute: Effect.fn('ProblemBank.byRoute')((route: LessonRoute) =>
        Effect.succeed(
          caseStudyRecords.filter((caseStudy) => caseStudy.route === route),
        ),
      ),
      byId: Effect.fn('ProblemBank.byId')(function* (id: string) {
        const record = caseStudyRecords.find((caseStudy) => caseStudy.id === id)
        if (record === undefined) {
          return yield* new UnknownProblem({ problemId: id })
        }
        return record
      }),
    }),
  )
}
