import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo.tsx'
import { Button } from '@/components/ui/button.tsx'
import { lessons } from '@/content/lessons.ts'
import { siteRoutes } from '@/lib/routes.ts'

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pb-14 pt-16 lg:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          An interactive companion to a course on statistical signal processing
        </p>

        <div className="mt-6">
          <Logo className="text-[clamp(0.95rem,4.3vw,3.25rem)]" />
        </div>

        <div className="mt-10 max-w-2xl">
          <h1 className="font-serif text-2xl leading-snug text-foreground md:text-[2rem]">
            See worlds through noise and hear noise through walls.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Every module here follows one rule: find the object the formula is
            secretly about, then perform the unseen action that makes the
            formula unavoidable. Slice an ensemble. Spend a false-alarm budget.
            Balance springs. Roll a ball down a bowl — first in daylight, then
            in fog.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/processes">
                Start with random processes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/detection">Jump to detection</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Five temas
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            The course in one sentence: characterize the random machine, decide
            which machine dealt the data, estimate the dial the machine was set
            to, then build — and finally adapt — the filter that undoes it.
          </p>
        </div>

        <ol className="mt-10 border-y border-border">
          {siteRoutes.map((route, index) => {
            const lesson = lessons[index]
            const number = String(index + 1).padStart(2, '0')
            return (
              <li
                key={route.path}
                className="border-t border-border first:border-t-0"
              >
                <Link
                  to={route.path}
                  className="group grid gap-5 py-6 transition-colors hover:bg-card/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:grid-cols-[4rem_minmax(0,1fr)_2rem] md:items-center"
                >
                  <span className="font-mono text-sm text-accent">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
                      {route.label}
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      {route.tagline}
                    </p>
                    {lesson !== undefined ? (
                      <p className="mt-2 font-mono text-xs text-muted-foreground/80">
                        {lesson.modules.map((m) => m.id).join(' · ')} —{' '}
                        {lesson.modules.length} figures,{' '}
                        {lesson.examBank.length} exam problems mapped
                      </p>
                    ) : null}
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
            How to study here
          </h2>
          <ol className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
            <li>
              <span className="font-mono text-sm text-accent">01</span>{' '}
              <span className="text-foreground">Read the trap first.</span> If
              it doesn’t sting, you may already own the object — skip ahead.
            </li>
            <li>
              <span className="font-mono text-sm text-accent">02</span>{' '}
              <span className="text-foreground">
                Perform the action with your hands.
              </span>{' '}
              Every readout in every figure is genuinely computed — the point is
              to predict it before you move the slider, and be wrong.
            </li>
            <li>
              <span className="font-mono text-sm text-accent">03</span>{' '}
              <span className="text-foreground">
                Only then reveal the equation.
              </span>{' '}
              It should read like a description of what you just did.
            </li>
            <li>
              <span className="font-mono text-sm text-accent">04</span>{' '}
              <span className="text-foreground">Close with the exam bank.</span>{' '}
              Each tema ends with real past-exam problems and the one move that
              unlocks each.
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}

export { HomePage }
