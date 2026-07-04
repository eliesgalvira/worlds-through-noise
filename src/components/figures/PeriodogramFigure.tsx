import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import { makeRng, periodogramAt, toneInNoise } from '@/domain/math/kernel.ts'

const TRUE_FREQ = 0.21
const AMPLITUDE = 1
const W = 470
const H = 290

function PeriodogramFigure() {
  const [n, setN] = useState(48)
  const [sigma, setSigma] = useState(1.2)
  const [candidatePct, setCandidatePct] = useState(30)
  const [seed, setSeed] = useState(5)

  const candidate = (candidatePct / 100) * 0.5

  const signal = useMemo(() => {
    const rng = makeRng(seed)
    return toneInNoise(rng, n, AMPLITUDE, TRUE_FREQ, sigma, 1.1)
  }, [n, sigma, seed])

  const frequencies = useMemo(() => linspace(0.005, 0.495, 220), [])
  const spectrum = useMemo(
    () => frequencies.map((f) => periodogramAt(signal, f)),
    [signal, frequencies],
  )
  const maxSpec = Math.max(...spectrum, 1e-9)
  const peakIndex = spectrum.reduce(
    (bestIdx, v, i) => (v > (spectrum[bestIdx] ?? 0) ? i : bestIdx),
    0,
  )
  const fMl = frequencies[peakIndex] ?? 0
  const candidateScore = periodogramAt(signal, candidate)

  const snr = (AMPLITUDE * AMPLITUDE) / 2 / (sigma * sigma)
  const crbStd = Math.sqrt(3 / (8 * Math.PI * Math.PI * snr * n ** 3))

  const xOf = (f: number) => 10 + (f / 0.5) * (W - 20)
  const yOf = (s: number) => H - 34 - (s / maxSpec) * (H - 60)

  return (
    <FigureShell
      title="Sweep a detector bank across the band"
      instruction="Each candidate frequency proposes a template; the meter is the honest correlation $|\sum x(n)e^{-j2\pi f n}|^2/N$ between your actual noisy samples and that template. Slide the candidate and hunt the hidden tone — then raise $N$ and watch the peak sharpen like $N^3$."
      controls={
        <>
          <SliderControl
            label="Candidate frequency"
            variable="f"
            value={candidatePct}
            min={1}
            max={99}
            step={0.5}
            meaning="The template you are currently testing."
            onValueChange={setCandidatePct}
            format={(v) => `f = ${((v / 100) * 0.5).toFixed(3)}`}
          />
          <SliderControl
            label="Samples"
            variable="N"
            value={n}
            min={16}
            max={256}
            step={8}
            meaning="Frequency information grows like $N^3$."
            onValueChange={setN}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <SliderControl
            label="Noise level"
            variable="σ"
            value={sigma}
            min={0.3}
            max={2.5}
            step={0.05}
            meaning="Feeds the spurious ripples that compete with the peak."
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
            New noise
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Score at your candidate"
            value={formatNumber(candidateScore, 2)}
            tone="h1"
          />
          <ReadoutRow
            label="Peak of the bank: $\hat{f}_{ML}$"
            value={formatNumber(fMl, 3)}
            tone="good"
          />
          <ReadoutRow
            label="True frequency"
            value={formatNumber(TRUE_FREQ, 3)}
          />
          <ReadoutRow
            label="CRB std of $\hat{f}$ ($\approx 1/N^{1.5}$)"
            value={formatNumber(crbStd, 5)}
          />
        </>
      }
    >
      <Legend
        items={[
          { label: 'periodogram $|X(f)|^2/N$', swatchClass: 'stroke-h0' },
          { label: 'your candidate', swatchClass: 'stroke-threshold' },
          {
            label: 'true tone $\\pm$ CRB',
            swatchClass: 'stroke-truth',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Periodogram of the noisy tone with candidate frequency marker"
        onDragPoint={(x) => {
          const f = ((x - 10) / (W - 20)) * 0.5
          setCandidatePct(Math.min(99, Math.max(1, (f / 0.5) * 100)))
        }}
      >
        <line
          x1={10}
          y1={H - 34}
          x2={W - 10}
          y2={H - 34}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <rect
          x={xOf(Math.max(TRUE_FREQ - crbStd, 0))}
          y={12}
          width={Math.max(
            xOf(TRUE_FREQ + crbStd) - xOf(TRUE_FREQ - crbStd),
            1.4,
          )}
          height={H - 46}
          className="fill-truth"
          opacity={0.12}
        />
        <line
          x1={xOf(TRUE_FREQ)}
          y1={12}
          x2={xOf(TRUE_FREQ)}
          y2={H - 34}
          className="stroke-truth"
          strokeWidth={1.2}
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <path
          d={frequencies
            .map(
              (f, i) =>
                `${i === 0 ? 'M' : 'L'} ${xOf(f).toFixed(1)} ${yOf(spectrum[i] ?? 0).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={1.6}
        />
        <line
          x1={xOf(candidate)}
          y1={16}
          x2={xOf(candidate)}
          y2={H - 30}
          className="stroke-threshold"
          strokeWidth={2}
        />
        <circle
          cx={xOf(candidate)}
          cy={yOf(candidateScore)}
          r={5}
          className="fill-threshold stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={W / 2}
          y={H - 12}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10px]"
        >
          candidate frequency f (drag anywhere)
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        This is the Fourier transform working as a detector: compressed
        likelihood turned the joint (A, f) search into one sweep plus one
        read-off.
      </p>
    </FigureShell>
  )
}

export { PeriodogramFigure }
