import { useMemo, useState } from 'react'
import { Cable } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { gammaPdf, linspace } from '@/domain/math/distributions.ts'
import {
  gammaScaleLogLikelihoodIgnoringConstant,
  gammaScaleMl,
} from '@/domain/math/estimation.ts'
import { formatFixed } from '@/lib/format.ts'
import {
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'

type PacketQueueProps = {
  readonly moduleId: string
}

function PacketQueue({ moduleId }: PacketQueueProps) {
  const [theta, setTheta] = useState(5)
  const [shape, setShape] = useState(3)
  const [sampleCount, setSampleCount] = useState(12)
  const observedMean = shape * theta * (0.92 + 0.12 * Math.sin(sampleCount))
  const totalDelay = observedMean * sampleCount
  const mlTheta = gammaScaleMl(totalDelay, sampleCount, shape)
  const likelihoodTitle =
    moduleId === 'E4'
      ? 'Choose the least surprising theta'
      : 'Packet-delay likelihood'

  const likelihoodPath = useMemo(() => {
    const candidates = linspace(1, 12, 120)
    const logs = candidates.map((candidate) =>
      gammaScaleLogLikelihoodIgnoringConstant({
        totalDelay,
        sampleCount,
        shape,
        scale: candidate,
      }),
    )
    const maxLog = logs.reduce(
      (max, value) => Math.max(max, value),
      Number.NEGATIVE_INFINITY,
    )
    const minLog = logs.reduce(
      (min, value) => Math.min(min, value),
      Number.POSITIVE_INFINITY,
    )
    const points = candidates.map((candidate, index) => {
      const logValue = logs[index] ?? minLog
      return {
        x: scaleLinear({
          value: candidate,
          domainMin: 1,
          domainMax: 12,
          rangeMin: 6,
          rangeMax: 96,
        }),
        y: scaleLinear({
          value: logValue,
          domainMin: minLog,
          domainMax: maxLog,
          rangeMin: 50,
          rangeMax: 8,
        }),
      }
    })
    return pathFromPoints(points)
  }, [shape, sampleCount, totalDelay])

  const delayPath = useMemo(() => {
    const peakX = Math.max(0.2, (shape - 1) * theta)
    const peak = gammaPdf(peakX, shape, theta)
    const points = linspace(0, 60, 120).map((delay) => ({
      x: scaleLinear({
        value: delay,
        domainMin: 0,
        domainMax: 60,
        rangeMin: 5,
        rangeMax: 96,
      }),
      y: 50 - (gammaPdf(delay, shape, theta) / Math.max(peak, 1e-9)) * 38,
    }))
    return pathFromPoints(points)
  }, [shape, theta])

  const packetDots = Math.min(sampleCount, 18)
  const dots = Array.from({ length: packetDots }, (_item, index) => ({
    x: 12 + index * (76 / Math.max(1, packetDots - 1)),
    y: 21 + 10 * Math.sin(index * 1.7 + theta),
  }))

  return (
    <LabPanel
      eyebrow={moduleId}
      title={likelihoodTitle}
      icon={<Cable className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Hidden scale"
            variable="theta"
            value={theta}
            min={2}
            max={10}
            step={0.5}
            meaning="Higher theta makes packet delays wider and heavier-tailed."
            onValueChange={setTheta}
            format={(value) => formatFixed(value, 1)}
          />
          <SliderControl
            label="Known shape"
            variable="k"
            value={shape}
            min={1}
            max={8}
            step={1}
            meaning="The known gamma shape changes the queue model but is not estimated here."
            onValueChange={setShape}
            format={(value) => value.toFixed(0)}
          />
          <SliderControl
            label="Observed packets"
            variable="N"
            value={sampleCount}
            min={3}
            max={40}
            step={1}
            meaning="More packets make the likelihood curve sharper."
            onValueChange={setSampleCount}
            format={(value) => value.toFixed(0)}
          />
        </>
      }
    >
      <svg
        viewBox="0 0 100 58"
        className="h-52 w-full"
        role="img"
        aria-label={`Packet queue with theta ${formatFixed(theta, 1)} and ML estimate ${formatFixed(mlTheta, 2)}.`}
      >
        <rect
          x="8"
          y="14"
          width="84"
          height="24"
          rx="5"
          className="fill-muted"
          opacity="0.8"
        />
        <line x1="8" y1="42" x2="92" y2="42" className="stroke-border" />
        {dots.map((dot, index) => (
          <circle
            key={`${dot.x}-${index}`}
            cx={dot.x}
            cy={dot.y}
            r="2"
            className={index % 2 === 0 ? 'fill-primary' : 'fill-h1'}
            opacity="0.85"
          />
        ))}
        <text
          x="50"
          y="53"
          textAnchor="middle"
          className="fill-muted-foreground text-[5px]"
        >
          packet queue, observed delays fixed before likelihood is evaluated
        </text>
      </svg>

      <div className="grid gap-4 sm:grid-cols-2">
        <svg
          viewBox="0 0 100 56"
          className="h-40 w-full"
          role="img"
          aria-label="Gamma delay density."
        >
          <line x1="4" y1="50" x2="98" y2="50" className="stroke-border" />
          <path
            d={delayPath}
            className="stroke-primary"
            strokeWidth="1.5"
            fill="none"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="fill-muted-foreground text-[5px]"
          >
            delay density
          </text>
        </svg>
        <svg
          viewBox="0 0 100 56"
          className="h-40 w-full"
          role="img"
          aria-label="Likelihood curve over theta."
        >
          <line x1="6" y1="50" x2="96" y2="50" className="stroke-border" />
          <path
            d={likelihoodPath}
            className="stroke-h1"
            strokeWidth="1.5"
            fill="none"
          />
          <line
            x1={scaleLinear({
              value: mlTheta,
              domainMin: 1,
              domainMax: 12,
              rangeMin: 6,
              rangeMax: 96,
            })}
            y1="8"
            x2={scaleLinear({
              value: mlTheta,
              domainMin: 1,
              domainMax: 12,
              rangeMin: 6,
              rangeMax: 96,
            })}
            y2="50"
            className="stroke-threshold"
            strokeDasharray="2 1.5"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="fill-muted-foreground text-[5px]"
          >
            likelihood over theta
          </text>
        </svg>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricStat
          label="Mean delay"
          value={formatFixed(observedMean, 1)}
          sublabel="sample mean"
          tone="neutral"
        />
        <MetricStat
          label="ML theta"
          value={formatFixed(mlTheta, 2)}
          sublabel="mean divided by k"
          tone="h1"
        />
        <MetricStat
          label="Total delay"
          value={formatFixed(totalDelay, 0)}
          sublabel="sufficient statistic"
          tone="h0"
        />
      </div>
    </LabPanel>
  )
}

export { PacketQueue }
