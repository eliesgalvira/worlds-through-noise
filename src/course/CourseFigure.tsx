import type { ReactNode } from 'react'
import { AutocorrelationFigure } from '@/components/figures/AutocorrelationFigure.tsx'
import { BitVoteFigure } from '@/components/figures/BitVoteFigure.tsx'
import { BudgetRocFigure } from '@/components/figures/BudgetRocFigure.tsx'
import { CancelKnobFigure } from '@/components/figures/CancelKnobFigure.tsx'
import { CurvatureFigure } from '@/components/figures/CurvatureFigure.tsx'
import { DescentFigure } from '@/components/figures/DescentFigure.tsx'
import { EnergyFigure } from '@/components/figures/EnergyFigure.tsx'
import { EnsembleFigure } from '@/components/figures/EnsembleFigure.tsx'
import { ErrorBowlFigure } from '@/components/figures/ErrorBowlFigure.tsx'
import { EstimatorRaceFigure } from '@/components/figures/EstimatorRaceFigure.tsx'
import { FusionSpringsFigure } from '@/components/figures/FusionSpringsFigure.tsx'
import { LmsFigure } from '@/components/figures/LmsFigure.tsx'
import { PeriodogramFigure } from '@/components/figures/PeriodogramFigure.tsx'
import { PowerTerrainFigure } from '@/components/figures/PowerTerrainFigure.tsx'
import { PredictorFigure } from '@/components/figures/PredictorFigure.tsx'
import { TwoWorldsFigure } from '@/components/figures/TwoWorldsFigure.tsx'
import { WhitenMatchFigure } from '@/components/figures/WhitenMatchFigure.tsx'
import type { LessonModuleRecord } from '@/domain/types.ts'

type FigureFactory = () => ReactNode

const figureRegistry: Record<string, FigureFactory> = {
  P1: () => <EnsembleFigure />,
  P2: () => <AutocorrelationFigure />,
  P3: () => <PowerTerrainFigure />,
  D1: () => <TwoWorldsFigure />,
  D2: () => <BudgetRocFigure />,
  D3: () => <WhitenMatchFigure />,
  D4: () => <EnergyFigure />,
  D5: () => <BitVoteFigure />,
  E1: () => <EstimatorRaceFigure />,
  E2: () => <CurvatureFigure />,
  E3: () => <FusionSpringsFigure />,
  E4: () => <PeriodogramFigure />,
  W1: () => <ErrorBowlFigure />,
  W2: () => <CancelKnobFigure />,
  W3: () => <PredictorFigure />,
  A1: () => <DescentFigure />,
  A2: () => <LmsFigure />,
}

type CourseFigureProps = {
  readonly module: LessonModuleRecord
}

function CourseFigure({ module }: CourseFigureProps) {
  const key = module.figureKey ?? module.id
  const render = figureRegistry[key]
  return render?.() ?? null
}

export { CourseFigure }
