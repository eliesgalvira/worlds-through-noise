import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
} from '@/components/figures/shared.tsx'
import {
  formatNumber,
  formatPercentValue,
} from '@/components/figures/figure-utils.ts'
import { binomialPmf } from '@/domain/math/kernel.ts'
import { useState } from 'react'

const COPIES = 5
const W = 470
const H = 230

function BitVoteFigure() {
  const [epsilonPct, setEpsilonPct] = useState(20)
  const [priorPct, setPriorPct] = useState(50)
  const [costRatio, setCostRatio] = useState(1)

  const epsilon = epsilonPct / 100
  const p1 = priorPct / 100
  const p0 = 1 - p1

  // Pr(k ones | bit): binomial with success prob ε (bit 0) or 1−ε (bit 1).
  const pmf0 = Array.from({ length: COPIES + 1 }, (_, k) =>
    binomialPmf(COPIES, k, epsilon),
  )
  const pmf1 = Array.from({ length: COPIES + 1 }, (_, k) =>
    binomialPmf(COPIES, k, 1 - epsilon),
  )

  // Decide 1 when costRatio · P1 · Pr(k|1) > P0 · Pr(k|0).
  const decideOne = pmf0.map((q, k) => costRatio * p1 * (pmf1[k] ?? 0) > p0 * q)
  const pFalseOne = pmf0.reduce(
    (acc, q, k) => acc + ((decideOne[k] ?? false) ? q : 0),
    0,
  )
  const pMissOne = pmf1.reduce(
    (acc, q, k) => acc + (!(decideOne[k] ?? false) ? q : 0),
    0,
  )
  const pError = p0 * pFalseOne + p1 * pMissOne
  // Bayes risk in units of the cost of a false one (C10 = 1, C01 = ratio),
  // against plain majority vote, which ignores priors and costs.
  const risk = p0 * pFalseOne + costRatio * p1 * pMissOne
  const majority = Math.ceil((COPIES + 1) / 2)
  const tail = (pmf: ReadonlyArray<number>, from: number) =>
    pmf.reduce((acc, q, k) => acc + (k >= from ? q : 0), 0)
  const majorityRisk =
    p0 * tail(pmf0, majority) + costRatio * p1 * (1 - tail(pmf1, majority))

  const maxPmf = Math.max(...pmf0, ...pmf1, 1e-9)
  const slot = (W - 40) / (COPIES + 1)
  const xOf = (k: number) => 20 + k * slot + slot / 2
  const barH = (p: number) => (p / maxPmf) * (H - 70)

  return (
    <FigureShell
      title="MAP and minimum-risk decisions on a repeated bit"
      instruction="A bit is stored five times and each copy flips with probability $\varepsilon$. The bars are the exact distribution of the number of ones $k$ under each stored bit, and the shaded region is where the rule decides bit = 1. Change the prior of a one or the cost of missing it and watch the boundary move."
      controls={
        <>
          <SliderControl
            label="Flip probability"
            variable="ε"
            value={epsilonPct}
            min={2}
            max={45}
            step={1}
            meaning="How unreliable each stored copy is."
            onValueChange={setEpsilonPct}
            format={(v) => `${v.toFixed(0)}%`}
          />
          <SliderControl
            label="Prior of a one"
            variable="P₁"
            value={priorPct}
            min={2}
            max={98}
            step={1}
            meaning="How often ones are written at all."
            onValueChange={setPriorPct}
            format={(v) => `${v.toFixed(0)}%`}
          />
          <SliderControl
            label="Cost of missing a 1"
            variable="C₀₁/C₁₀"
            value={costRatio}
            min={0.1}
            max={10}
            step={0.1}
            meaning="How much worse a missed one is than a false one."
            onValueChange={setCostRatio}
            format={(v) => `×${v.toFixed(1)}`}
          />
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="$\Pr(\hat{b}{=}1 \mid b{=}0)$"
            value={formatPercentValue(pFalseOne)}
            tone="bad"
          />
          <ReadoutRow
            label="$\Pr(\hat{b}{=}0 \mid b{=}1)$"
            value={formatPercentValue(pMissOne)}
            tone="h1"
          />
          <ReadoutRow
            label="Total error probability"
            value={formatPercentValue(pError)}
          />
          <ReadoutRow
            label="Bayes risk of this rule (a false 1 costs 1)"
            value={formatNumber(risk, 3)}
            tone="good"
          />
          <ReadoutRow
            label="Bayes risk of majority vote"
            value={formatNumber(majorityRisk, 3)}
          />
          <ReadoutNote>
            <MathText text="With $P_1 = 0.5$ and equal costs the boundary sits at majority vote, $k \geq 3$." />
          </ReadoutNote>
        </>
      }
    >
      <Legend
        items={[
          { label: 'count of ones if bit = 0', swatchClass: 'stroke-h0' },
          { label: 'count of ones if bit = 1', swatchClass: 'stroke-h1' },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Binomial distributions of the count of ones under each stored bit with the decision region shaded"
      >
        {Array.from({ length: COPIES + 1 }, (_, k) => (
          <g key={k}>
            {(decideOne[k] ?? false) ? (
              <rect
                x={20 + k * slot}
                y={12}
                width={slot}
                height={H - 44}
                className="fill-foreground"
                opacity={0.06}
              />
            ) : null}
            <rect
              x={xOf(k) - 14}
              y={H - 32 - barH(pmf0[k] ?? 0)}
              width={12}
              height={barH(pmf0[k] ?? 0)}
              className={
                (decideOne[k] ?? false)
                  ? 'fill-h0 stroke-false-alarm'
                  : 'fill-h0'
              }
              strokeWidth={(decideOne[k] ?? false) ? 2.5 : 0}
              opacity={0.85}
            />
            <rect
              x={xOf(k) + 2}
              y={H - 32 - barH(pmf1[k] ?? 0)}
              width={12}
              height={barH(pmf1[k] ?? 0)}
              className={
                (decideOne[k] ?? false) ? 'fill-h1' : 'fill-h1 stroke-h1-ink'
              }
              strokeWidth={(decideOne[k] ?? false) ? 0 : 2.5}
              opacity={0.85}
            />
            <text
              x={xOf(k)}
              y={H - 16}
              textAnchor="middle"
              className="fill-muted-foreground font-mono plot-text-sm"
            >
              k={k}
            </text>
            <text
              x={xOf(k)}
              y={26}
              textAnchor="middle"
              className={
                (decideOne[k] ?? false)
                  ? 'fill-h1-ink font-mono plot-text-xs'
                  : 'fill-h0 font-mono plot-text-xs'
              }
            >
              {(decideOne[k] ?? false) ? '→1' : '→0'}
            </text>
          </g>
        ))}
        <line
          x1={16}
          y1={H - 32}
          x2={W - 16}
          y2={H - 32}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="Outlined bars are errors. $\Pr(\hat{b}{=}1 \mid b{=}0)$ adds the red-outlined blue bars inside the shaded region, and $\Pr(\hat{b}{=}0 \mid b{=}1)$ the outlined amber bars outside it. The minimum-risk rule is the shading with the lowest Bayes risk." />
      </p>
    </FigureShell>
  )
}

export { BitVoteFigure }
