import { useEffect, useMemo, useRef, useState } from 'react'
import { AlignLeft, ChevronDown } from 'lucide-react'
import type { LessonModuleRecord } from '@/domain/types.ts'
import { cn } from '@/lib/utils.ts'

type TocItem = {
  readonly id: string
  readonly title: string
  readonly depth: 1 | 2
}

type StickyLessonNavProps = {
  readonly modules: ReadonlyArray<LessonModuleRecord>
  readonly variant: 'desktop' | 'mobile'
}

function buildToc(
  modules: ReadonlyArray<LessonModuleRecord>,
): ReadonlyArray<TocItem> {
  return [
    { id: 'lesson-intro', title: 'Introduction', depth: 1 },
    ...modules.flatMap((module) => [
      {
        id: module.id,
        title: `${module.id}. ${module.title}`,
        depth: 1 as const,
      },
      {
        id: `${module.id}-sandbox`,
        title: 'Interactive sandbox',
        depth: 2 as const,
      },
      {
        id: `${module.id}-transfer`,
        title: 'Prediction check',
        depth: 2 as const,
      },
    ]),
    { id: 'case-bank', title: 'Case-study sandboxes', depth: 1 },
    { id: 'final-challenge', title: 'Final challenge', depth: 1 },
  ]
}

function useActiveToc(items: ReadonlyArray<TocItem>) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    let frame = 0

    const readActiveId = () => {
      const offset = 128
      const scrollPosition = window.scrollY + offset
      let next = items[0]?.id ?? ''

      for (const item of items) {
        const element = document.getElementById(item.id)
        if (element === null) continue

        const top = element.getBoundingClientRect().top + window.scrollY
        if (top <= scrollPosition) {
          next = item.id
        } else {
          break
        }
      }

      return next
    }

    const updateActive = () => {
      frame = 0
      const next = readActiveId()
      setActiveId((current) => (current === next ? current : next))
    }

    const scheduleUpdate = () => {
      if (frame !== 0) return
      frame = window.requestAnimationFrame(updateActive)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [items])

  return activeId
}

function ProgressCircle({
  value,
  total,
}: {
  readonly value: number
  readonly total: number
}) {
  const size = 18
  const strokeWidth = 1.5
  const radius = size / 2 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const progress = (Math.max(0, value) / Math.max(1, total)) * circumference

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      className="h-[18px] w-[18px] shrink-0 text-accent"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-current/25"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  )
}

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  readonly items: ReadonlyArray<TocItem>
  readonly activeId: string
  readonly onNavigate?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const list = listRef.current
    const track = trackRef.current
    if (container === null || list === null || track === null) return

    let frame = 0

    const updateTrack = () => {
      frame = 0
      const active = list.querySelector<HTMLAnchorElement>(
        `a[data-toc-id="${activeId}"]`,
      )
      if (active === null) return

      const activeRect = active.getBoundingClientRect()
      const listRect = list.getBoundingClientRect()
      const styles = window.getComputedStyle(active)
      const paddingTop = Number.parseFloat(styles.paddingTop) || 0
      const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0
      const trackTop = activeRect.top - listRect.top + paddingTop
      const trackBottom = activeRect.bottom - listRect.top - paddingBottom

      track.style.setProperty('--toc-track-top', `${trackTop}px`)
      track.style.setProperty('--toc-track-bottom', `${trackBottom}px`)

      const activeTop = active.offsetTop
      const activeBottom = activeTop + active.offsetHeight
      const visibleTop = container.scrollTop
      const visibleBottom = visibleTop + container.clientHeight
      const outsideView =
        activeTop < visibleTop + 8 || activeBottom > visibleBottom - 8

      if (outsideView) {
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
        container.scrollTo({
          top: Math.max(
            0,
            activeTop - container.clientHeight / 2 + active.offsetHeight / 2,
          ),
          behavior: reduceMotion ? 'auto' : 'smooth',
        })
      }
    }

    const scheduleUpdate = () => {
      if (frame !== 0) return
      frame = window.requestAnimationFrame(updateTrack)
    }

    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(list)
    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
      observer.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [activeId])

  return (
    <div
      ref={containerRef}
      className="relative max-h-[50vh] overflow-y-auto py-3 [scrollbar-width:none] xl:max-h-[calc(100svh-9rem)]"
    >
      <div
        ref={trackRef}
        className="pointer-events-none absolute left-0 top-3 z-10 h-[calc(100%-1.5rem)] w-px bg-accent transition-[clip-path] duration-200 ease-out"
        style={{
          clipPath:
            'polygon(0 var(--toc-track-top, 0px), 100% var(--toc-track-top, 0px), 100% var(--toc-track-bottom, 0px), 0 var(--toc-track-bottom, 0px))',
        }}
        aria-hidden="true"
      />
      <ol
        ref={listRef}
        className="relative flex flex-col border-l border-border/90"
      >
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                data-toc-id={item.id}
                aria-current={active ? 'location' : undefined}
                onClick={onNavigate}
                className={cn(
                  'block py-1.5 pr-2 text-sm leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  item.depth === 1 ? 'pl-4' : 'pl-8',
                  active
                    ? 'text-accent'
                    : item.depth === 1
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/70 hover:text-foreground',
                )}
              >
                {item.title}
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function StickyLessonNav({ modules, variant }: StickyLessonNavProps) {
  const items = useMemo(() => buildToc(modules), [modules])
  const activeId = useActiveToc(items)
  const [open, setOpen] = useState(false)
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  )
  const activeTitle = items[activeIndex]?.title ?? 'On this page'

  if (variant === 'mobile') {
    return (
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur xl:hidden">
        <button
          type="button"
          className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm text-muted-foreground sm:px-6"
          aria-expanded={open}
          aria-controls="lesson-toc-popover"
          onClick={() => {
            setOpen((current) => !current)
          }}
        >
          <ProgressCircle value={activeIndex + 1} total={items.length} />
          <span className="grid min-w-0 flex-1">
            <span className="truncate">
              {open ? 'On this page' : activeTitle}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform',
              open ? 'rotate-180 text-accent' : '',
            )}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div
            id="lesson-toc-popover"
            className="border-t border-border px-4 sm:px-6"
          >
            <TocList
              items={items}
              activeId={activeId}
              onNavigate={() => {
                setOpen(false)
              }}
            />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden h-[calc(100svh-7rem)] flex-col py-4 xl:flex"
    >
      <div className="mb-4 flex items-center gap-3 text-muted-foreground">
        <AlignLeft className="h-4 w-4" aria-hidden="true" />
        <p className="text-sm font-medium">On this page</p>
      </div>
      <TocList items={items} activeId={activeId} />
    </nav>
  )
}

export { StickyLessonNav }
