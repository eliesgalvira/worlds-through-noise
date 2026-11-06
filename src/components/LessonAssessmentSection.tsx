import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MathText } from '@/components/MathText.tsx'
import { WorkedProblem } from '@/components/WorkedProblem.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { CourseRecord } from '@/course/types.ts'
import type { LessonRecord } from '@/domain/types.ts'

type LessonAssessmentSectionProps = {
  readonly lesson: LessonRecord
  readonly labels: CourseRecord['labels']
  readonly next?: LessonRecord
  readonly renderFigure?: (key: string) => ReactNode
}

function LessonAssessmentSection({
  lesson,
  labels,
  next,
  renderFigure,
}: LessonAssessmentSectionProps) {
  return (
    <section
      id="exam-bank"
      className="scroll-mt-32 xl:scroll-mt-24 border-t border-border py-14"
    >
      <div className="max-w-3xl">
        <p className="font-mono text-sm uppercase tracking-[0.16em] text-accent-ink">
          {labels.assessmentEyebrow}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground">
          {labels.assessmentTitle}
        </h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          <MathText text={labels.assessmentDescription} />
        </p>
      </div>
      <div className="mt-8 max-w-3xl">
        {lesson.workedProblems.map((problem) => (
          <WorkedProblem
            key={problem.id}
            problem={problem}
            {...(renderFigure !== undefined ? { renderFigure } : {})}
          />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        {next !== undefined ? (
          <Button asChild>
            <Link to={`/${next.route}`}>
              {labels.nextPrefix} {next.title}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <Link to="/">{labels.backToIndex}</Link>
        </Button>
      </div>
    </section>
  )
}

export { LessonAssessmentSection }
