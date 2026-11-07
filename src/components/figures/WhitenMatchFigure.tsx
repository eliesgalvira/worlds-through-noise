import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
  ReadoutNote,
  Sym,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { gaussian, makeRng } from '@/domain/math/kernel.ts'
import { linspace, normalPdf } from '@/domain/math/distributions.ts'

const W = 420
const H = 320
const CX = W / 2
const CY = H / 2

// Colored noise: strong along 30°, weak across it.
const NOISE_ANGLE = Math.PI / 6
const S_LOUD = 2.1
const S_QUIET = 0.65
// Pulse direction: 75°, halfway between the loud (30°) and quiet (120°) axes.
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

/** Mean shift and spread of the projection y = hᵀx along unit direction θ. */
function shadow(theta: number, t: number): { mean: number; sd: number } {
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
  const variance =
    ua * ua * S_LOUD ** (2 - 2 * t) + ub * ub * S_QUIET ** (2 - 2 * t)
  return { mean: u.x * mean.x + u.y * mean.y, sd: Math.sqrt(variance) }
}

/** SNR of the shadow along θ in the current (morphed) picture. */
function deflection(theta: number, t: number): number {
  const { mean, sd } = shadow(theta, t)
  return (mean * mean) / Math.max(sd * sd, 1e-9)
}

