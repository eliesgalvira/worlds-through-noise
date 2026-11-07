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
 * A display equation laid out as display-size inline math, so the browser
 * can break it after a relation or operator, or between the formulas a
 * \\qquad separates, when it is too wide for its box.
 */
export function renderWrappedMath(latex: string): string {
  return katex.renderToString(
    `\\displaystyle ${latex.replaceAll('\\qquad', '\\quad\\allowbreak')}`,
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
