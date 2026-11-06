import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LessonAssessmentSection } from '@/components/LessonAssessmentSection.tsx'
import { LessonModule } from '@/components/LessonModule.tsx'
import { MathText } from '@/components/MathText.tsx'
import { StickyLessonNav } from '@/components/StickyLessonNav.tsx'
import { CourseFigure } from '@/course/CourseFigure.tsx'
import { StatementFigure } from '@/course/StatementFigure.tsx'
import { lessonNeighbors } from '@/course/catalog.ts'
import { currentCourse } from '@/course/current-course.ts'
import type { LessonRecord } from '@/domain/types.ts'

type LessonPageProps = {
  readonly lesson: LessonRecord
}

function LessonPage({ lesson }: LessonPageProps) {
  const { next } = lessonNeighbors(lesson.route)
  const labels = currentCourse.labels

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:pt-16">
        <header
          id="lesson-intro"
          className="max-w-4xl scroll-mt-32 xl:scroll-mt-24"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {labels.allLessons}
          </Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-accent-ink">
            {labels.unit} {lesson.ordinal}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            {lesson.title}
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-foreground">
            <MathText text={lesson.thesis} />
          </p>
          {lesson.intro.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground"
            >
              <MathText text={paragraph} />
            </p>
          ))}
        </header>
      </div>

      <StickyLessonNav
        modules={lesson.modules}
        problems={lesson.workedProblems}
        variant="mobile"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="min-w-0">
          {lesson.modules.map((module) => (
            <LessonModule
              key={module.id}
              module={module}
              figure={<CourseFigure module={module} />}
            />
          ))}

          <LessonAssessmentSection
            lesson={lesson}
            labels={labels}
            renderFigure={(key) => <StatementFigure figureKey={key} />}
            {...(next !== undefined ? { next } : {})}
          />
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
