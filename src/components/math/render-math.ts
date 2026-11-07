import katex from 'katex'

export type InlineMathSegment =
  | { readonly kind: 'text'; readonly content: string }
  | { readonly kind: 'math'; readonly content: string }

export function renderInlineMath(latex: string): string {
  return katex.renderToString(latex, {
    displayMode: false,
    throwOnError: false,
    strict: 'ignore',
  })
}

export function renderDisplayMath(latex: string): string {
  return katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
    strict: 'ignore',
  })
}

/**
 * A display equation laid out as display-size inline math for a box too
 * narrow for it: each formula a \\qquad separates starts a new line, so do
 * the ≈ and ⟹ steps, and the browser may break a long line after a relation.
 */
/** A spaced ≈ or ⇒ step, e.g. "\\;\\approx\\;", which starts a new wrapped line. */
const STEP_RELATION =
  /\\;\s*\\(approx|Rightarrow|Longrightarrow|implies)\s*\\;/g

export function renderWrappedMath(latex: string): string {
  return katex.renderToString(
    `\\displaystyle ${latex
      .replaceAll('\\qquad', '\\\\')
      .replace(STEP_RELATION, '\\\\ \\$1 ')}`,
    { displayMode: false, throwOnError: false, strict: 'ignore' },
  )
}

export function parseInlineMath(
  text: string,
): ReadonlyArray<InlineMathSegment> {
  const segments: Array<InlineMathSegment> = []
  let buffer = ''
  let inMath = false

  const flush = () => {
    segments.push({ kind: inMath ? 'math' : 'text', content: buffer })
    buffer = ''
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? ''
    const next = text[index + 1]
    if (char === '\\' && next === '$') {
      buffer += '$'
      index += 1
    } else if (char === '$') {
      flush()
      inMath = !inMath
    } else {
      buffer += char
    }
  }

  flush()
  return segments
}
