import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { gaussian, makeRng } from '@/domain/math/kernel.ts'

const W = 420
const H = 320
const CX = W / 2
const CY = H / 2
const SCALE = 46

// Colored noise: strong along 30°, weak across it.
const NOISE_ANGLE = Math.PI / 6
const S_LOUD = 2.1
const S_QUIET = 0.65
// Pulse direction: 75° — deliberately leaning into the loud axis.
const PULSE_ANGLE = (75 * Math.PI) / 180
const PULSE_LEN = 2.6

type Pt = { readonly x: number; readonly y: number }

function noiseSample(rng: () => number): Pt {
  const a = gaussian(rng) * S_LOUD
  const b = gaussian(rng) * S_QUIET
  return {
    x: a * Math.cos(NOISE_ANGLE) - b * Math.sin(NOISE_ANGLE),
    y: a * Math.sin(NOISE_ANGLE) + b * Math.cos(NOISE_ANGLE),
  }
}

/** Whitening morph: identity at t=0, C^{-1/2} at t=1. */
function morph(p: Pt, t: number): Pt {
  const cos = Math.cos(NOISE_ANGLE)
  const sin = Math.sin(NOISE_ANGLE)
  const a = p.x * cos + p.y * sin
  const b = -p.x * sin + p.y * cos
  const ga = S_LOUD ** -t
  const gb = S_QUIET ** -t
  const am = a * ga
  const bm = b * gb
  return { x: am * cos - bm * sin, y: am * sin + bm * cos }
}

/** Deflection d² of a unit direction u against the CURRENT (morphed) picture. */
function deflection(theta: number, t: number): number {
  const u = { x: Math.cos(theta), y: Math.sin(theta) }
  const mean = morph(
    {
      x: PULSE_LEN * Math.cos(PULSE_ANGLE),
      y: PULSE_LEN * Math.sin(PULSE_ANGLE),
    },
    t,
  )
  const cos = Math.cos(NOISE_ANGLE)
  const sin = Math.sin(NOISE_ANGLE)
  const ua = u.x * cos + u.y * sin
  const ub = -u.x * sin + u.y * cos
  const varU =
    ua * ua * S_LOUD ** (2 - 2 * t) + ub * ub * S_QUIET ** (2 - 2 * t)
  const shift = u.x * mean.x + u.y * mean.y
  return (shift * shift) / Math.max(varU, 1e-9)
}

