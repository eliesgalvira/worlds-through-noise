import { useState } from 'react'
import { ScanSearch } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { inverse2x2, matVec2, dot } from '@/domain/math/linear-algebra.ts'
import type { Matrix2, Vector2 } from '@/domain/math/linear-algebra.ts'
import { formatFixed } from '@/lib/format.ts'

function mahalanobis2(delta: Vector2, covariance: Matrix2): number {
  const inverse = inverse2x2(covariance)
  return dot(delta, matVec2(inverse, delta))
}

const INTRUDER_DELTA: Vector2 = [2.6, -1.4]

function PixelBackgroundTrainer() {
  const [trainingFrames, setTrainingFrames] = useState(16)
  const [rho, setRho] = useState(0.45)
  const [threshold, setThreshold] = useState(5.5)
  const covariance: Matrix2 = [
    [1, rho],
    [rho, 1],
  ]
  const learnedNoise = 7 / Math.sqrt(trainingFrames)
  const intruderDistance = mahalanobis2(INTRUDER_DELTA, covariance)
  const cells = Array.from({ length: 64 }, (_item, index) => {
    const row = Math.floor(index / 8)
    const col = index % 8
    const isIntruder = row === 5 && col === 4
    const delta: Vector2 = isIntruder
      ? INTRUDER_DELTA
      : [
          Math.sin(index * 1.8) * learnedNoise * 0.28,
          Math.cos(index * 1.3) * learnedNoise * 0.28,
        ]
    const distance = mahalanobis2(delta, covariance)
    return {
      row,
      col,
      isIntruder,
      flagged: distance > threshold,
      distance,
    }
  })
  const flaggedCount = cells.filter((cell) => cell.flagged).length

  return (
    <LabPanel
      eyebrow="E8"
      title="Estimate background, detect deviation"
      icon={<ScanSearch className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Training frames"
            variable="M"
            value={trainingFrames}
            min={4}
            max={80}
            step={1}
            meaning="More clean frames tighten the learned background mean."
            onValueChange={setTrainingFrames}
            format={(value) => value.toFixed(0)}
          />
          <SliderControl
            label="Color correlation"
            variable="rho"
            value={rho}
            min={-0.75}
            max={0.75}
            step={0.01}
            meaning="Correlated RGB noise changes which color deviations are surprising."
            onValueChange={setRho}
            format={(value) => formatFixed(value, 2)}
          />
          <SliderControl
            label="Detection threshold"
            variable="gamma"
            value={threshold}
            min={1.5}
            max={12}
            step={0.1}
            meaning="Flag pixels whose Mahalanobis distance is larger than this threshold."
            onValueChange={setThreshold}
            format={(value) => formatFixed(value, 1)}
          />
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
        <svg
          viewBox="0 0 80 80"
          className="h-60 w-full"
          role="img"
          aria-label={`Pixel grid with ${flaggedCount} flagged cells.`}
        >
          {cells.map((cell) => (
            <g key={`${cell.row}-${cell.col}`}>
              <rect
                x={cell.col * 9 + 4}
                y={cell.row * 9 + 4}
                width="8"
                height="8"
                rx="1"
                className={cell.flagged ? 'fill-false-alarm' : 'fill-primary'}
                opacity={
                  cell.flagged
                    ? 0.82
                    : 0.18 + Math.min(0.35, cell.distance / 18)
                }
                stroke={cell.isIntruder ? 'var(--foreground)' : 'var(--border)'}
                strokeWidth={cell.isIntruder ? 1.2 : 0.3}
              />
              {cell.flagged ? (
                <text
                  x={cell.col * 9 + 8}
                  y={cell.row * 9 + 10.5}
                  textAnchor="middle"
                  className="fill-card text-[5px]"
                >
                  !
                </text>
              ) : null}
            </g>
          ))}
          <text
            x="40"
            y="78"
            textAnchor="middle"
            className="fill-muted-foreground text-[5px]"
          >
            new frame, ! marks flagged pixels
          </text>
        </svg>
        <div className="space-y-3">
          <div className="border-y border-border py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Learned RGB model
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-md border"
                style={{ background: 'rgb(128, 142, 118)' }}
              />
              <div>
                <p className="font-mono text-sm text-foreground">
                  mean [128, 142, 118]
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  covariance uses rho for color coupling
                </p>
              </div>
            </div>
          </div>
          <MetricStat
            label="Intruder D^2"
            value={formatFixed(intruderDistance, 2)}
            sublabel="new pixel distance"
            tone={intruderDistance > threshold ? 'falseAlarm' : 'detection'}
          />
          <MetricStat
            label="Flagged pixels"
            value={flaggedCount}
            sublabel="threshold crossings"
            tone="h1"
          />
        </div>
      </div>
    </LabPanel>
  )
}

export { PixelBackgroundTrainer }
