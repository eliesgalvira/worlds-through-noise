import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  AxisTicks,
  AxisTicksY,
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  Sym,
} from '@/components/figures/shared.tsx'
import type { LegendItem } from '@/components/figures/shared.tsx'
import { formatNumber, niceTicks } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'
import {
  complexPeriodogramAt,
  complexToneInNoise,
  makeRng,
} from '@/domain/math/kernel.ts'

const TRUE_FREQ = 0.21
/** Band of candidate frequencies the bank sweeps, in cycles/sample. */
const F_FROM = 0.005
const F_TO = 0.495
const AMPLITUDE = 1
const W = 560
const H = 372
/** Left edge of the plot, leaving room for the match ticks. */
const LEFT = 40
const RIGHT = W - 16
const AXIS_Y = H - 46
const TOP = 112
/** Strip of samples and template above the periodogram. */
const STRIP_Y = 40
const STRIP_HALF = 22
/** Samples shown in the strip: enough to see the oscillation. */
const STRIP_SAMPLES = 48
/** Row of the CRB bracket, above the peak marker. */
const CRB_Y = 76

/** Legend entries for the marks that appear with the answer. */
const ANSWER_LEGEND: ReadonlyArray<LegendItem> = [
  {
    label: 'peak $\\hat{f}_{ML}$',
    swatchClass: 'fill-estimate',
    mark: 'triangle',
  },
  { label: 'true tone $f_0$', swatchClass: 'stroke-truth', dash: true },
  {
    label: '$f_0 \\pm \\sigma_{CR}$',
    swatchClass: 'fill-truth/15',
    mark: 'square',
  },
]

