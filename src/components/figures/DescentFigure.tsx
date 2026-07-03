import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { eigSym2 } from '@/domain/math/kernel.ts'

const W = 400
const H = 400
const SCALE = 120
const CX = W / 2
const CY = H / 2

type Spread = 'low' | 'high'

// Two correlation matrices from the course examples (unit diagonal scaled):
const MATRICES: Record<Spread, { r0: number; r1: number }> = {
  low: { r0: 1.1, r1: 0.26 }, // spread ≈ 1.6
  high: { r0: 1.0, r1: 0.86 }, // spread ≈ 13
}

const H_OPT = { h0: 0.35, h1: -0.45 }

function DescentFigure() {
  const [spread, setSpread] = useState<Spread>('high')
  const [muPct, setMuPct] = useState(12)
  const [trajectory, setTrajectory] = useState<
    Array<{ h0: number; h1: number }>
  >([{ h0: -1.15, h1: 0.95 }])
  const [running, setRunning] = useState(false)

  const { r0, r1 } = MATRICES[spread]
  const eig = eigSym2(r0, r1, r0)
  const muMax = 2 / eig.lambda1
  const mu = (muPct / 100) * 0.5 // slider maps to [0, 0.5]

  const xiExcess = (h0: number, h1: number) => {
    const d0 = h0 - H_OPT.h0
    const d1 = h1 - H_OPT.h1
    return d0 * d0 * r0 + 2 * d0 * d1 * r1 + d1 * d1 * r0
  }

  const step = (point: { h0: number; h1: number }) => {
    // ∇ = R(h − h_opt); h ← h − μ∇.
    const d0 = point.h0 - H_OPT.h0
    const d1 = point.h1 - H_OPT.h1
    const g0 = r0 * d0 + r1 * d1
    const g1 = r1 * d0 + r0 * d1
    return { h0: point.h0 - mu * g0, h1: point.h1 - mu * g1 }
  }

  useEffect(() => {
    if (!running) {
      return
    }
    const timer = setInterval(() => {
      setTrajectory((prev) => {
        const last = prev[prev.length - 1]
        if (last === undefined || prev.length > 400) {
          return prev
        }
        const next = step(last)
        if (!Number.isFinite(next.h0) || Math.abs(next.h0) > 60) {
          return prev
        }
        return [...prev, next]
      })
    }, 90)
    return () => {
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mu, spread])

  const last = trajectory[trajectory.length - 1] ?? { h0: 0, h1: 0 }
  const angleDeg = (-Math.atan2(eig.u1[1], eig.u1[0]) * 180) / Math.PI
  const toX = (v: number) => CX + v * SCALE
  const toY = (v: number) => CY - v * SCALE
  const levels = [0.05, 0.2, 0.6, 1.4, 2.6]
  const diverging = mu > muMax

  return (
    <FigureShell
      title="Roll the ball — then break the speed limit"
      instruction="Click anywhere to drop the filter, press play, and watch steepest descent hop against the local slope. On the stretched bowl, find the μ that makes the steep axis overshoot while the shallow axis still crawls — then push μ past 2/λ_max and watch it explode."
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={spread === 'low' ? 'default' : 'outline'}
              onClick={() => {
                setSpread('low')
                setTrajectory((prev) => [
                  prev[prev.length - 1] ?? { h0: -1, h1: 1 },
                ])
              }}
            >
              Round bowl (spread 1.6)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={spread === 'high' ? 'default' : 'outline'}
              onClick={() => {
                setSpread('high')
                setTrajectory((prev) => [
                  prev[prev.length - 1] ?? { h0: -1, h1: 1 },
                ])
              }}
            >
              Stretched (spread 13)
            </Button>
          </div>
          <SliderControl
            label="Step size"
            variable="μ"
            value={muPct}
            min={1}
            max={100}
            step={1}
            meaning={`Stability limit 2/λ_max = ${formatNumber(muMax, 3)}.`}
            onValueChange={setMuPct}
            format={(v) => ((v / 100) * 0.5).toFixed(3)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setRunning((r) => !r)
              }}
            >
              {running ? 'Pause' : 'Play'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setRunning(false)
                setTrajectory([{ h0: -1.15, h1: 0.95 }])
              }}
            >
              Reset
            </Button>
          </div>
        </>
      }
      readout={
        <>
          <ReadoutRow label="Iterations" value={`${trajectory.length - 1}`} />
          <ReadoutRow
            label="Excess error Δξ(h_k)"
            value={formatNumber(xiExcess(last.h0, last.h1), 4)}
            tone="h1"
          />
          <ReadoutRow
            label="μ vs limit 2/λ_max"
            value={`${formatNumber(mu, 3)} / ${formatNumber(muMax, 3)}`}
            tone={diverging ? 'bad' : 'good'}
          />
          <ReadoutRow
            label="Contraction of slow mode |1−μλ_min|"
            value={formatNumber(Math.abs(1 - mu * eig.lambda2), 3)}
          />
        </>
      }
    >
      <Legend
        items={[
          { label: 'iso-error contours', swatchClass: 'stroke-h0' },
          { label: 'descent trajectory', swatchClass: 'stroke-threshold' },
          { label: 'optimum', swatchClass: 'stroke-detection' },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Steepest descent trajectory over iso-error contours"
        onDragPoint={(x, y) => {
          setTrajectory([{ h0: (x - CX) / SCALE, h1: (CY - y) / SCALE }])
        }}
      >
        {levels.map((level) => (
          <ellipse
            key={level}
            cx={toX(H_OPT.h0)}
            cy={toY(H_OPT.h1)}
            rx={Math.sqrt(level / Math.max(eig.lambda1, 1e-9)) * SCALE}
            ry={Math.sqrt(level / Math.max(eig.lambda2, 1e-9)) * SCALE}
            transform={`rotate(${angleDeg.toFixed(2)} ${toX(H_OPT.h0)} ${toY(H_OPT.h1)})`}
            fill="none"
            className="stroke-h0"
            strokeWidth={1.1}
            opacity={0.55}
          />
        ))}
        <circle
          cx={toX(H_OPT.h0)}
          cy={toY(H_OPT.h1)}
          r={5}
          className="fill-detection stroke-card"
          strokeWidth={1.5}
        />
        <path
          d={trajectory
            .map(
              (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${toX(p.h0).toFixed(1)} ${toY(p.h1).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-threshold"
          strokeWidth={1.6}
          opacity={0.9}
        />
        {trajectory.map((p, i) =>
          i % 2 === 0 || i === trajectory.length - 1 ? (
            <circle
              key={i}
              cx={toX(p.h0)}
              cy={toY(p.h1)}
              r={i === trajectory.length - 1 ? 5 : 2}
              className={
                i === trajectory.length - 1
                  ? 'fill-threshold stroke-card'
                  : 'fill-threshold'
              }
              strokeWidth={1.5}
              opacity={i === trajectory.length - 1 ? 1 : 0.5}
            />
          ) : null,
        )}
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Every hop is the real recursion h_{'{k+1}'} = h_k − μ(R h_k − r): the
        zig-zag, the valley crawl and the explosion are computed, not drawn.
      </p>
    </FigureShell>
  )
}

export { DescentFigure }
