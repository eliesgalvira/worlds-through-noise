import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo.tsx'
import { MathText } from '@/components/MathText.tsx'
import { Button } from '@/components/ui/button.tsx'
import { courseLessonEntries } from '@/course/catalog.ts'
import { currentCourse } from '@/course/current-course.ts'

function HomePage() {
  const { home, labels, manifest } = currentCourse

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="pb-14 pt-16 lg:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {manifest.eyebrow}
        </p>

        <div className="mt-6">
          <Logo className="text-[clamp(0.95rem,4.3vw,3.25rem)]" />
        </div>

        <div className="mt-10 max-w-2xl">
          <h1 className="font-serif text-2xl leading-snug text-foreground md:text-[2rem]">
            {manifest.slogan}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {home.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to={`/${home.primaryCta.route}`}>
                {home.primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to={`/${home.secondaryCta.route}`}>
                {home.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            {labels.lessonIndexTitle}
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {home.unifyingSentence}
          </p>
        </div>

        <ol className="mt-10 border-y border-border">
          {courseLessonEntries.map((entry, index) => {
            const { lesson } = entry
            const number = String(index + 1).padStart(2, '0')
            return (
              <li
                key={lesson.route}
                className="border-t border-border first:border-t-0"
              >
                <Link
                  to={`/${lesson.route}`}
                  className="group grid gap-5 py-6 transition-colors hover:bg-card/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:grid-cols-[4rem_minmax(0,1fr)_2rem] md:items-center"
                >
                  <span className="font-mono text-sm text-accent-ink">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
                      {entry.navLabel}
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      <MathText text={entry.tagline} />
                    </p>
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      {lesson.modules.map((m) => m.id).join(', ')} —{' '}
                      {lesson.modules.length} figures,{' '}
                      {lesson.workedProblems.length} exam problems worked step
                      by step
                    </p>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary md:justify-self-end"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="border-t border-border py-14">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            {home.studyTitle}
          </h2>
          <ol className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
            {home.studySteps.map((step, index) => (
              <li key={step.lead}>
                <span className="font-mono text-sm text-accent-ink">
                  {String(index + 1).padStart(2, '0')}
                </span>{' '}
                <span className="text-foreground">{step.lead}</span> {step.body}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}

export { HomePage }