function WhitenMatchFigure() {
  const [whiten, setWhiten] = useState(0)
  const [thetaDeg, setThetaDeg] = useState(75)
  const [seed, setSeed] = useState(7)

  const theta = (thetaDeg * Math.PI) / 180
  const t = whiten / 100

  const clouds = useMemo(() => {
    const rng = makeRng(seed)
    const h0: Array<Pt> = []
    const h1: Array<Pt> = []
    const meanX = PULSE_LEN * Math.cos(PULSE_ANGLE)
    const meanY = PULSE_LEN * Math.sin(PULSE_ANGLE)
    for (let i = 0; i < 110; i += 1) {
      const n0 = noiseSample(rng)
      const n1 = noiseSample(rng)
      h0.push(n0)
      h1.push({ x: meanX + n1.x, y: meanY + n1.y })
    }
    return { h0, h1 }
  }, [seed])

  const d2 = deflection(theta, t)
  // Best achievable deflection (search — honest, no closed form needed):
  const best = useMemo(() => {
    let bestVal = 0
    let bestTheta = 0
    for (let k = 0; k < 360; k += 1) {
      const value = deflection((k * Math.PI) / 180, t)
      if (value > bestVal) {
        bestVal = value
        bestTheta = (k * Math.PI) / 180
      }
    }
    return { value: bestVal, theta: bestTheta }
  }, [t])

  const toScreen = (p: Pt) => ({ x: CX + p.x * SCALE, y: CY - p.y * SCALE })
  const meanPoint = toScreen(
    morph(
      {
        x: PULSE_LEN * Math.cos(PULSE_ANGLE),
        y: PULSE_LEN * Math.sin(PULSE_ANGLE),
      },
      t,
    ),
  )
  const dirEnd = {
    x: CX + Math.cos(theta) * 150,
    y: CY - Math.sin(theta) * 150,
  }
  const bestEnd = {
    x: CX + Math.cos(best.theta) * 150,
    y: CY - Math.sin(best.theta) * 150,
  }

  return (
    <FigureShell
      title="Hunt for the best shadow — then whiten and stop hunting"
      instruction="Blue dots are noise-only observations; amber dots contain the pulse. Rotate the projection direction and watch the separation meter: with colored noise the best direction is NOT toward the pulse. Now squeeze the space with the whitening slider and hunt again."
      controls={
        <>
          <SliderControl
            label="Projection direction"
            variable="θ"
            value={thetaDeg}
            min={0}
            max={180}
            step={1}
            meaning="The shadow line the detector projects onto."
            onValueChange={setThetaDeg}
            format={(v) => `${v.toFixed(0)}°`}
          />
          <SliderControl
            label="Whitening"
            variable="C⁻ᵗ/²"
            value={whiten}
            min={0}
            max={100}
            step={1}
            meaning="0: raw colored noise. 100: noise squeezed round."
            onValueChange={setWhiten}
            format={(v) => `${v.toFixed(0)}%`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed((s) => s + 1)
            }}
          >
            Redraw noise
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Separation d² along θ"
            value={formatNumber(d2, 2)}
            tone="h1"
          />
          <ReadoutRow
            label="Best possible d² (this picture)"
            value={formatNumber(best.value, 2)}
            tone="good"
          />
          <ReadoutRow
            label="Your fraction of optimal"
            value={`${formatNumber((d2 / Math.max(best.value, 1e-9)) * 100, 0)}%`}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            At 100% whitening the best direction is simply “toward the pulse” —
            and mapping it back gives h ∝ C⁻¹p.
          </p>
        </>
      }
    >
      <Legend
        items={[
          { label: 'H₀ cloud (noise)', swatchClass: 'stroke-h0' },
          { label: 'H₁ cloud (pulse + noise)', swatchClass: 'stroke-h1' },
          { label: 'your direction', swatchClass: 'stroke-threshold' },
          {
            label: 'optimal direction',
            swatchClass: 'stroke-detection',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Two observation clouds under colored noise with a rotatable projection direction"
        onDragPoint={(x, y) => {
          const angle = Math.atan2(CY - y, x - CX)
          const deg = ((angle * 180) / Math.PI + 360) % 180
          setThetaDeg(Math.round(deg))
        }}
      >
        {clouds.h0.map((p, i) => {
          const s = toScreen(morph(p, t))
          return (
            <circle
              key={`a${i}`}
              cx={s.x}
              cy={s.y}
              r={2.2}
              className="fill-h0"
              opacity={0.5}
            />
          )
        })}
        {clouds.h1.map((p, i) => {
          const s = toScreen(morph(p, t))
          return (
            <circle
              key={`b${i}`}
              cx={s.x}
              cy={s.y}
              r={2.2}
              className="fill-h1"
              opacity={0.55}
            />
          )
        })}
        <line
          x1={2 * CX - bestEnd.x}
          y1={2 * CY - bestEnd.y}
          x2={bestEnd.x}
          y2={bestEnd.y}
          className="stroke-detection"
          strokeWidth={1.4}
          strokeDasharray="5 4"
          opacity={0.9}
        />
        <line
          x1={2 * CX - dirEnd.x}
          y1={2 * CY - dirEnd.y}
          x2={dirEnd.x}
          y2={dirEnd.y}
          className="stroke-threshold"
          strokeWidth={2}
        />
        <circle
          cx={CX}
          cy={CY}
          r={4}
          className="fill-h0 stroke-card"
          strokeWidth={1.5}
        />
        <circle
          cx={meanPoint.x}
          cy={meanPoint.y}
          r={4.5}
          className="fill-h1 stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={meanPoint.x + 8}
          y={meanPoint.y - 6}
          className="fill-h1 font-mono text-[10px]"
        >
          Ap
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        The meter is the honest deflection (uᵀΔμ)²/uᵀCu of the current picture —
        drag on the plot to aim the direction.
      </p>
    </FigureShell>
  )
}

export { WhitenMatchFigure }
