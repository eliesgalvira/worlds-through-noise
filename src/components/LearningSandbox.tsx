import { useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { BusinessDay, Time } from 'lightweight-charts'
import { Button } from '@/components/ui/button.tsx'
import { LessonChart } from '@/components/LessonChart.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  bayesGaussianThreshold,
  gaussianLogLikelihoodRatio,
  npThresholdRightTail,
  rightTailDetectionProbability,
  rightTailFalseAlarm,
} from '@/domain/math/detection.ts'
import {
  linspace,
  normalCdf,
  normalInvCdf,
  normalPdf,
} from '@/domain/math/distributions.ts'
import { formatFixed, formatPercent } from '@/lib/format.ts'
import { cn } from '@/lib/utils.ts'
import {
  areaPathFromPoints,
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'
import type { ChartSeries } from '@/components/LessonChart.tsx'

type LearningSandboxProps = {
  readonly moduleId: string
}

type LegendItem = {
  readonly label: string
  readonly color: string
  readonly kind?: 'line' | 'dot' | 'dash'
}

type EstimationControls = {
  readonly samples: number
  readonly noise: number
  readonly priorStrength: number
  readonly drawRun: number
}

type EstimationControlAction =
  | { readonly type: 'samples'; readonly value: number }
  | { readonly type: 'noise'; readonly value: number }
  | { readonly type: 'priorStrength'; readonly value: number }
  | { readonly type: 'drawSamples' }

const initialEstimationControls: EstimationControls = {
  samples: 12,
  noise: 10,
  priorStrength: 0.35,
  drawRun: 0,
}

function estimationControlsReducer(
  state: EstimationControls,
  action: EstimationControlAction,
): EstimationControls {
  switch (action.type) {
    case 'samples':
      return { ...state, samples: action.value }
    case 'noise':
      return { ...state, noise: action.value }
    case 'priorStrength':
      return { ...state, priorStrength: action.value }
    case 'drawSamples':
      return { ...state, drawRun: state.drawRun + 1 }
  }
}

const VIEW_WIDTH = 100
const CHART_BASE_YEAR = 2020
const ROC_SAMPLE_COUNT = 2400
const ROC_MIN_FALSE_ALARM = 0.001
const PLOT_LEFT_PERCENT = 2.5
const PLOT_WIDTH_PERCENT = 89
const ESTIMATION_VIEW_HEIGHT = 74
const ESTIMATION_SVG_HEIGHT_REM = 20
const ESTIMATION_SVG_PADDING_REM = 1
const priorHoleStyle = {
  borderColor: 'var(--prior)',
  boxShadow:
    '0 0 0 3px var(--card), 0 0 0 4px color-mix(in srgb, var(--prior) 22%, transparent)',
}

const estimationSvgTop = (y: number): string =>
  `calc(${ESTIMATION_SVG_PADDING_REM}rem + ${(y / ESTIMATION_VIEW_HEIGHT) * ESTIMATION_SVG_HEIGHT_REM}rem)`

const plotXPercent = (value: number): number =>
  PLOT_LEFT_PERCENT + (value / VIEW_WIDTH) * PLOT_WIDTH_PERCENT

const isLeapYear = (year: number): boolean =>
  year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)

const daysInYear = (year: number): number => (isLeapYear(year) ? 366 : 365)

const daysInMonths = (year: number): ReadonlyArray<number> => [
  31,
  isLeapYear(year) ? 29 : 28,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31,
]

const businessDayFromOffset = (offset: number): BusinessDay => {
  let year = CHART_BASE_YEAR
  let remaining = offset

  while (remaining >= daysInYear(year)) {
    remaining -= daysInYear(year)
    year += 1
  }

  const months = daysInMonths(year)
  let monthIndex = 0
  while (
    monthIndex < months.length - 1 &&
    remaining >= (months[monthIndex] ?? 31)
  ) {
    remaining -= months[monthIndex] ?? 31
    monthIndex += 1
  }

  return {
    year,
    month: monthIndex + 1,
    day: remaining + 1,
  }
}

const offsetFromBusinessDay = (businessDay: BusinessDay): number => {
  let offset = 0

  for (let year = CHART_BASE_YEAR; year < businessDay.year; year += 1) {
    offset += daysInYear(year)
  }

  const months = daysInMonths(businessDay.year)
  for (
    let monthIndex = 0;
    monthIndex < businessDay.month - 1;
    monthIndex += 1
  ) {
    offset += months[monthIndex] ?? 0
  }

  return offset + businessDay.day - 1
}

const chartTime = (value: number): BusinessDay => {
  const dayIndex = Math.max(0, Math.round(value * 10))
  return businessDayFromOffset(dayIndex)
}

const chartValueFromTime = (time: Time): number => {
  if (typeof time === 'number') return time

  if (typeof time === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(time)
    if (match === null) return 0
    return (
      offsetFromBusinessDay({
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      }) / 10
    )
  }

  return offsetFromBusinessDay(time) / 10
}

const formatChartAxisTime = (time: Time): string =>
  formatFixed(chartValueFromTime(time), 1)