function PeriodogramFigure() {
  const [n, setN] = useState(48)
  const [sigma, setSigma] = useState(1.2)
  const [candidatePct, setCandidatePct] = useState(30)
  const [seed, setSeed] = useState(5)
  // The tone, its band and the bank's peak stay hidden until the student
  // has hunted with the candidate.
  const [answerShown, setAnswerShown] = useState(false)

  const candidate = (candidatePct / 100) * 0.5

  const signal = useMemo(() => {
    const rng = makeRng(seed)
    return complexToneInNoise(rng, n, AMPLITUDE, TRUE_FREQ, sigma, 1.1)
  }, [n, sigma, seed])

  // About eight points per 1/N, so the drawn peak reaches the value the
  // readouts report even at the largest N.
  const frequencies = useMemo(
    () =>
      linspace(F_FROM, F_TO, Math.max(220, Math.ceil((F_TO - F_FROM) * 8 * n))),
    [n],
  )
  const { spectrum, maxSpec, peak } = useMemo(() => {
    const values = frequencies.map((f) => complexPeriodogramAt(signal, f))
    const best = values.reduce(
      (bestIdx, v, i) => (v > (values[bestIdx] ?? 0) ? i : bestIdx),
      0,
    )
    const top = Math.max(...values, 1e-9)
    // The grid is coarser than the main lobe at large N: refine the peak on
    // a fine grid around the best grid point before reading it out.
    const fBest = frequencies[best] ?? 0
    const step = (F_TO - F_FROM) / (frequencies.length - 1)
    const refined = linspace(fBest - step, fBest + step, 41).reduce(
      (acc, f) => {
        const value = complexPeriodogramAt(signal, f)
        return value > acc.value ? { f, value } : acc
      },
      { f: fBest, value: top },
    )
    return { spectrum: values, maxSpec: top, peak: refined }
  }, [signal, frequencies])
  const fMl = peak.f
  const candidateScore = complexPeriodogramAt(signal, candidate)

  // Complex tone with A and phase unknown: the bound of the slides (T3, p. 97).
  const snr = (AMPLITUDE * AMPLITUDE) / (sigma * sigma)
  const crbStd = Math.sqrt(6 / (4 * Math.PI * Math.PI * snr * n * (n * n - 1)))

  const xOf = (f: number) => LEFT + (f / 0.5) * (RIGHT - LEFT)
  // The strip: real parts of the first samples and of the candidate's
  // template e^{j2πfn}, on one shared vertical scale.
  const shown = Math.min(n, STRIP_SAMPLES)
  const stripX = (k: number) => LEFT + (k / (shown - 1)) * (RIGHT - LEFT)
  const stripScale =
    STRIP_HALF /
    Math.max(...signal.re.slice(0, shown).map((v) => Math.abs(v)), 1)
  const templatePath = Array.from({ length: (shown - 1) * 4 + 1 }, (_, i) => {
    const k = i / 4
    return `${i === 0 ? 'M' : 'L'} ${stripX(k).toFixed(1)} ${(STRIP_Y - Math.cos(2 * Math.PI * candidate * k) * stripScale).toFixed(1)}`
  }).join(' ')
  const yOf = (s: number) => AXIS_Y - (s / maxSpec) * (AXIS_Y - TOP)
  // Zero sits on the frequency axis, which already labels it.
  // Drawn to scale. Below 12 units the bracket would read as a letter, so it
  // becomes a single tick and the label says the band is narrower.
  const bandW = xOf(TRUE_FREQ + crbStd) - xOf(TRUE_FREQ - crbStd)
  const bandTooNarrow = bandW < 12
  // The candidate's and the peak's labels face away from each other, and
  // turn inward near the plot edges.
  const matchLabelLeft = candidate < fMl ? candidate > 0.12 : candidate > 0.42
  const peakLabelLeft = candidate > fMl ? fMl > 0.08 : fMl > 0.44
  const matchTicks = niceTicks(maxSpec, 5).filter((tick) => tick > 0)

  return (
    <FigureShell
      title="Sweep a detector bank across the band"
      instruction="Each candidate frequency proposes a template. The strip on top lays that template over your first samples. The dot's height is their match $|X(f)|^2/N$, with $X(f) = \sum x(n)e^{-j2\pi f n}$. Slide the candidate to find the hidden tone, then show the answer and raise $N$ to watch the peak narrow."
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
          <Button
            type="button"
            variant={answerShown ? 'secondary' : 'outline'}
            size="sm"
            aria-pressed={answerShown}
            onClick={() => {
              setAnswerShown((shown) => !shown)
            }}
          >
            {answerShown ? 'Hide the answer' : 'Show the answer'}
          </Button>
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
            label="Noise std"
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
            label="Match at your candidate"
            value={formatNumber(candidateScore, 2)}
            tone="cursor"
          />
          <ReadoutRow
            label="Peak of the bank: $\hat{f}_{ML}$"
            value={answerShown ? formatNumber(fMl, 3) : '—'}
            tone="estimate"
          />
          <ReadoutRow
            label="Amplitude $|\hat{A}_{ML}|$"
            value={
              answerShown ? formatNumber(Math.sqrt(peak.value / n), 2) : '—'
            }
            tone="estimate"
          />
          <ReadoutRow
            label="True frequency $f_0$"
            value={answerShown ? formatNumber(TRUE_FREQ, 3) : '—'}
          />
          <ReadoutRow
            label="SNR $|A|^2/\sigma^2$ with $A = 1$"
            value={formatNumber(snr, 2)}
          />
          <ReadoutRow
            label="CRB std $\sigma_{CR(f)}$ (theory)"
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
          ...(answerShown ? ANSWER_LEGEND : []),
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
        <text
          x={LEFT}
          y={12}
          className="fill-muted-foreground font-mono plot-text-xs"
        >
          first {shown} samples, real part
        </text>
        <text
          x={RIGHT}
          y={12}
          textAnchor="end"
          className="fill-cursor font-mono plot-text-xs"
        >
          template s(f) at your f
        </text>
        <line
          x1={LEFT}
          y1={STRIP_Y}
          x2={RIGHT}
          y2={STRIP_Y}
          className="stroke-border"
          strokeWidth={1}
        />
        <path
          d={templatePath}
          fill="none"
          className="stroke-cursor/70"
          strokeWidth={1.4}
        />
        {signal.re.slice(0, shown).map((v, k) => (
          <circle
            key={k}
            cx={stripX(k)}
            cy={STRIP_Y - v * stripScale}
            r={2.2}
            className="fill-muted-foreground"
          />
        ))}
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
          <AxisTicksY
            x={LEFT}
            ticks={matchTicks.map((tick) => ({
              y: yOf(tick),
              label: formatNumber(tick, tick < 1 ? 1 : 0),
            }))}
          />
          <text
            x={LEFT + 8}
            y={TOP - 14}
            stroke="none"
            className="font-mono plot-text-xs"
          >
            match |X(f)|²/N
          </text>
        </g>
        {answerShown ? (
          <g>
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
              <Sym base="σ" sub="CR" /> = {crbStd.toPrecision(2)}
              {bandTooNarrow ? ', too thin to draw' : ''}
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
            <text
              x={xOf(TRUE_FREQ) - 4}
              y={AXIS_Y - 6}
              textAnchor="end"
              className="plot-halo fill-truth font-mono plot-text-xs"
            >
              <Sym base="f" sub="0" /> = {TRUE_FREQ.toFixed(3)}
            </text>
          </g>
        ) : null}
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
        {answerShown ? (
          <g>
            <path
              d={`M ${xOf(fMl)} ${yOf(maxSpec) - 3} l -5 -8 h 10 z`}
              className="fill-estimate"
            />
            <text
              x={xOf(fMl) + (peakLabelLeft ? -8 : 8)}
              y={yOf(maxSpec) + 4}
              textAnchor={peakLabelLeft ? 'end' : 'start'}
              className="plot-halo fill-estimate font-mono plot-text-sm"
            >
              <Sym base="f̂" sub="ML" />
            </text>
          </g>
        ) : null}
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
          x={xOf(candidate) + (matchLabelLeft ? -6 : 6)}
          y={TOP + 12}
          textAnchor={matchLabelLeft ? 'end' : 'start'}
          className="plot-halo fill-cursor font-mono plot-text-sm"
        >
          f = {candidate.toFixed(3)}
        </text>
        <text
          x={xOf(candidate) + (matchLabelLeft ? -6 : 6)}
          y={TOP + 30}
          textAnchor={matchLabelLeft ? 'end' : 'start'}
          className="plot-halo fill-cursor font-mono plot-text-sm"
        >
          match {formatNumber(candidateScore, 2)}
        </text>
        <text
          x={(LEFT + RIGHT) / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          candidate f, cycles/sample
        </text>
      </Plot>
    </FigureShell>
  )
}

export { PeriodogramFigure }
