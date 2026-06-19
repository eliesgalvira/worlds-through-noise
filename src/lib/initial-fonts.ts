import * as Effect from 'effect/Effect'

const FIRST_PAINT_FONT_FACES: ReadonlyArray<string> = [
  '400 1em Inter',
  '500 1em Inter',
  '400 1em Spectral',
  '500 1em IBM Plex Mono',
]

// Normal connections should paint with the web fonts already resolved. Slow or
// failed font loads get a bounded delay, then `font-display: optional` prevents
// a late fallback-to-webfont swap from creating layout shift.
const FIRST_PAINT_FONT_BUDGET_MS = 1000

function loadFontFaceBestEffort(font: string): Effect.Effect<void> {
  return Effect.promise(() =>
    document.fonts.load(font).then(
      () => undefined,
      () => undefined,
    ),
  )
}

function loadInitialFonts(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return Effect.runPromise(Effect.void)
  }

  const fontsReady = Effect.all(
    FIRST_PAINT_FONT_FACES.map(loadFontFaceBestEffort),
    {
      concurrency: 'unbounded',
      discard: true,
    },
  )

  return Effect.runPromise(
    Effect.race(fontsReady, Effect.sleep(FIRST_PAINT_FONT_BUDGET_MS)),
  )
}

export { loadInitialFonts }
