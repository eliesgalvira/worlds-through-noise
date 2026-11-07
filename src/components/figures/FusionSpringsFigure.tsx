import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  ControlRow,
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  Sym,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { sampleMean } from '@/domain/math/estimation.ts'

const W = 470
const H = 260
const X_MIN = 30
const X_MAX = 70

const SENSOR_READINGS = [44, 53, 58]
const PRIOR_MEAN = 38
/** Smallest sensor noise the sliders allow, and so the stiffest spring. */
const SIGMA_MIN = 0.8
const MAX_WEIGHT = 1 / (SIGMA_MIN * SIGMA_MIN)
/** Height of the sensor readings above the axis. */
const READING_Y = 40

function FusionSpringsFigure() {
  const [sigmas, setSigmas] = useState<ReadonlyArray<number>>([2, 3.5, 5])
  const [priorOn, setPriorOn] = useState(false)
  const [priorSigma, setPriorSigma] = useState(4)

  const weights = sigmas.map((s) => 1 / (s * s))
  const priorWeight = priorOn ? 1 / (priorSigma * priorSigma) : 0

  const numerator =
    SENSOR_READINGS.reduce((acc, x, i) => acc + x * (weights[i] ?? 0), 0) +
    PRIOR_MEAN * priorWeight
  const totalWeight = weights.reduce((a, b) => a + b, 0) + priorWeight
  const estimate = numerator / totalWeight
  const variance = 1 / totalWeight

  const dataOnly =
    SENSOR_READINGS.reduce((acc, x, i) => acc + x * (weights[i] ?? 0), 0) /
    weights.reduce((a, b) => a + b, 0)
  const alpha =
    weights.reduce((a, b) => a + b, 0) /
    (weights.reduce((a, b) => a + b, 0) + priorWeight)

  const xOf = (v: number) => 10 + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 20)
  // The θ̂ label goes on the side with fewer springs, and left of the
  // data-only ring when the prior is on.
  const readingsMean = sampleMean(SENSOR_READINGS)
  const labelLeft = priorOn || estimate < readingsMean
  // Fixed scale, so a spring only changes when its own σ changes.
  const springWidth = (w: number) => 0.75 + Math.sqrt(w / MAX_WEIGHT) * 9

  return (
    <FigureShell
      title="Every measurement is a spring, and the estimate is their balance point"
      instruction="Three sensors read the same hidden humidity with different noise. Each pulls the estimate toward its reading with stiffness $1/\sigma^2$. Slacken a sensor and watch the balance slide away from it — then switch on the prior: one more spring, anchored at old knowledge."
      controls={
        <>
          {SENSOR_READINGS.map((reading, index) => (
            <SliderControl
              key={reading}
              label={`Sensor ${String(index + 1)} noise (reads ${String(reading)})`}
              variable={`σ${String(index + 1)}`}
              value={sigmas[index] ?? 1}
              min={SIGMA_MIN}
              max={12}
              step={0.1}
              {...(index === 0
                ? { meaning: 'Stiff spring: small $\\sigma$ pulls hard.' }
                : {})}
              onValueChange={(v) => {
                setSigmas((prev) => prev.map((s, i) => (i === index ? v : s)))
              }}
              format={(v) => v.toFixed(1)}
            />
          ))}
          {/* The prior row never moves: its slider stays in place, inert
              while the prior is off. */}
          <ControlRow>
            <Button
              type="button"
              variant={priorOn ? 'secondary' : 'outline'}
              size="sm"
              aria-pressed={priorOn}
              onClick={() => {
                setPriorOn((on) => !on)
              }}
            >
              {priorOn ? 'Prior spring: on' : 'Prior spring: off'}
            </Button>
            <SliderControl
              className="sm:max-w-xs"
              label="Prior spread"
              variable="σθ"
              value={priorSigma}
              min={1}
              max={15}
              step={0.5}
              disabled={!priorOn}
              meaning="Std of the prior. Small $\sigma_\theta$: a stubborn prior."
              onValueChange={setPriorSigma}
              format={(v) => v.toFixed(1)}
            />
          </ControlRow>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label={priorOn ? 'MAP estimate' : 'Fused ML estimate'}
            value={formatNumber(estimate, 2)}
            tone="estimate"
          />
          <ReadoutRow
            label={
              priorOn
                ? 'Posterior variance $\\sigma^2_{\\theta|\\mathbf{x}}$'
                : 'Estimator variance'
            }
            value={formatNumber(variance, 3)}
          />
          <ReadoutRow
            label="Data share $\alpha$"
            value={priorOn ? formatNumber(alpha, 2) : '—'}
          />
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'reading $x_i$',
            swatchClass: 'fill-muted-foreground',
            mark: 'dot',
          },
          { label: 'spring', swatchClass: 'stroke-muted-foreground/60' },
          { label: 'prior anchor', swatchClass: 'fill-prior', mark: 'dot' },
          {
            label: 'balance point $\\hat{\\theta}$',
            swatchClass: 'fill-estimate',
            mark: 'dot',
          },
          {
            label: priorOn
              ? '$\\hat{\\theta}_{MAP} \\pm \\sigma_{\\theta|\\mathbf{x}}$'
              : '$\\hat{\\theta} \\pm$ its standard deviation',
            swatchClass: 'stroke-estimate/40',
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Number line with sensor springs pulling on the estimate"
      >
        <line
          x1={10}
          y1={H - 60}
          x2={W - 10}
          y2={H - 60}
          className="stroke-muted-foreground"
          strokeWidth={1.2}
        />
        {[35, 40, 45, 50, 55, 60, 65].map((tick) => (
          <g key={tick}>
            <line
              x1={xOf(tick)}
              y1={H - 64}
              x2={xOf(tick)}
              y2={H - 56}
              className="stroke-muted-foreground"
              strokeWidth={1}
            />
            <text
              x={xOf(tick)}
              y={H - 44}
              textAnchor="middle"
              className="fill-muted-foreground font-mono plot-text-xs"
            >
              {tick}
            </text>
          </g>
        ))}
        <text
          x={W - 10}
          y={H - 28}
          textAnchor="end"
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          humidity θ
        </text>
        {SENSOR_READINGS.map((reading, index) => {
          const y = READING_Y
          return (
            <g key={reading}>
              <line
                x1={xOf(reading)}
                y1={y}
                x2={xOf(estimate)}
                y2={H - 62}
                className="stroke-muted-foreground"
                strokeWidth={springWidth(weights[index] ?? 0)}
                opacity={0.6}
              />
              <circle
                cx={xOf(reading)}
                cy={y}
                r={5}
                className="fill-muted-foreground stroke-card"
                strokeWidth={1.5}
              />
              <text
                x={xOf(reading)}
                y={y - 10}
                textAnchor="middle"
                className="fill-muted-foreground font-mono plot-text-sm"
              >
                <Sym base="x" sub={String(index + 1)} />={reading}
              </text>
            </g>
          )
        })}
        {priorOn ? (
          <g>
            <line
              x1={xOf(PRIOR_MEAN)}
              y1={H - 14}
              x2={xOf(estimate)}
              y2={H - 58}
              className="stroke-prior"
              strokeWidth={springWidth(priorWeight)}
              opacity={0.65}
            />
            <circle
              cx={xOf(PRIOR_MEAN)}
              cy={H - 14}
              r={5}
              className="fill-prior stroke-card"
              strokeWidth={1.5}
            />
            <text
              x={xOf(PRIOR_MEAN) - 9}
              y={H - 10}
              textAnchor="end"
              className="fill-prior font-mono plot-text-sm"
            >
              <Sym base="μ" sub="θ" /> = {PRIOR_MEAN}
            </text>
          </g>
        ) : null}
        {priorOn ? (
          <g>
            <circle
              cx={xOf(dataOnly)}
              cy={H - 60}
              r={6}
              fill="none"
              className="stroke-estimate"
              strokeWidth={1.6}
              strokeDasharray="3 2"
            />
            <text
              x={xOf(dataOnly)}
              y={H - 22}
              textAnchor="middle"
              className="plot-halo fill-estimate font-mono plot-text-xs"
            >
              data only = {formatNumber(dataOnly, 1)}
            </text>
          </g>
        ) : null}
        <line
          x1={xOf(estimate - Math.sqrt(variance))}
          y1={H - 60}
          x2={xOf(estimate + Math.sqrt(variance))}
          y2={H - 60}
          className="stroke-estimate/40"
          strokeWidth={8}
        />
        <circle
          cx={xOf(estimate)}
          cy={H - 60}
          r={7}
          className="fill-estimate stroke-card"
          strokeWidth={2}
        />
        <text
          x={xOf(estimate) + (labelLeft ? -10 : 10)}
          y={H - 74}
          textAnchor={labelLeft ? 'end' : 'start'}
          className="plot-halo fill-estimate font-mono plot-text"
        >
          {priorOn ? <Sym base="θ̂" sub="MAP" /> : 'θ̂'} ={' '}
          {formatNumber(estimate, 1)}
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText
          text={
            priorOn
              ? 'Thicker spring, larger weight $1/\\sigma^2$, on a fixed scale. The dashed ring is where the sensors alone balance.'
              : 'Thicker spring, larger weight $1/\\sigma_i^2$, on a fixed scale.'
          }
        />
      </p>
    </FigureShell>
  )
}

export { FusionSpringsFigure }
