/**
 * Hill-climb bench. Serves the app with Vite on a free port, opens one lesson
 * in Chromium with a fixed clock, locale and time zone, and writes:
 *
 * - leccion-<ancho>-<estado>-<seccion>-<n>.png: tiles of each section in the
 *   states inicial, extremo (every slider at its maximum) and resuelto (every
 *   reveal opened), plus `cabecera` (top of page) and `vista` (the viewport
 *   on the first figure, nav included);
 * - interaccion-<figura>-<ancho>-<n>.png and interaccion-<figura>.txt: the
 *   manipulation each figure's text asks for, done with the keyboard;
 * - textos-<ancho>-<estado>.tsv: visible text per section, to diff rounds;
 * - cortes-<ancho>-<estado>.txt: text wider than its box, and controls whose
 *   centre is covered by something else;
 * - metricas.json: DOM nodes, layout shift, startup, heap, apparent SVG text.
 *
 * Any network request off localhost, console error or page error fails the
 * run. Usage:
 *   node scripts/hill-climb/captura.ts --ruta /detection --salida DIR
 *     [--anchos 1440,900,390] [--figuras D3,D2]
 */
import { createServer as createNetServer } from 'node:net'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from 'playwright'
import type { Page } from 'playwright'
import { createServer } from 'vite'
import { INTERACCIONES, describirInteraccion } from './interacciones.ts'
import type { Paso } from './interacciones.ts'
import {
  interactionImage,
  interactionText,
  lessonImage,
  sectionSlug,
  STATES,
  tileHeight,
  tiles,
  viewportHeight,
} from './nombres.ts'
import type { State } from './nombres.ts'

const FIXED_TIME = new Date('2026-11-07T10:00:00+01:00')

const { values } = parseArgs({
  options: {
    ruta: { type: 'string' },
    salida: { type: 'string' },
    anchos: { type: 'string', default: '1440,900,390' },
    figuras: { type: 'string', default: '' },
  },
})

function required(value: string | undefined): string {
  if (value === undefined || value === '') {
    throw new Error('Usage: --ruta /detection --salida DIR')
  }
  return value
}

const route = required(values.ruta)
const out = required(values.salida)
const widths = values.anchos.split(',').map(Number)
const onlyFigures = values.figuras
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

const failures: Array<string> = []

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createNetServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => {
        if (address !== null && typeof address === 'object') {
          resolve(address.port)
        } else {
          reject(new Error('No free port'))
        }
      })
    })
  })
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })
  })
}

async function sectionIds(page: Page): Promise<ReadonlyArray<string>> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('main section[id]'))
      .map((section) => section.id)
      .filter((id) => /^[A-Z]\d$/.test(id) || id === 'exam-bank'),
  )
}

async function sliderIn(page: Page, scope: string, label: string) {
  const labelEl = page
    .locator(`${scope} label`)
    .filter({ hasText: label })
    .first()
  const id = await labelEl.getAttribute('for')
  if (id === null) {
    throw new Error(`No slider labelled «${label}» in ${scope}`)
  }
  return page.locator(`[id="${id}"] [role="slider"]`)
}

async function setSlider(
  page: Page,
  scope: string,
  label: string,
  target: number,
): Promise<void> {
  const thumb = await sliderIn(page, scope, label)
  await thumb.focus()
  await page.keyboard.press('Home')
  const read = async (name: string) => Number(await thumb.getAttribute(name))
  const min = await read('aria-valuemin')
  const max = await read('aria-valuemax')
  const clamped = Math.min(Math.max(target, min), max)
  for (let guard = 0; guard < 2000; guard += 1) {
    const now = await read('aria-valuenow')
    if (now >= clamped - 1e-9) {
      break
    }
    await page.keyboard.press('ArrowRight')
  }
  const reached = await read('aria-valuenow')
  if (Math.abs(reached - target) > 1e-6) {
    failures.push(
      `${scope} «${label}» asked for ${String(target)}, reached ${String(reached)}`,
    )
  }
}

async function runStep(page: Page, scope: string, paso: Paso): Promise<void> {
  if ('deslizar' in paso) {
    await setSlider(page, scope, paso.deslizar, paso.valor)
  } else if ('pulsar' in paso) {
    await page
      .locator(`${scope} button`)
      .filter({ hasText: paso.pulsar })
      .first()
      .click()
  } else {
    await page
      .locator(`${scope} label`)
      .filter({ hasText: paso.marcar })
      .first()
      .click()
  }
  await settle(page)
}

