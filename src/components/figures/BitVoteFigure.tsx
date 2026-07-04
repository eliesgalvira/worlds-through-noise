import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatPercentValue } from '@/components/figures/figure-utils.ts'
import { binomialPmf } from '@/domain/math/kernel.ts'
import { useState } from 'react'

const COPIES = 5
const W = 470
const H = 280

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

  const maxPmf = Math.max(...pmf0, ...pmf1, 1e-9)
  const slot = (W - 40) / (COPIES + 1)
  const xOf = (k: number) => 20 + k * slot + slot / 2
  const barH = (p: number) => (p / maxPmf) * (H - 70)

  return (
    <FigureShell
      title="Count the ones — then let the prior lean on the count"
      instruction="A bit is written five times; each copy flips with probability ε. The bars show the exactly computed distribution of the count of ones under each stored bit. The tinted region is where the rule says “bit = 1.” Now make ones rare, or make missing them expensive, and watch the boundary walk."
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
            variable="P(1)"
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
            label="Pr(decide 1 | bit was 0)"
            value={formatPercentValue(pFalseOne)}
            tone="bad"
          />
          <ReadoutRow
            label="Pr(decide 0 | bit was 1)"
            value={formatPercentValue(pMissOne)}
            tone="h1"
          />
          <ReadoutRow
            label="Total error probability"
            value={formatPercentValue(pError)}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            With P(1) = 50% and equal costs the boundary sits at majority vote —
            check it, then break it.
          </p>
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
                className="fill-h1"
                opacity={0.09}
              />
            ) : null}
            <rect
              x={xOf(k) - 14}
              y={H - 32 - barH(pmf0[k] ?? 0)}
              width={12}
              height={barH(pmf0[k] ?? 0)}
              className="fill-h0"
              opacity={0.85}
            />
            <rect
              x={xOf(k) + 2}
              y={H - 32 - barH(pmf1[k] ?? 0)}
              width={12}
              height={barH(pmf1[k] ?? 0)}
              className="fill-h1"
              opacity={0.85}
            />
            <text
              x={xOf(k)}
              y={H - 16}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              k={k}
            </text>
            <text
              x={xOf(k)}
              y={26}
              textAnchor="middle"
              className={
                (decideOne[k] ?? false)
                  ? 'fill-h1 font-mono text-[9px]'
                  : 'fill-h0 font-mono text-[9px]'
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
        Error probabilities are exact binomial sums over the shaded region — the
        minimum-risk rule is whichever shading you can’t improve.
      </p>
    </FigureShell>
  )
}

export { BitVoteFigure }
