import { useMemo, useState } from 'react'
import { Layers3 } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { linspace, normalPdf } from '@/domain/math/distributions.ts'
import { normalNormalPosterior } from '@/domain/math/estimation.ts'
import { formatFixed } from '@/lib/format.ts'
import {
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'

function curvePath(mean: number, sd: number, peak: number): string {
  const points = linspace(20, 85, 140).map((theta) => ({
    x: scaleLinear({
      value: theta,
      domainMin: 20,
      domainMax: 85,
      rangeMin: 6,
      rangeMax: 96,
    }),
    y: 54 - (normalPdf(theta, mean, sd) / peak) * 42,
  }))
  return pathFromPoints(points)
}

function PriorPosteriorLab() {
  const [priorMean, setPriorMean] = useState(48)
  const [priorSd, setPriorSd] = useState(12)
  const [observedMean, setObservedMean] = useState(62)
  const [sampleCount, setSampleCount] = useState(8)
  const likelihoodSd = 16 / Math.sqrt(sampleCount)
  const posterior = normalNormalPosterior({
    priorMean,
    priorSd,
    likelihoodMean: observedMean,
    likelihoodSd,
  })

  const paths = useMemo(() => {
    const peak = Math.max(
      normalPdf(priorMean, priorMean, priorSd),
      normalPdf(observedMean, observedMean, likelihoodSd),
      normalPdf(posterior.mean, posterior.mean, posterior.sd),
    )
    return {
      prior: curvePath(priorMean, priorSd, peak),
      likelihood: curvePath(observedMean, likelihoodSd, peak),
      posterior: curvePath(posterior.mean, posterior.sd, peak),
    }
  }, [
    likelihoodSd,
    observedMean,
    posterior.mean,
    posterior.sd,
    priorMean,
    priorSd,
  ])

  return (
    <LabPanel
      eyebrow="E7"
      title="Prior, likelihood, posterior"
      icon={<Layers3 className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Prior mean"
            variable="m_A"
            value={priorMean}
            min={30}
            max={75}
            step={1}
            meaning="The center of belief before the data arrives."
            onValueChange={setPriorMean}
            format={(value) => value.toFixed(0)}
          />
          <SliderControl
            label="Prior spread"
            variable="sigma_A"
            value={priorSd}
            min={3}
            max={25}
            step={1}
            meaning="Wide priors are weak. Tight priors pull MAP strongly."
            onValueChange={setPriorSd}
            format={(value) => value.toFixed(0)}
          />
          <SliderControl
            label="Observed mean"
            variable="xbar"
            value={observedMean}
            min={30}
            max={80}
            step={1}
            meaning="The likelihood center from the data."
            onValueChange={setObservedMean}
            format={(value) => value.toFixed(0)}
          />
          <SliderControl
            label="Samples"
            variable="N"
            value={sampleCount}
            min={1}
            max={60}
            step={1}
            meaning="More samples sharpen the likelihood curve."
            onValueChange={setSampleCount}
            format={(value) => value.toFixed(0)}
          />
        </>
      }
    >
      <svg
        viewBox="0 0 100 64"
        className="h-56 w-full"
        role="img"
        aria-label={`Prior mean ${priorMean}, observed mean ${observedMean}, posterior mean ${formatFixed(posterior.mean, 1)}.`}
      >
        <line x1="6" y1="54" x2="96" y2="54" className="stroke-border" />
        <path
          d={paths.prior}
          className="stroke-prior"
          strokeWidth="1.4"
          strokeDasharray="4 2"
          fill="none"
        />
        <path
          d={paths.likelihood}
          className="stroke-h0"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d={paths.posterior}
          className="stroke-h1"
          strokeWidth="2"
          fill="none"
        />
        <text x="14" y="12" className="fill-prior text-[5px]">
          prior
        </text>
        <text x="14" y="20" className="fill-h0 text-[5px]">
          likelihood
        </text>
        <text x="14" y="28" className="fill-h1 text-[5px]">
          posterior
        </text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricStat
          label="ML"
          value={formatFixed(observedMean, 1)}
          sublabel="data only"
          tone="h0"
        />
        <MetricStat
          label="MAP"
          value={formatFixed(posterior.mean, 1)}
          sublabel="posterior peak"
          tone="h1"
        />
        <MetricStat
          label="Post. sd"
          value={formatFixed(posterior.sd, 1)}
          sublabel="uncertainty"
          tone="neutral"
        />
      </div>
    </LabPanel>
  )
}

export { PriorPosteriorLab }
