import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { LessonModule } from '@/components/LessonModule.tsx'
import { StickyLessonNav } from '@/components/StickyLessonNav.tsx'
import { WorkedProblem } from '@/components/WorkedProblem.tsx'
import { Button } from '@/components/ui/button.tsx'
import { lessons } from '@/content/lessons.ts'
import type { LessonRecord } from '@/domain/types.ts'

type LessonPageProps = {
  readonly lesson: LessonRecord
}

function LessonPage({ lesson }: LessonPageProps) {
  const index = lessons.findIndex((l) => l.route === lesson.route)
  const next = lessons[index + 1]

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-12 sm:px-6 lg:pt-16">
        <header id="lesson-intro" className="max-w-4xl scroll-mt-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All lessons
          </Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Tema {lesson.ordinal}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            {lesson.title}
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-foreground">
            {lesson.thesis}
          </p>
          {lesson.intro.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </header>
      </div>

      <StickyLessonNav
        modules={lesson.modules}
        problems={lesson.workedProblems}
        variant="mobile"
      />

      <div className="mx-auto grid max-w-[92rem] gap-12 px-4 py-10 sm:px-6 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="min-w-0">
          {lesson.modules.map((module) => (
            <LessonModule key={module.id} module={module} />
          ))}

          <section
            id="exam-bank"
            className="scroll-mt-24 border-t border-border py-14"
          >
            <div className="max-w-3xl">
              <p className="font-mono text-sm uppercase tracking-[0.16em] text-accent">
                Exam workbook
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground">
                Real problems, worked one move at a time
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                These are real recent exam and collection problems, chosen
                because each one runs the moves this tema just taught. Read the
                statement, solve on paper, and only then walk the solution —
                each step is revealed one honest move at a time, so you can stop
                the moment you see where it goes.
              </p>
            </div>
            <div className="mt-8 max-w-3xl">
              {lesson.workedProblems.map((problem) => (
                <WorkedProblem key={problem.id} problem={problem} />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {next !== undefined ? (
                <Button asChild>
                  <Link to={`/${next.route}`}>
                    Next: {next.title}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" asChild>
                <Link to="/">Back to the index</Link>
              </Button>
            </div>
          </section>
        </main>

        <aside className="hidden xl:block">
          <StickyLessonNav
            modules={lesson.modules}
            problems={lesson.workedProblems}
            variant="desktop"
          />
        </aside>
      </div>
    </>
  )
}

export { LessonPage }
