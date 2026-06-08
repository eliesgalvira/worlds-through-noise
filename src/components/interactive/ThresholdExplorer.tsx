import { useId, useMemo, useReducer } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  bayesGaussianThreshold,
  rightTailDetectionProbability,
  rightTailFalseAlarm,
} from '@/domain/math/detection.ts'
import {
  linspace,
  normalInvCdf,
  normalPdf,
} from '@/domain/math/distributions.ts'
import { formatFixed, formatPercent } from '@/lib/format.ts'
import {
  areaPathFromPoints,
  pathFromPoints,
} from '@/components/interactive/plot-utils.ts'

const VIEW_WIDTH = 100
const VIEW_HEIGHT = 64
const BASELINE = 55
const H0_MEAN = 40
const H1_MEAN = 64
const SD = 12

type ThresholdExplorerProps = {
  readonly moduleId: string
}

type ThresholdState = {
  readonly threshold: number
  readonly alpha: number
  readonly priorH1: number
  readonly missCost: number
  readonly falseAlarmCost: number
}

type ThresholdAction =
  | { readonly type: 'threshold'; readonly value: number }
  | { readonly type: 'alpha'; readonly value: number }
  | { readonly type: 'priorH1'; readonly value: number }
  | { readonly type: 'missCost'; readonly value: number }
  | { readonly type: 'falseAlarmCost'; readonly value: number }

const INITIAL_THRESHOLD_STATE: ThresholdState = {
  threshold: 53,
  alpha: 0.1,
  priorH1: 0.35,
  missCost: 4,
  falseAlarmCost: 1,
}

function thresholdReducer(
  state: ThresholdState,
  action: ThresholdAction,
): ThresholdState {
  switch (action.type) {
    case 'threshold':
      return { ...state, threshold: action.value }
    case 'alpha':
      return { ...state, alpha: action.value }
    case 'priorH1':
      return { ...state, priorH1: action.value }
    case 'missCost':
      return { ...state, missCost: action.value }
    case 'falseAlarmCost':
      return { ...state, falseAlarmCost: action.value }
  }
}

function densityPaths(mean: number): {
  readonly stroke: string
  readonly area: string
} {
  const peak = normalPdf(mean, mean, SD)
  const points = linspace(0, VIEW_WIDTH, 120).map((x) => ({
    x,
    y: BASELINE - (normalPdf(x, mean, SD) / peak) * 40,
  }))
  return {
    stroke: pathFromPoints(points),
    area: areaPathFromPoints(points, BASELINE),
  }
}

