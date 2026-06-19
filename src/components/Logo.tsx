import { cn } from '@/lib/utils.ts'

/**
 * One continuous signal line for the wordmark: clean as it crosses THROUGH,
 * then ramping into noise across NOISE. Drawn in a 240x24 box (centerline y=12)
 * and stretched over the THROUGH+NOISE words. Stable (fixed seed).
 */
function buildSignal(): string {
  const width = 240
  const mid = 12
  const straightEnd = 138
  let d = `M 0 ${mid} L ${straightEnd} ${mid}`
  const segments = 30
  const span = width - straightEnd
  let seed = 9973
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let i = 1; i <= segments; i += 1) {
    const x = straightEnd + (i / segments) * span
    const ramp = i < segments * 0.3 ? i / (segments * 0.3) : 1
    const y = mid + (rand() - 0.5) * 2 * 7.5 * ramp
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

const SIGNAL_D = buildSignal()

/** Short jagged signal overlaid on the globe inside the compact mark. */
const MARK_NOISE_D =
  'M5 24 L9 19 L12 28 L15 17 L18 27 L21 20 L24 26 L27 18 L30 27 L33 21 L37 25 L41 23 L44 24'

/** A globe standing in for the letter O in WORLDS. */
function GlobeO({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn('inline-block', className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10.4" />
      <ellipse cx="12" cy="12" rx="4.4" ry="10.4" />
      <line x1="1.6" y1="12" x2="22.4" y2="12" />
      <path d="M3.5 6.6 H20.5" />
      <path d="M3.5 17.4 H20.5" />
    </svg>
  )
}

type LogoProps = {
  readonly className?: string
}

/**
 * Full wordmark. A signal travels left to right: a world for the O in WORLDS,
 * a single line crossing through THROUGH, then degrading into NOISE.
 */
function Logo({ className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="Worlds Through Noise"
      className={cn(
        'inline-flex w-[14.75em] select-none items-center gap-[0.5em] overflow-visible whitespace-nowrap font-serif font-semibold uppercase leading-none tracking-[0.06em]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center text-foreground"
      >
        W
        <GlobeO className="mx-[0.06em] h-[0.78em] w-[0.78em] -translate-y-[0.035em] text-primary" />
        RLDS
      </span>

      <span
        aria-hidden="true"
        className="relative inline-flex items-center gap-[0.5em] text-foreground"
      >
        <span>THROUGH</span>
        <span>NOISE</span>
        <svg
          viewBox="0 0 240 24"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-[-0.16em] right-[-0.04em] top-[46.85%] h-[1.05em] -translate-y-1/2 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d={SIGNAL_D} />
        </svg>
      </span>
    </span>
  )
}

type LogoMarkProps = {
  readonly className?: string
}

/**
 * Compact square mark: a globe whose equator is replaced by a noise signal.
 * Suitable for the favicon and tight contexts.
 */
function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Worlds Through Noise"
      className={cn('inline-block', className)}
    >
      <circle
        cx="24"
        cy="24"
        r="15"
        className="stroke-primary"
        strokeWidth={2}
        fill="var(--card)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="6.2"
        ry="15"
        className="stroke-primary"
        strokeWidth={1.4}
        opacity={0.75}
      />
      <path
        d="M11 16 H37 M11 32 H37"
        className="stroke-primary"
        strokeWidth={1.4}
        opacity={0.6}
      />
      <path
        d={MARK_NOISE_D}
        className="stroke-accent"
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export { Logo, LogoMark }
