import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  AxisTicks,
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  Sym,
} from '@/components/figures/shared.tsx'
import { formatNumber, niceTicks } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import {
  complexPeriodogramAt,
  complexToneInNoise,
  makeRng,
} from '@/domain/math/kernel.ts'

const TRUE_FREQ = 0.21
const AMPLITUDE = 1
const W = 470
const H = 300
/** Left edge of the plot, leaving room for the score ticks. */
const LEFT = 40
const RIGHT = W - 16
const AXIS_Y = H - 46
const TOP = 40
/** Row of the CRB bracket, above the peak marker. */
const CRB_Y = 14

function PeriodogramFigure() {
  const [n, setN] = useState(48)
  const [sigma, setSigma] = useState(1.2)
  const [candidatePct, setCandidatePct] = useState(30)
  const [seed, setSeed] = useState(5)

  const candidate = (candidatePct / 100) * 0.5

  const signal = useMemo(() => {
    const rng = makeRng(seed)
    return complexToneInNoise(rng, n, AMPLITUDE, TRUE_FREQ, sigma, 1.1)
  }, [n, sigma, seed])

  // About eight points per 1/N, so the drawn peak reaches the score the
  // readouts report even at the largest N.
  const frequencies = useMemo(
    () => linspace(0.005, 0.495, Math.max(220, Math.ceil(0.49 * 8 * n))),
    [n],
  )
  const spectrum = useMemo(
    () => frequencies.map((f) => complexPeriodogramAt(signal, f)),
    [signal, frequencies],
  )
  const maxSpec = Math.max(...spectrum, 1e-9)
  const peakIndex = spectrum.reduce(
    (bestIdx, v, i) => (v > (spectrum[bestIdx] ?? 0) ? i : bestIdx),
    0,
  )
  // The display grid is coarser than the main lobe at large N: refine the
  // peak on a fine grid around the best grid point before reading it out.
  const coarseStep = 0.49 / (frequencies.length - 1)
  const peak = linspace(
    (frequencies[peakIndex] ?? 0) - coarseStep,
    (frequencies[peakIndex] ?? 0) + coarseStep,
    41,
  ).reduce(
    (best, f) => {
      const score = complexPeriodogramAt(signal, f)
      return score > best.score ? { f, score } : best
    },
    { f: frequencies[peakIndex] ?? 0, score: maxSpec },
  )
  const fMl = peak.f
  const candidateScore = complexPeriodogramAt(signal, candidate)

  // Complex tone with A and phase unknown: the bound of the slides (T3, p. 97).
  const snr = (AMPLITUDE * AMPLITUDE) / (sigma * sigma)
  const crbStd = Math.sqrt(6 / (4 * Math.PI * Math.PI * snr * n * (n * n - 1)))

  const xOf = (f: number) => LEFT + (f / 0.5) * (RIGHT - LEFT)
  const yOf = (s: number) => AXIS_Y - (s / maxSpec) * (AXIS_Y - TOP)
  // Zero sits on the frequency axis, which already labels it.
  // Drawn to scale. Below 6 units the bracket would be a smudge, so it
  // becomes a single tick and the label says the band is narrower.
  const bandW = xOf(TRUE_FREQ + crbStd) - xOf(TRUE_FREQ - crbStd)
  const bandTooNarrow = bandW < 6
  const scoreTicks = niceTicks(maxSpec, 5).filter((tick) => tick > 0)

  return (
    <FigureShell
      title="Sweep a detector bank across the band"
      instruction="Each candidate frequency proposes a template. The dot's height is the score $|X(f)|^2/N$ of your noisy samples against that template, with $X(f) = \sum x(n)e^{-j2\pi f n}$. Slide the candidate to find the hidden tone, then raise $N$ and watch the peak narrow."
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
            meaning="Length of the record."
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
            tone="cursor"
          />
          <ReadoutRow
            label="Peak of the bank: $\hat{f}_{ML}$"
            value={formatNumber(fMl, 3)}
            tone="estimate"
          />
          <ReadoutRow
            label="Amplitude $|\hat{A}_{ML}|$"
            value={formatNumber(Math.sqrt(peak.score / n), 2)}
            tone="estimate"
          />
          <ReadoutRow
            label="True frequency"
            value={formatNumber(TRUE_FREQ, 3)}
          />
          <ReadoutRow
            label="SNR $|A|^2/\sigma^2$ with $A = 1$"
            value={formatNumber(snr, 2)}
          />
          <ReadoutRow
            label="CRB std of $\hat{f}$ (theory)"
            value={crbStd.toPrecision(2)}
          />
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'periodogram $|X(f)|^2/N$',
            swatchClass: 'stroke-muted-foreground',
          },
          { label: 'your candidate', swatchClass: 'stroke-cursor' },
          {
            label: 'peak $\\hat{f}_{ML}$',
            swatchClass: 'fill-estimate',
            mark: 'triangle',
          },
          { label: 'true tone', swatchClass: 'stroke-truth', dash: true },
          {
            label: 'true tone $\\pm$ CRB std',
            swatchClass: 'fill-truth/15',
            mark: 'square',
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Periodogram of the noisy tone with candidate frequency marker"
        onDragPoint={(x) => {
          const f = ((x - LEFT) / (RIGHT - LEFT)) * 0.5
          setCandidatePct(Math.min(99, Math.max(1, (f / 0.5) * 100)))
        }}
      >
        <line
          x1={LEFT}
          y1={AXIS_Y}
          x2={RIGHT}
          y2={AXIS_Y}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <AxisTicks
          y={AXIS_Y}
          ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((f) => ({
            x: xOf(f),
            label: f.toFixed(1),
          }))}
        />
        <g className="fill-muted-foreground stroke-muted-foreground">
          <line x1={LEFT} y1={TOP} x2={LEFT} y2={AXIS_Y} strokeWidth={1} />
          {scoreTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={LEFT - 4}
                y1={yOf(tick)}
                x2={LEFT}
                y2={yOf(tick)}
                strokeWidth={1}
              />
              <text
                x={LEFT - 6}
                y={yOf(tick) + 3}
                textAnchor="end"
                stroke="none"
                className="font-mono plot-text-xs"
              >
                {formatNumber(tick, tick < 1 ? 1 : 0)}
              </text>
            </g>
          ))}
          <text
            x={LEFT + 8}
            y={TOP - 14}
            stroke="none"
            className="font-mono plot-text-xs"
          >
            score
          </text>
        </g>
        <rect
          x={xOf(TRUE_FREQ) - bandW / 2}
          y={TOP}
          width={bandW}
          height={AXIS_Y - TOP}
          className="fill-truth/15"
        />
        <path
          d={
            bandTooNarrow
              ? `M ${xOf(TRUE_FREQ)} ${CRB_Y - 4} v 8`
              : `M ${xOf(TRUE_FREQ) - bandW / 2} ${CRB_Y - 4} v 8 M ${xOf(TRUE_FREQ) - bandW / 2} ${CRB_Y} H ${xOf(TRUE_FREQ) + bandW / 2} M ${xOf(TRUE_FREQ) + bandW / 2} ${CRB_Y - 4} v 8`
          }
          className="stroke-truth"
          strokeWidth={1.4}
          fill="none"
        />
        <text
          x={xOf(TRUE_FREQ) + bandW / 2 + 5}
          y={CRB_Y + 4}
          className="fill-truth font-mono plot-text-xs"
        >
          true f ±<Sym base="σ" sub="CR" /> = {crbStd.toPrecision(2)}
          {bandTooNarrow ? ', thinner than this tick' : ''}
        </text>
        <line
          x1={xOf(TRUE_FREQ)}
          y1={TOP}
          x2={xOf(TRUE_FREQ)}
          y2={AXIS_Y}
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
          className="stroke-muted-foreground"
          strokeWidth={1.6}
        />
        <path
          d={`M ${xOf(fMl)} ${yOf(maxSpec) - 3} l -5 -8 h 10 z`}
          className="fill-estimate"
        />
        <text
          x={xOf(fMl) + (fMl > 0.4 ? -8 : 8)}
          y={yOf(maxSpec) + 4}
          textAnchor={fMl > 0.4 ? 'end' : 'start'}
          className="plot-halo fill-estimate font-mono plot-text-sm"
        >
          <Sym base="f̂" sub="ML" />
        </text>
        <line
          x1={xOf(candidate)}
          y1={TOP}
          x2={xOf(candidate)}
          y2={AXIS_Y}
          className="stroke-cursor"
          strokeWidth={2}
        />
        <circle
          cx={xOf(candidate)}
          cy={yOf(candidateScore)}
          r={5}
          className="fill-cursor stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={xOf(candidate) + (candidate > 0.4 ? -6 : 6)}
          y={TOP + 12}
          textAnchor={candidate > 0.4 ? 'end' : 'start'}
          className="plot-halo fill-cursor font-mono plot-text-sm"
        >
          score {formatNumber(candidateScore, 2)}
        </text>
        <text
          x={(LEFT + RIGHT) / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          candidate frequency f (drag anywhere)
        </text>
      </Plot>
    </FigureShell>
  )
}

export { PeriodogramFigure }
