import { useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  rightTailDetectionProbability,
  rightTailFalseAlarm,
} from '@/domain/math/detection.ts'
import { formatFixed, formatPercent } from '@/lib/format.ts'
import type { CaseStudyRecord } from '@/domain/types.ts'

type CaseStudySandboxProps = {
  readonly caseStudy: CaseStudyRecord
}

function DetectionCaseSandbox({ caseStudy }: CaseStudySandboxProps) {
  const [threshold, setThreshold] = useState(54)
  const [signal, setSignal] = useState(1.2)
  const h0Mean = 42
  const h1Mean = 42 + 18 * signal
  const sd = 12
  const pFalseAlarm = rightTailFalseAlarm(threshold, h0Mean, sd)
  const pDetection = rightTailDetectionProbability(threshold, h1Mean, sd)

  return (
    <div className="border-y border-border py-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Case sandbox
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        Treat this case as a detector. Move the decision line and predict which
        mistake becomes easier to tolerate.
      </p>
      <svg
        viewBox="0 0 100 36"
        className="mt-4 h-36 w-full"
        role="img"
        aria-label={`${caseStudy.title} threshold sandbox`}
      >
        <line x1="8" y1="25" x2="92" y2="25" className="stroke-border" />
        <circle cx={h0Mean} cy="25" r="8" className="fill-h0" opacity="0.16" />
        <path
          d={`M ${h1Mean.toFixed(2)} 16 l 8 14 h -16 Z`}
          className="fill-h1"
          opacity="0.18"
        />
        <line
          x1={threshold}
          y1="6"
          x2={threshold}
          y2="31"
          className="stroke-threshold"
          strokeDasharray="3 2"
          strokeWidth="1.4"
        />
        <text
          x={h0Mean}
          y="34"
          textAnchor="middle"
          className="fill-h0 text-[5px]"
        >
          H0
        </text>
        <text
          x={h1Mean}
          y="34"
          textAnchor="middle"
          className="fill-h1 text-[5px]"
        >
          H1
        </text>
      </svg>
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

function EstimationCaseSandbox({ caseStudy }: CaseStudySandboxProps) {
  const [samples, setSamples] = useState(10)
  const [priorPull, setPriorPull] = useState(0.25)
  const truth = caseStudy.id.includes('poisson') ? 8 : 52
  const ml = truth + 12 / Math.sqrt(samples)
  const prior = truth - 10
  const map = ml * (1 - priorPull) + prior * priorPull
  const variance = 1 / samples

  return (
    <div className="border-y border-border py-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Case sandbox
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        Treat this case as estimation. Add data and change prior pull, then
        watch ML and MAP separate or converge.
      </p>
      <svg
        viewBox="0 0 100 36"
        className="mt-4 h-36 w-full"
        role="img"
        aria-label={`${caseStudy.title} estimator sandbox`}
      >
        <line x1="8" y1="22" x2="92" y2="22" className="stroke-border" />
        <line
          x1={truth}
          y1="7"
          x2={truth}
          y2="30"
          className="stroke-truth"
          strokeWidth="1.4"
        />
        <circle cx={ml} cy="18" r="3" className="fill-estimate" />
        <rect
          x={map - 2.5}
          y="23"
          width="5"
          height="5"
          className="fill-prior"
        />
        <text
          x={truth}
          y="35"
          textAnchor="middle"
          className="fill-truth text-[5px]"
        >
          truth
        </text>
      </svg>
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
