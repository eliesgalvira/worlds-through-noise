import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { formulaRecords } from '@/domain/formulas/formula-book.ts'
import type { FormulaId, FormulaRecord } from '@/domain/types.ts'
import { UnknownFormula } from '@/domain/services/errors.ts'

export class FormulaBook extends Context.Service<
  FormulaBook,
  {
    readonly all: Effect.Effect<ReadonlyArray<FormulaRecord>>
    readonly byId: (
      id: FormulaId,
    ) => Effect.Effect<FormulaRecord, UnknownFormula>
    readonly byIds: (
      ids: ReadonlyArray<FormulaId>,
    ) => Effect.Effect<ReadonlyArray<FormulaRecord>, UnknownFormula>
  }
>()('worlds-through-noise/domain/services/formula-book/FormulaBook') {
  static readonly Live = Layer.effect(FormulaBook)(
    Effect.succeed({
      all: Effect.succeed(formulaRecords),
      byId: Effect.fn('FormulaBook.byId')(function* (id: FormulaId) {
        const record = formulaRecords.find((formula) => formula.id === id)
        if (record === undefined) {
          return yield* new UnknownFormula({ formulaId: id })
        }
        return record
      }),
      byIds: Effect.fn('FormulaBook.byIds')(function* (
        ids: ReadonlyArray<FormulaId>,
      ) {
        const records: Array<FormulaRecord> = []
        for (const id of ids) {
          const record = formulaRecords.find((formula) => formula.id === id)
          if (record === undefined) {
            return yield* new UnknownFormula({ formulaId: id })
          }
          records.push(record)
        }
        return records
      }),
    }),
  )
}
