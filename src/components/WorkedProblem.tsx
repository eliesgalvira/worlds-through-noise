import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, RotateCcw } from 'lucide-react'
import { MathBlock, MathText } from '@/components/MathText.tsx'
import type { ProblemPartRecord, WorkedProblemRecord } from '@/domain/types.ts'
import { cn } from '@/lib/utils.ts'

function SolutionStep({
  index,
  step,
}: {
  readonly index: number
  readonly step: ProblemPartRecord['steps'][number]
}) {
  return (
    <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
      <span className="pt-0.5 font-mono text-xs text-accent">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <p className="text-sm font-medium leading-6 text-foreground">
          {step.title}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          <MathText text={step.body} />
        </p>
        {step.latex !== undefined ? (
          <MathBlock
            latex={step.latex}
            className="mt-2 rounded-md border border-border bg-background px-4 py-2 text-[0.95rem]"
          />
        ) : null}
        {step.note !== undefined ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            <MathText text={step.note} />
          </p>
        ) : null}
      </div>
    </li>
  )
}

function ProblemPart({ part }: { readonly part: ProblemPartRecord }) {
  const [revealed, setRevealed] = useState(0)
  const total = part.steps.length
  const done = revealed >= total

  return (
    <li className="border-t border-border/70 py-5 first:border-t-0">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
        <span className="pt-1 font-mono text-sm font-medium text-accent">
          {part.label})
        </span>
        <div>
          <p className="text-base leading-7 text-foreground">
            <MathText text={part.prompt} />
          </p>
          {part.promptMath !== undefined ? (
            <MathBlock latex={part.promptMath} className="mt-2" />
          ) : null}

          {revealed > 0 ? (
            <ol className="mt-4 space-y-4 border-l-2 border-accent/30 pl-4 pt-1">
              {part.steps.slice(0, revealed).map((step, index) => (
                <SolutionStep key={step.title} index={index} step={step} />
              ))}
            </ol>
          ) : null}

          {done ? (
            <div className="mt-4 border-l-2 border-accent pl-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                Result
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                <MathText text={part.answer.sentence} />
              </p>
              {part.answer.latex !== undefined ? (
                <MathBlock latex={part.answer.latex} className="mt-2" />
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {!done ? (
              <button
                type="button"
                onClick={() => {
                  setRevealed((current) => current + 1)
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                {revealed === 0
                  ? total === 1
                    ? 'Walk the solution — 1 step'
                    : `Walk the solution — ${String(total)} steps`
                  : `Next step (${String(revealed + 1)} of ${String(total)})`}
              </button>
            ) : null}
            {revealed > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setRevealed(0)
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Hide and retry
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}

type WorkedProblemProps = {
  readonly problem: WorkedProblemRecord
  readonly className?: string
}

function WorkedProblem({ problem, className }: WorkedProblemProps) {
  return (
    <article
      id={problem.id}
      className={cn('scroll-mt-24 border-t border-border py-10', className)}
    >
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {problem.source}
        </p>
        <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-foreground">
          {problem.title}
        </h3>
        <p className="mt-2 border-l border-accent pl-4 text-sm leading-6 text-muted-foreground">
          <MathText text={problem.why} />
        </p>
      </header>

      <div className="mt-6 rounded-md border border-border bg-card/40 px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Statement
        </p>
        <div className="mt-2 space-y-3">
          {problem.statement.map((block, index) =>
            block.kind === 'math' ? (
              <MathBlock
                key={`${String(index)}-${block.content.slice(0, 24)}`}
                latex={block.content}
              />
            ) : (
              <p
                key={`${String(index)}-${block.content.slice(0, 24)}`}
                className="text-base leading-7 text-foreground"
              >
                <MathText text={block.content} />
              </p>
            ),
          )}
        </div>
      </div>

      <ol className="mt-2">
        {problem.parts.map((part) => (
          <ProblemPart key={part.label} part={part} />
        ))}
      </ol>

      {problem.related !== undefined ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          <Link
            to={problem.related.href}
            className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {problem.related.text}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </p>
      ) : null}
    </article>
  )
}

export { WorkedProblem }
