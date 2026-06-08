import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CaseStudyCard } from '@/components/CaseStudyCard.tsx'
import { ConceptBadge } from '@/components/ConceptBadge.tsx'
import { LessonModule } from '@/components/LessonModule.tsx'
import { StickyLessonNav } from '@/components/StickyLessonNav.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { CaseStudyRecord, LessonRouteRecord } from '@/domain/types.ts'

type LessonShellProps = {
  readonly lesson: LessonRouteRecord
  readonly caseStudies: ReadonlyArray<CaseStudyRecord>
}

const routeIntros = {
  detection: {
    problem:
      'A detector is built when the world will not tell you what happened, but a decision still has consequences. A clinic must decide whether a person is anemic. A disk must decide whether a repeated bit was originally 0 or 1. An ultrasound probe must decide whether blood cells are moving.',
    question: 'Which hidden world produced this corrupted trace?',
    left: 'H0 or H1',
    output: 'Choose a world and control mistakes',
  },
  estimation: {
    problem:
      'An estimator is built when the hidden cause is not a yes-or-no world, but a number that controls the observations. Packet delays point back to a scale. Humidity sensors point back to one physical value. Radar samples point back to an amplitude.',
    question: 'Which hidden value made this data unsurprising?',
    left: 'theta, A, lambda',
    output: 'Name a value and understand its error',
  },
  filtering: {
    problem:
      'A filter is built when the hidden value changes while observations keep arriving. It will combine estimation with time evolution and prediction-correction loops.',
    question: 'How does the hidden value evolve through time?',
    left: 'state over time',
    output: 'Predict, correct, and update belief',
  },
} satisfies Record<
  LessonRouteRecord['route'],
  {
    readonly problem: string
    readonly question: string
    readonly left: string
    readonly output: string
  }
>

function InferenceFlow({ lesson }: { readonly lesson: LessonRouteRecord }) {
  const intro = routeIntros[lesson.route]

  return (
    <div className="border-y border-border py-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Shared model
      </p>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.2fr] md:items-center">
        <p>
          <span className="block font-medium text-foreground">
            Hidden cause
          </span>
          {intro.left}
        </p>
        <ArrowRight
          className="hidden h-4 w-4 text-accent md:block"
          aria-hidden="true"
        />
        <p>
          <span className="block font-medium text-foreground">
            Noisy mechanism
          </span>
          sensor, channel, queue, covariance
        </p>
        <ArrowRight
          className="hidden h-4 w-4 text-accent md:block"
          aria-hidden="true"
        />
        <p>
          <span className="block font-medium text-foreground">Observation</span>
          samples, pixels, echoes, packets
        </p>
        <ArrowRight
          className="hidden h-4 w-4 text-accent md:block"
          aria-hidden="true"
        />
        <p>
          <span className="block font-medium text-foreground">Inference</span>
          {intro.output}
        </p>
      </div>
    </div>
  )
}

function LessonShell({ lesson, caseStudies }: LessonShellProps) {
  const intro = routeIntros[lesson.route]

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:pt-16">
        <header id="lesson-intro" className="scroll-mt-24 max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {lesson.route}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-foreground md:text-7xl">
            {lesson.title}
          </h1>
          <p className="mt-6 max-w-3xl text-2xl leading-10 text-foreground">
            {lesson.thesis}
          </p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            {intro.problem}
          </p>
          <p className="mt-6 max-w-3xl border-l border-accent pl-5 text-xl leading-9 text-foreground">
            {intro.question}
          </p>
        </header>

        <div className="mt-12 max-w-5xl">
          <InferenceFlow lesson={lesson} />
        </div>
      </div>

      {lesson.modules.length > 0 ? (
        <StickyLessonNav modules={lesson.modules} variant="mobile" />
      ) : null}

      <div className="mx-auto grid max-w-[92rem] gap-12 px-4 py-14 sm:px-6 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="min-w-0">
          {lesson.modules.map((module) => (
            <LessonModule key={module.id} module={module} />
          ))}

          <section
            id="case-bank"
            className="scroll-mt-24 border-t border-border py-20"
          >
            <div className="max-w-3xl">
              <p className="font-mono text-sm uppercase tracking-[0.16em] text-accent">
                Case bank
              </p>
              <h2 className="mt-3 font-serif text-4xl font-semibold text-foreground">
                Practice the transfer
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                These are not decorations. Each case asks you to recognize the
                same inference pattern in a real system, then name the hidden
                cause, the noisy mechanism, the observation, and the decision or
                estimate.
              </p>
            </div>
            <div className="mt-10">
              {caseStudies.map((caseStudy) => (
                <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
              ))}
            </div>
          </section>

          <section
            id="final-challenge"
            className="scroll-mt-24 border-y border-border py-12"
          >
            <div className="flex flex-wrap gap-2">
              <ConceptBadge>final challenge</ConceptBadge>
              <ConceptBadge>{lesson.route}</ConceptBadge>
            </div>
            <h2 className="mt-5 max-w-3xl font-serif text-4xl font-semibold text-foreground">
              {lesson.finalChallenge.title}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-foreground">
              {lesson.finalChallenge.prompt}
            </p>
            <ol className="mt-8 grid gap-4 text-base leading-7 text-muted-foreground md:grid-cols-3">
              {lesson.finalChallenge.checks.map((check, index) => (
                <li key={check} className="border-t border-border pt-4">
                  <span className="font-mono text-xs text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-2">{check}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              {lesson.route === 'detection' ? (
                <Button asChild>
                  <Link to="/estimation">
                    Continue to estimation
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/filtering">
                    Preview filtering
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </section>
        </main>

        {lesson.modules.length > 0 ? (
          <aside className="hidden xl:block">
            <StickyLessonNav modules={lesson.modules} variant="desktop" />
          </aside>
        ) : null}
      </div>
    </>
  )
}

export { LessonShell }
