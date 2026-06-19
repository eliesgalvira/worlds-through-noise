import * as Effect from 'effect/Effect'

type InitialFontLoadTarget = {
  readonly font: string
  readonly text: string
}

const INITIAL_FONT_LOAD_TARGETS: ReadonlyArray<InitialFontLoadTarget> = [
  {
    font: '400 1em Inter',
    text: 'Manipulate the phenomenon first. Watch noise, samples, priors, and thresholds change the answer.',
  },
  {
    font: '500 1em Inter',
    text: 'Detection Estimation Filtering Start with detection Open estimation',
  },
  {
    font: '500 1em IBM Plex Mono',
    text: 'Interactive signal-processing textbook',
  },
  {
    font: '400 1em Spectral',
    text: 'Learn to infer hidden causes from corrupted traces.',
  },
  {
    font: '600 1em Spectral',
    text: 'Worlds Through Noise',
  },
]

const INITIAL_FONT_TIMEOUT_MS = 5000

function loadFontTarget({
  font,
  text,
}: InitialFontLoadTarget): Effect.Effect<void> {
  return Effect.tryPromise({
    try: () => document.fonts.load(font, text).then(() => undefined),
    catch: () => undefined,
  }).pipe(Effect.orElseSucceed(() => undefined))
}

function loadInitialFonts(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return Effect.runPromise(Effect.void)
  }

  return Effect.runPromise(
    Effect.all(INITIAL_FONT_LOAD_TARGETS.map(loadFontTarget), {
      concurrency: 'unbounded',
      discard: true,
    }).pipe(
      Effect.timeoutOrElse({
        duration: INITIAL_FONT_TIMEOUT_MS,
        orElse: () => Effect.void,
      }),
    ),
  )
}

export { loadInitialFonts }
