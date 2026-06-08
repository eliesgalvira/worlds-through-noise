import { useMemo, useState } from 'react'
import { Sigma } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { gaussianMeanCrb, shrinkageMoments } from '@/domain/math/estimation.ts'
import { formatFixed } from '@/lib/format.ts'
import {
  pathFromPoints,
  scaleLinear,
} from '@/components/interactive/plot-utils.ts'

type BiasVarianceMsePlotProps = {
  readonly moduleId: string
}

function BiasVarianceMsePlot({ moduleId }: BiasVarianceMsePlotProps) {
  const [shrinkage, setShrinkage] = useState(0.25)
  const [noise, setNoise] = useState(10)
  const [sampleCount, setSampleCount] = useState(12)
  const truth = 1
  const baseVariance = gaussianMeanCrb(noise * noise, sampleCount) / 100
  const { biasValue, varianceValue, mseValue } = shrinkageMoments({
    shrinkage,
    truth,
    baseVariance,
  })
  const crb = baseVariance

  const paths = useMemo(() => {
    const values = Array.from({ length: 101 }, (_item, index) => index / 100)
    const maxY = Math.max(baseVariance, 1)
    const makePoint = (x: number, y: number) => ({
      x: scaleLinear({
        value: x,
        domainMin: 0,
        domainMax: 1,
        rangeMin: 8,
        rangeMax: 94,
      }),
      y: scaleLinear({
        value: y,
        domainMin: 0,
        domainMax: maxY,
        rangeMin: 54,
        rangeMax: 8,
      }),
    })
    return {
      bias: pathFromPoints(values.map((x) => makePoint(x, x * x))),
      variance: pathFromPoints(
        values.map((x) => makePoint(x, (1 - x) * (1 - x) * baseVariance)),
      ),
      mse: pathFromPoints(
        values.map((x) =>
          makePoint(x, x * x + (1 - x) * (1 - x) * baseVariance),
        ),
      ),
      maxY,
    }
  }, [baseVariance])

  const markerX = scaleLinear({
    value: shrinkage,
    domainMin: 0,
    domainMax: 1,
    rangeMin: 8,
    rangeMax: 94,
  })

  return (
    <LabPanel
      eyebrow={moduleId}
      title={
        moduleId === 'E5'
          ? 'CRB floor and estimate spread'
          : 'Bias, variance, and MSE'
      }
      icon={<Sigma className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Shrinkage toward zero"
            variable="s"
            value={shrinkage}
            min={0}
            max={0.95}
            step={0.01}
            meaning="More shrinkage narrows the cloud but pulls the average away from the truth."
            onValueChange={setShrinkage}
            format={(value) => formatFixed(value, 2)}
          />
          <SliderControl
            label="Noise"
            variable="sigma"
            value={noise}
            min={4}
            max={24}
            step={1}
            meaning="More noise raises the CRB floor and estimator variance."
            onValueChange={setNoise}
            format={(value) => value.toFixed(0)}
          />
          <SliderControl
            label="Sample count"
            variable="N"
            value={sampleCount}
            min={2}
            max={80}
            step={1}
            meaning="More samples lower the variance floor."
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
        aria-label={`Bias squared ${formatFixed(biasValue * biasValue, 2)}, variance ${formatFixed(varianceValue, 2)}, MSE ${formatFixed(mseValue, 2)}.`}
      >
        <line x1="8" y1="54" x2="94" y2="54" className="stroke-border" />
        <line x1="8" y1="8" x2="8" y2="54" className="stroke-border" />
        <path
          d={paths.bias}
          className="stroke-false-alarm"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d={paths.variance}
          className="stroke-h0"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d={paths.mse}
          className="stroke-detection"
          strokeWidth="1.8"
          fill="none"
        />
        <line
          x1="8"
          y1={scaleLinear({
            value: crb,
            domainMin: 0,
            domainMax: paths.maxY,
            rangeMin: 54,
            rangeMax: 8,
          })}
          x2="94"
          y2={scaleLinear({
            value: crb,
            domainMin: 0,
            domainMax: paths.maxY,
            rangeMin: 54,
            rangeMax: 8,
          })}
          className="stroke-muted-foreground"
          strokeDasharray="3 2"
          opacity="0.55"
        />
        <line
          x1={markerX}
          y1="8"
          x2={markerX}
          y2="54"
          className="stroke-threshold"
          strokeDasharray="2 2"
        />
        <text x="22" y="13" className="fill-false-alarm text-[5px]">
          bias^2
        </text>
        <text x="22" y="21" className="fill-h0 text-[5px]">
          variance
        </text>
        <text x="22" y="29" className="fill-detection text-[5px]">
          MSE
        </text>
        <text x="72" y="50" className="fill-muted-foreground text-[5px]">
          CRB floor
        </text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricStat
          label="Bias"
          value={formatFixed(biasValue, 2)}
          sublabel="systematic offset"
          tone="falseAlarm"
        />
        <MetricStat
          label="Variance"
          value={formatFixed(varianceValue, 2)}
          sublabel="random wobble"
          tone="h0"
        />
        <MetricStat
          label="MSE"
          value={formatFixed(mseValue, 2)}
          sublabel="bias^2 + variance"
          tone="detection"
        />
        <MetricStat
          label="CRB"
          value={formatFixed(crb, 2)}
          sublabel="unbiased floor"
          tone="neutral"
        />
      </div>
    </LabPanel>
  )
}

export { BiasVarianceMsePlot }
