import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { FormulaBook } from '@/domain/services/formula-book.ts'
import { LessonCatalog } from '@/domain/services/lesson-catalog.ts'
import { MathKernel } from '@/domain/services/math-kernel.ts'
import { ProblemBank } from '@/domain/services/problem-bank.ts'
import { ProgressStore } from '@/domain/services/progress-store.ts'
import { Rng } from '@/domain/services/rng.ts'
import { SimulationService } from '@/domain/services/simulation-service.ts'
import type {
  CaseStudyRecord,
  FormulaRecord,
  LessonRoute,
  LessonRouteRecord,
} from '@/domain/types.ts'

const contentLayer = Layer.merge(LessonCatalog.Live, ProblemBank.Live)
const referenceLayer = Layer.merge(contentLayer, FormulaBook.Live)
const computationLayer = Layer.merge(MathKernel.Live, Rng.Live)
const simulationLayer = Layer.merge(SimulationService.Live, ProgressStore.Live)

export const AppLayer = Layer.merge(
  Layer.merge(referenceLayer, computationLayer),
  simulationLayer,
)

const runtime = ManagedRuntime.make(AppLayer)

function runStatic<A, E>(
  effect: Effect.Effect<A, E, Layer.Success<typeof AppLayer>>,
): A {
  return runtime.runSync(effect)
}

export function getLessonRoute(route: LessonRoute): LessonRouteRecord {
  return runStatic(
    Effect.gen(function* () {
      const catalog = yield* LessonCatalog
      return yield* catalog.byRoute(route)
    }),
  )
}

export function getCaseStudiesForRoute(
  route: LessonRoute,
): ReadonlyArray<CaseStudyRecord> {
  return runStatic(
    Effect.gen(function* () {
      const problems = yield* ProblemBank
      return yield* problems.byRoute(route)
    }),
  )
}

export function getFormulas(
  ids: LessonRouteRecord['modules'][number]['formulaIds'],
): ReadonlyArray<FormulaRecord> {
  return runStatic(
    Effect.gen(function* () {
      const formulas = yield* FormulaBook
      return yield* formulas.byIds(ids)
    }),
  )
}
