import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { MathText } from '@/components/MathText.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
  AxisTicks,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { bias, mse } from '@/domain/math/estimation.ts'
import { gaussian, makeRng } from '@/domain/math/kernel.ts'

const TRUTH = 0.5
const RUNS = 500
const W = 470
const H = 240
/** The estimate axis; piles grow up from it. */
const AXIS_Y = H - 44
/** Fixed rows for the two brackets, above the tallest a pile may grow. */
const MEAN_ROW = 40
const MID_ROW = 72
const PILE_CEILING = 86
/** Generous width of one monospace label character, in viewBox units. */
const LABEL_CHAR_W = 9
const X_MIN = -0.3
const X_MAX = 1.3

type NoiseKind = 'gaussian' | 'uniform'

type RaceResult = {
  readonly means: ReadonlyArray<number>
  readonly midranges: ReadonlyArray<number>
}

function runRace(kind: NoiseKind, n: number, seed: number): RaceResult {
  const rng = makeRng(seed)
  const means: Array<number> = []
  const midranges: Array<number> = []
  for (let run = 0; run < RUNS; run += 1) {
    let sum = 0
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < n; i += 1) {
      // Both noises have variance 1: uniform over ±√3.
      const noise =
        kind === 'gaussian' ? gaussian(rng) : (rng() * 2 - 1) * Math.sqrt(3)
      const x = TRUTH + noise
      sum += x
      min = Math.min(min, x)
      max = Math.max(max, x)
    }
    means.push(sum / n)
    midranges.push((min + max) / 2)
  }
  return { means, midranges }
}

function stats(values: ReadonlyArray<number>): { mean: number; sd: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length
  return { mean, sd: Math.sqrt(variance) }
}

/** MSE of a pile of estimates around the truth, from its measured stats. */
function raceMse({ mean, sd }: { mean: number; sd: number }): number {
  return mse(bias(mean, TRUTH), sd * sd)
}

function histogramOf(
  values: ReadonlyArray<number>,
  bins: number,
): Array<number> {
  const counts = Array.from({ length: bins }, () => 0)
  for (const v of values) {
    const index = Math.floor(((v - X_MIN) / (X_MAX - X_MIN)) * bins)
    if (index >= 0 && index < bins) {
      counts[index] = (counts[index] ?? 0) + 1
    }
  }
  return counts
}

