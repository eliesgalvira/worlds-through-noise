import { ConceptBadge } from '@/components/ConceptBadge.tsx'
import { CaseStudySandbox } from '@/components/CaseStudySandbox.tsx'
import type { CaseStudyRecord } from '@/domain/types.ts'

type CaseStudyCardProps = {
  readonly caseStudy: CaseStudyRecord
}

function RankingMeter({
  label,
  value,
}: {
  readonly label: string
  readonly value: number
}) {
  const clamped = Math.max(0, Math.min(5, value))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{clamped}/5</span>
      </div>
      <div
        className="mt-2 grid grid-cols-5 gap-1"
        aria-label={`${label}: ${clamped} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((slot) => (
          <span
            key={slot}
            className={
              slot <= clamped
                ? 'h-1.5 rounded-full bg-primary'
                : 'h-1.5 rounded-full bg-muted'
            }
          />
        ))}
      </div>
    </div>
  )
}

function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <article className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap gap-2">
        {caseStudy.concepts.slice(0, 5).map((concept) => (
          <ConceptBadge key={concept}>{concept}</ConceptBadge>
        ))}
      </div>

      <h3 className="mt-4 max-w-3xl font-serif text-2xl font-semibold leading-tight text-foreground">
        {caseStudy.title}
      </h3>
      <p className="mt-3 max-w-4xl text-base leading-7 text-foreground">
        {caseStudy.story}
      </p>

      <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
        <span className="font-medium text-foreground">Visual idea:</span>{' '}
        {caseStudy.visualIdea}
      </p>

      <div className="mt-5 grid gap-4 border-y border-border py-4 sm:grid-cols-3">
        <RankingMeter
          label="Exemplifies subject"
          value={caseStudy.ranking.exemplifiesSubject}
        />
        <RankingMeter
          label="Visual potential"
          value={caseStudy.ranking.visualPotential}
        />
        <RankingMeter
          label="Practical real life"
          value={caseStudy.ranking.practicalRealLife}
        />
      </div>

      <div className="mt-6">
        <CaseStudySandbox caseStudy={caseStudy} />
      </div>

      <details className="mt-5 border-y border-border py-4">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          Open the model and solution sketch
        </summary>
        <div className="mt-4 grid gap-6 text-sm leading-6 text-muted-foreground md:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Model
            </p>
            <ul className="mt-2 space-y-1.5">
              {caseStudy.mathematicalModel.slice(0, 5).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Tasks
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              {caseStudy.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Solution sketch
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              {caseStudy.solutionSketch.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </article>
  )
}

export { CaseStudyCard }
