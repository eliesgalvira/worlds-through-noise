import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = new URL('../src/', import.meta.url).pathname

function sources(dir: string): ReadonlyArray<string> {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      return sources(path)
    }
    return /\.tsx?$/.test(name) && !name.endsWith('.test.ts') ? [path] : []
  })
}

describe('theme guard', () => {
  it('never paints text in the stroke-only ambers (2.9:1 on paper)', () => {
    const offenders = sources(SRC).flatMap((path) =>
      readFileSync(path, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          /\b(?:text|fill)-(?:accent|h1)\b(?!-)/.test(line) &&
          (line.includes('text-') || /plot-text|<text/.test(line))
            ? [`${path.slice(SRC.length)}:${String(index + 1)}`]
            : [],
        ),
    )
    expect(offenders).toEqual([])
  })
})
