import { useMemo, useState } from 'react'
import { LineChart } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  rightTailDetectionProbability,
  rightTailFalseAlarm,
} from '@/domain/math/detection.ts'
import { linspace, normalPdf } from '@/domain/math/distributions.ts'
import { formatPercent } from '@/lib/format.ts'
import {
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'

const H0_MEAN = 40
const H1_MEAN = 64
const SD = 12

function RocExplorer() {
  const [threshold, setThreshold] = useState(53)
  const pFalseAlarm = rightTailFalseAlarm(threshold, H0_MEAN, SD)
  const pDetection = rightTailDetectionProbability(threshold, H1_MEAN, SD)

  const rocPath = useMemo(() => {
    const points = linspace(0, 100, 120).map((gamma) => ({
      x: scaleLinear({
        value: rightTailFalseAlarm(gamma, H0_MEAN, SD),
        domainMin: 0,
        domainMax: 1,
        rangeMin: 12,
        rangeMax: 92,
      }),
      y: scaleLinear({
        value: rightTailDetectionProbability(gamma, H1_MEAN, SD),
        domainMin: 0,
        domainMax: 1,
        rangeMin: 88,
        rangeMax: 10,
      }),
    }))
    return pathFromPoints(points)
  }, [])

  const densityPath = useMemo(() => {
    const peak = normalPdf(H1_MEAN, H1_MEAN, SD)
    const h0 = linspace(0, 100, 100).map((x) => ({
      x,
      y: 48 - (normalPdf(x, H0_MEAN, SD) / peak) * 34,
    }))
    const h1 = linspace(0, 100, 100).map((x) => ({
      x,
      y: 48 - (normalPdf(x, H1_MEAN, SD) / peak) * 34,
    }))
    return {
      h0: pathFromPoints(h0),
      h1: pathFromPoints(h1),
    }
  }, [])

  const pointX = scaleLinear({
    value: pFalseAlarm,
    domainMin: 0,
    domainMax: 1,
    rangeMin: 12,
    rangeMax: 92,
  })
  const pointY = scaleLinear({
    value: pDetection,
    domainMin: 0,
    domainMax: 1,
    rangeMin: 88,
    rangeMax: 10,
  })

  return (
    <LabPanel
      eyebrow="D7"
      title="Threshold sweep to ROC"
      icon={<LineChart className="h-5 w-5" />}
      controls={
        <SliderControl
          label="Threshold"
          variable="gamma"
          value={threshold}
          min={5}
          max={95}
          step={1}
          meaning="One threshold chooses one point on the ROC curve."
          onValueChange={setThreshold}
          format={(value) => `gamma = ${value.toFixed(0)}`}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <svg
          viewBox="0 0 100 100"
          className="h-56 w-full"
          role="img"
          aria-label={`ROC curve with false alarm ${formatPercent(pFalseAlarm)} and detection ${formatPercent(pDetection)}.`}
        >
          <line x1="12" y1="88" x2="92" y2="88" className="stroke-border" />
          <line x1="12" y1="88" x2="12" y2="10" className="stroke-border" />
          <line
            x1="12"
            y1="88"
            x2="92"
            y2="10"
            className="stroke-muted-foreground"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d={rocPath}
            className="stroke-primary"
            strokeWidth="1.8"
            fill="none"
          />
          <circle cx={pointX} cy={pointY} r="3" className="fill-threshold" />
          <text
            x="54"
            y="96"
            textAnchor="middle"
            className="fill-muted-foreground text-[5px]"
          >
            P_FA
          </text>
          <text
            x="5"
            y="48"
            textAnchor="middle"
            className="fill-muted-foreground text-[5px]"
          >
            P_D
          </text>
        </svg>
        <svg
          viewBox="0 0 100 56"
          className="h-56 w-full"
          role="img"
          aria-label="Same threshold drawn over the H0 and H1 densities."
        >
          <line x1="0" y1="48" x2="100" y2="48" className="stroke-border" />
          <path
            d={densityPath.h0}
            className="stroke-h0"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d={densityPath.h1}
            className="stroke-h1"
            strokeWidth="1.4"
            fill="none"
          />
          <line
            x1={threshold}
            y1="5"
            x2={threshold}
            y2="48"
            className="stroke-threshold"
            strokeWidth="1.3"
            strokeDasharray="2 1.5"
          />
          <text
            x="25"
            y="54"
            textAnchor="middle"
            className="fill-h0 text-[5px]"
          >
            H0
          </text>
          <text
            x="74"
            y="54"
            textAnchor="middle"
            className="fill-h1 text-[5px]"
          >
            H1
          </text>
        </svg>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricStat
          label="ROC x"
          value={formatPercent(pFalseAlarm)}
          sublabel="false alarm probability"
          tone="falseAlarm"
        />
        <MetricStat
          label="ROC y"
          value={formatPercent(pDetection)}
          sublabel="detection probability"
          tone="detection"
        />
      </div>
    </LabPanel>
  )
}

export { RocExplorer }
