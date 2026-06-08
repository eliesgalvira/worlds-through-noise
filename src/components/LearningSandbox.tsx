import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { BusinessDay, Time } from 'lightweight-charts'
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
import { scaleLinear } from '@/components/interactive/plot-utils.ts'
import type { ChartSeries } from '@/components/LessonChart.tsx'

type LearningSandboxProps = {
  readonly moduleId: string
}

const VIEW_WIDTH = 100
const CHART_BASE_YEAR = 2020

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
    },
    {
      type: 'area',
      title: 'H1 density',
      color: '#d97706',
      fill: 'rgba(217, 119, 6, 0.17)',
      data: h1Data,
      lineWidth: 3,
    },
  ]
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
      className="scroll-mt-24 rounded-lg border bg-card/80 p-5 sm:p-6"
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
      <LessonChart
        series={series}
        ariaLabel="Two Gaussian density curves for H0 and H1."
        height={300}
        timeFormatter={formatChartAxisTime}
      />
      <div className="pointer-events-none absolute inset-x-3 bottom-9 flex justify-between text-xs text-muted-foreground">
        <span className="text-h0">H0 density</span>
        <span className="text-h1">H1 density</span>
      </div>
      {threshold !== undefined ? (
        <>
          <motion.div
            className="pointer-events-none absolute bottom-11 top-5 border-l-2 border-dashed border-threshold"
            style={{ left: `${threshold}%` }}
            transition={markerTransition}
          />
          <motion.div
            className="pointer-events-none absolute top-4 h-3 w-3 -translate-x-1/2 rounded-full bg-threshold"
            style={{ left: `${threshold}%` }}
            transition={markerTransition}
          />
        </>
      ) : null}
      {observation !== undefined ? (
        <>
          <motion.div
            className="pointer-events-none absolute bottom-11 top-5 border-l-2 border-dashed border-foreground"
            style={{ left: `${observation}%` }}
            transition={markerTransition}
          />
          <motion.div
            className="pointer-events-none absolute top-4 h-3 w-3 -translate-x-1/2 bg-foreground"
            style={{ left: `${observation}%` }}
            transition={markerTransition}
          />
        </>
      ) : null}
    </div>
  )
}

function DetectionSandbox({ moduleId }: { readonly moduleId: string }) {
  const [observation, setObservation] = useState(58)
  const [noise, setNoise] = useState(13)
  const [samples, setSamples] = useState(5)
  const [separation, setSeparation] = useState(28)
  const [threshold, setThreshold] = useState(54)
  const [priorH1, setPriorH1] = useState(0.35)
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
            onValueChange={setObservation}
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
              meaning="More samples sharpen the average evidence."
              onValueChange={setSamples}
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
            meaning="The black marker is the observed statistic."
            onValueChange={setObservation}
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
            onValueChange={setThreshold}
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
              onValueChange={setPriorH1}
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
  const rocSeries = useMemo<ReadonlyArray<ChartSeries>>(
    () => [
      {
        type: 'area',
        title: 'ROC curve',
        color: '#1e3a8a',
        fill: 'rgba(30, 58, 138, 0.12)',
        lineWidth: 3,
        data: linspace(0.001, 0.999, 180).map((falseAlarm) => {
          const gamma = 38 + 12 * normalInvCdf(1 - falseAlarm)
          return {
            time: chartTime(falseAlarm * 100),
            value: rightTailDetectionProbability(gamma, 64, 12) * 100,
          }
        }),
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
    [],
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
        <LessonChart
          series={rocSeries}
          height={300}
          timeFormatter={formatChartAxisTime}
          ariaLabel="ROC curve plotting detection probability against false alarm probability."
        />
        <motion.div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-threshold ring-2 ring-card"
          style={{
            left: `${12 + pFalseAlarm * 76}%`,
            top: `${82 - pDetection * 66}%`,
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

function EstimationSandbox({ moduleId }: { readonly moduleId: string }) {
  const [samples, setSamples] = useState(12)
  const [noise, setNoise] = useState(10)
  const [priorStrength, setPriorStrength] = useState(0.35)
  const truth = 52
  const ml = truth + 18 / Math.sqrt(samples) - noise * 0.12
  const map = ml * (1 - priorStrength) + 42 * priorStrength
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
            onValueChange={setSamples}
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
            onValueChange={setNoise}
            format={(value) => `sigma = ${value.toFixed(0)}`}
          />
          {moduleId === 'E7' || moduleId === 'E6' ? (
            <SliderControl
              label="Prior pull"
              variable="w"
              value={priorStrength}
              min={0}
              max={0.8}
              step={0.01}
              meaning="A stronger prior pulls MAP away from pure ML."
              onValueChange={setPriorStrength}
              format={(value) => formatPercent(value, 0)}
            />
          ) : null}
        </>
      }
      readout={
        <div className="grid gap-4 text-sm leading-6 sm:grid-cols-3">
          <p>
            <span className="block font-medium text-truth">truth</span>
            <span className="font-mono">{formatFixed(truth, 1)}</span>
          </p>
          <p>
            <span className="block font-medium text-estimate">ML</span>
            <span className="font-mono">{formatFixed(ml, 1)}</span>
          </p>
          <p>
            <span className="block font-medium text-prior">MAP</span>
            <span className="font-mono">{formatFixed(map, 1)}</span>
          </p>
        </div>
      }
    >
      <svg
        viewBox="0 0 100 58"
        className="h-72 w-full"
        role="img"
        aria-label="Estimator cloud tightening around a hidden truth."
      >
        <line x1="8" y1="34" x2="92" y2="34" className="stroke-border" />
        <line
          x1={truth}
          y1="12"
          x2={truth}
          y2="46"
          className="stroke-truth"
          strokeWidth="1.5"
        />
        <line
          x1={ml}
          y1="18"
          x2={ml}
          y2="40"
          className="stroke-estimate"
          strokeWidth="1.5"
        />
        <line
          x1={map}
          y1="22"
          x2={map}
          y2="44"
          className="stroke-prior"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        {linspace(-2.5, 2.5, 17).map((offset, index) => (
          <circle
            key={offset}
            cx={ml + offset * spread}
            cy={23 + (index % 5) * 5}
            r="1.6"
            className="fill-estimate"
            opacity="0.45"
          />
        ))}
        <text
          x={truth}
          y="10"
          textAnchor="middle"
          className="fill-truth text-[5px]"
        >
          true value
        </text>
        <text
          x={ml}
          y="53"
          textAnchor="middle"
          className="fill-estimate text-[5px]"
        >
          estimate cloud
        </text>
      </svg>
    </SandboxShell>
  )
}

function LearningSandbox({ moduleId }: LearningSandboxProps) {
  if (moduleId.startsWith('D')) {
    return <DetectionSandbox moduleId={moduleId} />
  }

  return <EstimationSandbox moduleId={moduleId} />
}

export { LearningSandbox }
