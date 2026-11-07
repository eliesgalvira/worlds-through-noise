import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { MathText } from '@/components/MathText.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  AxisTicks,
  AxisTicksY,
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
  Sym,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import { populationStd } from '@/domain/math/estimation.ts'
import { gaussianVector, makeRng } from '@/domain/math/kernel.ts'

const TRUTH = 1
const W = 640
/** Left margin for the vertical-axis numbers, clear of the curve. */
const LEFT = 40
/** Hypothetical re-runs whose peaks fill the wobble strip. */
const RERUNS = 40
const H = 414
/** Bottom of the curve area, where the θ axis runs. */
const AXIS_Y = 214
const T_MIN = -1.5
const T_MAX = 3.5
/** Centre line of the score strip, and the score that fills half its height. */
const SCORE_Y = AXIS_Y + 86
const SCORE_MAX = 20
/** Half height of the score strip. */
const SCORE_HALF = 26

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
  // Score of the Gaussian mean, (N/σ²)(x̄ − θ): a straight line whose slope
  // is minus the Fisher information. Drawn only where it fits the strip.
  const information = n / (sigma * sigma)
  const scoreReach = SCORE_MAX / information
  const scoreFrom = Math.max(sampleMean - scoreReach, T_MIN)
  const scoreTo = Math.min(sampleMean + scoreReach, T_MAX)
  const scoreY = (theta: number) =>
    SCORE_Y - ((information * (sampleMean - theta)) / SCORE_MAX) * SCORE_HALF
  const beyondAxis = sample.filter((x) => x < T_MIN || x > T_MAX).length

  // Wobble strip: peak positions over RERUNS independent hypothetical samples.
  const peaks = useMemo(() => {
    const rng = makeRng(seed + 5000)
    const out: Array<number> = []
    for (let k = 0; k < RERUNS; k += 1) {
      const draws = gaussianVector(rng, n)
      out.push(TRUTH + (sigma * draws.reduce((a, b) => a + b, 0)) / n)
    }
    return out
  }, [n, sigma, seed])

  const peaksBeyond = peaks.filter((p) => p < T_MIN || p > T_MAX).length
  const peakStd = populationStd(peaks)

  const xOf = (theta: number) =>
    LEFT + ((theta - T_MIN) / (T_MAX - T_MIN)) * (W - LEFT - 10)
  // The CRB label sits right of its bar unless that runs off the plot.
  const crbLabelLeft = xOf(sampleMean + crbStd) + 130 > W - 10
  const yOf = (ll: number) => 36 + (Math.max(ll, floor) / floor) * (AXIS_Y - 40)

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
      instruction="The curve is the log-likelihood of every candidate $\theta$, computed from the actual samples (dots). Its peak is $\hat{\theta}_{ML}$. Its sharpness is Fisher information. Draw fresh samples and watch the peak wobble about as much as the flatness allows — then raise $N$."
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
            label="Noise std (per sample)"
            variable="σ"
            value={sigma}
            min={0.4}
            max={2.5}
            step={0.05}
            meaning="Weaker arguments per sample: the landscape flattens."
            onValueChange={setSigma}
            format={(v) => `σ = ${v.toFixed(2)}`}
          />
          <Button
            type="button"
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
            label="CRB std $\sigma_{CR} = \sigma/\sqrt{N}$ (theory)"
            value={formatNumber(crbStd, 3)}
          />
          <ReadoutRow
            label={`Measured $\\sigma_{\\hat{\\theta}}$ (std of ${String(RERUNS)} peaks)`}
            value={formatNumber(peakStd, 3)}
          />
          <ReadoutRow
            label="Score slope $-I(\theta)$"
            value={formatNumber(-information, 1)}
          />
          <ReadoutNote>
            <MathText text="The measured wobble tracks the theoretical floor because this estimator is efficient: its score factors as $I(\theta)(\bar{x} - \theta)$, with a slope $-N/\sigma^2$ that does not depend on the data." />
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
            label: 'peak $\\hat{\\theta}_{ML}$',
            swatchClass: 'fill-estimate',
            mark: 'dot',
          },
          {
            label: '$\\hat{\\theta}_{ML} \\pm \\sigma_{CR}$',
            swatchClass: 'stroke-estimate/55',
          },
          {
            label: 'samples',
            swatchClass: 'fill-muted-foreground',
            mark: 'dot',
          },
          { label: 'true $\\theta$', swatchClass: 'stroke-truth', dash: true },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Log-likelihood landscape with its score, CRB width and peak wobble strip"
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
          x={xOf(TRUTH)}
          y={AXIS_Y + 28}
          textAnchor="middle"
          className="fill-truth font-mono plot-text-xs"
        >
          θ = {TRUTH}
        </text>
        <g className="fill-muted-foreground stroke-muted-foreground">
          <text x={12} y={16} stroke="none" className="font-mono plot-text-xs">
            ln f − peak
          </text>
          <AxisTicksY
            x={LEFT}
            ticks={[0, -5, -10].map((tick) => ({
              y: yOf(tick),
              label: tick === 0 ? '0' : `−${String(-tick)}`,
            }))}
          />
        </g>
        <path
          d={curvePath}
          fill="none"
          className="stroke-foreground"
          strokeWidth={2}
        />
        <line
          x1={xOf(sampleMean - crbStd)}
          y1={yOf(0) - 10}
          x2={xOf(sampleMean + crbStd)}
          y2={yOf(0) - 10}
          className="stroke-estimate/55"
          strokeWidth={4}
        />
        <text
          x={
            crbLabelLeft
              ? xOf(sampleMean - crbStd) - 5
              : xOf(sampleMean + crbStd) + 5
          }
          y={yOf(0) - 7}
          textAnchor={crbLabelLeft ? 'end' : 'start'}
          className="plot-halo fill-estimate font-mono plot-text-xs"
        >
          ±<Sym base="σ" sub="CR" /> = {formatNumber(crbStd, 3)}
        </text>
        <circle
          cx={xOf(sampleMean)}
          cy={yOf(0)}
          r={4}
          className="fill-estimate stroke-card"
          strokeWidth={1.5}
        />
        <line
          x1={LEFT}
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
        <text
          x={12}
          y={AXIS_Y + 46}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          score ∂ln f/∂θ, zero at the peak
        </text>
        <text
          x={LEFT - 6}
          y={SCORE_Y + 3}
          textAnchor="end"
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          0
        </text>
        <line
          x1={LEFT}
          y1={SCORE_Y}
          x2={W - 10}
          y2={SCORE_Y}
          className="stroke-border"
          strokeWidth={1}
        />
        <line
          x1={xOf(scoreFrom)}
          y1={scoreY(scoreFrom)}
          x2={xOf(scoreTo)}
          y2={scoreY(scoreTo)}
          className="stroke-foreground"
          strokeWidth={1.6}
        />
        <circle
          cx={xOf(sampleMean)}
          cy={SCORE_Y}
          r={3}
          className="fill-estimate"
        />
        <text
          x={W - 10}
          y={SCORE_Y - 20}
          textAnchor="end"
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          slope −I(θ) = {formatNumber(-information, 1)}
        </text>
        <text
          x={12}
          y={AXIS_Y + 128}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          samples
          {beyondAxis > 0 ? `, ${String(beyondAxis)} beyond the axis` : ''}
        </text>
        {sample
          .filter((x) => x >= T_MIN && x <= T_MAX)
          .map((x, i) => (
            <circle
              key={i}
              cx={xOf(x)}
              cy={AXIS_Y + 142}
              r={2.4}
              className="fill-muted-foreground"
              opacity={0.7}
            />
          ))}
        <text
          x={12}
          y={AXIS_Y + 168}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          {RERUNS} re-run peaks: std {formatNumber(peakStd, 3)}
          {peaksBeyond > 0 ? `, ${String(peaksBeyond)} beyond the axis` : ''}
        </text>
        {/* Hollow bracket around the truth, unlike the filled bar around the
            peak above: the CRB predicts where the re-run peaks land. */}
        <path
          d={`M ${xOf(TRUTH - crbStd)} ${AXIS_Y + 173} v 14 M ${xOf(TRUTH - crbStd)} ${AXIS_Y + 187} H ${xOf(TRUTH + crbStd)} M ${xOf(TRUTH + crbStd)} ${AXIS_Y + 173} v 14`}
          className="stroke-estimate"
          strokeWidth={1.4}
          fill="none"
        />
        <text
          x={xOf(TRUTH + crbStd) + 6}
          y={AXIS_Y + 172}
          className="plot-halo fill-estimate font-mono plot-text-xs"
        >
          θ ±<Sym base="σ" sub="CR" />
        </text>
        {peaks
          .filter((p) => p >= T_MIN && p <= T_MAX)
          .map((p, i) => (
            <circle
              key={i}
              cx={xOf(p)}
              cy={AXIS_Y + 180}
              r={2.4}
              className="fill-estimate"
              opacity={0.6}
            />
          ))}
      </Plot>
    </FigureShell>
  )
}

export { CurvatureFigure }
