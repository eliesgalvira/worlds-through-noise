import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  parseInlineMath,
  renderDisplayMath,
  renderInlineMath,
  renderWrappedMath,
} from '@/components/math/render-math.ts'
import { cn } from '@/lib/utils.ts'

type MathTextProps = {
  /** Prose with inline math between $…$ delimiters. */
  readonly text: string
  readonly className?: string
}

/** Renders prose whose $…$ spans become inline KaTeX. */
function MathText({ text, className }: MathTextProps) {
  const segments = parseInlineMath(text)
  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.kind === 'math' ? (
          <span
            key={`${String(index)}-${segment.content}`}
            dangerouslySetInnerHTML={{
              __html: renderInlineMath(segment.content),
            }}
          />
        ) : (
          <span key={`${String(index)}-${segment.content}`}>
            {segment.content}
          </span>
        ),
      )}
    </span>
  )
}

type MathBlockProps = {
  readonly latex: string
  /** Frame the equation, e.g. the result a worked solution arrives at. */
  readonly boxed?: boolean
  readonly className?: string
}

/** Below this scale an equation breaks into lines instead of shrinking. */
const WRAP_SCALE = 0.85
/** Smallest scale a single unbreakable piece may shrink to before it scrolls. */
const MIN_EQUATION_SCALE = 0.6

/**
 * A display-mode KaTeX equation. When it is wider than its box (a long
 * solution step on a phone), it shrinks a little, then breaks into lines
 * after its relations. Only a piece still too wide at 60 % scrolls.
 */
function MathBlock({ latex, boxed = false, className }: MathBlockProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  // One object per equation: React 19 rewrites innerHTML whenever this prop
  // is a new object, which would undo the fit below on every re-render.
  const html = useMemo(() => ({ __html: renderDisplayMath(latex) }), [latex])

  // Measured before paint and again once fonts arrive (their metrics change
  // the width). No ResizeObserver: one on each of the hundreds of
  // equations of a resolved lesson made every relayout crawl.
  useLayoutEffect(() => {
    const box = boxRef.current
    if (box === null) {
      return
    }
    // KaTeX widths do not scale exactly with the font (struts, borders), so
    // a few passes converge on the size that fits.
    const shrink = (floor: number) => {
      let scale = 1
      box.style.fontSize = ''
      for (let pass = 0; pass < 4; pass += 1) {
        const ratio = box.clientWidth / box.scrollWidth
        if (ratio >= 1 || scale <= floor) {
          break
        }
        scale = Math.max(scale * ratio * 0.99, floor)
        box.style.fontSize = `${String(scale * 100)}%`
      }
    }
    const fit = () => {
      box.innerHTML = html.__html
      shrink(WRAP_SCALE)
      const wrap = box.scrollWidth > box.clientWidth + 1
      box.toggleAttribute('data-wrapped', wrap)
      if (wrap) {
        box.innerHTML = renderWrappedMath(latex)
        shrink(MIN_EQUATION_SCALE)
      }
      // Still too wide at the smallest size: fade the right edge so the eye
      // knows the equation goes on and the box scrolls.
      box.toggleAttribute(
        'data-overflow',
        box.scrollWidth > box.clientWidth + 1,
      )
    }
    fit()
    let live = true
    document.fonts.ready.then(
      () => {
        if (live) {
          fit()
        }
      },
      () => undefined,
    )
    // KaTeX's fonts often start loading only after the first layout, when
    // fonts.ready has already resolved: refit when a font load finishes.
    document.fonts.addEventListener('loadingdone', fit)
    return () => {
      live = false
      document.fonts.removeEventListener('loadingdone', fit)
    }
  }, [latex, html])

  return (
    <div
      ref={boxRef}
      className={cn(
        'overflow-x-auto py-1 text-foreground data-overflow:mask-r-from-85% data-wrapped:leading-loose data-wrapped:[&_.base]:my-1',
        boxed && 'rounded-md border border-border bg-background px-4 py-2',
        className,
      )}
      aria-label={latex}
      dangerouslySetInnerHTML={html}
    />
  )
}

export { MathBlock, MathText }
