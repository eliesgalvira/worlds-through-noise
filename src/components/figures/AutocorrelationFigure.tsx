import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import {
  ar1,
  gaussianVector,
  makeRng,
  psdFromAutocorrelation,
  sampleAutocorrelation,
  toneInNoise,
} from '@/domain/math/kernel.ts'

const N = 150
const MAX_LAG = 24
const W = 460
const TRACE_H = 120
const PANEL_H = 110

type SignalKind = 'white' | 'colored' | 'tone'

const KIND_LABEL: Record<SignalKind, string> = {
  white: 'White noise',
  colored: 'Filtered noise',
  tone: 'Tone + noise',
}

function makeSignal(kind: SignalKind, seed: number): Array<number> {
  const rng = makeRng(seed)
  if (kind === 'white') {
    return gaussianVector(rng, N)
  }
  if (kind === 'colored') {
    return ar1(rng, N, 0.88)
  }
  return toneInNoise(rng, N, 1.3, 0.08, 0.55, 0.7)
}

function AutocorrelationFigure() {
  const [kind, setKind] = useState<SignalKind>('colored')
  const [lag, setLag] = useState(4)
  const [seed, setSeed] = useState(3)

  const signal = useMemo(() => makeSignal(kind, seed), [kind, seed])
  const autocorr = useMemo(
    () => sampleAutocorrelation(signal, MAX_LAG),
    [signal],
  )
  const frequencies = useMemo(() => linspace(0, 0.5, 80), [])
  const psd = useMemo(
    () => psdFromAutocorrelation(autocorr, frequencies),
    [autocorr, frequencies],
  )

  const r0 = autocorr[0] ?? 1
  const rm = autocorr[lag] ?? 0

  const xOf = (n: number) => 8 + (n / (N - 1)) * (W - 16)
  const yOf = (v: number) => TRACE_H / 2 - v * (TRACE_H / 8)
  const maxPsd = Math.max(...psd, 1e-6)

  return (
    <FigureShell
      title="Slide a copy of the signal past itself"
      instruction="The faint trace is the signal; the amber trace is the same signal shifted by the lag m. The overlap product, averaged, is one point of the autocorrelation — already plotted below for every lag. Try all three signals and watch memory die fast, slowly, or never."
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {(['white', 'colored', 'tone'] as const).map((k) => (
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
            label="Lag"
            variable="m"
            value={lag}
            min={0}
            max={MAX_LAG}
            step={1}
            meaning="How far the copy is slid before comparing."
            onValueChange={setLag}
            format={(v) => `m = ${v.toFixed(0)}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed((s) => s + 1)
            }}
          >
            New realization
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow label="r̂(0) — power" value={formatNumber(r0, 2)} />
          <ReadoutRow
            label={`r̂(${lag}) — resemblance at lag ${lag}`}
            value={formatNumber(rm, 2)}
            tone="h1"
          />
          <ReadoutRow
            label="Normalized r̂(m)/r̂(0)"
            value={formatNumber(rm / (r0 || 1), 2)}
            tone={Math.abs(rm / (r0 || 1)) > 0.4 ? 'good' : 'default'}
          />
        </>
      }
    >
      <Legend
        items={[
          { label: 'signal x(n)', swatchClass: 'stroke-h0' },
          { label: `shifted copy x(n−m)`, swatchClass: 'stroke-h1' },
        ]}
      />
      <Plot
        viewW={W}
        viewH={TRACE_H}
        ariaLabel="Signal and its lag-shifted copy"
      >
        <line
          x1={8}
          y1={TRACE_H / 2}
          x2={W - 8}
          y2={TRACE_H / 2}
          className="stroke-border"
          strokeWidth={1}
        />
        <path
          d={signal
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOf(n).toFixed(1)} ${yOf(v).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={1.4}
          opacity={0.85}
        />
        <path
          d={signal
            .slice(0, N - lag)
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOf(n + lag).toFixed(1)} ${yOf(v).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h1"
          strokeWidth={1.4}
          opacity={0.85}
        />
      </Plot>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <Plot
            viewW={W / 2}
            viewH={PANEL_H}
            ariaLabel="Sample autocorrelation over all lags"
            onDragPoint={(x) => {
              const m = Math.round(((x - 10) / (W / 2 - 20)) * MAX_LAG)
              setLag(Math.min(MAX_LAG, Math.max(0, m)))
            }}
          >
            <line
              x1={6}
              y1={PANEL_H - 24}
              x2={W / 2 - 6}
              y2={PANEL_H - 24}
              className="stroke-border"
              strokeWidth={1}
            />
            {autocorr.map((r, m) => {
              const x = 10 + (m / MAX_LAG) * (W / 2 - 20)
              const y = PANEL_H - 24 - (r / (r0 || 1)) * (PANEL_H - 42)
              return (
                <g key={m}>
                  <line
                    x1={x}
                    y1={PANEL_H - 24}
                    x2={x}
                    y2={y}
                    className={m === lag ? 'stroke-threshold' : 'stroke-h0'}
                    strokeWidth={m === lag ? 3 : 1.6}
                    opacity={m === lag ? 1 : 0.7}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={m === lag ? 3 : 2}
                    className={m === lag ? 'fill-threshold' : 'fill-h0'}
                  />
                </g>
              )
            })}
            <text
              x={W / 4}
              y={PANEL_H - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              r̂(m) — drag to set the lag
            </text>
          </Plot>
        </div>
        <div>
          <Plot
            viewW={W / 2}
            viewH={PANEL_H}
            ariaLabel="Power spectral density implied by the autocorrelation"
          >
            <path
              d={`${psd
                .map((s, i) => {
                  const x = 10 + ((frequencies[i] ?? 0) / 0.5) * (W / 2 - 20)
                  const y = PANEL_H - 24 - (s / maxPsd) * (PANEL_H - 42)
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
                })
                .join(
                  ' ',
                )} L ${(W / 2 - 10).toFixed(1)} ${PANEL_H - 24} L 10 ${PANEL_H - 24} Z`}
              className="fill-h1 stroke-h1"
              fillOpacity={0.25}
              strokeWidth={1.5}
            />
            <text
              x={W / 4}
              y={PANEL_H - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              Ŝ(f) — same information, by frequency
            </text>
          </Plot>
        </div>
      </div>
    </FigureShell>
  )
}

export { AutocorrelationFigure }
