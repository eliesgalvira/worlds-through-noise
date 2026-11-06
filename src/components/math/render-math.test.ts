import { describe, expect, it } from 'vitest'
import { parseInlineMath } from '@/components/math/render-math.ts'

describe('parseInlineMath', () => {
  it('alternates text and math at each unescaped dollar', () => {
    expect(parseInlineMath('a $x$ b $y^2$')).toEqual([
      { kind: 'text', content: 'a ' },
      { kind: 'math', content: 'x' },
      { kind: 'text', content: ' b ' },
      { kind: 'math', content: 'y^2' },
      { kind: 'text', content: '' },
    ])
  })

  it('keeps an escaped dollar as text', () => {
    expect(parseInlineMath('costs \\$5')).toEqual([
      { kind: 'text', content: 'costs $5' },
    ])
  })
})
