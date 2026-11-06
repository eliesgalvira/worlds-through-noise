import type { ReactNode } from 'react'
import { EquationReveal } from '@/components/EquationReveal.tsx'
import { MathText } from '@/components/MathText.tsx'
import { PredictionPrompt } from '@/components/PredictionPrompt.tsx'
import type { LessonModuleRecord } from '@/domain/types.ts'

function ProseParagraph({ text }: { readonly text: string }) {
  return (
    <p className="text-base leading-7 text-foreground">
      <MathText text={text} />
    </p>
  )
}

type LessonModuleProps = {
  readonly module: LessonModuleRecord
  readonly figure: ReactNode
}

function LessonModule({ module, figure }: LessonModuleProps) {
  return (
    <section
      id={module.id}
      className="scroll-mt-32 xl:scroll-mt-24 border-t border-border py-14"
    >
      <header className="max-w-3xl">
        <p className="font-mono text-sm uppercase tracking-[0.16em] text-accent-ink">
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
        <ProseParagraph text={module.trap} />
        <ProseParagraph text={module.object} />
        <ProseParagraph text={module.action} />
      </div>

      <div
        id={`${module.id}-figure`}
        className="mt-8 max-w-5xl scroll-mt-32 xl:scroll-mt-24"
      >
        {figure}
      </div>

      <div className="mt-8 max-w-3xl space-y-6">
        <ProseParagraph text={module.payoff} />
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
        className="mt-8 max-w-3xl scroll-mt-32 xl:scroll-mt-24 space-y-6"
      >
        <PredictionPrompt
          question={module.prediction.question}
          answer={<MathText text={module.prediction.answer} />}
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-ink">
            Transfer to the exam
          </p>
          <p className="mt-2 text-base leading-7 text-foreground">
            <MathText text={module.transfer} />
          </p>
          {module.examRefs.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground">
              {module.examRefs.map((ref) => (
                <li key={ref} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent-ink">
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
