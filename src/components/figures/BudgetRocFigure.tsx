import { useMemo, useState } from 'react'
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
import { linspace, normalPdf } from '@/domain/math/distributions.ts'
import { qFunc, qInv } from '@/domain/math/kernel.ts'

const W = 250
const H = 220

function BudgetRocFigure() {
  const [alphaPct, setAlphaPct] = useState(10)
  const [enrDb, setEnrDb] = useState(6)

  const alpha = alphaPct / 100
  const enr = 10 ** (enrDb / 10)
  const separation = Math.sqrt(enr)
  const gamma = qInv(alpha)
  const pd = qFunc(gamma - separation)

  const xs = useMemo(() => linspace(-4, 8, 180), [])
  const xOf = (v: number) => 10 + ((v + 4) / 12) * (W - 20)
  const peak = normalPdf(0, 0, 1)
  const yOf = (p: number) => H - 30 - (p / peak) * (H - 56)

  const density = (mean: number) =>
    xs
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(normalPdf(v, mean, 1)).toFixed(1)}`,
      )
      .join(' ')
  const tail = (mean: number, from: number) => {
    const grid = linspace(from, 8, 60)
    const inner = grid
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(normalPdf(v, mean, 1)).toFixed(1)}`,
      )
      .join(' ')
    return `${inner} L ${xOf(8).toFixed(1)} ${H - 30} L ${xOf(from).toFixed(1)} ${H - 30} Z`
  }

  const rocPoints = useMemo(() => {
    const thresholds = linspace(-4, 7, 140)
    return thresholds.map((t) => ({ pfa: qFunc(t), pd: qFunc(t - separation) }))
  }, [separation])
  const rocX = (pfa: number) => 26 + pfa * (W - 36)
  const rocY = (p: number) => H - 30 - p * (H - 52)

  return (
    <FigureShell
      title="Spend the budget, read the catch"
      instruction="Pick the false-alarm budget $\alpha$: the dam slides until the spilled $\mathcal{H}_0$ area equals it — that position is $Q^{-1}(\alpha)$. The $\mathcal{H}_1$ area beyond the dam is your detection probability, one point on the ROC. Sweep in your head; the curve is the full menu."
      controls={
        <>
          <SliderControl
            label="False-alarm budget"
            variable="α"
            value={alphaPct}
            min={0.5}
            max={40}
            step={0.5}
            meaning="Fraction of $\mathcal{H}_0$ probability you are licensed to spill."
            onValueChange={setAlphaPct}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <SliderControl
            label="Energy-to-noise ratio"
            variable="ENR"
            value={enrDb}
            min={0}
            max={14}
            step={0.5}
            meaning="$NA^2/\sigma^2$ — grows with more samples or less noise."
            onValueChange={setEnrDb}
            format={(v) => `${v.toFixed(1)} dB`}
          />
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Threshold $\gamma = Q^{-1}(\alpha)$"
            value={formatNumber(gamma, 2)}
          />
          <ReadoutRow
            label="Separation $\sqrt{ENR}$"
            value={formatNumber(separation, 2)}
            tone="h1"
          />
          <ReadoutRow
            label="$P_D = Q(Q^{-1}(\alpha) - \sqrt{ENR})$"
            value={formatPercentValue(pd)}
            tone="good"
          />
        </>
      }
    >
      <Legend
        items={[
          { label: '$\\mathcal{H}_0$ (noise only)', swatchClass: 'stroke-h0' },
          {
            label: '$\\mathcal{H}_1$ (signal present)',
            swatchClass: 'stroke-h1',
          },
          {
            label: 'spilled budget $\\alpha$',
            swatchClass: 'stroke-false-alarm',
          },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <Plot
          viewW={W}
          viewH={H}
          ariaLabel="Test statistic densities with threshold set by the false-alarm budget"
        >
          <line
            x1={10}
            y1={H - 30}
            x2={W - 10}
            y2={H - 30}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
          <path
            d={tail(0, gamma)}
            className="fill-false-alarm"
            opacity={0.35}
          />
          <path
            d={tail(separation, gamma)}
            className="fill-detection"
            opacity={0.22}
          />
          <path
            d={density(0)}
            fill="none"
            className="stroke-h0"
            strokeWidth={1.8}
          />
          <path
            d={density(separation)}
            fill="none"
            className="stroke-h1"
            strokeWidth={1.8}
          />
          <line
            x1={xOf(gamma)}
            y1={12}
            x2={xOf(gamma)}
            y2={H - 26}
            className="stroke-threshold"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <text
            x={W / 2}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            test statistic y (σ_y = 1)
          </text>
        </Plot>
        <Plot
          viewW={W}
          viewH={H}
          ariaLabel="ROC curve with the current operating point"
        >
          <line
            x1={26}
            y1={H - 30}
            x2={W - 10}
            y2={H - 30}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
          <line
            x1={26}
            y1={H - 30}
            x2={26}
            y2={16}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
          <line
            x1={26}
            y1={H - 30}
            x2={W - 10}
            y2={rocY(1)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <path
            d={rocPoints
              .map(
                (p, i) =>
                  `${i === 0 ? 'M' : 'L'} ${rocX(p.pfa).toFixed(1)} ${rocY(p.pd).toFixed(1)}`,
              )
              .join(' ')}
            fill="none"
            className="stroke-h1"
            strokeWidth={2}
          />
          <circle
            cx={rocX(alpha)}
            cy={rocY(pd)}
            r={5}
            className="fill-threshold stroke-card"
            strokeWidth={1.5}
          />
          <text
            x={(W + 16) / 2}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            P_FA →
          </text>
          <text
            x={14}
            y={H / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${H / 2})`}
            className="fill-muted-foreground font-mono text-[10px]"
          >
            P_D →
          </text>
        </Plot>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        The dashed diagonal is a coin-flip detector. No threshold moves you off
        the curve; only ENR bends the curve itself.
      </p>
    </FigureShell>
  )
}

export { BudgetRocFigure }
