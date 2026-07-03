import { Link } from 'react-router-dom'
import { ArrowRight, Lock } from 'lucide-react'
import { Logo } from '@/components/Logo.tsx'
import { Button } from '@/components/ui/button.tsx'
import { siteRoutes } from '@/lib/routes.ts'

/**
 * A clean signal on the left that is progressively buried in noise toward the
 * right: the product thesis as a single figure. Deterministic (fixed seed).
 */
function heroSignal(): string {
  const width = 600
  const mid = 100
  const steps = 240
  let seed = 20259
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  let d = ''
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const x = t * width
    const clean = Math.sin(t * Math.PI * 7) * 30 * Math.max(0, 1 - t / 0.75)
    const noiseGain = Math.min(1, Math.max(0, (t - 0.42) / 0.3))
    const noise = (rand() - 0.5) * 2 * 30 * noiseGain
    const y = mid - clean - noise
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

const HERO_SIGNAL_D = heroSignal()

const stages = [
  {
    dot: 'bg-truth',
    title: 'Hidden cause',
    body: 'A world the sensor never sees directly: H0, H1, or a buried value.',
  },
  {
    dot: 'bg-accent',
    title: 'Noise',
    body: 'The channel corrupts the trace. Evidence arrives smeared and uncertain.',
  },
  {
    dot: 'bg-estimate ring-2 ring-estimate/30',
    title: 'Inference',
    body: 'A rule that chooses the world, or names the value, then owns its errors.',
  },
]

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pb-14 pt-16 lg:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Interactive signal-processing textbook
        </p>

        <div className="mt-6">
          <Logo className="text-[clamp(0.95rem,4.3vw,3.25rem)]" />
        </div>

        <div className="mt-10 max-w-2xl">
          <h1 className="font-serif text-2xl leading-snug text-foreground md:text-[2rem]">
            See worlds through noise and hear noise through walls.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Manipulate the phenomenon first. Watch noise, samples, priors, and
            thresholds change the answer. Meet the mathematics only once the
            intuition is already yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/detection">
                Start with detection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/estimation">Open estimation</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <figure className="overflow-hidden rounded-lg border bg-card">
          <div className="relative">
            <svg
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
              className="block h-[clamp(160px,26vw,240px)] w-full"
              role="img"
              aria-label="A clean signal on the left is progressively buried by noise toward the right, where a threshold and an inference marker sit."
            >
              <defs>
                <linearGradient
                  id="heroSignalStroke"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0" style={{ stopColor: 'var(--truth)' }} />
                  <stop offset="0.34" style={{ stopColor: 'var(--truth)' }} />
                  <stop offset="0.58" style={{ stopColor: 'var(--accent)' }} />
                  <stop offset="1" style={{ stopColor: 'var(--accent)' }} />
                </linearGradient>
              </defs>
              {[120, 240, 360, 480].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={16}
                  x2={x}
                  y2={184}
                  className="stroke-border"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <line
                x1={0}
                y1={100}
                x2={600}
                y2={100}
                className="stroke-border"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={HERO_SIGNAL_D}
                stroke="url(#heroSignalStroke)"
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={500}
                y1={20}
                x2={500}
                y2={180}
                className="stroke-threshold"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              aria-hidden="true"
              className="absolute left-[83.333%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-estimate ring-2 ring-card"
            />
          </div>
          <figcaption className="grid gap-6 border-t border-border p-6 sm:grid-cols-3 sm:gap-8">
            {stages.map((stage) => (
              <div key={stage.title} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${stage.dot}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-foreground">{stage.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {stage.body}
                  </p>
                </div>
              </div>
            ))}
          </figcaption>
        </figure>
      </section>

      <section className="border-t border-border py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Three questions
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Detection asks which world produced the data. Estimation asks what
            value made it likely. Filtering asks how that value moves through
            time.
          </p>
        </div>

        <ol className="mt-10 border-y border-border">
          {siteRoutes.map((route, index) => {
            const number = String(index + 1).padStart(2, '0')
            const available = route.status === 'available'

            if (!available) {
              return (
                <li
                  key={route.path}
                  className="grid gap-5 border-t border-border py-6 text-muted-foreground first:border-t-0 md:grid-cols-[4rem_minmax(0,1fr)_8rem] md:items-center"
                >
                  <span className="font-mono text-sm text-muted-foreground/70">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl">{route.label}</h3>
                    <p className="mt-1 text-muted-foreground/80">
                      {route.tagline}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground/70 md:justify-self-end">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Soon
                  </span>
                </li>
              )
            }

            return (
              <li
                key={route.path}
                className="border-t border-border first:border-t-0"
              >
                <Link
                  to={route.path}
                  className="group grid gap-5 py-6 transition-colors hover:bg-card/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:grid-cols-[4rem_minmax(0,1fr)_2rem] md:items-center"
                >
                  <span className="font-mono text-sm text-accent">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
                      {route.label}
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      {route.tagline}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary md:justify-self-end"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

export { HomePage }
