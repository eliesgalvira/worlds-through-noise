import { CheckCircle2 } from 'lucide-react'
import { ConceptBadge } from '@/components/ConceptBadge.tsx'
import { EquationReveal } from '@/components/EquationReveal.tsx'
import { LearningSandbox } from '@/components/LearningSandbox.tsx'
import { PredictionPrompt } from '@/components/PredictionPrompt.tsx'
import { getFormulas } from '@/domain/services/app-layer.ts'
import type { LessonModuleRecord } from '@/domain/types.ts'

type LessonModuleProps = {
  readonly module: LessonModuleRecord
}

function LessonModule({ module }: LessonModuleProps) {
  const formulas = getFormulas(module.formulaIds)
  const [leadParagraph, ...supportingParagraphs] = module.body

  return (
    <section
      id={module.id}
      className="scroll-mt-28 border-t border-border py-20 first:border-t-0 first:pt-0"
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-5 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
          <p className="font-mono text-sm text-accent">{module.id}</p>
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              {module.title}
            </h2>
            <p className="mt-5 text-2xl leading-9 text-foreground">
              {module.question}
            </p>
            {leadParagraph !== undefined ? (
              <p className="mt-7 text-xl leading-9 text-foreground">
                {leadParagraph}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
          <div aria-hidden="true" />
          <div className="space-y-5 text-[17px] leading-8 text-muted-foreground">
            {supportingParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Concepts
          </p>
          <div className="flex flex-wrap gap-2">
            {module.concepts.map((concept) => (
              <ConceptBadge key={concept}>{concept}</ConceptBadge>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Manipulate the phenomenon
        </p>
        <LearningSandbox moduleId={module.id} />
      </div>

      <div
        id={`${module.id}-transfer`}
        className="mx-auto mt-10 max-w-4xl scroll-mt-24 space-y-8"
      >
        <PredictionPrompt
          question={module.prediction.question}
          answer={module.prediction.answer}
        />

        <div className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Mathematical compression
          </p>
          {formulas.map((formula) => (
            <EquationReveal
              key={formula.id}
              sentence={formula.meaning}
              equation={formula.latex}
              caption={formula.caption}
            />
          ))}
        </div>

        <div className="border-y border-detection/30 py-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-1 h-5 w-5 shrink-0 text-detection"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Transfer check
              </p>
              <p className="mt-2 text-base leading-7 text-foreground">
                {module.transferCheck}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { LessonModule }