function EstimatorRaceFigure() {
  const [kind, setKind] = useState<NoiseKind>('gaussian')
  const [n, setN] = useState(64)
  const [seed, setSeed] = useState(1)
  // Empty until the first run: the student predicts before seeing a pile.
  const [result, setResult] = useState<RaceResult | null>(null)

  const bins = 80
  const meanHist = histogramOf(result?.means ?? [], bins)
  const midHist = histogramOf(result?.midranges ?? [], bins)
  // One fixed count scale for every N and noise, so a pile only changes
  // when its estimator does. A pile taller than the frame is clipped and
  // prints the count of its tallest bar.
  const maxCount = RUNS * 0.2
  const barH = (count: number) =>
    Math.min(count / maxCount, 1) * (AXIS_Y - PILE_CEILING)
  const clippedPeak = (hist: ReadonlyArray<number>) => {
    const peak = Math.max(...hist)
    return peak > maxCount ? [{ count: peak, i: hist.indexOf(peak) }] : []
  }
  const meanStats = stats(result?.means ?? [])
  const midStats = stats(result?.midranges ?? [])
  const readout = (stat: { mean: number; sd: number }) =>
    result === null
      ? '—'
      : `${formatNumber(stat.mean - TRUTH, 3)}, ${formatNumber(stat.sd, 3)}`

  const xOf = (v: number) => 10 + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 20)
  const slotW = (W - 20) / bins

  const beyondAxis =
    result === null
      ? 0
      : [...result.means, ...result.midranges].filter(
          (v) => v < X_MIN || v > X_MAX,
        ).length
  const bracketRows = [
    {
      name: 'sample mean',
      stat: meanStats,
      y: MEAN_ROW,
      stroke: 'stroke-estimate',
      fill: 'fill-estimate',
    },
    {
      name: 'midrange',
      stat: midStats,
      y: MID_ROW,
      stroke: 'stroke-muted-foreground',
      fill: 'fill-muted-foreground',
    },
  ]

  const rerun = (nextKind: NoiseKind, nextN: number) => {
    const nextSeed = seed + 1
    setSeed(nextSeed)
    setResult(runRace(nextKind, nextN, nextSeed))
  }

  return (
    <FigureShell
      title="Race two estimators over 500 repeated experiments"
      instruction="Both machines estimate the same hidden mean (dashed line) from the same data. The piles are their outputs over 500 fresh experiments. The bracket above each pile marks its center and its spread $\pm\sigma_{\hat{\theta}}$: the bias $b_{\hat{\theta}}$ is how far the center sits from the truth $\theta$. Now switch the noise from Gaussian to uniform and run again."
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={kind === 'gaussian' ? 'secondary' : 'outline'}
              aria-pressed={kind === 'gaussian'}
              onClick={() => {
                setKind('gaussian')
                rerun('gaussian', n)
              }}
            >
              Gaussian noise
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === 'uniform' ? 'secondary' : 'outline'}
              aria-pressed={kind === 'uniform'}
              onClick={() => {
                setKind('uniform')
                rerun('uniform', n)
              }}
            >
              Uniform noise
            </Button>
          </div>
          <SliderControl
            label="Samples per experiment"
            variable="N"
            value={n}
            min={8}
            max={256}
            step={8}
            meaning="Consistency: watch the good pile tighten as $N$ grows."
            onValueChange={(v) => {
              setN(v)
              rerun(kind, v)
            }}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              rerun(kind, n)
            }}
          >
            Run 500 fresh experiments
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Sample mean: $b_{\hat{\theta}}$, $\sigma_{\hat{\theta}}$ (measured)"
            value={readout(meanStats)}
            tone="estimate"
          />
          <ReadoutRow
            label="Midrange: $b_{\hat{\theta}}$, $\sigma_{\hat{\theta}}$ (measured)"
            value={readout(midStats)}
          />
          <ReadoutRow
            label="Lower MSE $= \sigma_{\hat{\theta}}^2 + b_{\hat{\theta}}^2$"
            value={
              result === null
                ? '—'
                : raceMse(meanStats) < raceMse(midStats)
                  ? 'sample mean'
                  : 'midrange'
            }
          />
          <ReadoutNote>
            {kind === 'uniform' &&
            result !== null &&
            raceMse(midStats) < raceMse(meanStats)
              ? 'Both noises have variance 1. The ranking flipped with the distribution: “best estimator” is a property of the pair.'
              : 'Both noises have variance 1.'}
          </ReadoutNote>
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'sample mean pile',
            swatchClass: 'fill-estimate/60',
            mark: 'square',
          },
          {
            label: 'midrange $(\\max{+}\\min)/2$ pile (outline)',
            swatchClass: 'stroke-muted-foreground',
          },
          {
            label: 'hidden truth $\\theta$',
            swatchClass: 'stroke-truth',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Histograms of two estimators' outputs over repeated experiments"
      >
        {meanHist.map((count, i) => (
          <rect
            key={`m${i}`}
            x={10 + i * slotW}
            y={AXIS_Y - barH(count)}
            width={slotW * 0.9}
            height={barH(count)}
            className="fill-estimate/60"
          />
        ))}
        <path
          d={midHist
            .map(
              (count, i) =>
                `${i === 0 ? 'M' : 'L'} ${(10 + i * slotW).toFixed(1)} ${(AXIS_Y - 1.5 - barH(count)).toFixed(1)} H ${(10 + (i + 1) * slotW).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth={2}
        />
        {[
          { hist: meanHist, className: 'fill-estimate' },
          { hist: midHist, className: 'fill-muted-foreground' },
        ].flatMap(({ hist, className }) =>
          clippedPeak(hist).map(({ count, i }) => (
            <text
              key={`${className}${i}`}
              x={10 + (i + 1) * slotW + 3}
              y={PILE_CEILING + 6}
              className={`plot-halo font-mono plot-text-xs ${className}`}
            >
              {count} runs, off scale ↑
            </text>
          )),
        )}
        <line
          x1={xOf(TRUTH)}
          y1={24}
          x2={xOf(TRUTH)}
          y2={AXIS_Y}
          className="stroke-truth"
          strokeWidth={1.6}
          strokeDasharray="4 4"
        />
        {result === null ? (
          <text
            x={xOf(TRUTH) + 10}
            y={AXIS_Y - 50}
            className="plot-halo fill-muted-foreground font-mono plot-text-sm"
          >
            Which pile is narrower?
          </text>
        ) : (
          bracketRows.map(({ name, stat, y, stroke, fill }) => {
            const left = xOf(Math.max(stat.mean - stat.sd, X_MIN))
            const right = xOf(Math.min(stat.mean + stat.sd, X_MAX))
            const center = xOf(stat.mean)
            const label = `${name} spread ±${formatNumber(stat.sd, 3)}`
            // Beside the bracket on the side away from the truth line, so the
            // line never crosses it. Above the bracket when there is no room.
            const labelW = label.length * LABEL_CHAR_W
            const place: { x: number; y: number; anchor: 'start' | 'end' } =
              stat.mean >= TRUTH && right + 6 + labelW <= W - 10
                ? { x: right + 6, y: y + 4, anchor: 'start' }
                : stat.mean < TRUTH && left - 6 - labelW >= 10
                  ? { x: left - 6, y: y + 4, anchor: 'end' }
                  : {
                      x: Math.min(Math.max(left, 12), W - 10 - labelW),
                      y: y - 9,
                      anchor: 'start',
                    }
            return (
              <g key={stroke}>
                <path
                  d={`M ${left} ${y - 4} V ${y + 4} M ${left} ${y} H ${right} M ${right} ${y - 4} V ${y + 4} M ${center} ${y - 6} V ${y + 6}`}
                  className={stroke}
                  strokeWidth={1.6}
                  fill="none"
                />
                <text
                  x={place.x}
                  y={place.y}
                  textAnchor={place.anchor}
                  className={`plot-halo font-mono plot-text-xs ${fill}`}
                >
                  {label}
                </text>
              </g>
            )
          })
        )}
        <line
          x1={10}
          y1={AXIS_Y}
          x2={W - 10}
          y2={AXIS_Y}
          className="stroke-border"
          strokeWidth={1}
        />
        <text
          x={xOf(TRUTH) + 6}
          y={16}
          className="fill-truth font-mono plot-text-sm"
        >
          θ = 0.5
        </text>
        <AxisTicks
          y={AXIS_Y}
          ticks={[0, 0.25, 0.5, 0.75, 1].map((v) => ({
            x: xOf(v),
            label: String(v),
          }))}
        />
        <text
          x={W - 12}
          y={H - 6}
          textAnchor="end"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          estimate θ̂ (bar height: experiments per bin)
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText
          text={`Every bar counts real experiments: ${String(RUNS)} runs of $N = ${String(n)}$ samples each, no fitted curves.${beyondAxis > 0 ? ` ${String(beyondAxis)} ${beyondAxis === 1 ? 'estimate falls' : 'estimates fall'} beyond the axis.` : ''}`}
        />
      </p>
    </FigureShell>
  )
}

export { EstimatorRaceFigure }
