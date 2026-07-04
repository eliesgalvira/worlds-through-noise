import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { FigureShell, Plot, ReadoutRow } from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { ar1, gaussianVector, makeRng } from '@/domain/math/kernel.ts'

const TRACES = 28
const SAMPLES = 96
const W = 460
const H = 280
const HIST_W = 130

type ProcessKind = 'white' | 'colored' | 'burst'

function makeEnsemble(kind: ProcessKind, seed: number): Array<Array<number>> {
  const rng = makeRng(seed)
  const traces: Array<Array<number>> = []
  for (let t = 0; t < TRACES; t += 1) {
    if (kind === 'white') {
      traces.push(gaussianVector(rng, SAMPLES))
    } else if (kind === 'colored') {
      traces.push(ar1(rng, SAMPLES, 0.85))
    } else {
      const white = gaussianVector(rng, SAMPLES)
      traces.push(
        white.map((v, n) => {
          const envelope = 0.35 + 1.9 * Math.exp(-(((n - 62) / 16) ** 2))
          return v * envelope
        }),
      )
    }
  }
  return traces
}

const KIND_LABEL: Record<ProcessKind, string> = {
  white: 'White',
  colored: 'Filtered (AR)',
  burst: 'Burst',
}

function EnsembleFigure() {
  const [kind, setKind] = useState<ProcessKind>('white')
  const [slice, setSlice] = useState(30)
  const [seed, setSeed] = useState(11)

  const ensemble = useMemo(() => makeEnsemble(kind, seed), [kind, seed])

  const sliceValues = ensemble.map((trace) => trace[slice] ?? 0)
  const mean = sliceValues.reduce((a, b) => a + b, 0) / sliceValues.length
  const variance =
    sliceValues.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
    sliceValues.length

  const yOf = (v: number) => H / 2 - v * (H / 9)
  const xOf = (n: number) => 8 + (n / (SAMPLES - 1)) * (W - 16)

  const bins = 13
  const histogram = useMemo(() => {
    const counts = Array.from({ length: bins }, () => 0)
    for (const v of sliceValues) {
      const index = Math.min(
        bins - 1,
        Math.max(0, Math.floor(((v + 4.5) / 9) * bins)),
      )
      counts[index] = (counts[index] ?? 0) + 1
    }
    return counts
  }, [sliceValues])
  const maxCount = Math.max(...histogram, 1)

  return (
    <FigureShell
      title="Slice the deck, not the trace"
      instruction="Each faint line is one dealt realization of the same process. Drag the slice through time and watch the vertical histogram: if it refuses to move, the process is stationary. Then switch to the amplitude burst."
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {(['white', 'colored', 'burst'] as const).map((k) => (
              <Button
                key={k}
                type="button"
                size="sm"
                variant={kind === k ? 'default' : 'outline'}
                onClick={() => {
                  setKind(k)
                }}
              >
                {KIND_LABEL[k]}
              </Button>
            ))}
          </div>
          <SliderControl
            label="Slice instant"
            variable="n"
            value={slice}
            min={0}
            max={SAMPLES - 1}
            step={1}
            meaning="Where you cut the deck vertically."
            onValueChange={setSlice}
            format={(v) => `n = ${v.toFixed(0)}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed((s) => s + 1)
            }}
          >
            Deal a fresh ensemble
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Slice mean m̂(n)"
            value={formatNumber(mean, 2)}
            tone="h0"
          />
          <ReadoutRow
            label="Slice variance σ̂²(n)"
            value={formatNumber(variance, 2)}
            tone="h1"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Computed across the {TRACES} realizations at the slice — the
            vertical average, not the horizontal one.
          </p>
        </>
      }
    >
      <div className="flex gap-2">
        <Plot
          viewW={W}
          viewH={H}
          ariaLabel="Ensemble of realizations with a movable time slice"
          className="min-w-0 flex-1"
          onDragPoint={(x) => {
            const n = Math.round(((x - 8) / (W - 16)) * (SAMPLES - 1))
            setSlice(Math.min(SAMPLES - 1, Math.max(0, n)))
          }}
        >
          <line
            x1={8}
            y1={H / 2}
            x2={W - 8}
            y2={H / 2}
            className="stroke-border"
            strokeWidth={1}
          />
          {ensemble.map((trace, index) => (
            <path
              key={index}
              d={trace
                .map(
                  (v, n) =>
                    `${n === 0 ? 'M' : 'L'} ${xOf(n).toFixed(1)} ${yOf(v).toFixed(1)}`,
                )
                .join(' ')}
              fill="none"
              className="stroke-h0"
              strokeWidth={0.8}
              opacity={0.32}
            />
          ))}
          <line
            x1={xOf(slice)}
            y1={6}
            x2={xOf(slice)}
            y2={H - 6}
            className="stroke-threshold"
            strokeWidth={2}
          />
          {sliceValues.map((v, index) => (
            <circle
              key={index}
              cx={xOf(slice)}
              cy={yOf(v)}
              r={2}
              className="fill-truth"
              opacity={0.75}
            />
          ))}
        </Plot>
        <Plot
          viewW={HIST_W}
          viewH={H}
          ariaLabel="Histogram of the ensemble values at the current slice"
          className="w-[26%] max-w-[140px] shrink-0"
        >
          {histogram.map((count, index) => {
            const y0 = H - 10 - ((index + 1) / bins) * (H - 20)
            const binH = (H - 20) / bins - 1.5
            return (
              <rect
                key={index}
                x={4}
                y={y0}
                width={(count / maxCount) * (HIST_W - 12)}
                height={Math.max(binH, 1)}
                className="fill-h1"
                opacity={0.8}
              />
            )
          })}
          <text
            x={HIST_W / 2}
            y={12}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[9px]"
          >
            f̂(x; n)
          </text>
        </Plot>
      </div>
    </FigureShell>
  )
}

export { EnsembleFigure }