const SHADOW_W = 300
const SHADOW_H = 260

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

  // The shadow: both clouds projected onto the chosen direction, drawn as
  // their exact Gaussian densities on an axis wide enough for any θ.
  const proj = shadow(theta, t)
  const span = Math.max(Math.abs(proj.mean) + 3.5 * proj.sd, 4)
  const sx = (v: number) => 20 + ((v + span) / (2 * span)) * (SHADOW_W - 40)
  const shadowXs = linspace(-span, span, 160)
  const shadowPath = (center: number) =>
    shadowXs
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${sx(v).toFixed(1)} ${(SHADOW_H - 28 - normalPdf(v, center, proj.sd) * proj.sd * Math.sqrt(2 * Math.PI) * (SHADOW_H - 48)).toFixed(1)}`,
      )
      .join(' ')

  // Frame the current picture: the pulse plus two and a half noise
  // deviations along the loud axis always fit, whitened or not.
  const pulseNow = morph(
    {
      x: PULSE_LEN * Math.cos(PULSE_ANGLE),
      y: PULSE_LEN * Math.sin(PULSE_ANGLE),
    },
    t,
  )
  const whitened = t > 0
  const loudNow = S_LOUD ** (1 - t)
  const quietNow = S_QUIET ** (1 - t)
  const extent =
    Math.max(Math.abs(pulseNow.x), Math.abs(pulseNow.y)) + 2.5 * loudNow
  const scale = (Math.min(CX, CY) * 0.92) / extent
  const toScreen = (p: Pt) => ({ x: CX + p.x * scale, y: CY - p.y * scale })
  const meanPoint = toScreen(pulseNow)
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
      title="Whitening, then the matched filter"
      instruction="Blue: noise-only observations. Amber: pulse plus noise. Rotate the projection direction $\mathbf{h}$ and read the shadow below: with colored noise the best $\mathbf{h}$ is not $\mathbf{p}$. Then whiten the noise and look for the best direction again."
      controls={
        <>
          <SliderControl
            label="Projection direction"
            variable="θ"
            value={thetaDeg}
            min={0}
            max={180}
            step={1}
            meaning="Angle of the direction $\mathbf{h}$ from the horizontal axis: the line the detector projects onto."
            onValueChange={setThetaDeg}
            format={(v) => `${v.toFixed(0)}°`}
          />
          <SliderControl
            label="Whitening"
            variable="t"
            value={whiten}
            min={0}
            max={100}
            step={1}
            meaning="Applies $\mathbf{C}_w^{-t/2}$ with $t$ from 0 to 1: 0% is the raw colored noise, 100% makes it white (round)."
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
            label="$SNR_y$ along $\theta$"
            value={formatNumber(d2, 2)}
          />
          <ReadoutRow
            label="Best possible $d_M^2$"
            value={formatNumber(best.value, 2)}
          />
          <ReadoutRow
            label="Your fraction of optimal"
            value={`${formatNumber((d2 / Math.max(best.value, 1e-9)) * 100, 0)}%`}
          />
          <ReadoutNote>
            <MathText text="At 100% whitening the best direction is simply toward the pulse, and mapping it back gives $\mathbf{h} \propto \mathbf{C}_w^{-1}\mathbf{p}$." />
          </ReadoutNote>
        </>
      }
    >
      <Legend
        items={[
          { label: '$\\mathcal{H}_0$ cloud (noise)', swatchClass: 'stroke-h0' },
          {
            label: '$\\mathcal{H}_1$ cloud (pulse + noise)',
            swatchClass: 'stroke-h1',
          },
          {
            label: 'your direction $\\mathbf{h}$',
            swatchClass: 'stroke-cursor',
          },
          {
            label: 'optimal $\\mathbf{h}$ for this picture',
            swatchClass: 'stroke-foreground',
          },
        ]}
      />
      <div className="grid items-center gap-3 sm:grid-cols-[1.4fr_1fr]">
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
          <line
            x1={8}
            y1={CY}
            x2={W - 8}
            y2={CY}
            className="stroke-border"
            strokeWidth={1}
          />
          <line
            x1={CX}
            y1={8}
            x2={CX}
            y2={H - 8}
            className="stroke-border"
            strokeWidth={1}
          />
          <text
            x={W - 10}
            y={CY - 6}
            textAnchor="end"
            className="fill-muted-foreground font-mono plot-text-xs"
          >
            x[0]
          </text>
          <text
            x={CX + 6}
            y={18}
            className="fill-muted-foreground font-mono plot-text-xs"
          >
            x[1]
          </text>
          <ellipse
            cx={CX}
            cy={CY}
            rx={loudNow * scale}
            ry={quietNow * scale}
            transform={`rotate(${String(-(NOISE_ANGLE * 180) / Math.PI)} ${String(CX)} ${String(CY)})`}
            fill="none"
            className="stroke-h0"
            strokeWidth={1.2}
            strokeDasharray="2 3"
          />
          <text
            x={CX + Math.cos(NOISE_ANGLE) * 2.6 * loudNow * scale}
            y={CY - Math.sin(NOISE_ANGLE) * 2.6 * loudNow * scale}
            className="fill-h0 plot-halo font-mono plot-text-xs"
          >
            {whitened ? (
              'noise (1σ)'
            ) : (
              <>
                <Sym base="C" sub="w" /> (1σ)
              </>
            )}
          </text>
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
            className="stroke-foreground"
            strokeWidth={1.4}
            opacity={0.8}
          />
          <text
            x={bestEnd.x + (bestEnd.x >= CX ? -4 : 4)}
            y={bestEnd.y + (bestEnd.y < CY ? 14 : -6)}
            textAnchor={bestEnd.x >= CX ? 'end' : 'start'}
            className="fill-foreground plot-halo font-mono plot-text-xs"
          >
            {whitened ? (
              'optimal h'
            ) : (
              <>
                optimal ∝ <Sym base="C" sub="w" />
                ⁻¹p
              </>
            )}
          </text>
          <line
            x1={2 * CX - dirEnd.x}
            y1={2 * CY - dirEnd.y}
            x2={dirEnd.x}
            y2={dirEnd.y}
            className="stroke-cursor"
            strokeWidth={2}
          />
          <path
            d={`M ${String(CX + 30)} ${String(CY)} A 30 30 0 0 0 ${String(CX + 30 * Math.cos(theta))} ${String(CY - 30 * Math.sin(theta))}`}
            fill="none"
            className="stroke-cursor"
            strokeWidth={1.5}
          />
          <text
            x={CX + 46 * Math.cos(theta / 2)}
            y={CY - 46 * Math.sin(theta / 2) + 4}
            className="fill-cursor plot-halo font-mono plot-text-sm"
          >
            θ
          </text>
          <line
            x1={CX}
            y1={CY}
            x2={meanPoint.x}
            y2={meanPoint.y}
            className="stroke-h1-ink"
            strokeWidth={1.5}
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
            className="fill-h1-ink plot-halo font-mono plot-text-sm"
          >
            {whitened ? 'Δμ (whitened)' : 'Δμ = Ap'}
          </text>
        </Plot>
        <Plot
          viewW={SHADOW_W}
          viewH={SHADOW_H}
          ariaLabel="The two clouds projected onto the chosen direction"
        >
          <text
            x={10}
            y={16}
            className="fill-muted-foreground font-mono plot-text-sm"
          >
            shadow on your direction: y = hᵀx
          </text>
          <line
            x1={20}
            y1={SHADOW_H - 28}
            x2={SHADOW_W - 20}
            y2={SHADOW_H - 28}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
          <path
            d={shadowPath(0)}
            fill="none"
            className="stroke-h0"
            strokeWidth={2}
          />
          <path
            d={shadowPath(proj.mean)}
            fill="none"
            className="stroke-h1"
            strokeWidth={2}
          />
          <line
            x1={sx(0)}
            y1={SHADOW_H - 22}
            x2={sx(proj.mean)}
            y2={SHADOW_H - 22}
            className="stroke-foreground"
            strokeWidth={1}
          />
          <text
            x={(sx(0) + sx(proj.mean)) / 2}
            y={SHADOW_H - 8}
            textAnchor="middle"
            className="fill-foreground font-mono plot-text-sm"
          >
            gap of means, <Sym base="SNR" sub="y" /> = {formatNumber(d2, 2)}
          </text>
        </Plot>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="The shadow's separation is $(\Delta m_y)^2/\sigma_y^2$ in the picture shown. With no whitening that is $SNR_y = (\mathbf{h}^T A\mathbf{p})^2 / \mathbf{h}^T\mathbf{C}_w\mathbf{h}$. Drag on the cloud to aim $\mathbf{h}$." />
      </p>
    </FigureShell>
  )
}

export { WhitenMatchFigure }
