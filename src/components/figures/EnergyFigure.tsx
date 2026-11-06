import { useMemo, useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
  AxisTicks,
} from '@/components/figures/shared.tsx'
import { formatPercentValue } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import {
  chi2Pdf,
  chi2Tail,
  chi2TailInv,
  qFunc,
  qInv,
} from '@/domain/math/kernel.ts'

const W = 470
const H = 280
/** Average power axis, in units of σ_w². */
const X_MAX = 4

function EnergyFigure() {
  const [samples, setSamples] = useState(10)
  const [snrPct, setSnrPct] = useState(60)
  const [alphaPct, setAlphaPct] = useState(10)

  // Real samples, as in the June 2026 final this module follows.
  const dof = samples
  const snr = snrPct / 100
  const alpha = alphaPct / 100

  // y/σ² is χ²_N under H0 and (1+SNR)·χ²_N under H1. The plot shows the
  // average power y/N in units of σ_w², on a fixed axis.
  const gamma = chi2TailInv(alpha, dof)
  const pdJailer = chi2Tail(gamma / (1 + snr), dof)
  // The intended receiver knows the waveform: deflection √(N·P/σ²).
  const pdReceiver = qFunc(qInv(alpha) - Math.sqrt(samples * snr))

  const xs = useMemo(() => linspace(0.005, X_MAX, 320), [])
  const h0Density = (p: number) => dof * chi2Pdf(dof * p, dof)
  const h1Density = (p: number) =>
    (dof * chi2Pdf((dof * p) / (1 + snr), dof)) / (1 + snr)
  const peak = Math.max(...xs.map(h0Density), ...xs.map(h1Density), 1e-9)
  const xOf = (p: number) => 10 + (Math.min(p, X_MAX) / X_MAX) * (W - 20)
  const yOf = (d: number) => H - 40 - (d / peak) * (H - 66)

  const pathOf = (density: (p: number) => number) =>
    xs
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(p).toFixed(1)} ${yOf(density(p)).toFixed(1)}`,
      )
      .join(' ')
  const h0Path = pathOf(h0Density)
  const h1Path = pathOf(h1Density)
  const threshold = gamma / dof

  // Two centre labels that would overlap split to either side of the gap.
  const centersClose = xOf(1 + snr) - xOf(1) < 90
  return (
    <FigureShell
      title="Energy detector: the waveform is unknown"
      instruction="The detector does not know the waveform, so it measures the average power $y/N$. The curves are its exact $\chi^2$ densities under each hypothesis. Raise $N$: the centers stay at $\sigma^2$ and $\sigma^2 + P$ while the widths shrink like $1/\sqrt{N}$. Compare the jailer’s $P_D$ with that of the receiver, who knows the waveform."
      controls={
        <>
          <SliderControl
            label="Observation length"
            variable="N"
            value={samples}
            min={2}
            max={150}
            step={1}
            meaning="Real samples of the suspected transmission."
            onValueChange={setSamples}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <SliderControl
            label="Signal-to-noise ratio"
            variable="P/σ²"
            value={snrPct}
            min={2}
            max={200}
            step={1}
            meaning="How loud the covert transmission is."
            onValueChange={setSnrPct}
            format={(v) => `${(v / 100).toFixed(2)}`}
          />
          <SliderControl
            label="False-alarm budget"
            variable="α"
            value={alphaPct}
            min={1}
            max={30}
            step={0.5}
            meaning="The jailer’s false-alarm probability."
            onValueChange={setAlphaPct}
            format={(v) => `${v.toFixed(1)}%`}
          />
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Jailer's $P_D$ (energy detector)"
            value={`${formatPercentValue(pdJailer)}${pdJailer - alpha < 0.02 ? ' ≈ α' : ''}`}
            tone="h1"
          />
          <ReadoutRow
            label="Receiver's $P_D$ (knows waveform)"
            value={formatPercentValue(pdReceiver)}
            tone="good"
          />
          <ReadoutRow
            label="$P_{FA}$ (both)"
            value={formatPercentValue(alpha)}
          />
          <ReadoutNote>
            <MathText text="When the jailer's $P_D \approx \alpha$, the transmission is statistically invisible. The energy detector notices powers only down to $P \propto 1/\sqrt{N}$, while the receiver that knows the waveform detects it down to $P \propto 1/N$." />
          </ReadoutNote>
        </>
      }
    >
      <Legend
        items={[
          {
            label: '$\\mathcal{H}_0$: noise power only',
            swatchClass: 'stroke-h0',
          },
          {
            label: '$\\mathcal{H}_1$: noise + covert signal',
            swatchClass: 'stroke-h1',
          },
          {
            label: 'threshold (spends $\\alpha$)',
            swatchClass: 'stroke-threshold',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Chi-squared densities of measured energy under both hypotheses"
      >
        <line
          x1={10}
          y1={H - 40}
          x2={W - 10}
          y2={H - 40}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <path d={h0Path} fill="none" className="stroke-h0" strokeWidth={2} />
        <path d={h1Path} fill="none" className="stroke-h1" strokeWidth={2} />
        <line
          x1={xOf(threshold)}
          y1={14}
          x2={xOf(threshold)}
          y2={H - 36}
          className="stroke-threshold"
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        <AxisTicks
          y={H - 40}
          ticks={[0, 2, 3, 4].map((v) => ({ x: xOf(v), label: String(v) }))}
        />
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          average power y/N, in units of σ²
        </text>
        <text
          x={xOf(1) - (centersClose ? 3 : 0)}
          y={H - 46}
          textAnchor={centersClose ? 'end' : 'middle'}
          className="fill-h0 font-mono plot-text-sm"
        >
          σ²
        </text>
        <text
          x={xOf(1 + snr) + (centersClose ? 3 : 0)}
          y={H - 46}
          textAnchor={centersClose ? 'start' : 'middle'}
          className="fill-h1-ink font-mono plot-text-sm"
        >
          σ²+P
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="Densities and tails are exact $\chi^2_N$ computations. At $N = 2$ they are exponentials, and $P_D = P_{FA}^{\sigma_0^2/\sigma_1^2}$ exactly, with $\sigma_0^2 = \sigma_w^2$ and $\sigma_1^2 = \sigma_w^2 + P$." />
      </p>
    </FigureShell>
  )
}

export { EnergyFigure }
