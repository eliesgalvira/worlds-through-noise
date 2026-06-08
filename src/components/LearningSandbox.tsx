import { useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { BusinessDay, Time } from 'lightweight-charts'
import { Button } from '@/components/ui/button.tsx'
import { LessonChart } from '@/components/LessonChart.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  gaussianLogLikelihoodRatio,
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
import { scaleLinear } from '@/components/interactive/plot-utils.ts'
import type { ChartSeries } from '@/components/LessonChart.tsx'

type LearningSandboxProps = {
  readonly moduleId: string
}

type LegendItem = {
  readonly label: string
  readonly color: string
  readonly kind?: 'line' | 'dot' | 'dash'
}

type DetectionControls = {
  readonly observation: number
  readonly noise: number
  readonly samples: number
  readonly separation: number
  readonly threshold: number
  readonly priorH1: number
}

type DetectionControlAction =
  | { readonly type: 'observation'; readonly value: number }
  | { readonly type: 'noise'; readonly value: number }
  | { readonly type: 'samples'; readonly value: number }
  | { readonly type: 'separation'; readonly value: number }
  | { readonly type: 'threshold'; readonly value: number }
  | { readonly type: 'priorH1'; readonly value: number }

const initialDetectionControls: DetectionControls = {
  observation: 58,
  noise: 13,
  samples: 5,
  separation: 28,
  threshold: 54,
  priorH1: 0.35,
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

function detectionControlsReducer(
  state: DetectionControls,
  action: DetectionControlAction,
): DetectionControls {
  switch (action.type) {
    case 'observation':
      return { ...state, observation: action.value }
    case 'noise':
      return { ...state, noise: action.value }
    case 'samples':
      return { ...state, samples: action.value }
    case 'separation':
      return { ...state, separation: action.value }
    case 'threshold':
      return { ...state, threshold: action.value }
    case 'priorH1':
      return { ...state, priorH1: action.value }
  }
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

function densityChartSeries(
  h0Mean: number,
  h1Mean: number,
  sd: number,
): ReadonlyArray<ChartSeries> {
  const h0Data = linspace(0, VIEW_WIDTH, 180).map((x) => ({
    time: chartTime(x),
    value: normalPdf(x, h0Mean, sd),
  }))
  const h1Data = linspace(0, VIEW_WIDTH, 180).map((x) => ({
    time: chartTime(x),
    value: normalPdf(x, h1Mean, sd),
  }))

  return [
    {
      type: 'area',
      title: 'H0 density',
      color: '#1e3a8a',
      fill: 'rgba(30, 58, 138, 0.14)',
      data: h0Data,
      lineWidth: 3,
      smooth: true,
    },
    {
      type: 'area',
      title: 'H1 density',
      color: '#d97706',
      fill: 'rgba(217, 119, 6, 0.17)',
      data: h1Data,
      lineWidth: 3,
      smooth: true,
    },
  ]
}

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
}: {
  readonly moduleId: string
  readonly title: string
  readonly instruction: string
  readonly children: ReactNode
  readonly controls: ReactNode
  readonly readout?: ReactNode
}) {
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

function EvidenceDensities({
  observation,
  separation,
  sd,
  threshold,
}: {
  readonly observation?: number
  readonly separation: number
  readonly sd: number
  readonly threshold?: number
}) {
  const h0Mean = 50 - separation / 2
  const h1Mean = 50 + separation / 2
  const reduceMotion = useReducedMotion()
  const markerTransition: Transition =
    reduceMotion === true
      ? { duration: 0 }
      : { type: 'spring', stiffness: 180, damping: 26 }
  const series = useMemo(
    () => densityChartSeries(h0Mean, h1Mean, sd),
    [h0Mean, h1Mean, sd],
  )

  return (
    <div className="relative">
      <ChartLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          ...(threshold !== undefined
            ? [
                {
                  label: 'decision threshold',
                  color: '#d97706',
                  kind: 'dash' as const,
                },
              ]
            : []),
          ...(observation !== undefined
            ? [
                {
                  label: 'observed statistic',
                  color: '#151515',
                  kind: 'dash' as const,
                },
              ]
            : []),
        ]}
      />
      <div className="relative">
        <LessonChart
          series={series}
          ariaLabel="Two Gaussian density curves for H0 and H1."
          height={300}
          yPrecision={3}
          timeFormatter={formatChartAxisTime}
        />
        {threshold !== undefined ? (
          <m.div
            className="pointer-events-none absolute bottom-8 top-4 z-20 border-l-2 border-dashed border-threshold"
            style={{
              left: `${plotXPercent(threshold)}%`,
              borderColor: '#d97706',
            }}
            transition={markerTransition}
          />
        ) : null}
        {observation !== undefined ? (
          <>
            <m.div
              className="pointer-events-none absolute bottom-8 top-4 z-20 border-l-2 border-dashed"
              style={{
                left: `${plotXPercent(observation)}%`,
                borderColor: '#151515',
              }}
              transition={markerTransition}
            />
            <m.div
              className="pointer-events-none absolute top-3 z-30 -translate-x-1/2 rounded-sm border border-border bg-card/95 px-2 py-1 font-mono text-xs font-medium text-foreground shadow-sm"
              style={{
                left: `${plotXPercent(observation)}%`,
              }}
              transition={markerTransition}
            >
              x={Math.round(observation)}
            </m.div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function DetectionSandbox({ moduleId }: { readonly moduleId: string }) {
  const [controls, dispatchControls] = useReducer(
    detectionControlsReducer,
    initialDetectionControls,
  )
  const { observation, noise, samples, separation, threshold, priorH1 } =
    controls
  const effectiveSd = noise / Math.sqrt(samples)
  const h0Mean = 50 - separation / 2
  const h1Mean = 50 + separation / 2
  const logEvidence = gaussianLogLikelihoodRatio(
    observation,
    h0Mean,
    h1Mean,
    effectiveSd,
  )
  const pFalseAlarm = rightTailFalseAlarm(threshold, h0Mean, effectiveSd)
  const pDetection = rightTailDetectionProbability(
    threshold,
    h1Mean,
    effectiveSd,
  )
  const overlap = 2 * normalCdf((h0Mean + h1Mean) / 2, h1Mean, effectiveSd)
  const likelyWorld = logEvidence >= 0 ? 'H1' : 'H0'

  if (moduleId === 'D0') {
    return (
      <SandboxShell
        moduleId={moduleId}
        title="Choose before you calculate"
        instruction="Move the trace. The point is not to find certainty; it is to feel that the same trace can be ordinary under both worlds."
        controls={
          <SliderControl
            label="Noisy observation"
            variable="x"
            value={observation}
            min={20}
            max={80}
            step={1}
            meaning="The only thing the detector gets to see."
            onValueChange={(value) => {
              dispatchControls({ type: 'observation', value })
            }}
            format={(value) => `x = ${value.toFixed(0)}`}
          />
        }
        readout={
          <p className="text-base leading-7 text-foreground">
            This trace currently leans toward{' '}
            <span className="font-semibold text-accent">{likelyWorld}</span>,
            but the other world has not become impossible. Noise is the reason a
            decision rule needs error probabilities.
          </p>
        }
      >
        <EvidenceDensities observation={observation} separation={28} sd={12} />
      </SandboxShell>
    )
  }

  if (moduleId === 'D1') {
    return (
      <SandboxShell
        moduleId={moduleId}
        title="Overlap is where mistakes live"
        instruction="Change noise and sample count. Watch the same two worlds become hard or easy without changing their names."
        controls={
          <>
            <SliderControl
              label="World separation"
              variable="d"
              value={separation}
              min={10}
              max={46}
              step={1}
              meaning="More separation means each hidden world leaves a more distinct trace."
              onValueChange={(value) => {
                dispatchControls({ type: 'separation', value })
              }}
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
              onValueChange={(value) => {
                dispatchControls({ type: 'noise', value })
              }}
              format={(value) => `sigma = ${value.toFixed(0)}`}
            />
            <SliderControl
              label="Independent samples"
              variable="N"
              value={samples}
              min={1}
              max={30}
              step={1}
              meaning="More samples sharpen the average evidence."
              onValueChange={(value) => {
                dispatchControls({ type: 'samples', value })
              }}
              format={(value) => `N = ${value.toFixed(0)}`}
            />
          </>
        }
        readout={
          <p className="text-base leading-7 text-foreground">
            Approximate overlap:{' '}
            <span className="font-mono text-accent">
              {formatPercent(Math.min(1, overlap))}
            </span>
            . Higher overlap means more traces can be explained by either world.
          </p>
        }
      >
        <EvidenceDensities separation={separation} sd={effectiveSd} />
      </SandboxShell>
    )
  }

  if (moduleId === 'D2') {
    return (
      <SandboxShell
        moduleId={moduleId}
        title="Evidence is a comparison, not a height"
        instruction="Move x. Do not ask whether one curve is high; ask which curve expected this exact trace more."
        controls={
          <SliderControl
            label="Observation"
            variable="x"
            value={observation}
            min={18}
            max={82}
            step={1}
            meaning="The dark annotated rule is the observed statistic."
            onValueChange={(value) => {
              dispatchControls({ type: 'observation', value })
            }}
            format={(value) => `x = ${value.toFixed(0)}`}
          />
        }
        readout={
          <div className="space-y-3">
            <p className="text-base leading-7 text-foreground">
              Log evidence:{' '}
              <span className="font-mono text-accent">
                {formatFixed(logEvidence, 2)}
              </span>
              . Positive values lean H1; negative values lean H0.
            </p>
            <div className="relative h-6 border-y border-border">
              <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-h0">
                H0
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-h1">
                H1
              </span>
              <span
                className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 bg-foreground"
                style={{
                  left: `${scaleLinear({
                    value: Math.tanh(logEvidence / 4),
                    domainMin: -1,
                    domainMax: 1,
                    rangeMin: 8,
                    rangeMax: 92,
                  })}%`,
                }}
              />
            </div>
          </div>
        }
      >
        <EvidenceDensities observation={observation} separation={32} sd={11} />
      </SandboxShell>
    )
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

  return (
    <SandboxShell
      moduleId={moduleId}
      title={
        moduleId === 'D5'
          ? 'Priors and costs move the line'
          : 'The threshold turns evidence into action'
      }
      instruction={
        moduleId === 'D4'
          ? 'Pretend alpha is a public promise. Move the threshold until H0 is only accused at the rate you can defend.'
          : 'Move the line and watch both mistakes change. There is no free direction.'
      }
      controls={
        <>
          <SliderControl
            label="Threshold"
            variable="gamma"
            value={threshold}
            min={25}
            max={75}
            step={1}
            meaning="Decide H1 when the statistic lands to the right."
            onValueChange={(value) => {
              dispatchControls({ type: 'threshold', value })
            }}
            format={(value) => `gamma = ${value.toFixed(0)}`}
          />
          {moduleId === 'D5' ? (
            <SliderControl
              label="Prior chance of H1"
              variable="P(H1)"
              value={priorH1}
              min={0.05}
              max={0.95}
              step={0.01}
              meaning="A rarer H1 needs stronger evidence unless the cost of missing it is high."
              onValueChange={(value) => {
                dispatchControls({ type: 'priorH1', value })
              }}
              format={(value) => formatPercent(value, 0)}
            />
          ) : null}
        </>
      }
      readout={
        <div className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="block font-medium text-false-alarm">
              False alarm
            </span>
            H0 crosses the line:{' '}
            <span className="font-mono">{formatPercent(pFalseAlarm)}</span>
          </p>
          <p>
            <span className="block font-medium text-detection">Detection</span>
            H1 crosses the line:{' '}
            <span className="font-mono">{formatPercent(pDetection)}</span>
          </p>
        </div>
      }
    >
      <EvidenceDensities
        separation={separation}
        sd={effectiveSd}
        threshold={threshold}
      />
    </SandboxShell>
  )
}

function DopplerSandbox({ moduleId }: { readonly moduleId: string }) {
  const [shift, setShift] = useState(0.22)
  const crests = linspace(0, 1, 13)
  const h0Score = Math.max(0, 1 - shift * 2.2)
  const h1Score = Math.min(1, 0.28 + shift * 1.9)

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
      <svg
        viewBox="0 0 100 58"
        className="h-72 w-full"
        role="img"
        aria-label="Doppler wave crests returning from static and moving reflectors."
      >
        <text x="5" y="10" className="fill-muted-foreground text-[5px]">
          probe
        </text>
        <rect
          x="6"
          y="18"
          width="8"
          height="22"
          rx="1.5"
          className="fill-primary"
        />
        {crests.map((t) => (
          <line
            key={`h0-${t}`}
            x1={22 + t * 65}
            y1="16"
            x2={22 + t * 65}
            y2="28"
            className="stroke-h0"
            strokeWidth="1"
            opacity="0.35"
          />
        ))}
        {crests.map((t) => (
          <line
            key={`h1-${t}`}
            x1={22 + t * (65 - shift * 35)}
            y1="34"
            x2={22 + t * (65 - shift * 35)}
            y2="48"
            className="stroke-h1"
            strokeWidth="1.2"
            opacity="0.65"
          />
        ))}
        <text x="22" y="14" className="fill-h0 text-[5px]">
          static rhythm
        </text>
        <text x="22" y="55" className="fill-h1 text-[5px]">
          shifted return
        </text>
      </svg>
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

  return (
    <SandboxShell
      moduleId={moduleId}
      title="Noise changes the meaning of distance"
      instruction="Rotate and stretch the noise ellipse. The best codeword separation points through the quiet direction, not necessarily the longest-looking Euclidean gap."
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
      <svg
        viewBox="0 0 100 70"
        className="h-72 w-full"
        role="img"
        aria-label="Colored Gaussian noise ellipse and quiet codeword direction."
      >
        <g transform={`translate(50 35) rotate(${angle})`}>
          <ellipse
            cx="0"
            cy="0"
            rx={14 * stretch}
            ry="14"
            className="fill-primary"
            opacity="0.1"
          />
          <ellipse
            cx="0"
            cy="0"
            rx={14 * stretch}
            ry="14"
            className="stroke-primary"
            strokeWidth="1.2"
            fill="none"
          />
          <line
            x1="0"
            y1="-24"
            x2="0"
            y2="24"
            className="stroke-accent"
            strokeWidth="1.8"
          />
          <circle cx="0" cy="-24" r="2.6" className="fill-accent" />
          <circle cx="0" cy="24" r="2.6" className="fill-accent" />
        </g>
        <text
          x="50"
          y="67"
          textAnchor="middle"
          className="fill-muted-foreground text-[5px]"
        >
          orange direction: quieter separation after whitening
        </text>
      </svg>
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
