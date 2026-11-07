import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  AxisTicks,
  Sym,
} from '@/components/figures/shared.tsx'
import {
  formatNumber,
  formatPercentValue,
} from '@/components/figures/figure-utils.ts'
import { linspace, normalCdf, normalPdf } from '@/domain/math/distributions.ts'
import { gaussianVector, makeRng } from '@/domain/math/kernel.ts'

const W = 470
const H = 260
const X_MIN = 12
const X_MAX = 88
const GAMMA_MIN = 25
const GAMMA_MAX = 75
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

  // The decision labels sit on either side of the threshold. Near an edge,
  // the one without room drops to a second row on the other side, its arrow
  // still pointing at its region.
  const leftRoom = xOf(threshold) > 100
  const rightRoom = xOf(threshold) < W - 100
  // Each hypothesis is named on the outer foot of its own curve, clear of the
  // threshold row at the top and of the other curve.
  const footOf = (mean: number, side: number) =>
    Math.min(X_MAX - 3, Math.max(X_MIN + 3, mean + side * 2 * sd))

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
      title="Two Gaussian hypotheses, one threshold on the sample mean"
      instruction="Under $\mathcal{H}_1$ (anemia) the sample mean of ferritin is centered at $m_1 = 42$, below the healthy $m_0 = 58$, so the detector decides $\mathcal{H}_1$ below $\gamma$. One measurement has standard deviation $\sigma = 11$. Draw a patient and judge it, then raise $N$: both densities narrow as $\sigma/\sqrt{N}$ and both error areas shrink."
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
            min={GAMMA_MIN}
            max={GAMMA_MAX}
            step={0.5}
            meaning="Below $\gamma$ you declare anemia."
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
              Show the true diagnosis
            </Button>
          </div>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="$P_{FA}$ (healthy called anemic)"
            value={formatPercentValue(pFalseAlarm)}
            tone="bad"
          />
          <ReadoutRow
            label="$P_D$ (anemia caught)"
            value={formatPercentValue(pDetection)}
            tone="good"
          />
          <ReadoutRow
            label="$P_M = 1 - P_D$"
            value={formatPercentValue(pMiss)}
            tone="h1"
          />
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
          {
            label: '$\\mathcal{H}_1$: anemic ($m_1 = 42$)',
            swatchClass: 'stroke-h1',
          },
          {
            label: '$\\mathcal{H}_0$: healthy ($m_0 = 58$)',
            swatchClass: 'stroke-h0',
          },
          {
            label: 'threshold $\\gamma$',
            swatchClass: 'stroke-threshold',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Densities of the sample mean under both hypotheses with a movable threshold"
        onDragPoint={(x) => {
          const v = X_MIN + ((x - 10) / (W - 20)) * (X_MAX - X_MIN)
          setThreshold(Math.min(GAMMA_MAX, Math.max(GAMMA_MIN, v)))
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
          x={xOf(threshold) + (leftRoom ? -6 : 6)}
          y={leftRoom ? 22 : 38}
          textAnchor={leftRoom ? 'end' : 'start'}
          className="fill-h1-ink font-mono plot-text-sm"
        >
          ← decide H1
        </text>
        <text
          x={xOf(threshold) + (rightRoom ? 6 : -6)}
          y={rightRoom ? 22 : 38}
          textAnchor={rightRoom ? 'start' : 'end'}
          className="fill-h0 font-mono plot-text-sm"
        >
          decide H0 →
        </text>
        <text
          x={xOf(threshold) - 6}
          y={H - 42}
          textAnchor="end"
          className="fill-false-alarm plot-halo font-mono plot-text-sm"
        >
          <Sym base="P" sub="FA" /> {formatPercentValue(pFalseAlarm)}
        </text>
        <text
          x={xOf(threshold) + 6}
          y={H - 42}
          className="fill-h1-ink plot-halo font-mono plot-text-sm"
        >
          <Sym base="P" sub="M" /> {formatPercentValue(pMiss)}
        </text>
        <AxisTicks
          y={H - 34}
          ticks={[20, 30, 42, 50, 58, 70, 80].map((v) => ({
            x: xOf(v),
            label: String(v),
          }))}
        />
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
          y={H - 4}
          textAnchor="middle"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          sample mean of ferritin (drag to move γ)
        </text>
        <text
          x={xOf(footOf(M1, -1)) - 4}
          y={Math.min(yOf(normalPdf(footOf(M1, -1), M1, sd)) - 6, H - 52)}
          textAnchor="end"
          className="fill-h1-ink font-mono plot-text"
        >
          H1
        </text>
        <text
          x={xOf(footOf(M0, +1)) + 4}
          y={Math.min(yOf(normalPdf(footOf(M0, +1), M0, sd)) - 6, H - 52)}
          textAnchor="start"
          className="fill-h0 font-mono plot-text"
        >
          H0
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="Red: healthy patients called anemic, $P_{FA}$. Amber: anemic patients missed, $P_M$. Both are computed from $\mathcal{N}(m, \sigma^2/N)$. Every curve has area 1. The plot rescales its height so both fit." />
      </p>
    </FigureShell>
  )
}

export { TwoWorldsFigure }
