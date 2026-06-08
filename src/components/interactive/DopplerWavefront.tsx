import { useState } from 'react'
import { RadioTower } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { formatFixed } from '@/lib/format.ts'

function meterWidth(value: number): string {
  return `${Math.max(0, Math.min(1, value)) * 100}%`
}

const CRESTS: ReadonlyArray<number> = [14, 26, 38, 50, 62, 74, 86]

function DopplerWavefront() {
  const [shift, setShift] = useState(0.12)
  const [noise, setNoise] = useState(0.25)
  const [sampleCount, setSampleCount] = useState(16)
  const evidenceGain = Math.sqrt(sampleCount / 16)
  const staticScore = Math.exp(-80 * shift * shift) * (1 - 0.55 * noise)
  const movingScore =
    (0.25 + Math.min(0.85, Math.abs(shift) * 5.2)) * evidenceGain
  const clippedMovingScore = Math.min(1, movingScore * (1 - 0.35 * noise))
  const score = clippedMovingScore - staticScore

  const movingSpacing = 12 - shift * 22

  return (
    <LabPanel
      eyebrow="D6"
      title="Doppler projection"
      icon={<RadioTower className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Doppler shift"
            variable="f1-f0"
            value={shift}
            min={0}
            max={0.22}
            step={0.01}
            meaning="Moving cells compress or stretch the returned rhythm."
            onValueChange={setShift}
            format={(value) => formatFixed(value, 2)}
          />
          <SliderControl
            label="Noise level"
            variable="sigma"
            value={noise}
            min={0}
            max={0.8}
            step={0.05}
            meaning="Noise makes both correlation meters less decisive."
            onValueChange={setNoise}
            format={(value) => formatFixed(value, 2)}
          />
          <SliderControl
            label="Samples"
            variable="N"
            value={sampleCount}
            min={4}
            max={64}
            step={4}
            meaning="More samples make projection scores separate more clearly."
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
        aria-label={`Doppler wavefront with static score ${formatFixed(staticScore, 2)} and moving score ${formatFixed(clippedMovingScore, 2)}.`}
      >
        <rect
          x="3"
          y="12"
          width="12"
          height="40"
          rx="2"
          className="fill-primary"
          opacity="0.88"
        />
        <text
          x="9"
          y="58"
          textAnchor="middle"
          className="fill-primary text-[5px]"
        >
          probe
        </text>
        {CRESTS.map((x) => (
          <circle
            key={`static-${x}`}
            cx={x}
            cy="25"
            r="9"
            className="stroke-h0"
            strokeWidth="0.9"
            fill="none"
            opacity="0.5"
          />
        ))}
        {CRESTS.map((x, index) => (
          <circle
            key={`moving-${x}`}
            cx={18 + index * movingSpacing}
            cy="43"
            r="7"
            className="stroke-h1"
            strokeWidth="0.9"
            fill="none"
            opacity="0.62"
          />
        ))}
        <circle cx="82" cy="25" r="4" className="fill-h0" opacity="0.72" />
        <path d="M 80 39 l 5 9 h -10 Z" className="fill-h1" opacity="0.82" />
        <text x="82" y="16" textAnchor="middle" className="fill-h0 text-[5px]">
          static rhythm
        </text>
        <text x="82" y="60" textAnchor="middle" className="fill-h1 text-[5px]">
          shifted rhythm
        </text>
      </svg>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-h0">Correlation with f0</span>
            <span className="font-mono">{formatFixed(staticScore, 2)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-h0"
              style={{ width: meterWidth(staticScore) }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-h1">Correlation with f1</span>
            <span className="font-mono">
              {formatFixed(clippedMovingScore, 2)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-h1"
              style={{ width: meterWidth(clippedMovingScore) }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricStat
          label="Projection score"
          value={formatFixed(score, 2)}
          sublabel="moving minus static"
          tone={score >= 0 ? 'h1' : 'h0'}
        />
        <MetricStat
          label="Decision"
          value={score >= 0 ? 'H1' : 'H0'}
          sublabel={score >= 0 ? 'moving cells' : 'static cells'}
          tone={score >= 0 ? 'h1' : 'h0'}
        />
      </div>
    </LabPanel>
  )
}

export { DopplerWavefront }
