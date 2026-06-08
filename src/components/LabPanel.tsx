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
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm sm:p-6',
        className,
      )}
      aria-label={title}
    >
      <header className="flex items-start justify-between gap-4">
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

      <div className="mt-4 rounded-md border bg-background p-4">{children}</div>

      {controls !== undefined ? (
        <>
          <Separator className="my-4" />
          <div className="space-y-4">{controls}</div>
        </>
      ) : null}
    </section>
  )
}

export { LabPanel }