async function allSlidersToMax(page: Page): Promise<void> {
  const thumbs = page.locator('main [role="slider"]')
  const count = await thumbs.count()
  for (let index = 0; index < count; index += 1) {
    await thumbs.nth(index).focus()
    await page.keyboard.press('End')
  }
  await settle(page)
}

async function revealEverything(page: Page): Promise<void> {
  for (let guard = 0; guard < 400; guard += 1) {
    const button = page.locator('main [data-sonda="revelar"]').first()
    if ((await button.count()) === 0) {
      return
    }
    await button.click()
  }
  failures.push('reveal buttons never ran out')
}

type Measure = {
  readonly cuts: ReadonlyArray<string>
  readonly covered: ReadonlyArray<string>
  readonly pageOverflow: number
  readonly texts: ReadonlyArray<readonly [string, string]>
}

async function measure(page: Page): Promise<Measure> {
  return page.evaluate(() => {
    const describe = (el: Element): string => {
      const section = el.closest('section[id]')
      const where = section === null ? 'page' : section.id
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
      return `${where}\t${el.tagName.toLowerCase()}\t${text.slice(0, 90)}`
    }
    const cuts: Array<string> = []
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (!(el instanceof HTMLElement)) {
        continue
      }
      const ownText = Array.from(el.childNodes).some(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? '').trim() !== '',
      )
      const isMath = el.classList.contains('katex-display')
      if (!ownText && !isMath) {
        continue
      }
      const style = getComputedStyle(el)
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        el.offsetWidth <= 1
      ) {
        continue
      }
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        const kind =
          style.overflowX === 'auto' || style.overflowX === 'scroll'
            ? 'desplaza'
            : style.overflowX === 'visible'
              ? 'desborda'
              : 'corta'
        cuts.push(`${kind}\t${describe(el)}`)
      }
      const clamp = style.getPropertyValue('-webkit-line-clamp')
      if (
        clamp !== '' &&
        clamp !== 'none' &&
        el.scrollHeight > el.clientHeight + 1
      ) {
        cuts.push(`recorta-lineas\t${describe(el)}`)
      }
    }
    for (const scroller of Array.from(
      document.querySelectorAll('.overflow-x-auto'),
    )) {
      if (scroller.scrollWidth > scroller.clientWidth + 1) {
        cuts.push(`desplaza\t${describe(scroller)}`)
      }
    }
    const covered: Array<string> = []
    const controls = document.querySelectorAll(
      'main button, main a, main [role="slider"], main input',
    )
    for (const control of Array.from(controls)) {
      control.scrollIntoView({ block: 'center' })
      const box = control.getBoundingClientRect()
      if (
        box.width <= 1 ||
        box.height <= 1 ||
        control.matches(':disabled, [aria-disabled="true"]')
      ) {
        continue
      }
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      )
      if (hit === null || !(control === hit || control.contains(hit))) {
        covered.push(
          `tapado\t${describe(control)}\t${hit === null ? 'nada' : describe(hit)}`,
        )
      }
    }
    window.scrollTo(0, 0)
    const texts: Array<readonly [string, string]> = Array.from(
      document.querySelectorAll('main section[id]'),
    ).map((section) => {
      const text =
        section instanceof HTMLElement ? section.innerText : section.textContent
      return [section.id, (text ?? '').replace(/\s+/g, ' ').trim()] as const
    })
    return {
      cuts: Array.from(new Set(cuts)),
      covered,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      texts,
    }
  })
}

type FigureText = {
  readonly figure: string
  readonly minPx: number
  readonly maxPx: number
}

async function svgTextSizes(page: Page): Promise<ReadonlyArray<FigureText>> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('main section[id]')).flatMap(
      (section) => {
        const sizes = Array.from(section.querySelectorAll('svg text')).flatMap(
          (text) => {
            if (!(text instanceof SVGTextElement)) {
              return []
            }
            const svg = text.ownerSVGElement
            const matrix = svg?.getScreenCTM()
            const size = Number.parseFloat(getComputedStyle(text).fontSize)
            return matrix === null || matrix === undefined || !(size > 0)
              ? []
              : [size * matrix.a]
          },
        )
        return sizes.length === 0
          ? []
          : [
              {
                figure: section.id,
                minPx: Math.round(Math.min(...sizes) * 10) / 10,
                maxPx: Math.round(Math.max(...sizes) * 10) / 10,
              },
            ]
      },
    ),
  )
}