function ChartLegend({ items }: { readonly items: ReadonlyArray<LegendItem> }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span
            className={cn(
              'inline-block h-2.5 w-5 rounded-full',
              item.kind === 'dot' ? 'h-2.5 w-2.5' : '',
              item.kind === 'dash'
                ? 'h-px border-t border-dashed bg-transparent'
                : '',
            )}
            style={{
              backgroundColor:
                item.kind === 'dash' ? 'transparent' : item.color,
              borderColor: item.color,
            }}
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function SandboxShell({
  moduleId,
  title,
  instruction,
  children,
  controls,
  readout,
  layout = 'stacked',
}: {
  readonly moduleId: string
  readonly title: string
  readonly instruction: string
  readonly children: ReactNode
  readonly controls: ReactNode
  readonly readout?: ReactNode
  readonly layout?: 'stacked' | 'split'
}) {
  if (layout === 'split') {
    return (
      <section
        id={`${moduleId}-sandbox`}
        className="scroll-mt-40 rounded-lg border bg-card/80 p-5 sm:scroll-mt-28 sm:p-6"
        aria-label={title}
      >
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          Interactive sandbox
        </p>
        <h3 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          {instruction}
        </p>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)]">
          <div className="min-w-0">{children}</div>
          <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Manipulate
            </p>
            <div className="space-y-5">{controls}</div>
            {readout !== undefined ? (
              <div className="mt-5 border-t border-border pt-4">{readout}</div>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id={`${moduleId}-sandbox`}
      className="scroll-mt-40 rounded-lg border bg-card/80 p-5 sm:scroll-mt-28 sm:p-6"
      aria-label={title}
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Interactive sandbox
      </p>
      <h3 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-tight text-foreground">
        {title}
      </h3>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
        {instruction}
      </p>
      <div className="mt-6">{children}</div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Manipulate
        </p>
        <div className="max-w-3xl space-y-5">{controls}</div>
      </div>

      {readout !== undefined ? (
        <div className="mt-5 border-y border-border py-4">{readout}</div>
      ) : null}
    </section>
  )
}

const DETECT_VIEW_W = 480
const DETECT_VIEW_H = 226
const DETECT_PAD_X = 22
const DETECT_TOP = 26
const DETECT_BASELINE = 184
const DETECT_GRID_VALUES = [10, 30, 50, 70, 90]

type DensityFn = (value: number) => number

type DensityScale = {
  readonly mapX: (value: number) => number
  readonly yForPdf: (pdf: number) => number
}

function makeDensityScale(curves: ReadonlyArray<DensityFn>): DensityScale {
  let peak = 1e-9
  for (const value of linspace(0, 100, 180)) {
    for (const curve of curves) {
      peak = Math.max(peak, curve(value))
    }
  }
  const plotHeight = DETECT_BASELINE - DETECT_TOP
  return {
    mapX: (value) =>
      scaleLinear({
        value,
        domainMin: 0,
        domainMax: 100,
        rangeMin: DETECT_PAD_X,
        rangeMax: DETECT_VIEW_W - DETECT_PAD_X,
      }),
    yForPdf: (pdf) => DETECT_BASELINE - (pdf / peak) * plotHeight * 0.92,
  }
}

function curvePoints(
  scale: DensityScale,
  curve: DensityFn,
): ReadonlyArray<{ readonly x: number; readonly y: number }> {
  return linspace(0, 100, 220).map((value) => ({
    x: scale.mapX(value),
    y: scale.yForPdf(curve(value)),
  }))
}

function regionPoints(
  scale: DensityScale,
  curve: DensityFn,
  from: number,
  to: number,
): ReadonlyArray<{ readonly x: number; readonly y: number }> {
  return linspace(from, to, 140).map((value) => ({
    x: scale.mapX(value),
    y: scale.yForPdf(curve(value)),
  }))
}

function DetectionField({
  ariaLabel,
  axisLabel,
  children,
}: {
  readonly ariaLabel: string
  readonly axisLabel: string
  readonly children: ReactNode
}) {
  return (
    <figure
      className="w-full overflow-hidden rounded-md border border-border bg-card"
      style={{ height: 300 }}
    >
      <svg
        viewBox={`0 0 ${DETECT_VIEW_W} ${DETECT_VIEW_H}`}
        className="h-full w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <g className="stroke-border" opacity="0.55">
          {DETECT_GRID_VALUES.map((value) => {
            const x =
              DETECT_PAD_X + (value / 100) * (DETECT_VIEW_W - 2 * DETECT_PAD_X)
            return (
              <line
                key={`grid-${value}`}
                x1={x}
                y1={DETECT_TOP}
                x2={x}
                y2={DETECT_BASELINE}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </g>
        <line
          x1={DETECT_PAD_X}
          y1={DETECT_BASELINE}
          x2={DETECT_VIEW_W - DETECT_PAD_X}
          y2={DETECT_BASELINE}
          className="stroke-muted-foreground"
          strokeWidth="1.1"
          opacity="0.8"
          vectorEffect="non-scaling-stroke"
        />
        {children}
        <text
          x={DETECT_VIEW_W / 2}
          y={DETECT_VIEW_H - 8}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {axisLabel}
        </text>
      </svg>
    </figure>
  )
}

function BaseFills({
  scale,
  pdfH0,
  pdfH1,
}: {
  readonly scale: DensityScale
  readonly pdfH0: DensityFn
  readonly pdfH1: DensityFn
}) {
  return (
    <>
      <path
        d={areaPathFromPoints(curvePoints(scale, pdfH0), DETECT_BASELINE)}
        className="fill-h0"
        opacity="0.08"
      />
      <path
        d={areaPathFromPoints(curvePoints(scale, pdfH1), DETECT_BASELINE)}
        className="fill-h1"
        opacity="0.08"
      />
    </>
  )
}

function BaseStrokes({
  scale,
  pdfH0,
  pdfH1,
}: {
  readonly scale: DensityScale
  readonly pdfH0: DensityFn
  readonly pdfH1: DensityFn
}) {
  return (
    <>
      <path
        d={pathFromPoints(curvePoints(scale, pdfH0))}
        fill="none"
        className="stroke-h0"
        strokeWidth="2.2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={pathFromPoints(curvePoints(scale, pdfH1))}
        fill="none"
        className="stroke-h1"
        strokeWidth="2.2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </>
  )
}

function PeakLabels({
  scale,
  h0Mean,
  h1Mean,
  pdfH0,
  pdfH1,
}: {
  readonly scale: DensityScale
  readonly h0Mean: number
  readonly h1Mean: number
  readonly pdfH0: DensityFn
  readonly pdfH1: DensityFn
}) {
  return (
    <>
      <text
        x={scale.mapX(h0Mean)}
        y={scale.yForPdf(pdfH0(h0Mean)) - 7}
        textAnchor="middle"
        className="fill-h0 font-mono text-[12px] font-medium"
      >
        H0
      </text>
      <text
        x={scale.mapX(h1Mean)}
        y={scale.yForPdf(pdfH1(h1Mean)) - 7}
        textAnchor="middle"
        className="fill-h1 font-mono text-[12px] font-medium"
      >
        H1
      </text>
    </>
  )
}

function ObservationSandbox({ moduleId }: { readonly moduleId: string }) {
  const h0Mean = 38
  const h1Mean = 62
  const sd = 12
  const [observation, setObservation] = useState(50)
  const [hiddenWorld, setHiddenWorld] = useState<'H0' | 'H1' | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [drawId, setDrawId] = useState(0)
  const pdfH0: DensityFn = (value) => normalPdf(value, h0Mean, sd)
  const pdfH1: DensityFn = (value) => normalPdf(value, h1Mean, sd)
  const scale = makeDensityScale([pdfH0, pdfH1])
  const likelihood0 = pdfH0(observation)
  const likelihood1 = pdfH1(observation)
  const ratio = likelihood1 / Math.max(1e-9, likelihood0)
  const ambiguous = ratio > 0.5 && ratio < 2
  const leaning = likelihood1 >= likelihood0 ? 'H1' : 'H0'
  const obsX = scale.mapX(observation)
  const y0 = scale.yForPdf(likelihood0)
  const y1 = scale.yForPdf(likelihood1)

  const drawTrace = () => {
    const next = drawId + 1
    const r1 = Math.abs(Math.sin(next * 12.9898 + 1.3)) % 1
    const r2 = Math.abs(Math.sin(next * 4.1414 + 0.7)) % 1
    const world = r1 < 0.5 ? 'H0' : 'H1'
    const mean = world === 'H0' ? h0Mean : h1Mean
    const gauss =
      Math.sqrt(-2 * Math.log(Math.max(1e-6, r2))) * Math.cos(2 * Math.PI * r1)
    setDrawId(next)
    setHiddenWorld(world)
    setRevealed(false)
    setObservation(Math.round(Math.min(88, Math.max(12, mean + sd * gauss))))
  }

  return (
    <SandboxShell
      moduleId={moduleId}
      title="One trace, two hidden worlds"
      instruction="Draw a noisy trace from a hidden world, or move it by hand. Read how ordinary that exact value is under each world. In the overlap, one trace cannot settle the question."
      controls={
        <>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={drawTrace}>
              Draw a noisy trace
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={hiddenWorld === null}
              onClick={() => {
                setRevealed(true)
              }}
            >
              Reveal hidden world
            </Button>
          </div>
          <SliderControl
            label="Trace position"
            variable="x"
            value={observation}
            min={12}
            max={88}
            step={1}
            meaning="The single corrupted value the detector is allowed to see."
            onValueChange={(value) => {
              setObservation(value)
              setHiddenWorld(null)
              setRevealed(false)
            }}
            format={(value) => `x = ${value.toFixed(0)}`}
          />
        </>
      }
      readout={
        <div className="space-y-2 text-base leading-7 text-foreground">
          <p>
            Likelihood under H0:{' '}
            <span className="font-mono text-h0">
              {formatFixed(likelihood0, 4)}
            </span>{' '}
            &nbsp;|&nbsp; under H1:{' '}
            <span className="font-mono text-h1">
              {formatFixed(likelihood1, 4)}
            </span>
          </p>
          <p>
            {ambiguous
              ? 'Both worlds explain this trace almost equally. The trace alone is not enough.'
              : `This trace leans ${leaning}, but the other world has not become impossible.`}
          </p>
          {hiddenWorld !== null ? (
            <p className="text-sm text-muted-foreground">
              {revealed
                ? `This trace was really generated by ${hiddenWorld}.`
                : 'The world that generated this trace is hidden. Guess, then reveal it.'}
            </p>
          ) : null}
        </div>
      }
    >
      <ChartLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          { label: 'observed trace x', color: '#151515', kind: 'dot' },
        ]}
      />
      <DetectionField
        ariaLabel={`Two world densities with an observed trace at ${observation}.`}
        axisLabel="observed value x"
      >
        <BaseFills scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <BaseStrokes scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <line
          x1={obsX}
          y1={DETECT_TOP - 6}
          x2={obsX}
          y2={DETECT_BASELINE}
          className="stroke-truth"
          strokeWidth="1.4"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={obsX}
          cy={y0}
          r="4"
          className="fill-h0 stroke-card"
          strokeWidth="1.5"
        />
        <circle
          cx={obsX}
          cy={y1}
          r="4"
          className="fill-h1 stroke-card"
          strokeWidth="1.5"
        />
        <circle
          cx={obsX}
          cy={DETECT_BASELINE}
          r="4.5"
          className="fill-truth stroke-card"
          strokeWidth="2"
        />
        <text
          x={obsX}
          y={DETECT_BASELINE + 15}
          textAnchor="middle"
          className="fill-truth font-mono text-[10px]"
        >
          trace
        </text>
        <PeakLabels
          scale={scale}
          h0Mean={h0Mean}
          h1Mean={h1Mean}
          pdfH0={pdfH0}
          pdfH1={pdfH1}
        />
        {revealed && hiddenWorld !== null ? (
          <text
            x={DETECT_VIEW_W / 2}
            y={DETECT_TOP - 4}
            textAnchor="middle"
            className={
              hiddenWorld === 'H0'
                ? 'fill-h0 font-mono text-[11px] font-medium'
                : 'fill-h1 font-mono text-[11px] font-medium'
            }
          >
            hidden world was {hiddenWorld}
          </text>
        ) : null}
      </DetectionField>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        The two dots are how tall each world&apos;s density is at the trace:
        evidence is a comparison of those heights, not a single curve.
      </p>
    </SandboxShell>
  )
}

function OverlapSandbox({ moduleId }: { readonly moduleId: string }) {
  const [separation, setSeparation] = useState(26)
  const [noise, setNoise] = useState(12)
  const [samples, setSamples] = useState(4)
  const sd = Math.max(3, noise / Math.sqrt(samples))
  const h0Mean = 50 - separation / 2
  const h1Mean = 50 + separation / 2
  const pdfH0: DensityFn = (value) => normalPdf(value, h0Mean, sd)
  const pdfH1: DensityFn = (value) => normalPdf(value, h1Mean, sd)
  const overlapFn: DensityFn = (value) => Math.min(pdfH0(value), pdfH1(value))
  const scale = makeDensityScale([pdfH0, pdfH1])
  const overlap = 2 * normalCdf((h0Mean + h1Mean) / 2, h1Mean, sd)
  const crossoverX = scale.mapX(50)

  return (
    <SandboxShell
      moduleId={moduleId}
      title="Overlap is where mistakes live"
      instruction="Pull the worlds apart, calm the noise, or average more samples. Watch the shaded overlap, the only region where a trace is genuinely confusable, grow and shrink."
      controls={
        <>
          <SliderControl
            label="World separation"
            variable="d"
            value={separation}
            min={8}
            max={46}
            step={1}
            meaning="More separation means each hidden world leaves a more distinct trace."
            onValueChange={setSeparation}
            format={(value) => `d = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Noise"
            variable="sigma"
            value={noise}
            min={5}
            max={25}
            step={1}
            meaning="More noise spreads each world across more observations."
            onValueChange={setNoise}
            format={(value) => `sigma = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Independent samples"
            variable="N"
            value={samples}
            min={1}
            max={30}
            step={1}
            meaning="Averaging more samples sharpens each world's distribution."
            onValueChange={setSamples}
            format={(value) => `N = ${value.toFixed(0)}`}
          />
        </>
      }
      readout={
        <p className="text-base leading-7 text-foreground">
          Confusable overlap:{' '}
          <span className="font-mono text-false-alarm">
            {formatPercent(Math.min(1, overlap))}
          </span>
          . Every false alarm and every miss is born inside this shaded region.
        </p>
      }
    >
      <ChartLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          { label: 'confusable overlap', color: '#b91c1c' },
        ]}
      />
      <DetectionField
        ariaLabel={`Two world densities with their overlap shaded; separation ${separation}, effective noise ${formatFixed(sd, 1)}.`}
        axisLabel="observed value x"
      >
        <BaseFills scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <path
          d={areaPathFromPoints(curvePoints(scale, overlapFn), DETECT_BASELINE)}
          className="fill-false-alarm"
          opacity="0.24"
        />
        <BaseStrokes scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <line
          x1={crossoverX}
          y1={DETECT_TOP}
          x2={crossoverX}
          y2={DETECT_BASELINE}
          className="stroke-false-alarm"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />
        <PeakLabels
          scale={scale}
          h0Mean={h0Mean}
          h1Mean={h1Mean}
          pdfH0={pdfH0}
          pdfH1={pdfH1}
        />
      </DetectionField>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Separation moves the worlds apart; noise widens them; sample count
        sharpens them. Only the overlap produces mistakes.
      </p>
    </SandboxShell>
  )
}

function EvidenceSandbox({ moduleId }: { readonly moduleId: string }) {
  const h0Mean = 40
  const h1Mean = 64
  const sd = 12
  const [observation, setObservation] = useState(56)
  const pdfH0: DensityFn = (value) => normalPdf(value, h0Mean, sd)
  const pdfH1: DensityFn = (value) => normalPdf(value, h1Mean, sd)
  const scale = makeDensityScale([pdfH0, pdfH1])
  const likelihood0 = pdfH0(observation)
  const likelihood1 = pdfH1(observation)
  const ratio = likelihood1 / Math.max(1e-9, likelihood0)
  const logEvidence = gaussianLogLikelihoodRatio(
    observation,
    h0Mean,
    h1Mean,
    sd,
  )
  const obsX = scale.mapX(observation)
  const y0 = scale.yForPdf(likelihood0)
  const y1 = scale.yForPdf(likelihood1)

  return (
    <SandboxShell
      moduleId={moduleId}
      title="Evidence is the ratio of two heights"
      instruction="Move the trace. The two bars are how tall each world's density is at that exact value. Their ratio, not either height alone, is the evidence."
      controls={
        <SliderControl
          label="Observation"
          variable="x"
          value={observation}
          min={16}
          max={88}
          step={1}
          meaning="The single statistic the detector compares across worlds."
          onValueChange={setObservation}
          format={(value) => `x = ${value.toFixed(0)}`}
        />
      }
      readout={
        <div className="grid gap-4 text-sm leading-6 sm:grid-cols-3">
          <p>
            <span className="block font-medium text-h1">Likelihood ratio</span>
            <span className="font-mono">{formatFixed(ratio, 2)}</span>
          </p>
          <p>
            <span className="block font-medium text-accent">Log evidence</span>
            <span className="font-mono">{formatFixed(logEvidence, 2)}</span>
          </p>
          <p>
            <span className="block font-medium text-muted-foreground">
              Leans toward
            </span>
            <span className="font-mono">{ratio >= 1 ? 'H1' : 'H0'}</span>
          </p>
        </div>
      }
    >
      <ChartLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          { label: 'observed trace x', color: '#151515', kind: 'dot' },
        ]}
      />
      <DetectionField
        ariaLabel={`Likelihood heights at x equals ${observation}: ratio ${formatFixed(ratio, 2)}.`}
        axisLabel="observed value x"
      >
        <BaseFills scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <BaseStrokes scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <line
          x1={obsX}
          y1={DETECT_TOP - 6}
          x2={obsX}
          y2={DETECT_BASELINE}
          className="stroke-truth"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={obsX - 6.5}
          y={y0}
          width="5"
          height={DETECT_BASELINE - y0}
          className="fill-h0"
          opacity="0.65"
        />
        <rect
          x={obsX + 1.5}
          y={y1}
          width="5"
          height={DETECT_BASELINE - y1}
          className="fill-h1"
          opacity="0.65"
        />
        <circle cx={obsX} cy={y0} r="3.4" className="fill-h0" />
        <circle cx={obsX} cy={y1} r="3.4" className="fill-h1" />
        <circle
          cx={obsX}
          cy={DETECT_BASELINE}
          r="4"
          className="fill-truth stroke-card"
          strokeWidth="2"
        />
        <PeakLabels
          scale={scale}
          h0Mean={h0Mean}
          h1Mean={h1Mean}
          pdfH0={pdfH0}
          pdfH1={pdfH1}
        />
      </DetectionField>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Taller amber bar means H1 expected this trace more; taller blue bar
        means H0 did. The likelihood ratio is amber height over blue height.
      </p>
    </SandboxShell>
  )
}

function ThresholdTradeoffSandbox({ moduleId }: { readonly moduleId: string }) {
  const h0Mean = 40
  const [separation, setSeparation] = useState(24)
  const [threshold, setThreshold] = useState(52)
  const h1Mean = h0Mean + separation
  const sd = 12
  const pdfH0: DensityFn = (value) => normalPdf(value, h0Mean, sd)
  const pdfH1: DensityFn = (value) => normalPdf(value, h1Mean, sd)
  const scale = makeDensityScale([pdfH0, pdfH1])
  const pFalseAlarm = rightTailFalseAlarm(threshold, h0Mean, sd)
  const pMiss = normalCdf(threshold, h1Mean, sd)
  const gammaX = scale.mapX(threshold)
  const hatchId = `miss-hatch-${moduleId}`

  return (
    <SandboxShell
      moduleId={moduleId}
      title="The threshold trades one mistake for the other"
      instruction="Slide the decision line. Right of it the detector says H1. Watch the red false-alarm area and the hatched miss area trade off: there is no free direction."
      controls={
        <>
          <SliderControl
            label="Decision line"
            variable="gamma"
            value={threshold}
            min={26}
            max={78}
            step={1}
            meaning="Decide H1 when the statistic lands to the right of this line."
            onValueChange={setThreshold}
            format={(value) => `gamma = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Signal separation"
            variable="d"
            value={separation}
            min={12}
            max={36}
            step={1}
            meaning="Greater separation shrinks both mistakes at once."
            onValueChange={setSeparation}
            format={(value) => `d = ${value.toFixed(0)}`}
          />
        </>
      }
      readout={
        <div className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="block font-medium text-false-alarm">
              False alarm
            </span>
            H0 lands right of the line:{' '}
            <span className="font-mono">{formatPercent(pFalseAlarm)}</span>
          </p>
          <p>
            <span className="block font-medium text-h1">Miss</span>
            H1 lands left of the line:{' '}
            <span className="font-mono">{formatPercent(pMiss)}</span>
          </p>
        </div>
      }
    >
      <ChartLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          { label: 'false alarm', color: '#b91c1c' },
          { label: 'miss', color: '#d97706', kind: 'dash' },
          { label: 'decision line', color: '#d97706', kind: 'dash' },
        ]}
      />
      <DetectionField
        ariaLabel={`Decision line at ${threshold}: false alarm ${formatPercent(pFalseAlarm)}, miss ${formatPercent(pMiss)}.`}
        axisLabel="decision statistic"
      >
        <defs>
          <pattern
            id={hatchId}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              className="stroke-h1"
              strokeWidth="1.4"
            />
          </pattern>
        </defs>
        <BaseFills scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <path
          d={areaPathFromPoints(
            regionPoints(scale, pdfH1, 0, threshold),
            DETECT_BASELINE,
          )}
          fill={`url(#${hatchId})`}
          opacity="0.7"
        />
        <path
          d={areaPathFromPoints(
            regionPoints(scale, pdfH0, threshold, 100),
            DETECT_BASELINE,
          )}
          className="fill-false-alarm"
          opacity="0.32"
        />
        <BaseStrokes scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <line
          x1={gammaX}
          y1={DETECT_TOP - 8}
          x2={gammaX}
          y2={DETECT_BASELINE}
          className="stroke-threshold"
          strokeWidth="1.6"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x={gammaX}
          y={DETECT_TOP - 11}
          textAnchor="middle"
          className="fill-threshold font-mono text-[11px] italic"
        >
          {'\u03b3'}
        </text>
        <PeakLabels
          scale={scale}
          h0Mean={h0Mean}
          h1Mean={h1Mean}
          pdfH0={pdfH0}
          pdfH1={pdfH1}
        />
      </DetectionField>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Move the line right to protect H0 from false alarms, and more real H1
        cases slip into the hatched miss region instead.
      </p>
    </SandboxShell>
  )
}

function NeymanPearsonSandbox({ moduleId }: { readonly moduleId: string }) {
  const h0Mean = 40
  const [alpha, setAlpha] = useState(0.1)
  const [separation, setSeparation] = useState(24)
  const h1Mean = h0Mean + separation
  const sd = 12
  const pdfH0: DensityFn = (value) => normalPdf(value, h0Mean, sd)
  const pdfH1: DensityFn = (value) => normalPdf(value, h1Mean, sd)
  const scale = makeDensityScale([pdfH0, pdfH1])
  const gamma = npThresholdRightTail(alpha, h0Mean, sd, normalInvCdf)
  const gammaDraw = Math.min(98, Math.max(2, gamma))
  const pDetection = rightTailDetectionProbability(gamma, h1Mean, sd)
  const gammaX = scale.mapX(gammaDraw)

  return (
    <SandboxShell
      moduleId={moduleId}
      title="Neyman-Pearson spends a fixed false-alarm budget"
      instruction="You do not move the line directly. You promise a false-alarm budget alpha under H0; the line is placed to spend exactly that budget, and detection is whatever is left."
      controls={
        <>
          <SliderControl
            label="False-alarm budget"
            variable="alpha"
            value={alpha}
            min={0.01}
            max={0.3}
            step={0.01}
            meaning="The audited promise: under H0 the detector may call H1 only this often."
            onValueChange={setAlpha}
            format={(value) => formatPercent(value, 0)}
          />
          <SliderControl
            label="Signal separation"
            variable="d"
            value={separation}
            min={12}
            max={36}
            step={1}
            meaning="Stronger signals buy more detection for the same budget."
            onValueChange={setSeparation}
            format={(value) => `d = ${value.toFixed(0)}`}
          />
        </>
      }
      readout={
        <div className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="block font-medium text-threshold">
              Derived line
            </span>
            gamma = <span className="font-mono">{formatFixed(gamma, 1)}</span>
          </p>
          <p>
            <span className="block font-medium text-detection">Detection</span>
            <span className="font-mono">{formatPercent(pDetection)}</span>
          </p>
        </div>
      }
    >
      <ChartLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          { label: 'alpha budget', color: '#b91c1c' },
          { label: 'detection', color: '#047857' },
          { label: 'derived line', color: '#d97706', kind: 'dash' },
        ]}
      />
      <DetectionField
        ariaLabel={`Neyman-Pearson with budget ${formatPercent(alpha, 0)}: derived line ${formatFixed(gamma, 1)}, detection ${formatPercent(pDetection)}.`}
        axisLabel="decision statistic"
      >
        <BaseFills scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <path
          d={areaPathFromPoints(
            regionPoints(scale, pdfH1, gammaDraw, 100),
            DETECT_BASELINE,
          )}
          className="fill-detection"
          opacity="0.26"
        />
        <path
          d={areaPathFromPoints(
            regionPoints(scale, pdfH0, gammaDraw, 100),
            DETECT_BASELINE,
          )}
          className="fill-false-alarm"
          opacity="0.34"
        />
        <BaseStrokes scale={scale} pdfH0={pdfH0} pdfH1={pdfH1} />
        <line
          x1={gammaX}
          y1={DETECT_TOP - 8}
          x2={gammaX}
          y2={DETECT_BASELINE}
          className="stroke-threshold"
          strokeWidth="1.6"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x={gammaX}
          y={DETECT_TOP - 11}
          textAnchor="middle"
          className="fill-threshold font-mono text-[11px] italic"
        >
          {'\u03b3'}({'\u03b1'})
        </text>
        <PeakLabels
          scale={scale}
          h0Mean={h0Mean}
          h1Mean={h1Mean}
          pdfH0={pdfH0}
          pdfH1={pdfH1}
        />
      </DetectionField>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        The red area is locked to alpha. Tighten alpha and the line slides
        right, so the green detection area shrinks with it.
      </p>
    </SandboxShell>
  )
}

function MapBayesSandbox({ moduleId }: { readonly moduleId: string }) {
  const h0Mean = 40
  const h1Mean = 64
  const sd = 12
  const [priorH1, setPriorH1] = useState(0.5)
  const [costRatio, setCostRatio] = useState(1)
  const priorH0 = 1 - priorH1
  const weightedH0: DensityFn = (value) =>
    priorH0 * normalPdf(value, h0Mean, sd)
  const weightedH1: DensityFn = (value) =>
    priorH1 * normalPdf(value, h1Mean, sd)
  const scale = makeDensityScale([weightedH0, weightedH1])
  const boundary = bayesGaussianThreshold({
    h0Mean,
    h1Mean,
    sd,
    priorH1,
    missCost: costRatio,
    falseAlarmCost: 1,
  })
  const boundaryDraw = Math.min(96, Math.max(6, boundary))
  const boundaryX = scale.mapX(boundaryDraw)

  return (
    <SandboxShell
      moduleId={moduleId}
      title="The prior and costs move the boundary"
      instruction="Scale each world by how likely it was and how costly its mistake is. The optimal boundary sits where the two prior-weighted curves cross, and it slides as you change either knob."
      controls={
        <>
          <SliderControl
            label="Prior chance of H1"
            variable="P(H1)"
            value={priorH1}
            min={0.05}
            max={0.95}
            step={0.01}
            meaning="A rarer H1 shrinks its weighted curve and pushes the boundary right."
            onValueChange={setPriorH1}
            format={(value) => formatPercent(value, 0)}
          />
          <SliderControl
            label="Miss vs false-alarm cost"
            variable="c"
            value={costRatio}
            min={0.2}
            max={5}
            step={0.1}
            meaning="When missing H1 is costlier, the boundary moves left to catch it more."
            onValueChange={setCostRatio}
            format={(value) => `${formatFixed(value, 1)}x`}
          />
        </>
      }
      readout={
        <p className="text-base leading-7 text-foreground">
          MAP boundary:{' '}
          <span className="font-mono text-prior">
            {formatFixed(boundary, 1)}
          </span>
          . With equal priors and costs it sits at the midpoint; rarity or cheap
          misses move it from there.
        </p>
      }
    >
      <ChartLegend
        items={[
          { label: 'P(H0) x H0 density', color: '#1e3a8a' },
          { label: 'P(H1) x H1 density', color: '#d97706' },
          { label: 'MAP boundary', color: '#6d28d9', kind: 'dash' },
        ]}
      />
      <DetectionField
        ariaLabel={`Prior-weighted densities with the MAP boundary at ${formatFixed(boundary, 1)}.`}
        axisLabel="observed value x"
      >
        <rect
          x={DETECT_PAD_X}
          y={DETECT_TOP}
          width={Math.max(0, boundaryX - DETECT_PAD_X)}
          height={DETECT_BASELINE - DETECT_TOP}
          className="fill-h0"
          opacity="0.05"
        />
        <rect
          x={boundaryX}
          y={DETECT_TOP}
          width={Math.max(0, DETECT_VIEW_W - DETECT_PAD_X - boundaryX)}
          height={DETECT_BASELINE - DETECT_TOP}
          className="fill-h1"
          opacity="0.05"
        />
        <BaseFills scale={scale} pdfH0={weightedH0} pdfH1={weightedH1} />
        <BaseStrokes scale={scale} pdfH0={weightedH0} pdfH1={weightedH1} />
        <line
          x1={boundaryX}
          y1={DETECT_TOP - 8}
          x2={boundaryX}
          y2={DETECT_BASELINE}
          className="stroke-prior"
          strokeWidth="1.8"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x={boundaryX}
          y={DETECT_TOP - 11}
          textAnchor="middle"
          className="fill-prior font-mono text-[10px]"
        >
          MAP
        </text>
        <text
          x={DETECT_PAD_X + 4}
          y={DETECT_BASELINE - 6}
          className="fill-h0 font-mono text-[9px]"
        >
          decide H0
        </text>
        <text
          x={DETECT_VIEW_W - DETECT_PAD_X - 4}
          y={DETECT_BASELINE - 6}
          textAnchor="end"
          className="fill-h1 font-mono text-[9px]"
        >
          decide H1
        </text>
      </DetectionField>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Lower the prior on H1 and its curve sinks, dragging the crossover right:
        a rare world must clear a higher bar of evidence.
      </p>
    </SandboxShell>
  )
}

function DetectionSandbox({ moduleId }: { readonly moduleId: string }) {
  if (moduleId === 'D1') {
    return <OverlapSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D2') {
    return <EvidenceSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D3') {
    return <ThresholdTradeoffSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D4') {
    return <NeymanPearsonSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D5') {
    return <MapBayesSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D6') {
    return <DopplerSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D7') {
    return <RocSandbox moduleId={moduleId} />
  }

  if (moduleId === 'D8') {
    return <GeometrySandbox moduleId={moduleId} />
  }

  return <ObservationSandbox moduleId={moduleId} />
}

const DOPPLER_VIEW_W = 480
const DOPPLER_VIEW_H = 210
const DOPPLER_REGION_LEFT = 92
const DOPPLER_REGION_RIGHT = 456
const DOPPLER_STATIC_BASELINE = 74
const DOPPLER_SHIFTED_BASELINE = 150
const DOPPLER_AMPLITUDE = 26
const DOPPLER_BASE_CYCLES = 4.5

function DopplerSandbox({ moduleId }: { readonly moduleId: string }) {
  const [shift, setShift] = useState(0.22)
  const h0Score = Math.max(0, 1 - shift * 2.2)
  const h1Score = Math.min(1, 0.28 + shift * 1.9)

  const shiftedCycles = DOPPLER_BASE_CYCLES * (65 / (65 - shift * 35))
  const wavePoints = (
    cycles: number,
    baseline: number,
  ): ReadonlyArray<PlotPoint> =>
    linspace(DOPPLER_REGION_LEFT, DOPPLER_REGION_RIGHT, 260).map((x) => {
      const phase =
        ((x - DOPPLER_REGION_LEFT) /
          (DOPPLER_REGION_RIGHT - DOPPLER_REGION_LEFT)) *
        Math.PI *
        2 *
        cycles
      return { x, y: baseline - DOPPLER_AMPLITUDE * Math.sin(phase) }
    })
  const staticPath = linePath(
    wavePoints(DOPPLER_BASE_CYCLES, DOPPLER_STATIC_BASELINE),
  )
  const shiftedPath = linePath(
    wavePoints(shiftedCycles, DOPPLER_SHIFTED_BASELINE),
  )
  const gridLines = linspace(DOPPLER_REGION_LEFT, DOPPLER_REGION_RIGHT, 9)

  return (
    <SandboxShell
      moduleId={moduleId}
      title="A moving reflector changes the rhythm"
      instruction="The probe does not see blood cells. It receives a rhythm. Movement compresses or stretches the returning crests, then correlation asks which rhythm the echo resembles."
      controls={
        <SliderControl
          label="Doppler shift"
          variable="Delta f"
          value={shift}
          min={0}
          max={0.45}
          step={0.01}
          meaning="More shift means moving cells sound less like the static template."
          onValueChange={setShift}
          format={(value) => formatFixed(value, 2)}
        />
      }
      readout={
        <div className="grid gap-4 text-sm leading-6 sm:grid-cols-2">
          <p>
            <span className="block font-medium text-h0">Sounds like f0</span>
            <span className="font-mono">{formatPercent(h0Score)}</span>
          </p>
          <p>
            <span className="block font-medium text-h1">Sounds like f1</span>
            <span className="font-mono">{formatPercent(h1Score)}</span>
          </p>
        </div>
      }
    >
      <ChartLegend
        items={[
          { label: 'static rhythm (template f0)', color: '#1e3a8a' },
          { label: 'shifted return (echo)', color: '#d97706' },
        ]}
      />
      <figure
        className="w-full overflow-hidden rounded-md border border-border bg-card"
        style={{ height: 300 }}
      >
        <svg
          viewBox={`0 0 ${DOPPLER_VIEW_W} ${DOPPLER_VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Static template rhythm and a Doppler-shifted echo whose frequency rises with a shift of ${formatFixed(shift, 2)}.`}
        >
          <g className="stroke-border" opacity="0.5">
            {gridLines.map((x) => (
              <line
                key={`dg-${x.toFixed(2)}`}
                x1={x}
                y1="36"
                x2={x}
                y2="188"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <line
            x1={DOPPLER_REGION_LEFT}
            y1={DOPPLER_STATIC_BASELINE}
            x2={DOPPLER_REGION_RIGHT}
            y2={DOPPLER_STATIC_BASELINE}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={DOPPLER_REGION_LEFT}
            y1={DOPPLER_SHIFTED_BASELINE}
            x2={DOPPLER_REGION_RIGHT}
            y2={DOPPLER_SHIFTED_BASELINE}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />

          <rect
            x="36"
            y="83"
            width="20"
            height="58"
            rx="4"
            className="fill-primary"
          />
          <text
            x="46"
            y="74"
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            probe
          </text>

          <path
            d={staticPath}
            fill="none"
            className="stroke-h0"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={shiftedPath}
            fill="none"
            className="stroke-h1"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          <text
            x={DOPPLER_REGION_LEFT}
            y={DOPPLER_STATIC_BASELINE - DOPPLER_AMPLITUDE - 8}
            className="fill-h0 font-mono text-[10px]"
          >
            static rhythm
          </text>
          <text
            x={DOPPLER_REGION_LEFT}
            y={DOPPLER_SHIFTED_BASELINE + DOPPLER_AMPLITUDE + 16}
            className="fill-h1 font-mono text-[10px]"
          >
            shifted return
          </text>
        </svg>
      </figure>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Motion compresses the returning wave into a higher frequency.
        Correlation scores how much the echo still resembles the static
        template.
      </p>
    </SandboxShell>
  )
}

function RocSandbox({ moduleId }: { readonly moduleId: string }) {
  const [threshold, setThreshold] = useState(54)
  const reduceMotion = useReducedMotion()
  const pFalseAlarm = rightTailFalseAlarm(threshold, 38, 12)
  const pDetection = rightTailDetectionProbability(threshold, 64, 12)
  const signalSeparation = (64 - 38) / 12
  const rocMarkerLeft = plotXPercent(pFalseAlarm * 100)
  const rocMarkerTop = 7 + ((100 - pDetection * 100) / 120) * 80
  const rocSeries = useMemo<ReadonlyArray<ChartSeries>>(
    () => [
      {
        type: 'line',
        title: 'ROC curve',
        color: '#1e3a8a',
        lineWidth: 3,
        data: linspace(ROC_MIN_FALSE_ALARM, 0.999, ROC_SAMPLE_COUNT).map(
          (falseAlarm) => ({
            time: chartTime(falseAlarm * 100),
            value:
              normalCdf(normalInvCdf(falseAlarm) + signalSeparation, 0, 1) *
              100,
          }),
        ),
      },
      {
        type: 'line',
        title: 'no-information detector',
        color: 'rgba(107, 98, 87, 0.45)',
        lineWidth: 1,
        data: linspace(0, 100, 20).map((x) => ({
          time: chartTime(x),
          value: x,
        })),
      },
    ],
    [signalSeparation],
  )

  return (
    <SandboxShell
      moduleId={moduleId}
      title="One threshold, one operating point"
      instruction="Move the threshold. The density plot changes on the left; the detector's operating point moves on the ROC curve on the right."
      controls={
        <SliderControl
          label="Threshold"
          variable="gamma"
          value={threshold}
          min={12}
          max={88}
          step={1}
          meaning="Strict thresholds move toward low false alarm and low detection."
          onValueChange={setThreshold}
          format={(value) => `gamma = ${value.toFixed(0)}`}
        />
      }
      readout={
        <p className="text-base leading-7 text-foreground">
          Current ROC point: ({formatPercent(pFalseAlarm)},{' '}
          {formatPercent(pDetection)}). The x-axis is false alarm. The y-axis is
          detection.
        </p>
      }
    >
      <div className="relative">
        <ChartLegend
          items={[
            { label: 'ROC curve', color: '#1e3a8a' },
            {
              label: 'no-information baseline',
              color: 'rgba(107, 98, 87, 0.65)',
              kind: 'line',
            },
            { label: 'current threshold', color: '#d97706', kind: 'dot' },
          ]}
        />
        <div className="relative">
          <LessonChart
            series={rocSeries}
            height={300}
            yPrecision={1}
            timeFormatter={formatChartAxisTime}
            ariaLabel="ROC curve plotting detection probability against false alarm probability."
          />
          <m.div
            className="pointer-events-none absolute bottom-8 top-3 z-20 border-l border-dashed"
            style={{ left: `${rocMarkerLeft}%`, borderColor: '#d97706' }}
            transition={
              reduceMotion === true
                ? { duration: 0 }
                : { type: 'spring', stiffness: 180, damping: 26 }
            }
          />
          <m.div
            className="pointer-events-none absolute left-3 right-20 z-20 border-t border-dashed"
            style={{ top: `${rocMarkerTop}%`, borderColor: '#d97706' }}
            transition={
              reduceMotion === true
                ? { duration: 0 }
                : { type: 'spring', stiffness: 180, damping: 26 }
            }
          />
          <m.div
            className="pointer-events-none absolute z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-card bg-threshold shadow-[0_0_0_2px_rgba(217,119,6,0.18)]"
            style={{
              left: `${rocMarkerLeft}%`,
              top: `${rocMarkerTop}%`,
            }}
            transition={
              reduceMotion === true
                ? { duration: 0 }
                : { type: 'spring', stiffness: 180, damping: 26 }
            }
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-9 flex justify-between text-xs text-muted-foreground">
            <span>false alarm probability</span>
            <span>detection probability rises upward</span>
          </div>
        </div>
      </div>
    </SandboxShell>
  )
}

function GeometrySandbox({ moduleId }: { readonly moduleId: string }) {
  const [stretch, setStretch] = useState(2.4)
  const [angle, setAngle] = useState(24)
  const quietScore = 1 / stretch

  const VIEW_W = 430
  const VIEW_H = 260
  const unit = 28
  const centerX = 215
  const centerY = 130
  const gridHalfX = 7
  const gridHalfY = 4
  const phiRad = (angle * Math.PI) / 180
  const cosPhi = Math.cos(phiRad)
  const sinPhi = Math.sin(phiRad)
  const minorRadius = unit
  const majorRadius = stretch * unit
  const project = (localX: number, localY: number) => ({
    x: centerX + localX * cosPhi - localY * sinPhi,
    y: centerY + localX * sinPhi + localY * cosPhi,
  })
  const contourLevels = [0.42, 0.72, 1] as const
  const gridLeft = centerX - gridHalfX * unit
  const gridRight = centerX + gridHalfX * unit
  const gridTop = centerY - gridHalfY * unit
  const gridBottom = centerY + gridHalfY * unit
  const verticalIndices = Array.from(
    { length: gridHalfX * 2 + 1 },
    (_value, index) => index - gridHalfX,
  )
  const horizontalIndices = Array.from(
    { length: gridHalfY * 2 + 1 },
    (_value, index) => index - gridHalfY,
  )
  const xTickValues = [-6, -4, -2, 2, 4, 6]
  const yTickValues = [-4, -2, 2, 4]

  const noisyHalf = majorRadius * 1.12
  const noisyStart = project(-noisyHalf, 0)
  const noisyEnd = project(noisyHalf, 0)
  const noisyLabel = project(noisyHalf + 13, 0)
  const quietHalf = Math.max(minorRadius * 1.55, 46)
  const quietTop = project(0, -quietHalf)
  const quietBottom = project(0, quietHalf)
  const quietLabel = project(0, -quietHalf - 14)

  const arcRadius = 0.72 * unit
  const arcStart = { x: centerX + arcRadius, y: centerY }
  const arcEnd = {
    x: centerX + arcRadius * cosPhi,
    y: centerY + arcRadius * sinPhi,
  }
  const arcSweep = angle >= 0 ? 1 : 0
  const arcMid = phiRad / 2
  const arcLabel = {
    x: centerX + (arcRadius + 12) * Math.cos(arcMid),
    y: centerY + (arcRadius + 12) * Math.sin(arcMid),
  }
  const gradientId = `noise-fill-${moduleId}`
  const arrowId = `noisy-arrow-${moduleId}`

  return (
    <SandboxShell
      moduleId={moduleId}
      title="Noise changes the meaning of distance"
      instruction="Rotate and stretch the noise ellipse. The best codeword separation points through the quiet direction, not necessarily the longest-looking Euclidean gap."
      layout="split"
      controls={
        <>
          <SliderControl
            label="Noise stretch"
            variable="lambda max"
            value={stretch}
            min={1}
            max={4}
            step={0.1}
            meaning="A stretched direction is a noisy direction."
            onValueChange={setStretch}
            format={(value) => formatFixed(value, 1)}
          />
          <SliderControl
            label="Ellipse angle"
            variable="phi"
            value={angle}
            min={-60}
            max={60}
            step={1}
            meaning="Colored noise chooses the geometry."
            onValueChange={setAngle}
            format={(value) => `${value.toFixed(0)} deg`}
          />
        </>
      }
      readout={
        <p className="text-base leading-7 text-foreground">
          Quiet-direction score:{' '}
          <span className="font-mono text-accent">
            {formatFixed(quietScore, 2)}
          </span>
          . After whitening, separation is judged in units of noise.
        </p>
      }
    >
      <ChartLegend
        items={[
          { label: 'noise covariance', color: '#1e3a8a' },
          { label: 'quiet separation direction', color: '#d97706' },
          { label: 'noisy direction', color: '#6b6257', kind: 'dash' },
        ]}
      />
      <figure className="mx-auto aspect-[43/26] w-full max-w-[58rem] overflow-hidden rounded-md border border-border bg-card">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Colored Gaussian noise ellipse stretched by ${formatFixed(stretch, 1)} and rotated ${angle} degrees, with the quiet codeword separation direction along its short axis.`}
        >
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#1e3a8a" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
            </radialGradient>
            <marker
              id={arrowId}
              markerWidth="9"
              markerHeight="9"
              refX="4.2"
              refY="4"
              orient="auto-start-reverse"
            >
              <path d="M1 1 L7.4 4 L1 7 Z" className="fill-muted-foreground" />
            </marker>
          </defs>

          <g className="stroke-border" opacity="0.55">
            {verticalIndices.map((index) => (
              <line
                key={`v-${index}`}
                x1={centerX + index * unit}
                y1={gridTop}
                x2={centerX + index * unit}
                y2={gridBottom}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {horizontalIndices.map((index) => (
              <line
                key={`h-${index}`}
                x1={gridLeft}
                y1={centerY + index * unit}
                x2={gridRight}
                y2={centerY + index * unit}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          <g className="stroke-muted-foreground" opacity="0.85">
            <line
              x1={gridLeft}
              y1={centerY}
              x2={gridRight}
              y2={centerY}
              strokeWidth="1.1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={centerX}
              y1={gridTop}
              x2={centerX}
              y2={gridBottom}
              strokeWidth="1.1"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          {xTickValues.map((value) => (
            <text
              key={`xt-${value}`}
              x={centerX + value * unit}
              y={centerY + 14}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {value}
            </text>
          ))}
          {yTickValues.map((value) => (
            <text
              key={`yt-${value}`}
              x={centerX - 7}
              y={centerY - value * unit + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {value}
            </text>
          ))}

          <g transform={`translate(${centerX} ${centerY}) rotate(${angle})`}>
            <ellipse
              cx="0"
              cy="0"
              rx={majorRadius}
              ry={minorRadius}
              fill={`url(#${gradientId})`}
            />
            {contourLevels.map((level) => (
              <ellipse
                key={`c-${level}`}
                cx="0"
                cy="0"
                rx={majorRadius * level}
                ry={minorRadius * level}
                fill="none"
                className="stroke-primary"
                strokeWidth={level === 1 ? 1.6 : 1}
                opacity={level === 1 ? 0.75 : 0.32}
              />
            ))}
          </g>

          {Math.abs(angle) > 3 ? (
            <>
              <path
                d={`M ${arcStart.x.toFixed(2)} ${arcStart.y.toFixed(2)} A ${arcRadius} ${arcRadius} 0 0 ${arcSweep} ${arcEnd.x.toFixed(2)} ${arcEnd.y.toFixed(2)}`}
                fill="none"
                className="stroke-muted-foreground"
                strokeWidth="1"
                opacity="0.7"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={arcLabel.x}
                y={arcLabel.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px] italic"
              >
                {'\u03c6'}
              </text>
            </>
          ) : null}

          <line
            x1={noisyStart.x}
            y1={noisyStart.y}
            x2={noisyEnd.x}
            y2={noisyEnd.y}
            className="stroke-muted-foreground"
            strokeWidth="1.4"
            strokeDasharray="5 4"
            markerStart={`url(#${arrowId})`}
            markerEnd={`url(#${arrowId})`}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={noisyLabel.x}
            y={noisyLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {'\u03bb'}max
          </text>

          <line
            x1={quietTop.x}
            y1={quietTop.y}
            x2={quietBottom.x}
            y2={quietBottom.y}
            className="stroke-accent"
            strokeWidth="2.4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={quietTop.x}
            cy={quietTop.y}
            r="4.6"
            className="fill-accent stroke-card"
            strokeWidth="2"
          />
          <circle
            cx={quietBottom.x}
            cy={quietBottom.y}
            r="4.6"
            className="fill-accent stroke-card"
            strokeWidth="2"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="3"
            className="fill-primary stroke-card"
            strokeWidth="1.5"
          />
          <text
            x={quietLabel.x}
            y={quietLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-accent font-mono text-[10px]"
          >
            {'\u03bb'}min
          </text>
        </svg>
      </figure>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Concentric contours are the colored-noise covariance. Codewords
        separated along the short ({'\u03bb'}min) axis are easiest to tell
        apart; the long ({'\u03bb'}max) axis only looks larger in raw Euclidean
        distance.
      </p>
    </SandboxShell>
  )
}

type PlotPoint = {
  readonly x: number
  readonly y: number
}

const clampPlotX = (value: number): number =>
  Math.min(
    88,
    Math.max(
      12,
      scaleLinear({
        value,
        domainMin: 12,
        domainMax: 88,
        rangeMin: 12,
        rangeMax: 88,
      }),
    ),
  )

const linePath = (points: ReadonlyArray<PlotPoint>): string =>
  points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${formatFixed(point.x, 3)} ${formatFixed(point.y, 3)}`,
    )
    .join(' ')

const areaPath = (
  points: ReadonlyArray<PlotPoint>,
  baseline: number,
): string => {
  const first = points[0]
  const last = points[points.length - 1]
  if (first === undefined || last === undefined) return ''

  return `${linePath(points)} L ${formatFixed(last.x, 3)} ${baseline} L ${formatFixed(first.x, 3)} ${baseline} Z`
}

function makeEstimationSamples({
  samples,
  noise,
  truth,
  drawRun,
}: {
  readonly samples: number
  readonly noise: number
  readonly truth: number
  readonly drawRun: number
}): ReadonlyArray<number> {
  return Array.from(
    { length: Math.max(1, Math.round(samples)) },
    (_, index) => {
      const phase = drawRun * 0.811 + index * 1.729
      const wave =
        Math.sin(phase) * 0.62 +
        Math.cos(phase * 1.71 + 0.4) * 0.27 +
        Math.sin(phase * 0.43 + 1.8) * 0.11

      return Math.min(88, Math.max(12, truth + wave * noise * 0.78))
    },
  )
}

const mean = (values: ReadonlyArray<number>): number =>
  values.reduce((total, value) => total + value, 0) / Math.max(1, values.length)

type DisplayedEstimationSample = {
  readonly id: number
  readonly x: number
  readonly curveY: number
  readonly finalY: number
}

function EstimationLabels({
  mapX,
  mlX,
  priorStrength,
  priorX,
  truthX,
}: {
  readonly mapX: number
  readonly mlX: number
  readonly priorStrength: number
  readonly priorX: number
  readonly truthX: number
}) {
  return (
    <>
      <span className="absolute left-[13%] top-[7%] z-20 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs font-medium text-estimate">
        sampling model f(x | true theta)
      </span>
      <span className="absolute left-[13%] top-[61%] z-20 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs text-muted-foreground">
        samples land by measured value
      </span>
      <span className="absolute left-[13%] top-[78%] z-20 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs text-muted-foreground">
        standard error band
      </span>
      <span
        className="absolute top-[11%] z-20 -translate-x-1/2 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs font-medium text-truth"
        style={{ left: `${truthX}%` }}
      >
        true theta
      </span>
      <span
        className="absolute top-[88%] z-20 -translate-x-1/2 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs font-medium text-estimate"
        style={{ left: `${mlX}%` }}
      >
        ML mean
      </span>
      {priorStrength > 0 ? (
        <>
          <span
            className="absolute top-[25%] z-20 -translate-x-1/2 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs text-prior"
            style={{ left: `${priorX}%` }}
          >
            prior mean
          </span>
          <span
            className="absolute top-[94%] z-20 -translate-x-1/2 rounded-sm bg-card/95 px-1.5 py-0.5 text-xs font-medium text-prior"
            style={{ left: `${mapX}%` }}
          >
            MAP
          </span>
        </>
      ) : null}
    </>
  )
}

function EstimationSampleDots({
  displayedSamples,
  drawRun,
  reduceMotion,
}: {
  readonly displayedSamples: ReadonlyArray<DisplayedEstimationSample>
  readonly drawRun: number
  readonly reduceMotion: boolean | null
}) {
  return (
    <>
      {displayedSamples.map((sample, index) => (
        <m.span
          key={`${drawRun}-${sample.id}`}
          className="absolute z-30 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-estimate shadow-[0_0_0_1px_rgba(30,58,138,0.28)]"
          style={{ left: `${sample.x}%` }}
          initial={
            reduceMotion === true
              ? false
              : {
                  opacity: 0,
                  top: estimationSvgTop(sample.curveY),
                  scale: 0.8,
                }
          }
          animate={{
            opacity: 0.86,
            top: estimationSvgTop(sample.finalY),
            scale: 1,
          }}
          transition={{
            duration: reduceMotion === true ? 0 : 0.42,
            delay: reduceMotion === true ? 0 : Math.min(1.6, index * 0.045),
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </>
  )
}

function PriorMapHoles({
  mapX,
  priorCurveY,
  priorStrength,
  priorX,
}: {
  readonly mapX: number
  readonly priorCurveY: number
  readonly priorStrength: number
  readonly priorX: number
}) {
  if (priorStrength <= 0) return null

  return (
    <>
      <span
        className="absolute z-30 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card"
        style={{
          ...priorHoleStyle,
          left: `${priorX}%`,
          top: estimationSvgTop(priorCurveY),
        }}
        aria-hidden="true"
      />
      <span
        className="absolute z-30 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card"
        style={{
          ...priorHoleStyle,
          left: `${mapX}%`,
          top: estimationSvgTop(62),
        }}
        aria-hidden="true"
      />
    </>
  )
}

function EstimationGrid() {
  return (
    <g className="stroke-border" opacity="0.65">
      {[24, 36, 48, 60, 72].map((x) => (
        <line
          key={`vertical-${x}`}
          x1={x}
          y1="11"
          x2={x}
          y2="66"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {[20, 36, 49, 62].map((y) => (
        <line
          key={`horizontal-${y}`}
          x1="12"
          y1={y}
          x2="88"
          y2={y}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  )
}

function StandardErrorBand({
  spreadBandWidth,
  spreadLeft,
  spreadRight,
  transition,
}: {
  readonly spreadBandWidth: number
  readonly spreadLeft: number
  readonly spreadRight: number
  readonly transition: Transition
}) {
  return (
    <>
      <m.rect
        x={spreadLeft}
        y="58.5"
        width={spreadBandWidth}
        height="7"
        rx="1.2"
        className="fill-estimate"
        opacity="0.12"
        transition={transition}
      />
      <m.line
        x1={spreadLeft}
        x2={spreadLeft}
        y1="57.5"
        y2="66.5"
        className="stroke-estimate"
        strokeWidth="1.1"
        opacity="0.75"
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={spreadRight}
        x2={spreadRight}
        y1="57.5"
        y2="66.5"
        className="stroke-estimate"
        strokeWidth="1.1"
        opacity="0.75"
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
    </>
  )
}

function PriorMapGuides({
  mapGapBottom,
  mapGapTop,
  mapX,
  priorGapBottom,
  priorGapTop,
  priorStrength,
  priorX,
  transition,
}: {
  readonly mapGapBottom: number
  readonly mapGapTop: number
  readonly mapX: number
  readonly priorGapBottom: number
  readonly priorGapTop: number
  readonly priorStrength: number
  readonly priorX: number
  readonly transition: Transition
}) {
  if (priorStrength <= 0) return null

  return (
    <>
      <m.line
        x1={priorX}
        x2={priorX}
        y1="14"
        y2={priorGapTop}
        className="stroke-prior"
        strokeDasharray="3 4"
        strokeWidth="1.25"
        opacity={0.55 + priorStrength * 0.35}
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={priorX}
        x2={priorX}
        y1={priorGapBottom}
        y2="67"
        className="stroke-prior"
        strokeDasharray="3 4"
        strokeWidth="1.25"
        opacity={0.55 + priorStrength * 0.35}
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={mapX}
        x2={mapX}
        y1="14"
        y2={mapGapTop}
        className="stroke-prior"
        strokeDasharray="3 4"
        strokeWidth="1.25"
        opacity={0.58 + priorStrength * 0.35}
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={mapX}
        x2={mapX}
        y1={mapGapBottom}
        y2="67"
        className="stroke-prior"
        strokeDasharray="3 4"
        strokeWidth="1.25"
        opacity={0.58 + priorStrength * 0.35}
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
    </>
  )
}

function TruthMlGuides({
  mlGuideStart,
  mlMarkerBottom,
  mlMarkerTop,
  mlX,
  transition,
  trueGuideEnd,
  trueMarkerBottom,
  trueMarkerTop,
  truthX,
}: {
  readonly mlGuideStart: number
  readonly mlMarkerBottom: number
  readonly mlMarkerTop: number
  readonly mlX: number
  readonly transition: Transition
  readonly trueGuideEnd: number
  readonly trueMarkerBottom: number
  readonly trueMarkerTop: number
  readonly truthX: number
}) {
  return (
    <>
      <m.line
        x1={truthX}
        x2={truthX}
        y1={trueMarkerBottom}
        y2={trueGuideEnd}
        className="stroke-truth"
        strokeWidth="0.75"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={truthX}
        x2={truthX}
        y1={trueMarkerTop}
        y2={trueMarkerBottom}
        className="stroke-truth"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={mlX}
        x2={mlX}
        y1={mlGuideStart}
        y2={mlMarkerTop}
        className="stroke-estimate"
        strokeWidth="0.75"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
      <m.line
        x1={mlX}
        x2={mlX}
        y1={mlMarkerTop}
        y2={mlMarkerBottom}
        className="stroke-estimate"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transition={transition}
      />
    </>
  )
}

function EstimationInstrument({
  moduleId,
  noise,
  truth,
  ml,
  map,
  spread,
  priorStrength,
  sampleValues,
  drawRun,
}: {
  readonly moduleId: string
  readonly noise: number
  readonly truth: number
  readonly ml: number
  readonly map: number
  readonly spread: number
  readonly priorStrength: number
  readonly sampleValues: ReadonlyArray<number>
  readonly drawRun: number
}) {
  const reduceMotion = useReducedMotion()
  const transition: Transition =
    reduceMotion === true
      ? { duration: 0 }
      : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  const modelBaseline = 36
  const modelSd = Math.max(4.2, noise * 0.62)
  const modelHeight = 20
  const modelYAt = (value: number): number => {
    const z = (value - truth) / modelSd
    return modelBaseline - Math.exp(-0.5 * z * z) * modelHeight
  }
  const curvePoints = linspace(12, 88, 240).map((x) => ({
    x,
    y: modelYAt(x),
  }))
  const prior = 42
  const truthX = clampPlotX(truth)
  const mlX = clampPlotX(ml)
  const priorX = clampPlotX(prior)
  const mapX = clampPlotX(map)
  const trueCurveY = modelYAt(truth)
  const priorCurveY = modelYAt(prior)
  const trueMarkerTop = trueCurveY - 4
  const trueMarkerBottom = trueCurveY + 7
  const trueGuideEnd = 49
  const mlMarkerTop = 57
  const mlMarkerBottom = 67
  const mlGuideStart = 49
  const mapGapTop = 58.8
  const mapGapBottom = 65.2
  const priorGapTop = priorCurveY - 4.5
  const priorGapBottom = priorCurveY + 4.5
  const standardErrorWidth = Math.min(24, Math.max(4, spread * 3.4))
  const spreadLeft = clampPlotX(mlX - standardErrorWidth)
  const spreadRight = clampPlotX(mlX + standardErrorWidth)
  const spreadBandWidth = Math.max(0, spreadRight - spreadLeft)
  const observedSampleY = 49
  const displayedSamples = sampleValues
    .slice(0, Math.min(60, sampleValues.length))
    .map((value, index) => {
      const z = (value - truth) / modelSd
      const curveY = modelBaseline - Math.exp(-0.5 * z * z) * modelHeight
      return {
        id: index,
        x: clampPlotX(value),
        curveY,
        finalY: observedSampleY,
      }
    })
  const gradientId = `estimate-gradient-${moduleId}`

  return (
    <div className="relative mx-auto max-w-4xl py-4">
      <EstimationLabels
        mapX={mapX}
        mlX={mlX}
        priorStrength={priorStrength}
        priorX={priorX}
        truthX={truthX}
      />
      <EstimationSampleDots
        displayedSamples={displayedSamples}
        drawRun={drawRun}
        reduceMotion={reduceMotion}
      />
      <PriorMapHoles
        mapX={mapX}
        priorCurveY={priorCurveY}
        priorStrength={priorStrength}
        priorX={priorX}
      />
      <svg
        viewBox="0 0 100 74"
        className="h-80 w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        aria-label="A labeled estimation animation showing sampled observations, the sampling model, true value, ML estimate, MAP estimate, prior mean, and estimator spread."
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
        </defs>

        <EstimationGrid />

        <line
          x1="12"
          y1={modelBaseline}
          x2="88"
          y2={modelBaseline}
          className="stroke-border"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <m.path
          d={areaPath(curvePoints, modelBaseline)}
          fill={`url(#${gradientId})`}
          transition={transition}
        />
        <m.path
          d={linePath(curvePoints)}
          fill="none"
          className="stroke-estimate"
          strokeWidth="1.9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          transition={transition}
        />

        <line
          x1="12"
          y1="49"
          x2="88"
          y2="49"
          className="stroke-border"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="12"
          y1="62"
          x2="88"
          y2="62"
          className="stroke-border"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <StandardErrorBand
          spreadBandWidth={spreadBandWidth}
          spreadLeft={spreadLeft}
          spreadRight={spreadRight}
          transition={transition}
        />
        <PriorMapGuides
          mapGapBottom={mapGapBottom}
          mapGapTop={mapGapTop}
          mapX={mapX}
          priorGapBottom={priorGapBottom}
          priorGapTop={priorGapTop}
          priorStrength={priorStrength}
          priorX={priorX}
          transition={transition}
        />
        <TruthMlGuides
          mlGuideStart={mlGuideStart}
          mlMarkerBottom={mlMarkerBottom}
          mlMarkerTop={mlMarkerTop}
          mlX={mlX}
          transition={transition}
          trueGuideEnd={trueGuideEnd}
          trueMarkerBottom={trueMarkerBottom}
          trueMarkerTop={trueMarkerTop}
          truthX={truthX}
        />
      </svg>
    </div>
  )
}

function EstimationSandbox({ moduleId }: { readonly moduleId: string }) {
  const [controls, dispatchControls] = useReducer(
    estimationControlsReducer,
    initialEstimationControls,
  )
  const { drawRun, noise, priorStrength, samples } = controls
  const truth = 52
  const prior = 42
  const usesPrior = moduleId === 'E7' || moduleId === 'E6'
  const effectivePriorStrength = usesPrior ? priorStrength : 0
  const sampleValues = useMemo(
    () => makeEstimationSamples({ drawRun, noise, samples, truth }),
    [drawRun, noise, samples, truth],
  )
  const ml = mean(sampleValues)
  const map = ml * (1 - effectivePriorStrength) + prior * effectivePriorStrength
  const spread = noise / Math.sqrt(samples)

  return (
    <SandboxShell
      moduleId={moduleId}
      title={
        moduleId === 'E7'
          ? 'Prior knowledge is a soft measurement'
          : moduleId === 'E8'
            ? 'Learn the model, then detect deviation'
            : 'Repeated estimates form a cloud'
      }
      instruction="Change the amount of data and uncertainty. The important object is not one lucky estimate; it is the behavior of the estimator across repeated experiments."
      controls={
        <>
          <SliderControl
            label="Samples"
            variable="N"
            value={samples}
            min={2}
            max={80}
            step={1}
            meaning="More observations usually tighten the estimate cloud."
            onValueChange={(value) => {
              dispatchControls({ type: 'samples', value })
            }}
            format={(value) => `N = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Noise"
            variable="sigma"
            value={noise}
            min={3}
            max={24}
            step={1}
            meaning="More noise makes each observation less informative."
            onValueChange={(value) => {
              dispatchControls({ type: 'noise', value })
            }}
            format={(value) => `sigma = ${value.toFixed(0)}`}
          />
          {usesPrior ? (
            <SliderControl
              label="Prior pull"
              variable="w"
              value={priorStrength}
              min={0}
              max={0.8}
              step={0.01}
              meaning="A stronger prior pulls MAP away from pure ML."
              onValueChange={(value) => {
                dispatchControls({ type: 'priorStrength', value })
              }}
              format={(value) => formatPercent(value, 0)}
            />
          ) : null}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                dispatchControls({ type: 'drawSamples' })
              }}
            >
              Draw observations
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              Dots fall from the sampling model to their measured positions.
            </p>
          </div>
        </>
      }
      readout={
        <div
          className={cn(
            'grid gap-4 text-sm leading-6',
            usesPrior ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
          )}
        >
          <p>
            <span className="block font-medium text-truth">truth</span>
            <span className="font-mono">{formatFixed(truth, 1)}</span>
          </p>
          <p>
            <span className="block font-medium text-estimate">ML</span>
            <span className="font-mono">{formatFixed(ml, 1)}</span>
          </p>
          {usesPrior ? (
            <p>
              <span className="block font-medium text-prior">MAP</span>
              <span className="font-mono">{formatFixed(map, 1)}</span>
            </p>
          ) : null}
        </div>
      }
    >
      <EstimationInstrument
        moduleId={moduleId}
        noise={noise}
        truth={truth}
        ml={ml}
        map={map}
        spread={spread}
        priorStrength={effectivePriorStrength}
        sampleValues={sampleValues}
        drawRun={drawRun}
      />
    </SandboxShell>
  )
}

function LearningSandbox({ moduleId }: LearningSandboxProps) {
  return (
    <LazyMotion features={domAnimation}>
      {moduleId.startsWith('D') ? (
        <DetectionSandbox moduleId={moduleId} />
      ) : (
        <EstimationSandbox moduleId={moduleId} />
      )}
    </LazyMotion>
  )
}

export { LearningSandbox }
