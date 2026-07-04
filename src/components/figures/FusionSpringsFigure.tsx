import { useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'

const W = 470
const H = 260
const X_MIN = 30
const X_MAX = 70

const SENSOR_READINGS = [44, 53, 58]
const PRIOR_MEAN = 38

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
  const maxWeight = Math.max(...weights, priorWeight, 1e-9)
  const springWidth = (w: number) => 1 + (w / maxWeight) * 7

  return (
    <FigureShell
      title="Every measurement is a spring; the estimate is the balance point"
      instruction="Three sensors read the same hidden humidity with different noise. Each pulls the estimate toward its reading with stiffness $1/\sigma^2$. Slacken a sensor and watch the balance slide away from it — then switch on the prior: one more spring, anchored at old knowledge."
      controls={
        <>
          {SENSOR_READINGS.map((reading, index) => (
            <SliderControl
              key={reading}
              label={`Sensor ${index + 1} noise (reads ${reading})`}
              variable={`σ${index + 1}`}
              value={sigmas[index] ?? 1}
              min={0.8}
              max={12}
              step={0.1}
              meaning={
                index === 0 ? 'Stiff spring: small $\\sigma$ pulls hard.' : ''
              }
              onValueChange={(v) => {
                setSigmas((prev) => prev.map((s, i) => (i === index ? v : s)))
              }}
              format={(v) => v.toFixed(1)}
            />
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={priorOn}
              onChange={(event) => {
                setPriorOn(event.target.checked)
              }}
            />
            Add the prior spring (μ_θ = {PRIOR_MEAN})
          </label>
          {priorOn ? (
            <SliderControl
              label="Prior confidence"
              variable="σ_θ"
              value={priorSigma}
              min={1}
              max={15}
              step={0.5}
              meaning="Small $\sigma_\theta$: a stubborn prior."
              onValueChange={setPriorSigma}
              format={(v) => v.toFixed(1)}
            />
          ) : null}
        </>
      }
      readout={
        <>
          <ReadoutRow
            label={priorOn ? 'MAP estimate' : 'Fused ML estimate'}
            value={formatNumber(estimate, 2)}
            tone="h1"
          />
          <ReadoutRow
            label="Estimator variance $1/\sum(1/\sigma_i^2)$"
            value={formatNumber(variance, 3)}
            tone="good"
          />
          {priorOn ? (
            <ReadoutRow
              label="Data share $\alpha$ in $\hat{\theta} = \alpha\hat{\theta}_{ML} + (1-\alpha)\mu_\theta$"
              value={formatNumber(alpha, 2)}
            />
          ) : null}
          <p className="text-xs leading-5 text-muted-foreground">
            <MathText text="Break a sensor completely ($\sigma \to 12$) and the fusion quietly ignores it: the defective-pixel exam problem in one gesture." />
          </p>
        </>
      }
    >
      <Legend
        items={[
          { label: 'sensor readings (springs)', swatchClass: 'stroke-h0' },
          { label: 'prior anchor', swatchClass: 'stroke-prior' },
          {
            label: 'balance point $\\hat{\\theta}$',
            swatchClass: 'stroke-threshold',
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
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {tick}
            </text>
          </g>
        ))}
        {SENSOR_READINGS.map((reading, index) => {
          const y = 34 + index * 26
          return (
            <g key={reading}>
              <line
                x1={xOf(reading)}
                y1={y}
                x2={xOf(estimate)}
                y2={H - 62}
                className="stroke-h0"
                strokeWidth={springWidth(weights[index] ?? 0)}
                opacity={0.55}
              />
              <circle
                cx={xOf(reading)}
                cy={y}
                r={5}
                className="fill-h0 stroke-card"
                strokeWidth={1.5}
              />
              <text
                x={xOf(reading) + 9}
                y={y + 4}
                className="fill-h0 font-mono text-[10px]"
              >
                x{index + 1}={reading}
              </text>
            </g>
          )
        })}
        {priorOn ? (
          <g>
            <line
              x1={xOf(PRIOR_MEAN)}
              y1={H - 24}
              x2={xOf(estimate)}
              y2={H - 58}
              className="stroke-prior"
              strokeWidth={springWidth(priorWeight)}
              opacity={0.65}
            />
            <circle
              cx={xOf(PRIOR_MEAN)}
              cy={H - 24}
              r={5}
              className="fill-prior stroke-card"
              strokeWidth={1.5}
            />
            <text
              x={xOf(PRIOR_MEAN) + 9}
              y={H - 20}
              className="fill-prior font-mono text-[10px]"
            >
              μ_θ={PRIOR_MEAN}
            </text>
          </g>
        ) : null}
        {priorOn ? (
          <circle
            cx={xOf(dataOnly)}
            cy={H - 60}
            r={4}
            fill="none"
            className="stroke-h0"
            strokeWidth={1.4}
            strokeDasharray="2 2"
          />
        ) : null}
        <circle
          cx={xOf(estimate)}
          cy={H - 60}
          r={7}
          className="fill-threshold stroke-card"
          strokeWidth={2}
        />
        <text
          x={xOf(estimate)}
          y={H - 72}
          textAnchor="middle"
          className="fill-foreground font-mono text-[11px]"
        >
          θ̂ = {formatNumber(estimate, 1)}
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="Spring thickness is the honest weight $1/\sigma_i^2$. With the prior on, the dashed ring marks where the data alone would balance." />
      </p>
    </FigureShell>
  )
}

export { FusionSpringsFigure }