async function shootSection(
  page: Page,
  width: number,
  state: State,
  id: string,
): Promise<void> {
  // Cut at the figure's edges so no tile slices a figure in half.
  const edges = await page.evaluate((sectionId) => {
    const section = document.getElementById(sectionId)
    if (section === null) {
      return null
    }
    const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY
    const bottom = (el: Element) =>
      el.getBoundingClientRect().bottom + window.scrollY
    const figure = document.getElementById(`${sectionId}-figure`)
    return figure === null
      ? [top(section), bottom(section)]
      : [top(section), top(figure), bottom(figure), bottom(section)]
  }, id)
  if (edges === null) {
    failures.push(`section ${id} not found`)
    return
  }
  let part = 0
  for (let index = 0; index + 1 < edges.length; index += 1) {
    const from = Math.round(edges[index] ?? 0)
    const to = Math.round(edges[index + 1] ?? 0)
    for (const tile of tiles(from, to - from, tileHeight(width))) {
      part += 1
      await page.screenshot({
        path: join(out, lessonImage(width, state, sectionSlug(id), part)),
        fullPage: true,
        clip: { x: 0, y: tile.y, width, height: tile.height },
        animations: 'disabled',
      })
    }
  }
}

async function main(): Promise<void> {
  await mkdir(out, { recursive: true })
  const port = await freePort()
  const server = await createServer({
    server: { port, strictPort: false, host: '127.0.0.1' },
    logLevel: 'error',
    clearScreen: false,
  })
  await server.listen()
  const base =
    server.resolvedUrls?.local[0] ?? `http://127.0.0.1:${String(port)}/`
  const origin = new URL(base).origin
  const browser = await chromium.launch({
    args: [
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      '--disable-lcd-text',
      '--disable-gpu',
      '--disable-partial-raster',
    ],
  })
  const metrics: Record<string, unknown> = { ruta: route, origen: 'vite dev' }

  try {
    for (const width of widths) {
      for (const state of STATES) {
        const context = await browser.newContext({
          viewport: { width, height: viewportHeight(width) },
          deviceScaleFactor: 1,
          locale: 'en-US',
          timezoneId: 'Europe/Madrid',
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        await page.clock.setFixedTime(FIXED_TIME)
        await page.route('**/*', async (request) => {
          const url = request.request().url()
          if (url.startsWith(origin) || url.startsWith('data:')) {
            await request.continue()
          } else {
            failures.push(`network ${url}`)
            await request.abort()
          }
        })
        page.on('console', (message) => {
          if (message.type() === 'error') {
            failures.push(
              `console ${String(width)} ${state}: ${message.text()}`,
            )
          }
        })
        page.on('pageerror', (error) => {
          failures.push(`pageerror ${String(width)} ${state}: ${error.message}`)
        })
        await page.addInitScript(() => {
          const shifts: Array<number> = []
          Reflect.set(window, '__shifts', shifts)
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const value = Reflect.get(entry, 'value')
              if (Reflect.get(entry, 'hadRecentInput') === true) {
                continue
              }
              if (typeof value === 'number') {
                shifts.push(value)
              }
            }
          }).observe({ type: 'layout-shift', buffered: true })
        })

        const started = Date.now()
        await page.goto(new URL(route, base).toString(), {
          waitUntil: 'networkidle',
        })
        await page.locator('main section[id]').first().waitFor()
        await settle(page)
        const startupMs = Date.now() - started
        const fontsOk = await page.evaluate(() =>
          Array.from(document.fonts).every((face) => face.status !== 'error'),
        )
        if (!fontsOk) {
          failures.push(`fonts failed at ${String(width)}`)
        }

        const loadShift = await page.evaluate(() => {
          const list: unknown = Reflect.get(window, '__shifts')
          return Array.isArray(list)
            ? list.reduce(
                (sum: number, v: unknown) =>
                  sum + (typeof v === 'number' ? v : 0),
                0,
              )
            : 0
        })
        const ids = await sectionIds(page)
        if (state === 'extremo') {
          await allSlidersToMax(page)
        }
        if (state === 'resuelto') {
          await revealEverything(page)
          await settle(page)
        }

        const viewH = viewportHeight(width)
        await page.screenshot({
          path: join(out, lessonImage(width, state, 'cabecera', 1)),
          clip: { x: 0, y: 0, width, height: viewH },
        })
        for (const id of ids) {
          if (
            onlyFigures.length > 0 &&
            id !== 'exam-bank' &&
            !onlyFigures.includes(id)
          ) {
            continue
          }
          await shootSection(page, width, state, id)
        }
        const first = onlyFigures[0] ?? ids.find((id) => id !== 'exam-bank')
        if (first !== undefined) {
          await page.locator(`[id="${first}-figure"]`).scrollIntoViewIfNeeded()
          await page.evaluate((id) => {
            const el = document.getElementById(`${id}-figure`)
            const header = document.querySelector('header')
            const offset =
              header === null ? 0 : header.getBoundingClientRect().bottom
            if (el !== null) {
              window.scrollTo(
                0,
                el.getBoundingClientRect().top + window.scrollY - offset - 16,
              )
            }
          }, first)
          // The nav's progress ring follows scroll events a frame late.
          await page.waitForTimeout(250)
          await settle(page)
          await page.screenshot({
            path: join(out, lessonImage(width, state, 'vista', 1)),
          })
          await page.evaluate(() => {
            window.scrollTo(0, 0)
          })
        }

        const measured = await measure(page)
        await writeFile(
          join(out, `textos-${String(width)}-${state}.tsv`),
          measured.texts.map(([id, text]) => `${id}\t${text}`).join('\n') +
            '\n',
        )
        await writeFile(
          join(out, `cortes-${String(width)}-${state}.txt`),
          [
            ...(measured.pageOverflow > 0
              ? [
                  `pagina\tdesborda ${String(measured.pageOverflow)} px en horizontal`,
                ]
              : []),
            ...measured.cuts,
            ...measured.covered,
          ].join('\n') + '\n',
        )
        const cdp = await context.newCDPSession(page)
        await cdp.send('Performance.enable')
        const perf = await cdp.send('Performance.getMetrics')
        const pick = (name: string) =>
          perf.metrics.find((metric) => metric.name === name)?.value ?? null
        metrics[`${String(width)}-${state}`] = {
          arranqueMs: startupMs,
          nodosDom: pick('Nodes'),
          heapMb: Math.round((pick('JSHeapUsedSize') ?? 0) / 1e5) / 10,
          layoutShiftCarga: Math.round(loadShift * 1e4) / 1e4,
          cortes: measured.cuts.length,
          tapados: measured.covered.length,
          textoSvg: state === 'inicial' ? await svgTextSizes(page) : undefined,
        }

        if (state === 'inicial') {
          for (const id of ids) {
            const interaccion = INTERACCIONES[id]
            if (interaccion === undefined) {
              continue
            }
            if (onlyFigures.length > 0 && !onlyFigures.includes(id)) {
              continue
            }
            const scope = `[id="${id}-figure"]`
            const slug = sectionSlug(id)
            for (const paso of interaccion.antes) {
              await runStep(page, scope, paso)
            }
            const shoot = async (frame: number) => {
              await page.locator(scope).screenshot({
                path: join(out, interactionImage(slug, width, frame)),
                animations: 'disabled',
              })
            }
            await shoot(1)
            for (const [index, pasos] of interaccion.pasos.entries()) {
              for (const paso of pasos) {
                await runStep(page, scope, paso)
              }
              await shoot(index + 2)
            }
            await writeFile(
              join(out, interactionText(slug)),
              describirInteraccion(interaccion),
            )
          }
        }
        await context.close()
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }

  await writeFile(
    join(out, 'metricas.json'),
    JSON.stringify(metrics, null, 2) + '\n',
  )
  await writeFile(join(out, 'fallos.txt'), failures.join('\n') + '\n')
  if (failures.length > 0) {
    console.error(failures.join('\n'))
    process.exitCode = 1
  }
}

await main()
