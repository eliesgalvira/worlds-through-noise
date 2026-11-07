import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  AxisTicks,
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import { gaussianVector, makeRng } from '@/domain/math/kernel.ts'

const TRUTH = 1
const W = 470
const H = 320
/** Bottom of the curve area, where the θ axis runs. */
const AXIS_Y = 214
const T_MIN = -1.5
const T_MAX = 3.5

function CurvatureFigure() {
  const [n, setN] = useState(5)
  const [sigma, setSigma] = useState(1)
  const [seed, setSeed] = useState(21)

  const sample = useMemo(() => {
    const rng = makeRng(seed)
    return gaussianVector(rng, n).map((g) => TRUTH + sigma * g)
  }, [n, sigma, seed])

  const sampleMean = sample.reduce((a, b) => a + b, 0) / sample.length

  // Log-likelihood of θ for the actual sample (up to a constant):
  const logLik = (theta: number) =>
    -sample.reduce((acc, x) => acc + (x - theta) * (x - theta), 0) /
    (2 * sigma * sigma)

  const grid = useMemo(() => linspace(T_MIN, T_MAX, 220), [])
  const maxLl = logLik(sampleMean)
  const values = grid.map((theta) => logLik(theta) - maxLl)
  const floor = -14

  const crbStd = sigma / Math.sqrt(n)

  // Wobble strip: peak positions over 40 independent hypothetical samples.
  const peaks = useMemo(() => {
    const rng = makeRng(seed + 5000)
    const out: Array<number> = []
    for (let k = 0; k < 40; k += 1) {
      const draws = gaussianVector(rng, n)
      out.push(TRUTH + (sigma * draws.reduce((a, b) => a + b, 0)) / n)
    }
    return out
  }, [n, sigma, seed])

  const xOf = (theta: number) =>
    10 + ((theta - T_MIN) / (T_MAX - T_MIN)) * (W - 20)
  const yOf = (ll: number) => 30 + (Math.max(ll, floor) / floor) * (AXIS_Y - 34)

  // The parabola leaves the frame below the floor: stop the stroke there
  // instead of drawing a flat line along the bottom edge.
  const curvePath = grid
    .flatMap((theta, i) => {
      const value = values[i] ?? floor
      if (value < floor) {
        return []
      }
      const inside = (values[i - 1] ?? floor - 1) >= floor
      return [
        `${inside ? 'L' : 'M'} ${xOf(theta).toFixed(1)} ${yOf(value).toFixed(1)}`,
      ]
    })
    .join(' ')

  return (
    <FigureShell
      title="Watch the landscape sharpen — information is curvature"
      instruction="The curve is the log-likelihood of every candidate $\theta$, computed from the actual samples (dots). Its peak is $\hat{\theta}_{ML}$; its sharpness is Fisher information. Draw fresh samples and watch the peak wobble exactly as much as the flatness allows — then raise $N$."
      controls={
        <>
          <SliderControl
            label="Sample size"
            variable="N"
            value={n}
            min={1}
            max={100}
            step={1}
            meaning="Each sample multiplies another factor into the likelihood."
            onValueChange={setN}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <SliderControl
            label="Noise level"
            variable="σ"
            value={sigma}
            min={0.4}
            max={2.5}
            step={0.05}
            meaning="Weaker arguments per sample: the landscape flattens."
            onValueChange={setSigma}
            format={(v) => v.toFixed(2)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed((s) => s + 1)
            }}
          >
            Draw a fresh sample
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Peak $\hat{\theta}_{ML}$ (sample mean)"
            value={formatNumber(sampleMean, 3)}
            tone="estimate"
          />
          <ReadoutRow
            label="CRB std $\sigma/\sqrt{N}$"
            value={formatNumber(crbStd, 3)}
          />
          <ReadoutRow
            label="Std of the 40 peaks below"
            value={formatNumber(
              Math.sqrt(
                peaks.reduce((a, p) => {
                  const m = peaks.reduce((x, y) => x + y, 0) / peaks.length
                  return a + (p - m) * (p - m)
                }, 0) / peaks.length,
              ),
              3,
            )}
          />
          <ReadoutNote>
            The measured wobble tracks the theoretical floor because this
            estimator is efficient: its score is a straight line through the
            peak.
          </ReadoutNote>
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'log-likelihood of $\\theta$ (this sample)',
            swatchClass: 'stroke-foreground',
          },
          {
            label: 'peak $\\hat{\\theta}_{ML}$ and its CRB width',
            swatchClass: 'stroke-estimate',
          },
          { label: 'true $\\theta$', swatchClass: 'stroke-truth', dash: true },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Log-likelihood landscape with CRB width and peak wobble strip"
      >
        <line
          x1={xOf(TRUTH)}
          y1={24}
          x2={xOf(TRUTH)}
          y2={AXIS_Y}
          className="stroke-truth"
          strokeWidth={1.4}
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <text
          x={xOf(TRUTH) + 4}
          y={20}
          className="fill-truth font-mono plot-text-xs"
        >
          true θ = {TRUTH}
        </text>
        <text
          x={12}
          y={20}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          ln f(x;θ), peak at 0
        </text>
        <path
          d={curvePath}
          fill="none"
          className="stroke-foreground"
          strokeWidth={2}
        />
        <line
          x1={xOf(sampleMean - crbStd)}
          y1={yOf(-0.5)}
          x2={xOf(sampleMean + crbStd)}
          y2={yOf(-0.5)}
          className="stroke-estimate"
          strokeWidth={4}
          opacity={0.55}
        />
        <circle
          cx={xOf(sampleMean)}
          cy={yOf(0)}
          r={4}
          className="fill-estimate stroke-card"
          strokeWidth={1.5}
        />
        {sample.slice(0, 60).map((x, i) => (
          <circle
            key={i}
            cx={xOf(Math.min(Math.max(x, T_MIN), T_MAX))}
            cy={AXIS_Y + 52}
            r={2.4}
            className="fill-truth"
            opacity={0.55}
          />
        ))}
        <line
          x1={10}
          y1={AXIS_Y}
          x2={W - 10}
          y2={AXIS_Y}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <AxisTicks
          y={AXIS_Y}
          ticks={[-1, 0, 1, 2, 3].map((t) => ({
            x: xOf(t),
            label: t.toString(),
          }))}
        />
        <text
          x={W - 10}
          y={AXIS_Y + 28}
          textAnchor="end"
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          candidate θ
        </text>
        {peaks.map((p, i) => (
          <circle
            key={i}
            cx={xOf(Math.min(Math.max(p, T_MIN), T_MAX))}
            cy={AXIS_Y + 94}
            r={2.4}
            className="fill-estimate"
            opacity={0.6}
          />
        ))}
        <text
          x={12}
          y={AXIS_Y + 42}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          samples
        </text>
        <text
          x={12}
          y={AXIS_Y + 84}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          peak positions over 40 re-runs
        </text>
      </Plot>
    </FigureShell>
  )
}

export { CurvatureFigure }
