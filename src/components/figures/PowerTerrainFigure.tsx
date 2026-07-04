import { useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { eigSym2 } from '@/domain/math/kernel.ts'

const W = 380
const H = 380
const SCALE = 110
const CX = W / 2
const CY = H / 2

function toScreen(h0: number, h1: number): { x: number; y: number } {
  return { x: CX + h0 * SCALE, y: CY - h1 * SCALE }
}

function PowerTerrainFigure() {
  const [amplitude, setAmplitude] = useState(1.4)
  const [sigma, setSigma] = useState(0.6)
  const [h, setH] = useState<{ h0: number; h1: number }>({ h0: 1.1, h1: 0.5 })
  const [snap, setSnap] = useState(true)

  const f0 = 0.11
  const tonePower = (amplitude * amplitude) / 2
  const c = Math.cos(2 * Math.PI * f0)
  // R for a 2-tap window of a real tone + white noise:
  const a = tonePower + sigma * sigma
  const b = tonePower * c
  const eig = eigSym2(a, b, a)

  const power = (h0: number, h1: number) =>
    a * h0 * h0 + 2 * b * h0 * h1 + a * h1 * h1

  const applied = snap
    ? (() => {
        const norm = Math.hypot(h.h0, h.h1) || 1
        return { h0: h.h0 / norm, h1: h.h1 / norm }
      })()
    : h

  const py = power(applied.h0, applied.h1)
  const angleOfU1 = Math.atan2(eig.u1[1], eig.u1[0])
  const bestPoint = toScreen(eig.u1[0], eig.u1[1])
  const hPoint = toScreen(applied.h0, applied.h1)

  const levels = [0.35, 0.75, 1.3, 2.0]
  const ellipseDegrees = (-angleOfU1 * 180) / Math.PI

  return (
    <FigureShell
      title="Walk the power terrain P_y = hᴴR_x h"
      instruction="Every point of the plane is a 2-tap filter; the ellipses are iso-power curves of the honestly computed quadratic form. Drag h around the unit circle and hunt for the loudest direction — then check where the eigenvector arrows point."
      controls={
        <>
          <SliderControl
            label="Tone amplitude"
            variable="A"
            value={amplitude}
            min={0}
            max={2.5}
            step={0.05}
            meaning="Stretches the terrain along the tone's steering direction."
            onValueChange={setAmplitude}
            format={(v) => v.toFixed(2)}
          />
          <SliderControl
            label="Noise level"
            variable="σ"
            value={sigma}
            min={0.2}
            max={2}
            step={0.05}
            meaning="Raises the floor equally in all directions."
            onValueChange={setSigma}
            format={(v) => v.toFixed(2)}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={snap}
              onChange={(event) => {
                setSnap(event.target.checked)
              }}
            />
            Constrain to the unit circle ‖h‖ = 1
          </label>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Output power hᴴR_x h"
            value={formatNumber(py, 3)}
            tone="h1"
          />
          <ReadoutRow
            label="λ_max (best possible on circle)"
            value={formatNumber(eig.lambda1, 3)}
            tone="good"
          />
          <ReadoutRow
            label="λ_min (noise-only floor)"
            value={formatNumber(eig.lambda2, 3)}
          />
          <ReadoutRow
            label="Eigenvalue spread λ_max/λ_min"
            value={formatNumber(eig.lambda1 / Math.max(eig.lambda2, 1e-9), 1)}
          />
        </>
      }
    >
      <Legend
        items={[
          { label: 'iso-power ellipses', swatchClass: 'stroke-h0' },
          {
            label: 'unit circle ‖h‖=1',
            swatchClass: 'stroke-border',
            dash: true,
          },
          { label: 'eigenvectors of R_x', swatchClass: 'stroke-detection' },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Iso-power ellipses of the correlation matrix with a draggable filter point"
        onDragPoint={(x, y) => {
          setH({ h0: (x - CX) / SCALE, h1: (CY - y) / SCALE })
        }}
      >
        <line
          x1={CX}
          y1={8}
          x2={CX}
          y2={H - 8}
          className="stroke-border"
          strokeWidth={1}
        />
        <line
          x1={8}
          y1={CY}
          x2={W - 8}
          y2={CY}
          className="stroke-border"
          strokeWidth={1}
        />
        {levels.map((level) => (
          <ellipse
            key={level}
            cx={CX}
            cy={CY}
            rx={Math.sqrt(level / Math.max(eig.lambda1, 1e-9)) * SCALE}
            ry={Math.sqrt(level / Math.max(eig.lambda2, 1e-9)) * SCALE}
            transform={`rotate(${ellipseDegrees.toFixed(2)} ${CX} ${CY})`}
            fill="none"
            className="stroke-h0"
            strokeWidth={1.2}
            opacity={0.6}
          />
        ))}
        <circle
          cx={CX}
          cy={CY}
          r={SCALE}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth={1.2}
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <line
          x1={CX - eig.u1[0] * SCALE * 1.35}
          y1={CY + eig.u1[1] * SCALE * 1.35}
          x2={CX + eig.u1[0] * SCALE * 1.35}
          y2={CY - eig.u1[1] * SCALE * 1.35}
          className="stroke-detection"
          strokeWidth={1.6}
          opacity={0.9}
        />
        <line
          x1={CX - eig.u2[0] * SCALE * 0.8}
          y1={CY + eig.u2[1] * SCALE * 0.8}
          x2={CX + eig.u2[0] * SCALE * 0.8}
          y2={CY - eig.u2[1] * SCALE * 0.8}
          className="stroke-detection"
          strokeWidth={1.2}
          opacity={0.5}
        />
        <circle
          cx={bestPoint.x}
          cy={bestPoint.y}
          r={5}
          fill="none"
          className="stroke-detection"
          strokeWidth={1.6}
        />
        <line
          x1={CX}
          y1={CY}
          x2={hPoint.x}
          y2={hPoint.y}
          className="stroke-threshold"
          strokeWidth={1.6}
        />
        <circle
          cx={hPoint.x}
          cy={hPoint.y}
          r={6}
          className="fill-threshold stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={hPoint.x - 10}
          y={hPoint.y - 8}
          textAnchor="end"
          className="fill-foreground font-mono text-[11px]"
        >
          h
        </text>
        <text
          x={toScreen(eig.u1[0] * 1.52, eig.u1[1] * 1.52).x}
          y={toScreen(eig.u1[0] * 1.52, eig.u1[1] * 1.52).y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-detection font-mono text-[10px]"
        >
          u_max
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        With A → 0 the ellipses become circles: white noise has no preferred
        direction, and every unit filter earns exactly σ².
      </p>
    </FigureShell>
  )
}

export { PowerTerrainFigure }
