import { EquationReveal } from '@/components/EquationReveal.tsx'
import { MathText } from '@/components/MathText.tsx'
import { PredictionPrompt } from '@/components/PredictionPrompt.tsx'
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

function ModuleFigure({ moduleId }: { readonly moduleId: string }) {
  switch (moduleId) {
    case 'P1':
      return <EnsembleFigure />
    case 'P2':
      return <AutocorrelationFigure />
    case 'P3':
      return <PowerTerrainFigure />
    case 'D1':
      return <TwoWorldsFigure />
    case 'D2':
      return <BudgetRocFigure />
    case 'D3':
      return <WhitenMatchFigure />
    case 'D4':
      return <EnergyFigure />
    case 'D5':
      return <BitVoteFigure />
    case 'E1':
      return <EstimatorRaceFigure />
    case 'E2':
      return <CurvatureFigure />
    case 'E3':
      return <FusionSpringsFigure />
    case 'E4':
      return <PeriodogramFigure />
    case 'W1':
      return <ErrorBowlFigure />
    case 'W2':
      return <CancelKnobFigure />
    case 'W3':
      return <PredictorFigure />
    case 'A1':
      return <DescentFigure />
    case 'A2':
      return <LmsFigure />
    default:
      return null
  }
}

function LabeledParagraph({
  label,
  text,
}: {
  readonly label: string
  readonly text: string
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        {label}
      </p>
      <p className="mt-1.5 text-base leading-7 text-foreground">
        <MathText text={text} />
      </p>
    </div>
  )
}

type LessonModuleProps = {
  readonly module: LessonModuleRecord
}

function LessonModule({ module }: LessonModuleProps) {
  return (
    <section
      id={module.id}
      className="scroll-mt-24 border-t border-border py-14"
    >
      <header className="max-w-3xl">
        <p className="font-mono text-sm uppercase tracking-[0.16em] text-accent">
          {module.id}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground md:text-4xl">
          {module.title}
        </h2>
        <p className="mt-3 border-l border-accent pl-4 text-lg leading-8 text-muted-foreground">
          <MathText text={module.question} />
        </p>
      </header>

      <div className="mt-8 max-w-3xl space-y-5">
        <LabeledParagraph label="The trap" text={module.trap} />
        <LabeledParagraph label="The object" text={module.object} />
        <LabeledParagraph label="The unseen action" text={module.action} />
      </div>

      <div id={`${module.id}-figure`} className="mt-8 max-w-4xl scroll-mt-24">
        <ModuleFigure moduleId={module.id} />
      </div>

      <div className="mt-8 max-w-3xl space-y-6">
        <LabeledParagraph label="Why it becomes obvious" text={module.payoff} />
        {module.equations.map((equation) => (
          <EquationReveal
            key={equation.latex}
            sentence={equation.sentence}
            equation={equation.latex}
            {...(equation.caption !== undefined
              ? { caption: equation.caption }
              : {})}
          />
        ))}
      </div>

      <div
        id={`${module.id}-transfer`}
        className="mt-8 max-w-3xl scroll-mt-24 space-y-6"
      >
        <PredictionPrompt
          question={module.prediction.question}
          answer={<MathText text={module.prediction.answer} />}
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Transfer to the exam
          </p>
          <p className="mt-2 text-base leading-7 text-foreground">
            <MathText text={module.transfer} />
          </p>
          {module.examRefs.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground">
              {module.examRefs.map((ref) => (
                <li key={ref} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">
                    →
                  </span>
                  <MathText text={ref} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { LessonModule }
