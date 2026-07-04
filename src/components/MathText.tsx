import katex from 'katex'
import { cn } from '@/lib/utils.ts'

function renderInline(latex: string): string {
  return katex.renderToString(latex, {
    displayMode: false,
    throwOnError: false,
    strict: 'ignore',
  })
}

function renderDisplay(latex: string): string {
  return katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
    strict: 'ignore',
  })
}

type MathTextProps = {
  /** Prose with inline math between $…$ delimiters. */
  readonly text: string
  readonly className?: string
}

/** Renders prose whose $…$ spans become inline KaTeX. */
function MathText({ text, className }: MathTextProps) {
  const segments = text.split('$')
  return (
    <span className={className}>
      {segments.map((segment, index) =>
        index % 2 === 1 ? (
          <span
            key={`${String(index)}-${segment}`}
            dangerouslySetInnerHTML={{ __html: renderInline(segment) }}
          />
        ) : (
          <span key={`${String(index)}-${segment}`}>{segment}</span>
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
      dangerouslySetInnerHTML={{ __html: renderDisplay(latex) }}
    />
  )
}

export { MathBlock, MathText }
