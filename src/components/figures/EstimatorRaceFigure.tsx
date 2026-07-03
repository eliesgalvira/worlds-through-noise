import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { gaussian, makeRng } from '@/domain/math/kernel.ts'

const TRUTH = 0.5
const RUNS = 500
const W = 470
const H = 230
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
  const [result, setResult] = useState<RaceResult>(() =>
    runRace('gaussian', 64, 1),
  )

  const bins = 46
  const meanHist = histogramOf(result.means, bins)
  const midHist = histogramOf(result.midranges, bins)
  const maxCount = Math.max(...meanHist, ...midHist, 1)
  const meanStats = stats(result.means)
  const midStats = stats(result.midranges)

  const xOf = (v: number) => 10 + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 20)
  const slotW = (W - 20) / bins

  const rerun = (nextKind: NoiseKind, nextN: number) => {
    const nextSeed = seed + 1
    setSeed(nextSeed)
    setResult(runRace(nextKind, nextN, nextSeed))
  }

  return (
    <FigureShell
      title="Race two estimators over 500 repeated experiments"
      instruction="Both machines estimate the same hidden mean (ink line) from the same data. The piles are their actual outputs over 500 fresh experiments — bias is a shifted pile, variance is a wide one. Now switch the noise from Gaussian to uniform and run again."
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={kind === 'gaussian' ? 'default' : 'outline'}
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
              variant={kind === 'uniform' ? 'default' : 'outline'}
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
            meaning="Consistency: watch the good pile tighten as N grows."
            onValueChange={(v) => {
              setN(v)
              rerun(kind, v)
            }}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <Button
            type="button"
            variant="outline"
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
            label="Sample mean: std of pile"
            value={formatNumber(meanStats.sd, 3)}
            tone="h0"
          />
          <ReadoutRow
            label="Midrange: std of pile"
            value={formatNumber(midStats.sd, 3)}
            tone="h1"
          />
          <ReadoutRow
            label="Winner (this model)"
            value={meanStats.sd < midStats.sd ? 'sample mean' : 'midrange'}
            tone="good"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Both noises have variance 1. The ranking flips with the distribution
            — “best estimator” is a property of the pair.
          </p>
        </>
      }
    >
      <Legend
        items={[
          { label: 'sample mean pile', swatchClass: 'stroke-h0' },
          { label: 'midrange (max+min)/2 pile', swatchClass: 'stroke-h1' },
          { label: 'hidden truth θ', swatchClass: 'stroke-truth' },
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
            y={H - 30 - (count / maxCount) * (H - 60)}
            width={slotW * 0.9}
            height={(count / maxCount) * (H - 60)}
            className="fill-h0"
            opacity={0.55}
          />
        ))}
        {midHist.map((count, i) => (
          <rect
            key={`r${i}`}
            x={10 + i * slotW}
            y={H - 30 - (count / maxCount) * (H - 60)}
            width={slotW * 0.9}
            height={(count / maxCount) * (H - 60)}
            className="fill-h1"
            opacity={0.45}
          />
        ))}
        <line
          x1={xOf(TRUTH)}
          y1={12}
          x2={xOf(TRUTH)}
          y2={H - 26}
          className="stroke-truth"
          strokeWidth={2}
        />
        <line
          x1={10}
          y1={H - 30}
          x2={W - 10}
          y2={H - 30}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <text
          x={xOf(TRUTH) + 6}
          y={20}
          className="fill-truth font-mono text-[10px]"
        >
          θ = 0.5
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Every bar is a real experiment: {RUNS} runs × N samples, no fitted
        curves anywhere.
      </p>
    </FigureShell>
  )
}

export { EstimatorRaceFigure }
