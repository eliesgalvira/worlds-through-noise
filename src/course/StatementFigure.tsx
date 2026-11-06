import type { ReactNode } from 'react'
import { AnemiaRocFigure } from '@/components/figures/AnemiaRocFigure.tsx'

const statementFigures: Record<string, () => ReactNode> = {
  'anemia-roc': () => <AnemiaRocFigure />,
}

/** A figure an exam statement refers to, redrawn from the model. */
function StatementFigure({ figureKey }: { readonly figureKey: string }) {
  return statementFigures[figureKey]?.() ?? null
}

export { StatementFigure }
