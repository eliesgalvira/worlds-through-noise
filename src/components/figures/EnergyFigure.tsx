import { useId, useMemo, useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
  AxisTicks,
  Hatch,
  Sym,
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
  const hatchId = `hatch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
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
  const tailOf = (density: (p: number) => number, from: number) => {
    const grid = linspace(Math.min(from, X_MAX), X_MAX, 120)
    const top = grid
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(p).toFixed(1)} ${yOf(density(p)).toFixed(1)}`,
      )
      .join(' ')
    return `${top} L ${xOf(X_MAX).toFixed(1)} ${H - 40} L ${xOf(from).toFixed(1)} ${H - 40} Z`
  }
  const h0Path = pathOf(h0Density)
  const h1Path = pathOf(h1Density)
  const threshold = gamma / dof
  // Mode of the average power under H1: (N − 2)/N in σ² units, times 1 + SNR.
  const h1Mode = (Math.max(dof - 2, 0.2) / dof) * (1 + snr)
  // Labels flip to the left of their mark when the right side has no room
  // or when the power mark sits right next to the threshold.
  const labelLeft = xOf(threshold) > W * 0.55
  const powerLeft =
    xOf(1 + snr) < xOf(threshold) && xOf(threshold) - xOf(1 + snr) < 70

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
            tone="good"
          />
          <ReadoutRow
            label="Receiver's $P_D$ (knows waveform)"
            value={formatPercentValue(pdReceiver)}
          />
          <ReadoutRow
            label="$P_{FA}$ (both)"
            value={formatPercentValue(alpha)}
            tone="bad"
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
        <path
          d={tailOf(h1Density, threshold)}
          className="fill-detection"
          opacity={0.2}
        />
        <Hatch id={hatchId} className="stroke-false-alarm" />
        <path d={tailOf(h0Density, threshold)} fill={`url(#${hatchId})`} />
        <path d={h0Path} fill="none" className="stroke-h0" strokeWidth={2} />
        <text
          x={xOf(threshold) + (labelLeft ? -6 : 6)}
          y={H - 56}
          textAnchor={labelLeft ? 'end' : 'start'}
          className="plot-halo fill-detection font-mono plot-text-sm"
        >
          jailer <Sym base="P" sub="D" />
        </text>
        <text
          x={xOf(threshold) + (labelLeft ? -6 : 6)}
          y={H - 44}
          textAnchor={labelLeft ? 'end' : 'start'}
          className="plot-halo fill-false-alarm font-mono plot-text-sm"
        >
          <Sym base="P" sub="FA" />
        </text>
        <text
          x={xOf(Math.max(dof - 2, 0.2) / dof) + 6}
          y={yOf(h0Density(Math.max(dof - 2, 0.2) / dof)) + 14}
          className="plot-halo fill-h0 font-mono plot-text-sm"
        >
          H0
        </text>
        <text
          x={xOf(h1Mode) + 6}
          y={yOf(h1Density(h1Mode)) + 14}
          className="plot-halo fill-h1-ink font-mono plot-text-sm"
        >
          H1
        </text>

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
          ticks={[0, 1, 2, 3, 4].map((v) => ({ x: xOf(v), label: String(v) }))}
        />
        <text
          x={xOf(threshold) + (labelLeft ? -4 : 4)}
          y={24}
          textAnchor={labelLeft ? 'end' : 'start'}
          className="fill-threshold plot-halo font-mono plot-text-sm"
        >
          <tspan className="font-serif italic">γ</tspan>
          <tspan className="fill-detection">
            , jailer <Sym base="P" sub="D" /> {formatPercentValue(pdJailer)}
          </tspan>
        </text>
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          average power y/N, in units of σ<tspan baselineShift="sub">w</tspan>²
        </text>
        <line
          x1={xOf(1 + snr)}
          y1={H - 40}
          x2={xOf(1 + snr)}
          y2={H - 48}
          className="stroke-h1-ink"
          strokeWidth={1.5}
        />
        <text
          x={xOf(1 + snr) + (powerLeft ? -4 : 4)}
          y={H - 50}
          textAnchor={powerLeft ? 'end' : 'start'}
          className="fill-h1-ink plot-halo font-mono plot-text-sm"
        >
          σ²+P
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="Densities and tails are exact $\chi^2_N$ computations. Both curves share one height scale, and the axis stops at $4\sigma^2$, so a wide $\mathcal{H}_1$ curve can run past it. At $N = 2$ they are exponentials, and $P_D = P_{FA}^{\sigma_0^2/\sigma_1^2}$ exactly, with $\sigma_0^2 = \sigma_w^2$ and $\sigma_1^2 = \sigma_w^2 + P$." />
      </p>
    </FigureShell>
  )
}

export { EnergyFigure }
