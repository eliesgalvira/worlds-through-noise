import { useMemo, useState } from 'react'
import { Compass } from 'lucide-react'
import { LabPanel } from '@/components/LabPanel.tsx'
import { MetricStat } from '@/components/MetricStat.tsx'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  dot,
  eigenSymmetric2x2,
  inverse2x2,
  matVec2,
} from '@/domain/math/linear-algebra.ts'
import type { Matrix2, Vector2 } from '@/domain/math/linear-algebra.ts'
import { formatFixed } from '@/lib/format.ts'
import { pathFromPoints } from '@/components/interactive/plot-utils.ts'

type MahalanobisCanvasProps = {
  readonly moduleId: string
}

function ellipsePath(
  covariance: Matrix2,
  radius: number,
  whitened: boolean,
): string {
  const eig = eigenSymmetric2x2(covariance)
  const large = Math.sqrt(Math.max(0.05, whitened ? 1 : eig.values[0]))
  const small = Math.sqrt(Math.max(0.05, whitened ? 1 : eig.values[1]))
  const largeVector = eig.vectors[0]
  const smallVector = eig.vectors[1]
  const points = Array.from({ length: 97 }, (_item, index) => {
    const t = (index / 96) * Math.PI * 2
    const x =
      50 +
      radius *
        (Math.cos(t) * large * largeVector[0] +
          Math.sin(t) * small * smallVector[0])
    const y =
      32 +
      radius *
        (Math.cos(t) * large * largeVector[1] +
          Math.sin(t) * small * smallVector[1])
    return { x, y }
  })
  return pathFromPoints(points)
}

function MahalanobisCanvas({ moduleId }: MahalanobisCanvasProps) {
  const [rho, setRho] = useState(0.72)
  const [angle, setAngle] = useState(90)
  const [whitened, setWhitened] = useState(false)
  const covariance: Matrix2 = [
    [1, rho],
    [rho, 1],
  ]
  const inverse = inverse2x2(covariance)
  const radians = (angle / 180) * Math.PI
  const direction: Vector2 = [Math.cos(radians), Math.sin(radians)]
  const mahalanobisSquared = dot(direction, matVec2(inverse, direction))
  const eig = eigenSymmetric2x2(covariance)
  const quietVector = eig.vectors[1]
  const quietAngle =
    Math.atan2(quietVector[1], quietVector[0]) * (180 / Math.PI)
  const title =
    moduleId === 'E9' ? 'Covariance-aware projection' : 'Colored noise geometry'

  const cloud = useMemo(
    () =>
      Array.from({ length: 48 }, (_item, index) => {
        const t = index * 2.399
        const r = 0.25 + ((index * 37) % 100) / 90
        const rawX = Math.cos(t) * r
        const rawY = Math.sin(t) * r
        const x = 50 + 14 * (rawX + rho * rawY * 0.55)
        const y = 32 + 14 * (rho * rawX * 0.55 + rawY)
        return { x, y }
      }),
    [rho],
  )

  return (
    <LabPanel
      eyebrow={moduleId}
      title={title}
      icon={<Compass className="h-5 w-5" />}
      controls={
        <>
          <SliderControl
            label="Noise correlation"
            variable="rho"
            value={rho}
            min={-0.85}
            max={0.85}
            step={0.01}
            meaning="Correlation stretches the uncertainty ellipse into colored noise."
            onValueChange={setRho}
            format={(value) => formatFixed(value, 2)}
          />
          <SliderControl
            label="Codeword direction"
            variable="angle"
            value={angle}
            min={0}
            max={180}
            step={1}
            meaning="The same Euclidean step can be strong or weak evidence depending on direction."
            onValueChange={setAngle}
            format={(value) => `${value.toFixed(0)} deg`}
          />
          <Button
            type="button"
            variant={whitened ? 'default' : 'outline'}
            onClick={() => {
              setWhitened((current) => !current)
            }}
          >
            {whitened ? 'Show colored space' : 'Whiten covariance'}
          </Button>
        </>
      }
    >
      <svg
        viewBox="0 0 100 64"
        className="h-56 w-full"
        role="img"
        aria-label={`Mahalanobis squared distance ${formatFixed(mahalanobisSquared, 2)} with correlation ${formatFixed(rho, 2)}.`}
      >
        <line x1="8" y1="32" x2="92" y2="32" className="stroke-border" />
        <line x1="50" y1="8" x2="50" y2="56" className="stroke-border" />
        <path
          d={ellipsePath(covariance, 13, whitened)}
          className="stroke-muted-foreground"
          strokeWidth="1.2"
          fill="var(--muted)"
          opacity="0.55"
        />
        {cloud.map((point, index) => (
          <circle
            key={`${point.x}-${index}`}
            cx={whitened ? 50 + (point.x - 50) * 0.65 : point.x}
            cy={whitened ? 32 + (point.y - 32) * 0.65 : point.y}
            r="1.2"
            className="fill-h0"
            opacity="0.35"
          />
        ))}
        <circle cx="50" cy="32" r="2" className="fill-h0" />
        <line
          x1="50"
          y1="32"
          x2={50 + Math.cos(radians) * 23}
          y2={32 + Math.sin(radians) * 23}
          className="stroke-h1"
          strokeWidth="2"
        />
        <path
          d={`M ${(50 + quietVector[0] * 25).toFixed(2)} ${(32 + quietVector[1] * 25).toFixed(2)} L ${(50 - quietVector[0] * 25).toFixed(2)} ${(32 - quietVector[1] * 25).toFixed(2)}`}
          className="stroke-detection"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          x="50"
          y="61"
          textAnchor="middle"
          className="fill-muted-foreground text-[5px]"
        >
          {whitened ? 'whitened coordinates' : 'colored covariance ellipse'}
        </text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricStat
          label="d_M^2"
          value={formatFixed(mahalanobisSquared, 2)}
          sublabel="covariance distance"
          tone="h1"
        />
        <MetricStat
          label="lambda min"
          value={formatFixed(eig.values[1], 2)}
          sublabel="quiet variance"
          tone="detection"
        />
        <MetricStat
          label="Quiet angle"
          value={`${formatFixed(quietAngle, 0)} deg`}
          sublabel="best codeword direction"
          tone="neutral"
        />
      </div>
    </LabPanel>
  )
}

export { MahalanobisCanvas }