function ThresholdExplorer({ moduleId }: ThresholdExplorerProps) {
  const [state, dispatch] = useReducer(
    thresholdReducer,
    INITIAL_THRESHOLD_STATE,
  )
  const clipId = useId()

  const pFalseAlarm = rightTailFalseAlarm(state.threshold, H0_MEAN, SD)
  const pDetection = rightTailDetectionProbability(state.threshold, H1_MEAN, SD)
  const npThreshold = H0_MEAN + SD * normalInvCdf(1 - state.alpha)
  const mapThreshold = bayesGaussianThreshold({
    h0Mean: H0_MEAN,
    h1Mean: H1_MEAN,
    sd: SD,
    priorH1: state.priorH1,
    missCost: state.missCost,
    falseAlarmCost: state.falseAlarmCost,
  })

  const paths = useMemo(
    () => ({
      h0: densityPaths(H0_MEAN),
      h1: densityPaths(H1_MEAN),
    }),
    [],
  )

  const title =
    moduleId === 'D5'
      ? 'Priors, costs, and the threshold'
      : 'Threshold tradeoff'

  return (
    <LabPanel
      eyebrow={moduleId}
      title={title}
      icon={<SlidersHorizontal className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Decision threshold"
            variable="gamma"
            value={state.threshold}
            min={10}
            max={90}
            step={1}
            meaning="Decide H1 when the statistic lands to the right of this line."
            onValueChange={(value) => {
              dispatch({ type: 'threshold', value })
            }}
            format={(value) => `gamma = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="False-alarm budget"
            variable="alpha"
            value={state.alpha}
            min={0.01}
            max={0.4}
            step={0.01}
            meaning="Neyman-Pearson chooses a threshold that spends this H0 budget."
            onValueChange={(value) => {
              dispatch({ type: 'alpha', value })
            }}
            format={(value) => formatPercent(value, 0)}
          />
          <SliderControl
            label="Prior probability of H1"
            variable="P(H1)"
            value={state.priorH1}
            min={0.05}
            max={0.95}
            step={0.01}
            meaning="MAP shifts toward the hidden world that was plausible before observing data."
            onValueChange={(value) => {
              dispatch({ type: 'priorH1', value })
            }}
            format={(value) => formatPercent(value, 0)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SliderControl
              label="Miss cost"
              variable="C_M"
              value={state.missCost}
              min={1}
              max={10}
              step={1}
              meaning="Higher miss cost makes the detector more willing to call H1."
              onValueChange={(value) => {
                dispatch({ type: 'missCost', value })
              }}
              format={(value) => value.toFixed(0)}
            />
            <SliderControl
              label="False-alarm cost"
              variable="C_FA"
              value={state.falseAlarmCost}
              min={1}
              max={10}
              step={1}
              meaning="Higher false-alarm cost makes the detector demand stronger evidence."
              onValueChange={(value) => {
                dispatch({ type: 'falseAlarmCost', value })
              }}
              format={(value) => value.toFixed(0)}
            />
          </div>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-56 w-full"
        role="img"
        aria-label={`Threshold plot with false alarm ${formatPercent(pFalseAlarm)} and detection ${formatPercent(pDetection)}.`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={state.threshold}
              y="0"
              width={Math.max(0, VIEW_WIDTH - state.threshold)}
              height={VIEW_HEIGHT}
            />
          </clipPath>
        </defs>
        <line
          x1="0"
          y1={BASELINE}
          x2={VIEW_WIDTH}
          y2={BASELINE}
          className="stroke-border"
          strokeWidth="0.6"
        />
        <path
          d={paths.h0.area}
          className="fill-false-alarm"
          opacity="0.2"
          clipPath={`url(#${clipId})`}
        />
        <path
          d={paths.h1.area}
          className="fill-detection"
          opacity="0.24"
          clipPath={`url(#${clipId})`}
        />
        <path
          d={paths.h0.stroke}
          className="stroke-h0"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d={paths.h1.stroke}
          className="stroke-h1"
          strokeWidth="1.4"
          fill="none"
        />
        <line
          x1={state.threshold}
          y1="7"
          x2={state.threshold}
          y2={BASELINE}
          className="stroke-threshold"
          strokeWidth="1.3"
          strokeDasharray="2 1.5"
        />
        <circle
          cx={state.threshold}
          cy="7"
          r="2.2"
          className="fill-threshold"
        />
        <line
          x1={npThreshold}
          y1="12"
          x2={npThreshold}
          y2={BASELINE}
          className="stroke-primary"
          strokeWidth="0.8"
        />
        <line
          x1={mapThreshold}
          y1="16"
          x2={mapThreshold}
          y2={BASELINE}
          className="stroke-prior"
          strokeWidth="0.8"
          strokeDasharray="3 2"
        />
        <text
          x={H0_MEAN}
          y="61"
          textAnchor="middle"
          className="fill-h0 text-[5px]"
        >
          H0 circle
        </text>
        <text
          x={H1_MEAN}
          y="61"
          textAnchor="middle"
          className="fill-h1 text-[5px]"
        >
          H1 triangle
        </text>
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricStat
          label="False alarm"
          value={formatPercent(pFalseAlarm)}
          sublabel="H0 called H1"
          tone="falseAlarm"
        />
        <MetricStat
          label="Detection"
          value={formatPercent(pDetection)}
          sublabel="H1 called H1"
          tone="detection"
        />
        <MetricStat
          label="NP gamma"
          value={formatFixed(npThreshold, 1)}
          sublabel={`alpha ${formatPercent(state.alpha, 0)}`}
          tone="h0"
        />
        <MetricStat
          label="MAP gamma"
          value={formatFixed(mapThreshold, 1)}
          sublabel="prior and costs"
          tone="h1"
        />
      </div>
    </LabPanel>
  )
}

export { ThresholdExplorer }
