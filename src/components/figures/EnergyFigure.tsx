import { useMemo, useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
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

function EnergyFigure() {
  const [samples, setSamples] = useState(10)
  const [snrPct, setSnrPct] = useState(60)
  const [alphaPct, setAlphaPct] = useState(10)

  const dof = 2 * samples // complex observations
  const snr = snrPct / 100
  const alpha = alphaPct / 100

  // Test statistic y/σ²: χ²_dof under H0, (1+SNR)·χ²_dof under H1.
  const gamma = chi2TailInv(alpha, dof)
  const pdJailer = chi2Tail(gamma / (1 + snr), dof)
  // The intended receiver knows the waveform: coherent gain √(N·SNR·2).
  const pdReceiver = qFunc(qInv(alpha) - Math.sqrt(2 * samples * snr))

  const xMax = (1 + snr) * (dof + 4 * Math.sqrt(2 * dof)) + 4
  const xs = useMemo(() => linspace(0.01, xMax, 240), [xMax])
  const peak = Math.max(
    ...xs.map((v) => chi2Pdf(v, dof)),
    ...xs.map((v) => chi2Pdf(v / (1 + snr), dof) / (1 + snr)),
    1e-9,
  )
  const xOf = (v: number) => 10 + (v / xMax) * (W - 20)
  const yOf = (p: number) => H - 32 - (p / peak) * (H - 58)

  const h0Path = xs
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(chi2Pdf(v, dof)).toFixed(1)}`,
    )
    .join(' ')
  const h1Path = xs
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(chi2Pdf(v / (1 + snr), dof) / (1 + snr)).toFixed(1)}`,
    )
    .join(' ')

  return (
    <FigureShell
      title="Two loudness gauges, separating at $\sqrt{N}$"
      instruction="Nobody knows the waveform, so the detector can only measure energy. The bumps are exact chi-squared densities of the measured power under each hypothesis. Slide $N$: the centers stay $P$ apart while the widths shrink like $1/\sqrt{N}$ — separation is slow. Compare the jailer with the receiver, who knows the waveform and gains the full $N$."
      controls={
        <>
          <SliderControl
            label="Observation length"
            variable="N"
            value={samples}
            min={2}
            max={150}
            step={1}
            meaning="Complex samples of the suspected transmission."
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
            meaning="The jailer's allowed rate of wrong accusations."
            onValueChange={setAlphaPct}
            format={(v) => `${v.toFixed(1)}%`}
          />
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Jailer's $P_D$ (energy detector)"
            value={formatPercentValue(pdJailer)}
            tone={pdJailer - alpha < 0.08 ? 'bad' : 'h1'}
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
          <p className="text-xs leading-5 text-muted-foreground">
            <MathText text="When the jailer's $P_D \approx \alpha$, the transmission is statistically invisible: energy detection only gains $\sqrt{N}$, coherent detection gains $N$." />
          </p>
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
          y1={H - 32}
          x2={W - 10}
          y2={H - 32}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <path d={h0Path} fill="none" className="stroke-h0" strokeWidth={2} />
        <path d={h1Path} fill="none" className="stroke-h1" strokeWidth={2} />
        <line
          x1={xOf(gamma)}
          y1={14}
          x2={xOf(gamma)}
          y2={H - 28}
          className="stroke-threshold"
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        <text
          x={xOf(dof)}
          y={H - 12}
          textAnchor="middle"
          className="fill-h0 font-mono text-[10px]"
        >
          Nσ²
        </text>
        <text
          x={xOf(dof * (1 + snr))}
          y={H - 12}
          textAnchor="middle"
          className="fill-h1 font-mono text-[10px]"
        >
          N(σ²+P)
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="Densities and tails are exact $\chi^2_{2N}$ computations — watch how skewed they are at small $N$, where the exponential special case $P_D = P_{FA}^{\sigma_0^2/\sigma_1^2}$ lives." />
      </p>
    </FigureShell>
  )
}

export { EnergyFigure }
