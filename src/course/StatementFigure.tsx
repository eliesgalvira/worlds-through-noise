import type { ReactNode } from 'react'
import { AnemiaRocFigure } from '@/components/figures/AnemiaRocFigure.tsx'
import type { StatementFigureKey } from '@/domain/types.ts'

const statementFigures: Readonly<Record<StatementFigureKey, () => ReactNode>> =
  {
    'anemia-roc': () => <AnemiaRocFigure />,
  }

/** A figure an exam statement refers to, redrawn from the model. */
function StatementFigure({
  figureKey,
}: {
  readonly figureKey: StatementFigureKey
}) {
  return statementFigures[figureKey]()
}

export { StatementFigure }
