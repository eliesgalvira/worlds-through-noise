import { useState } from 'react'
import { Target } from 'lucide-react'
import { ConceptBadge } from '@/components/ConceptBadge.tsx'
import { EquationReveal } from '@/components/EquationReveal.tsx'
import { LabPanel } from '@/components/LabPanel.tsx'
import { LessonLayout } from '@/components/LessonLayout.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { PredictionPrompt } from '@/components/PredictionPrompt.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'

const VIEW_W = 100
const VIEW_H = 60
const BASELINE = 52
const TRUE_X = 58

function gaussianStroke(mean: number, sd: number, amp: number): string {
  const samples = 80
  let d = ''
  for (let i = 0; i <= samples; i += 1) {
    const x = (i / samples) * VIEW_W
    const z = (x - mean) / sd
    const y = BASELINE - amp * Math.exp(-0.5 * z * z)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return d.trim()
}

function EstimationPage() {
  const [sampleCount, setSampleCount] = useState(20)
  const spread = 30 / Math.sqrt(sampleCount)
  const sd = Math.max(2.2, spread)
  const amp = Math.min(46, 14 + sampleCount * 0.18)
  const estimateX = TRUE_X + 0.25 * sd
  const sigmaUnits = spread / 10
  const variance = sigmaUnits * sigmaUnits

  return (
    <LessonLayout
      eyebrow="Module 02"
      title="Estimation"
      summary="An estimator is a machine: data goes in, one number comes out. The question is not whether it is ever wrong, but how tightly its answers cluster around the hidden truth as evidence accumulates."
      concepts={
        <>
          <ConceptBadge>ML</ConceptBadge>
          <ConceptBadge>MAP</ConceptBadge>
          <ConceptBadge>CRB</ConceptBadge>
          <ConceptBadge>Bias</ConceptBadge>
          <ConceptBadge>Variance</ConceptBadge>
        </>
      }
      lab={
        <LabPanel
          eyebrow="Interactive lab"
          title="The estimate tightens with evidence"
          icon={<Target className="h-5 w-5" />}
          controls={
            <>
              <SliderControl
                label="Sample count"
                variable="n"
                meaning="More independent samples concentrate the estimate around the truth."
                value={sampleCount}
                min={1}
                max={200}
                step={1}
                onValueChange={setSampleCount}
                format={(value) => `n = ${value}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <MetricStat
                  label="Std. error"
                  value={`±${sigmaUnits.toFixed(2)}`}
                  sublabel="spread of the estimate"
                  tone="h0"
                />
                <MetricStat
                  label="Variance"
                  value={variance.toFixed(3)}
                  sublabel="σ² of the estimate"
                  tone="neutral"
                />
              </div>
            </>
          }
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-44 w-full"
            role="img"
            aria-label={`Sampling distribution of an estimator with ${sampleCount} samples, standard error ±${sigmaUnits.toFixed(2)}.`}
          >
            <line
              x1={0}
              y1={BASELINE}
              x2={VIEW_W}
              y2={BASELINE}
              className="stroke-border"
              strokeWidth={0.5}
            />
            <path
              d={gaussianStroke(TRUE_X, sd, amp)}
              className="stroke-estimate"
              strokeWidth={1.4}
              fill="none"
            />
            <line
              x1={TRUE_X}
              y1={8}
              x2={TRUE_X}
              y2={BASELINE}
              className="stroke-truth"
              strokeWidth={1}
            />
            <circle cx={TRUE_X} cy={8} r={1.8} className="fill-truth" />
            <line
              x1={estimateX}
              y1={BASELINE - amp}
              x2={estimateX}
              y2={BASELINE}
              className="stroke-estimate"
              strokeWidth={1}
              strokeDasharray="2 1.5"
            />
            <circle
              cx={estimateX}
              cy={BASELINE - amp}
              r={1.8}
              className="fill-estimate"
            />
          </svg>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-truth" />
              True value θ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-estimate" />
              Estimate θ̂
            </span>
          </div>
        </LabPanel>
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Lesson scaffold — placeholder copy
      </p>

      <PredictionPrompt
        question="You double the number of samples. Does the spread of your estimate halve?"
        answer="Not quite. The standard error falls like 1/√n, so to halve the spread you need four times the data. The Cramér-Rao bound sets the floor no unbiased estimator can beat."
      />

      <div className="space-y-4 text-[17px] leading-8 text-foreground">
        <p>
          This is placeholder narrative. The finished module will let the
          learner turn a hidden dial, watch repeated samples scatter, and feel
          the estimate cloud tighten as evidence grows.
        </p>
        <p>
          Bias, variance, and the bound that limits them will emerge from play,
          not from a theorem block dropped before any intuition exists.
        </p>
      </div>

      <EquationReveal
        sentence="The error you should expect splits cleanly into how far off you are on average and how much you wobble."
        equation={
          'MSE(θ̂) = Bias(θ̂)² + Var(θ̂)\n\nVar(θ̂) ≥ 1 / I(θ)   (Cramér-Rao)'
        }
        caption="Mean squared error decomposes into bias and variance; the Fisher information sets the variance floor."
      />
    </LessonLayout>
  )
}

export { EstimationPage }
