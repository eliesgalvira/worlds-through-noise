import { spawnSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const hasNu = spawnSync('nu', ['--version']).status === 0
const root = new URL('../..', import.meta.url).pathname
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function fixture(extraReference?: string) {
  const base = mkdtempSync(join(tmpdir(), 'wtn-paquete-test-'))
  const capturas = join(base, 'capturas')
  const refs = join(base, 'refs')
  mkdirSync(capturas, { recursive: true })
  mkdirSync(refs, { recursive: true })
  for (const name of [
    'leccion-1440-inicial-d3-1.png',
    'leccion-390-inicial-d3-1.png',
    'leccion-1440-resuelto-cuaderno-1.png',
    'leccion-1440-extremo-cuaderno-1.png',
    'interaccion-d3-1440-1.png',
    'interaccion-d3-390-1.png',
    'interaccion-d2-1440-1.png',
  ]) {
    writeFileSync(join(capturas, name), PNG)
  }
  writeFileSync(join(capturas, 'interaccion-d3.txt'), 'Entre 1 y 2: pulsa.\n')
  writeFileSync(join(capturas, 'cortes-1440-inicial.txt'), '\n')
  writeFileSync(join(refs, 'producto-a.png'), PNG)
  if (extraReference !== undefined) {
    writeFileSync(join(refs, extraReference), PNG)
  }
  return { capturas, refs }
}

function paquete(capturas: string, refs: string, args: ReadonlyArray<string>) {
  return spawnSync(
    'nu',
    [
      join(root, 'scripts/hill-climb-paquete.nu'),
      capturas,
      join(root, 'docs/hill-climb/rubrica.md'),
      refs,
      join(root, 'docs/hill-climb/brief-revisor.md'),
      join(root, 'docs/hill-climb/reglas-revisor.md'),
      ...args,
    ],
    { encoding: 'utf8' },
  )
}

describe.skipIf(!hasNu)('hill-climb-paquete.nu', () => {
  it('copies only the chosen neutral files and fills the brief', () => {
    const { capturas, refs } = fixture()
    const run = paquete(capturas, refs, [
      '--anchos',
      '1440',
      '--figuras',
      'd3',
      '--estados-por-seccion',
      'cuaderno=resuelto',
    ])
    expect(run.status, run.stderr).toBe(0)
    const record = readdirSync(capturas).find((name) =>
      /^paquete-.*\.json$/.test(name),
    )
    const parsed: unknown = JSON.parse(
      readFileSync(join(capturas, record ?? 'missing'), 'utf8'),
    )
    const dir =
      typeof parsed === 'object' && parsed !== null
        ? String(Reflect.get(parsed, 'dir'))
        : ''
    expect(dir.startsWith(tmpdir())).toBe(true)
    expect(readdirSync(dir).sort()).toEqual([
      'brief.md',
      'interaccion-d3-1440-1.png',
      'interaccion-d3.txt',
      'leccion-1440-inicial-d3-1.png',
      'leccion-1440-resuelto-cuaderno-1.png',
      'producto-a.png',
      'rubrica.md',
    ])
    const brief = readFileSync(join(dir, 'brief.md'), 'utf8')
    expect(brief).toContain(`${dir}/rubrica.md`)
    expect(brief).not.toMatch(/<dir>|<n>|<m>|<reglas>|hill-climb|worlds/i)
  })

  it('refuses a reference folder that names a product', () => {
    const { capturas, refs } = fixture('brilliant.png')
    const run = paquete(capturas, refs, [])
    expect(run.status).not.toBe(0)
    expect(run.stderr).toContain('brilliant.png')
  })
})
