import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { ConceptBadge } from '@/components/ConceptBadge.tsx'
import { EquationReveal } from '@/components/EquationReveal.tsx'
import { LabPanel } from '@/components/LabPanel.tsx'
import { LessonLayout } from '@/components/LessonLayout.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { PredictionPrompt } from '@/components/PredictionPrompt.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'

const VIEW_W = 100
const VIEW_H = 60
const BASELINE = 54

function densityPoints(
  mean: number,
  sd: number,
  amp: number,
): Array<[number, number]> {
  const points: Array<[number, number]> = []
  const samples = 80
  for (let i = 0; i <= samples; i += 1) {
    const x = (i / samples) * VIEW_W
    const z = (x - mean) / sd
    const y = BASELINE - amp * Math.exp(-0.5 * z * z)
    points.push([x, y])
  }
  return points
}

function strokePath(points: Array<[number, number]>): string {
  return points
    .map(
      ([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`,
    )
    .join(' ')
}

function filledPath(points: Array<[number, number]>): string {
  const first = points[0]
  const last = points[points.length - 1]
  if (first === undefined || last === undefined) {
    return ''
  }
  return `${strokePath(points)} L ${last[0].toFixed(2)} ${BASELINE} L ${first[0].toFixed(2)} ${BASELINE} Z`
}

const h0Points = densityPoints(38, 11, 42)
const h1Points = densityPoints(66, 11, 42)
const h0Stroke = strokePath(h0Points)
const h1Stroke = strokePath(h1Points)
const h0Fill = filledPath(h0Points)
const h1Fill = filledPath(h1Points)

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`

function DetectionPage() {
  const [threshold, setThreshold] = useState(55)
  const pFalseAlarm = sigmoid(-(threshold - 50) / 9)
  const pDetection = sigmoid(-(threshold - 72) / 11)

  return (
    <LessonLayout
      eyebrow="Module 01"
      title="Detection"
      summary="Two worlds could have produced what you just measured. A detector is a rule for choosing between them, and a threshold is a promise about which mistake you are willing to control."
      concepts={
        <>
          <ConceptBadge variant="h0">H0 vs H1</ConceptBadge>
          <ConceptBadge>Neyman-Pearson</ConceptBadge>
          <ConceptBadge>Likelihood ratio</ConceptBadge>
          <ConceptBadge>ROC</ConceptBadge>
        </>
      }
      lab={
        <LabPanel
          eyebrow="Interactive lab"
          title="Threshold and the two worlds"
          icon={<SlidersHorizontal className="h-5 w-5" />}
          controls={
            <>
              <SliderControl
                label="Decision threshold"
                variable="γ"
                meaning="Decide H1 only when the observation lands to the right of this line."
                value={threshold}
                min={10}
                max={90}
                step={1}
                onValueChange={setThreshold}
                format={(value) => `γ = ${value}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <MetricStat
                  label="False alarm"
                  value={percent(pFalseAlarm)}
                  sublabel="H0 called H1"
                  tone="falseAlarm"
                />
                <MetricStat
                  label="Detection"
                  value={percent(pDetection)}
                  sublabel="H1 called H1"
                  tone="detection"
                />
              </div>
            </>
          }
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-44 w-full"
            role="img"
            aria-label={`Two probability densities with a decision threshold at ${threshold}. False alarm probability ${percent(pFalseAlarm)}, detection probability ${percent(pDetection)}.`}
          >
            <defs>
              <clipPath id="decideH1">
                <rect
                  x={threshold}
                  y={0}
                  width={VIEW_W - threshold}
                  height={VIEW_H}
                />
              </clipPath>
            </defs>
            <line
              x1={0}
              y1={BASELINE}
              x2={VIEW_W}
              y2={BASELINE}
              className="stroke-border"
              strokeWidth={0.5}
            />
            <path
              d={h0Fill}
              className="fill-false-alarm"
              opacity={0.18}
              clipPath="url(#decideH1)"
            />
            <path
              d={h1Fill}
              className="fill-detection"
              opacity={0.22}
              clipPath="url(#decideH1)"
            />
            <path
              d={h0Stroke}
              className="stroke-h0"
              strokeWidth={1.4}
              fill="none"
            />
            <path
              d={h1Stroke}
              className="stroke-accent"
              strokeWidth={1.4}
              fill="none"
            />
            <line
              x1={threshold}
              y1={6}
              x2={threshold}
              y2={BASELINE}
              className="stroke-threshold"
              strokeWidth={1}
              strokeDasharray="2 1.5"
            />
            <circle cx={threshold} cy={6} r={2} className="fill-threshold" />
          </svg>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-h0" />
              World H0 (noise only)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              World H1 (signal present)
            </span>
          </div>
        </LabPanel>
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Lesson scaffold — placeholder copy
      </p>

      <PredictionPrompt
        question="If you slide the threshold to the right to avoid false alarms, what happens to your chance of catching a real signal?"
        answer="Both shrink together. Moving the threshold trades one error for the other; you can never reduce both at once. That trade-off is exactly what the ROC curve draws."
      />

      <div className="space-y-4 text-[17px] leading-8 text-foreground">
        <p>
          This is placeholder narrative. The finished module will open with a
          concrete human problem — a faint tone in static, a blip on a screen —
          before any symbol appears.
        </p>
        <p>
          The learner will drag the threshold in the panel and watch the two
          kinds of mistake move in opposite directions, building the intuition
          that a detector is a chosen balance, not a fixed truth.
        </p>
      </div>

      <EquationReveal
        sentence="Decide the signal is present when the data is enough times more likely under H1 than under H0."
        equation={
          'Λ(x) = p(x | H1) / p(x | H0)  ≷  γ\n         decide H1   if   Λ(x) ≥ γ'
        }
        caption="The Neyman-Pearson lemma: the likelihood-ratio test is the most powerful test at any fixed false-alarm rate."
      />
    </LessonLayout>
  )
}

export { DetectionPage }
