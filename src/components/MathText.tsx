import { useLayoutEffect, useRef } from 'react'
import {
  parseInlineMath,
  renderDisplayMath,
  renderInlineMath,
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
  readonly className?: string
}

/** Smallest scale a display equation may shrink to before it scrolls. */
const MIN_EQUATION_SCALE = 0.6

/**
 * A display-mode KaTeX equation. When it is wider than its box (a long
 * solution step on a phone), it shrinks to fit, down to 60 %; only an
 * equation still too wide at that size scrolls sideways.
 */
function MathBlock({ latex, className }: MathBlockProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  // Measured before paint and again once KaTeX's fonts arrive (their metrics
  // change the width). No ResizeObserver: one on each of the hundreds of
  // equations of a resolved lesson made every relayout crawl.
  useLayoutEffect(() => {
    const box = boxRef.current
    if (box === null) {
      return
    }
    // KaTeX widths do not scale exactly with the font (struts, borders), so
    // a few passes converge on the size that fits.
    const fit = () => {
      let scale = 1
      box.style.fontSize = ''
      for (let pass = 0; pass < 4; pass += 1) {
        const ratio = box.clientWidth / box.scrollWidth
        if (ratio >= 1 || scale <= MIN_EQUATION_SCALE) {
          break
        }
        scale = Math.max(scale * ratio * 0.99, MIN_EQUATION_SCALE)
        box.style.fontSize = `${String(scale * 100)}%`
      }
      // Still too wide at the smallest size: fade the right edge so the eye
      // knows the equation goes on and the box scrolls.
      box.toggleAttribute(
        'data-desborda',
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
    return () => {
      live = false
    }
  }, [latex])

  return (
    <div
      ref={boxRef}
      className={cn(
        'overflow-x-auto py-1 text-foreground data-desborda:mask-r-from-85%',
        className,
      )}
      aria-label={latex}
      dangerouslySetInnerHTML={{ __html: renderDisplayMath(latex) }}
    />
  )
}

export { MathBlock, MathText }
