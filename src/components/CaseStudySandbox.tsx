import { useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  rightTailDetectionProbability,
  rightTailFalseAlarm,
} from '@/domain/math/detection.ts'
import { linspace, normalPdf } from '@/domain/math/distributions.ts'
import {
  areaPathFromPoints,
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'
import { formatFixed, formatPercent } from '@/lib/format.ts'
import { cn } from '@/lib/utils.ts'
import type { CaseStudyRecord } from '@/domain/types.ts'

type CaseStudySandboxProps = {
  readonly caseStudy: CaseStudyRecord
}

type LegendItem = {
  readonly label: string
  readonly color: string
  readonly kind?: 'line' | 'dot' | 'dash' | 'fill'
}

function FigureLegend({
  items,
}: {
  readonly items: ReadonlyArray<LegendItem>
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span
            className={cn(
              'inline-block',
              item.kind === 'dot'
                ? 'h-2.5 w-2.5 rounded-full'
                : item.kind === 'fill'
                  ? 'h-2.5 w-3 rounded-[2px]'
                  : item.kind === 'dash'
                    ? 'h-0 w-5 border-t-2 border-dashed'
                    : 'h-1 w-5 rounded-full',
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

const DETECTOR_VIEW_W = 480
const DETECTOR_VIEW_H = 210
const DETECTOR_PAD_X = 18
const DETECTOR_TOP = 22
const DETECTOR_BASELINE = 172
const DETECTOR_SD = 12

function DetectionCaseSandbox({ caseStudy }: CaseStudySandboxProps) {
  const [threshold, setThreshold] = useState(54)
  const [signal, setSignal] = useState(1.2)
  const h0Mean = 42
  const h1Mean = 42 + 18 * signal
  const sd = DETECTOR_SD
  const pFalseAlarm = rightTailFalseAlarm(threshold, h0Mean, sd)
  const pDetection = rightTailDetectionProbability(threshold, h1Mean, sd)

  const mapX = (value: number): number =>
    scaleLinear({
      value,
      domainMin: 0,
      domainMax: 100,
      rangeMin: DETECTOR_PAD_X,
      rangeMax: DETECTOR_VIEW_W - DETECTOR_PAD_X,
    })
  const peakPdf = normalPdf(h0Mean, h0Mean, sd)
  const plotHeight = DETECTOR_BASELINE - DETECTOR_TOP
  const yForPdf = (pdf: number): number =>
    DETECTOR_BASELINE - (pdf / peakPdf) * plotHeight * 0.9
  const domain = linspace(0, 100, 220)
  const h0Points = domain.map((value) => ({
    x: mapX(value),
    y: yForPdf(normalPdf(value, h0Mean, sd)),
  }))
  const h1Points = domain.map((value) => ({
    x: mapX(value),
    y: yForPdf(normalPdf(value, h1Mean, sd)),
  }))
  const falseAlarmPoints = domain
    .filter((value) => value >= threshold)
    .map((value) => ({
      x: mapX(value),
      y: yForPdf(normalPdf(value, h0Mean, sd)),
    }))
  const detectionPoints = domain
    .filter((value) => value >= threshold)
    .map((value) => ({
      x: mapX(value),
      y: yForPdf(normalPdf(value, h1Mean, sd)),
    }))
  const thresholdX = mapX(threshold)
  const gridValues = [10, 30, 50, 70, 90]

  return (
    <div className="border-y border-border py-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Case sandbox
      </p>
      <p className="mt-2 mb-4 max-w-3xl text-sm leading-6 text-muted-foreground">
        Treat this case as a detector. Move the decision line and predict which
        mistake becomes easier to tolerate.
      </p>
      <FigureLegend
        items={[
          { label: 'world H0 density', color: '#1e3a8a' },
          { label: 'world H1 density', color: '#d97706' },
          { label: 'false alarm', color: '#b91c1c', kind: 'fill' },
          { label: 'detection', color: '#047857', kind: 'fill' },
          { label: 'decision line', color: '#d97706', kind: 'dash' },
        ]}
      />
      <figure
        className="w-full overflow-hidden rounded-md border border-border bg-card"
        style={{ height: 240 }}
      >
        <svg
          viewBox={`0 0 ${DETECTOR_VIEW_W} ${DETECTOR_VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`${caseStudy.title} detector: two hypothesis densities with a decision line at ${threshold}.`}
        >
          <g className="stroke-border" opacity="0.55">
            {gridValues.map((value) => (
              <line
                key={`grid-${value}`}
                x1={mapX(value)}
                y1={DETECTOR_TOP}
                x2={mapX(value)}
                y2={DETECTOR_BASELINE}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          <path
            d={areaPathFromPoints(h0Points, DETECTOR_BASELINE)}
            className="fill-h0"
            opacity="0.08"
          />
          <path
            d={areaPathFromPoints(h1Points, DETECTOR_BASELINE)}
            className="fill-h1"
            opacity="0.08"
          />
          <path
            d={areaPathFromPoints(falseAlarmPoints, DETECTOR_BASELINE)}
            className="fill-false-alarm"
            opacity="0.28"
          />
          <path
            d={areaPathFromPoints(detectionPoints, DETECTOR_BASELINE)}
            className="fill-detection"
            opacity="0.26"
          />

          <path
            d={pathFromPoints(h0Points)}
            fill="none"
            className="stroke-h0"
            strokeWidth="2.2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={pathFromPoints(h1Points)}
            fill="none"
            className="stroke-h1"
            strokeWidth="2.2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          <line
            x1={DETECTOR_PAD_X}
            y1={DETECTOR_BASELINE}
            x2={DETECTOR_VIEW_W - DETECTOR_PAD_X}
            y2={DETECTOR_BASELINE}
            className="stroke-muted-foreground"
            strokeWidth="1.1"
            opacity="0.8"
            vectorEffect="non-scaling-stroke"
          />

          <line
            x1={thresholdX}
            y1={DETECTOR_TOP - 8}
            x2={thresholdX}
            y2={DETECTOR_BASELINE}
            className="stroke-threshold"
            strokeDasharray="5 4"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={thresholdX}
            y={DETECTOR_TOP - 11}
            textAnchor="middle"
            className="fill-threshold font-mono text-[11px] italic"
          >
            {'\u03b3'}
          </text>

          <text
            x={mapX(h0Mean)}
            y={yForPdf(peakPdf) - 7}
            textAnchor="middle"
            className="fill-h0 font-mono text-[12px] font-medium"
          >
            H0
          </text>
          <text
            x={mapX(h1Mean)}
            y={yForPdf(peakPdf) - 7}
            textAnchor="middle"
            className="fill-h1 font-mono text-[12px] font-medium"
          >
            H1
          </text>
          <text
            x={DETECTOR_VIEW_W / 2}
            y={DETECTOR_VIEW_H - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            decision statistic
          </text>
        </svg>
      </figure>
      <div className="mt-5 max-w-3xl space-y-5 border-t border-border pt-5">
        <SliderControl
          label="Decision threshold"
          variable="gamma"
          value={threshold}
          min={20}
          max={82}
          step={1}
          meaning="Higher threshold protects H0 but misses more H1 cases."
          onValueChange={setThreshold}
          format={(value) => value.toFixed(0)}
        />
        <SliderControl
          label="Signal separation"
          variable="d"
          value={signal}
          min={0.4}
          max={2}
          step={0.05}
          meaning="Better separation makes the case easier."
          onValueChange={setSignal}
          format={(value) => formatFixed(value, 2)}
        />
      </div>
      <div className="mt-4 grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
        <p>
          <span className="block font-medium text-false-alarm">
            False alarm
          </span>
          {formatPercent(pFalseAlarm)}
        </p>
        <p>
          <span className="block font-medium text-detection">Detection</span>
          {formatPercent(pDetection)}
        </p>
      </div>
    </div>
  )
}

const ESTIMATOR_VIEW_W = 480
const ESTIMATOR_VIEW_H = 180
const ESTIMATOR_PAD_X = 30
const ESTIMATOR_AXIS_Y = 92

function EstimationCaseSandbox({ caseStudy }: CaseStudySandboxProps) {
  const [samples, setSamples] = useState(10)
  const [priorPull, setPriorPull] = useState(0.25)
  const truth = caseStudy.id.includes('poisson') ? 8 : 52
  const ml = truth + 12 / Math.sqrt(samples)
  const prior = truth - 10
  const map = ml * (1 - priorPull) + prior * priorPull
  const variance = 1 / samples
  const standardError = 12 / Math.sqrt(samples)

  const candidates = [truth, prior, map, ml - standardError, ml + standardError]
  const spread = Math.max(...candidates) - Math.min(...candidates)
  const padding = spread * 0.18 + 4
  const domainMin = Math.min(...candidates) - padding
  const domainMax = Math.max(...candidates) + padding
  const mapX = (value: number): number =>
    scaleLinear({
      value,
      domainMin,
      domainMax,
      rangeMin: ESTIMATOR_PAD_X,
      rangeMax: ESTIMATOR_VIEW_W - ESTIMATOR_PAD_X,
    })
  const ticks = linspace(domainMin, domainMax, 7)
  const bandLeft = mapX(ml - standardError)
  const bandRight = mapX(ml + standardError)
  const mlX = mapX(ml)
  const mapMarkerX = mapX(map)
  const truthX = mapX(truth)
  const priorX = mapX(prior)
  const showPull = Math.abs(mlX - mapMarkerX) > 5

  return (
    <div className="border-y border-border py-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Case sandbox
      </p>
      <p className="mt-2 mb-4 max-w-3xl text-sm leading-6 text-muted-foreground">
        Treat this case as estimation. Add data and change prior pull, then
        watch ML and MAP separate or converge.
      </p>
      <FigureLegend
        items={[
          { label: 'true value', color: '#151515', kind: 'line' },
          { label: 'ML estimate', color: '#1e3a8a', kind: 'dot' },
          { label: 'MAP estimate', color: '#6d28d9', kind: 'fill' },
          { label: 'prior mean', color: '#6d28d9', kind: 'dash' },
        ]}
      />
      <figure
        className="w-full overflow-hidden rounded-md border border-border bg-card"
        style={{ height: 220 }}
      >
        <svg
          viewBox={`0 0 ${ESTIMATOR_VIEW_W} ${ESTIMATOR_VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`${caseStudy.title} estimator: true value, ML and MAP estimates on a parameter axis with a standard-error band.`}
        >
          <rect
            x={bandLeft}
            y={ESTIMATOR_AXIS_Y - 13}
            width={Math.max(0, bandRight - bandLeft)}
            height="26"
            rx="2"
            className="fill-estimate"
            opacity="0.12"
          />

          <line
            x1={ESTIMATOR_PAD_X}
            y1={ESTIMATOR_AXIS_Y}
            x2={ESTIMATOR_VIEW_W - ESTIMATOR_PAD_X}
            y2={ESTIMATOR_AXIS_Y}
            className="stroke-muted-foreground"
            strokeWidth="1.1"
            opacity="0.85"
            vectorEffect="non-scaling-stroke"
          />
          {ticks.map((value) => (
            <g key={`tick-${value.toFixed(3)}`}>
              <line
                x1={mapX(value)}
                y1={ESTIMATOR_AXIS_Y - 4}
                x2={mapX(value)}
                y2={ESTIMATOR_AXIS_Y + 4}
                className="stroke-muted-foreground"
                strokeWidth="1"
                opacity="0.7"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={mapX(value)}
                y={ESTIMATOR_AXIS_Y + 16}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[8px]"
              >
                {formatFixed(value, 0)}
              </text>
            </g>
          ))}

          <line
            x1={priorX}
            y1={ESTIMATOR_AXIS_Y - 32}
            x2={priorX}
            y2={ESTIMATOR_AXIS_Y + 12}
            className="stroke-prior"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={priorX}
            y={ESTIMATOR_AXIS_Y - 36}
            textAnchor="middle"
            className="fill-prior font-mono text-[10px]"
          >
            prior
          </text>

          <line
            x1={truthX}
            y1={ESTIMATOR_AXIS_Y - 26}
            x2={truthX}
            y2={ESTIMATOR_AXIS_Y + 26}
            className="stroke-truth"
            strokeWidth="2.4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={truthX}
            y={ESTIMATOR_AXIS_Y + 42}
            textAnchor="middle"
            className="fill-truth font-mono text-[10px] font-medium"
          >
            truth
          </text>

          {showPull ? (
            <line
              x1={mlX}
              y1={ESTIMATOR_AXIS_Y - 20}
              x2={mapMarkerX}
              y2={ESTIMATOR_AXIS_Y - 20}
              className="stroke-prior"
              strokeWidth="1.2"
              opacity="0.8"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          <rect
            x={mapMarkerX - 4}
            y={ESTIMATOR_AXIS_Y - 4}
            width="8"
            height="8"
            rx="1"
            className="fill-prior stroke-card"
            strokeWidth="1.5"
          />
          <text
            x={mapMarkerX}
            y={ESTIMATOR_AXIS_Y + 30}
            textAnchor="middle"
            className="fill-prior font-mono text-[10px] font-medium"
          >
            MAP
          </text>

          <circle
            cx={mlX}
            cy={ESTIMATOR_AXIS_Y}
            r="5"
            className="fill-estimate stroke-card"
            strokeWidth="2"
          />
          <text
            x={mlX}
            y={ESTIMATOR_AXIS_Y - 24}
            textAnchor="middle"
            className="fill-estimate font-mono text-[10px] font-medium"
          >
            ML
          </text>
        </svg>
      </figure>
      <div className="mt-5 max-w-3xl space-y-5 border-t border-border pt-5">
        <SliderControl
          label="Training observations"
          variable="N"
          value={samples}
          min={2}
          max={80}
          step={1}
          meaning="More observations make the data estimate more stable."
          onValueChange={setSamples}
          format={(value) => value.toFixed(0)}
        />
        <SliderControl
          label="Prior pull"
          variable="w"
          value={priorPull}
          min={0}
          max={0.8}
          step={0.01}
          meaning="A stronger prior matters most when data is scarce."
          onValueChange={setPriorPull}
          format={(value) => formatPercent(value, 0)}
        />
      </div>
      <div className="mt-4 grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
        <p>
          <span className="block font-medium text-estimate">ML</span>
          {formatFixed(ml, 1)}
        </p>
        <p>
          <span className="block font-medium text-prior">MAP</span>
          {formatFixed(map, 1)}
        </p>
        <p>
          <span className="block font-medium text-muted-foreground">
            Variance scale
          </span>
          {formatFixed(variance, 3)}
        </p>
      </div>
    </div>
  )
}

function CaseStudySandbox({ caseStudy }: CaseStudySandboxProps) {
  if (caseStudy.route === 'detection') {
    return <DetectionCaseSandbox caseStudy={caseStudy} />
  }

  return <EstimationCaseSandbox caseStudy={caseStudy} />
}

export { CaseStudySandbox }
