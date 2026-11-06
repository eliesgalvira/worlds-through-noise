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

/** A display-mode KaTeX equation with horizontal overflow handling. */
function MathBlock({ latex, className }: MathBlockProps) {
  return (
    <div
      className={cn('overflow-x-auto py-1 text-foreground', className)}
      aria-label={latex}
      dangerouslySetInnerHTML={{ __html: renderDisplayMath(latex) }}
    />
  )
}

export { MathBlock, MathText }
