import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import {
  formatNumber,
  formatPercentValue,
} from '@/components/figures/figure-utils.ts'
import { linspace, normalCdf, normalPdf } from '@/domain/math/distributions.ts'
import { gaussianVector, makeRng } from '@/domain/math/kernel.ts'

const W = 470
const H = 220
const X_MIN = 20
const X_MAX = 80
// Ferritin screen: the SICK world has the LOWER mean.
const M0 = 58
const M1 = 42
const SIGMA = 11

type Draw = {
  readonly world: 'H0' | 'H1'
  readonly mean: number
  readonly revealed: boolean
}

function TwoWorldsFigure() {
  const [samples, setSamples] = useState(1)
  const [threshold, setThreshold] = useState(50)
  const [draw, setDraw] = useState<Draw | null>(null)
  const [seed, setSeed] = useState(40)

  const sd = SIGMA / Math.sqrt(samples)
  // Decide H1 (anemia) when the average is BELOW the threshold.
  const pFalseAlarm = normalCdf(threshold, M0, sd)
  const pDetection = normalCdf(threshold, M1, sd)
  const pMiss = 1 - pDetection

  const xs = useMemo(() => linspace(X_MIN, X_MAX, 200), [])
  const xOf = (v: number) => 10 + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 20)
  const peak = normalPdf(0, 0, Math.max(sd, 1.2))
  const yOf = (p: number) => H - 34 - (p / peak) * (H - 62)

  const densityPath = (mean: number) =>
    xs
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(normalPdf(v, mean, sd)).toFixed(1)}`,
      )
      .join(' ')

  const areaPath = (mean: number, from: number, to: number) => {
    const grid = linspace(from, to, 80)
    const inner = grid
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(normalPdf(v, mean, sd)).toFixed(1)}`,
      )
      .join(' ')
    return `${inner} L ${xOf(to).toFixed(1)} ${H - 34} L ${xOf(from).toFixed(1)} ${H - 34} Z`
  }

  const drawPatient = () => {
    const rng = makeRng(seed)
    const world = rng() < 0.5 ? 'H0' : 'H1'
    const values = gaussianVector(rng, samples).map(
      (g) => (world === 'H0' ? M0 : M1) + SIGMA * g,
    )
    const mean = values.reduce((acc, v) => acc + v, 0) / values.length
    setSeed((s) => s + 1)
    setDraw({ world, mean, revealed: false })
  }

  const verdict =
    draw === null
      ? null
      : draw.mean < threshold
        ? 'H1 (anemic)'
        : 'H0 (healthy)'

  return (
    <FigureShell
      title="Two machines, one number — and a flipped threshold"
      instruction="H1 (anemia) is the LEFT pile: sick patients have lower ferritin, so you call H1 below the threshold. Draw a patient, judge them, then raise N and watch both piles tighten by √N until the overlap drains."
      controls={
        <>
          <SliderControl
            label="Samples averaged"
            variable="N"
            value={samples}
            min={1}
            max={25}
            step={1}
            meaning="Days of measurements averaged before deciding."
            onValueChange={(v) => {
              setSamples(v)
              setDraw(null)
            }}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <SliderControl
            label="Threshold"
            variable="γ"
            value={threshold}
            min={X_MIN + 5}
            max={X_MAX - 5}
            step={0.5}
            meaning="Below γ you declare anemia."
            onValueChange={setThreshold}
            format={(v) => `γ = ${v.toFixed(1)}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={drawPatient}>
              Draw a patient
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={draw === null || draw.revealed}
              onClick={() => {
                setDraw((d) => (d === null ? null : { ...d, revealed: true }))
              }}
            >
              Reveal the world
            </Button>
          </div>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="P_FA (healthy called anemic)"
            value={formatPercentValue(pFalseAlarm)}
            tone="bad"
          />
          <ReadoutRow
            label="P_D (anemia caught)"
            value={formatPercentValue(pDetection)}
            tone="good"
          />
          <ReadoutRow label="P_M = 1 − P_D" value={formatPercentValue(pMiss)} />
          {draw !== null ? (
            <p className="pt-1 text-xs leading-5 text-foreground">
              Patient average: {formatNumber(draw.mean, 1)} → verdict {verdict}.{' '}
              {draw.revealed
                ? `Truth: ${draw.world === 'H1' ? 'anemic' : 'healthy'} — ${
                    draw.mean < threshold === (draw.world === 'H1')
                      ? 'correct.'
                      : 'wrong.'
                  }`
                : 'Guess before revealing.'}
            </p>
          ) : null}
        </>
      }
    >
      <Legend
        items={[
          { label: 'H1: anemic (m₁ = 42)', swatchClass: 'stroke-h1' },
          { label: 'H0: healthy (m₀ = 58)', swatchClass: 'stroke-h0' },
          { label: 'threshold γ', swatchClass: 'stroke-threshold', dash: true },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Densities of the sample mean under both hypotheses with a movable threshold"
        onDragPoint={(x) => {
          const v = X_MIN + ((x - 10) / (W - 20)) * (X_MAX - X_MIN)
          setThreshold(Math.min(X_MAX - 5, Math.max(X_MIN + 5, v)))
        }}
      >
        <line
          x1={10}
          y1={H - 34}
          x2={W - 10}
          y2={H - 34}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <path
          d={areaPath(M0, X_MIN, threshold)}
          className="fill-false-alarm"
          opacity={0.28}
        />
        <path
          d={areaPath(M1, threshold, X_MAX)}
          className="fill-h1"
          opacity={0.18}
        />
        <path
          d={densityPath(M0)}
          fill="none"
          className="stroke-h0"
          strokeWidth={2}
        />
        <path
          d={densityPath(M1)}
          fill="none"
          className="stroke-h1"
          strokeWidth={2}
        />
        <line
          x1={xOf(threshold)}
          y1={12}
          x2={xOf(threshold)}
          y2={H - 30}
          className="stroke-threshold"
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        <text
          x={xOf(threshold) - 6}
          y={22}
          textAnchor="end"
          className="fill-h1 font-mono text-[10px]"
        >
          ← decide H1
        </text>
        <text
          x={xOf(threshold) + 6}
          y={22}
          className="fill-h0 font-mono text-[10px]"
        >
          decide H0 →
        </text>
        {draw !== null ? (
          <g>
            <line
              x1={xOf(draw.mean)}
              y1={H - 52}
              x2={xOf(draw.mean)}
              y2={H - 34}
              className="stroke-truth"
              strokeWidth={2}
            />
            <circle
              cx={xOf(draw.mean)}
              cy={H - 34}
              r={4.5}
              className="fill-truth stroke-card"
              strokeWidth={1.5}
            />
          </g>
        ) : null}
        <text
          x={W / 2}
          y={H - 10}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10px]"
        >
          sample mean of ferritin (drag to move γ)
        </text>
        <text
          x={xOf(M1)}
          y={yOf(normalPdf(M1, M1, sd)) - 8}
          textAnchor="middle"
          className="fill-h1 font-mono text-[11px]"
        >
          H1
        </text>
        <text
          x={xOf(M0)}
          y={yOf(normalPdf(M0, M0, sd)) - 8}
          textAnchor="middle"
          className="fill-h0 font-mono text-[11px]"
        >
          H0
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        The red area is the false-alarm probability being manufactured; both
        error probabilities are computed from N(m, σ²/N), never faked.
      </p>
    </FigureShell>
  )
}

export { TwoWorldsFigure }
