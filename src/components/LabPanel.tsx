import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator.tsx'
import { cn } from '@/lib/utils.ts'

type LabPanelProps = {
  readonly title: string
  readonly eyebrow?: string
  readonly icon?: ReactNode
  /** The visual / simulation area. */
  readonly children: ReactNode
  /** Controls rendered below the visual (sliders, toggles, run buttons). */
  readonly controls?: ReactNode
  readonly className?: string
}

function LabPanel({
  title,
  eyebrow,
  icon,
  children,
  controls,
  className,
}: LabPanelProps) {
  return (
    <section
      className={cn('rounded-lg border bg-card/80 p-5 sm:p-6', className)}
      aria-label={title}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          {eyebrow !== undefined ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-serif text-xl font-semibold leading-tight text-foreground">
            {title}
          </h2>
        </div>
        {icon !== undefined ? (
          <span className="text-primary" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </header>

      <div
        className={cn(
          'mt-5 grid gap-6',
          controls !== undefined
            ? 'xl:grid-cols-[minmax(0,1fr)_minmax(260px,330px)]'
            : '',
        )}
      >
        <div>{children}</div>

        {controls !== undefined ? (
          <div className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <div className="mb-4 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Controls
              </span>
            </div>
            <div className="space-y-5">{controls}</div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export { LabPanel }
