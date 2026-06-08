import type { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

type LessonLayoutProps = {
  readonly eyebrow?: string
  readonly title: string
  readonly summary?: string
  /** Concept badges row. */
  readonly concepts?: ReactNode
  /** The sticky interactive panel (right column on desktop). */
  readonly lab: ReactNode
  /** Narrative column content. */
  readonly children: ReactNode
  readonly className?: string
}

function LessonLayout({
  eyebrow,
  title,
  summary,
  concepts,
  lab,
  children,
  className,
}: LessonLayoutProps) {
  return (
    <div
      className={cn('mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16', className)}
    >
      <header className="max-w-3xl">
        {eyebrow !== undefined ? (
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {summary !== undefined ? (
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {summary}
          </p>
        ) : null}
        {concepts !== undefined ? (
          <div className="mt-5 flex flex-wrap gap-2">{concepts}</div>
        ) : null}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="order-2 space-y-8 lg:order-1">{children}</div>
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">{lab}</div>
        </div>
      </div>
    </div>
  )
}

export { LessonLayout }
