import { useId, useMemo, useState } from 'react'
import { MoveHorizontal, Scale } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  gaussianLikelihoodRatio,
  gaussianLogLikelihoodRatio,
} from '@/domain/math/detection.ts'
import { linspace, normalPdf } from '@/domain/math/distributions.ts'
import { formatFixed } from '@/lib/format.ts'
import {
  areaPathFromPoints,
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'

const VIEW_WIDTH = 100
const VIEW_HEIGHT = 62
const BASELINE = 54

type LikelihoodPlaygroundProps = {
  readonly moduleId: string
}

function densityPath(
  mean: number,
  sd: number,
): {
  readonly stroke: string
  readonly area: string
} {
  const peak = normalPdf(mean, mean, sd)
  const points = linspace(0, VIEW_WIDTH, 120).map((x) => ({
    x,
    y: BASELINE - (normalPdf(x, mean, sd) / peak) * 40,
  }))
  return {
    stroke: pathFromPoints(points),
    area: areaPathFromPoints(points, BASELINE),
  }
}

function LikelihoodPlayground({ moduleId }: LikelihoodPlaygroundProps) {
  const [separation, setSeparation] = useState(28)
  const [sigma, setSigma] = useState(12)
  const [sampleCount, setSampleCount] = useState(4)
  const [observation, setObservation] = useState(58)
  const clipId = useId()

  const effectiveSd = sigma / Math.sqrt(sampleCount)
  const h0Mean = 50 - separation / 2
  const h1Mean = 50 + separation / 2
  const h0Density = normalPdf(observation, h0Mean, effectiveSd)
  const h1Density = normalPdf(observation, h1Mean, effectiveSd)
  const ratio = gaussianLikelihoodRatio(
    observation,
    h0Mean,
    h1Mean,
    effectiveSd,
  )
  const logRatio = gaussianLogLikelihoodRatio(
    observation,
    h0Mean,
    h1Mean,
    effectiveSd,
  )
  const evidence = Math.tanh(logRatio / 4)
  const meterX = scaleLinear({
    value: evidence,
    domainMin: -1,
    domainMax: 1,
    rangeMin: 10,
    rangeMax: 90,
  })

  const paths = useMemo(
    () => ({
      h0: densityPath(h0Mean, effectiveSd),
      h1: densityPath(h1Mean, effectiveSd),
    }),
    [h0Mean, h1Mean, effectiveSd],
  )

  const subtitle =
    moduleId === 'D0'
      ? 'One observation, two compatible worlds'
      : 'Likelihood ratio from a movable observation'

  return (
    <LabPanel
      eyebrow={moduleId}
      title={subtitle}
      icon={<MoveHorizontal className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Mean separation"
            variable="d"
            value={separation}
            min={8}
            max={54}
            step={1}
            meaning="Larger separation makes the two hidden worlds easier to tell apart."
            onValueChange={setSeparation}
            format={(value) => `d = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Noise standard deviation"
            variable="sigma"
            value={sigma}
            min={4}
            max={24}
            step={1}
            meaning="Larger noise widens both worlds and increases overlap."
            onValueChange={setSigma}
            format={(value) => `sigma = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Independent samples"
            variable="N"
            value={sampleCount}
            min={1}
            max={25}
            step={1}
            meaning="More samples shrink the distribution of an averaged statistic."
            onValueChange={setSampleCount}
            format={(value) => `N = ${value.toFixed(0)}`}
          />
          <SliderControl
            label="Observation"
            variable="x"
            value={observation}
            min={5}
            max={95}
            step={1}
            meaning="Move the observed statistic across the two possible worlds."
            onValueChange={setObservation}
            format={(value) => `x = ${value.toFixed(0)}`}
          />
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-56 w-full"
        role="img"
        aria-label={`Gaussian evidence plot. H0 density ${formatFixed(h0Density, 4)}, H1 density ${formatFixed(h1Density, 4)}, likelihood ratio ${formatFixed(ratio, 2)}.`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} />
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
        <path d={paths.h0.area} className="fill-h0" opacity="0.08" />
        <path d={paths.h1.area} className="fill-h1" opacity="0.13" />
        <path
          d={paths.h0.stroke}
          className="stroke-h0"
          strokeWidth="1.4"
          fill="none"
          clipPath={`url(#${clipId})`}
        />
        <path
          d={paths.h1.stroke}
          className="stroke-h1"
          strokeWidth="1.4"
          fill="none"
          clipPath={`url(#${clipId})`}
        />
        <line
          x1={observation}
          y1="6"
          x2={observation}
          y2={BASELINE}
          className="stroke-truth"
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />
        <rect
          x={observation - 1.7}
          y="4"
          width="3.4"
          height="3.4"
          className="fill-truth"
        />
        <circle cx={h0Mean} cy={BASELINE + 3} r="2" className="fill-h0" />
        <path
          d={`M ${h1Mean.toFixed(2)} ${BASELINE + 0.5} l 2.3 4 h -4.6 Z`}
          className="fill-h1"
        />
        <text
          x={h0Mean}
          y="61"
          textAnchor="middle"
          className="fill-h0 text-[5px]"
        >
          H0
        </text>
        <text
          x={h1Mean}
          y="61"
          textAnchor="middle"
          className="fill-h1 text-[5px]"
        >
          H1
        </text>
      </svg>

      <div className="grid gap-4 border-y border-border py-4 text-sm leading-6 sm:grid-cols-2">
        <div className="flex gap-3">
          <span
            className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-h0"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium text-foreground">World H0:</span>{' '}
            noise-only or baseline mechanism. Marker shape: circle.
          </p>
        </div>
        <div className="flex gap-3">
          <span
            className="mt-1.5 h-0 w-0 shrink-0 border-x-[6px] border-b-[11px] border-x-transparent border-b-h1"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium text-foreground">World H1:</span>{' '}
            signal-present or changed mechanism. Marker shape: triangle.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <MetricStat
          label="f(x|H0)"
          value={formatFixed(h0Density, 3)}
          sublabel="H0 fit"
          tone="h0"
        />
        <MetricStat
          label="f(x|H1)"
          value={formatFixed(h1Density, 3)}
          sublabel="H1 fit"
          tone="h1"
        />
        <MetricStat
          label="L(x)"
          value={formatFixed(ratio, 2)}
          sublabel="ratio"
          tone={ratio >= 1 ? 'h1' : 'h0'}
        />
        <MetricStat
          label="log L"
          value={formatFixed(logRatio, 2)}
          sublabel="additive"
          tone={logRatio >= 0 ? 'h1' : 'h0'}
        />
      </div>

      <div className="mt-4 border-y border-border py-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Evidence balance
        </div>
        <svg
          viewBox="0 0 100 16"
          className="h-8 w-full"
          role="img"
          aria-label={`Evidence balance marker at ${formatFixed(evidence, 2)}.`}
        >
          <line
            x1="10"
            y1="8"
            x2="90"
            y2="8"
            className="stroke-border"
            strokeWidth="2"
          />
          <text x="10" y="5" textAnchor="middle" className="fill-h0 text-[4px]">
            H0
          </text>
          <text x="90" y="5" textAnchor="middle" className="fill-h1 text-[4px]">
            H1
          </text>
          <rect
            x={meterX - 1.5}
            y="4"
            width="3"
            height="8"
            className="fill-truth"
          />
        </svg>
      </div>
    </LabPanel>
  )
}

export { LikelihoodPlayground }
