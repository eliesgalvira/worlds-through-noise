import { useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
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

const TRUE_SYSTEM = { c0: 0.8, c1: -0.5 }
const SIGMA_D = 0.35

function ErrorBowlFigure() {
  const [inputCorr, setInputCorr] = useState(0.55)
  const [h, setH] = useState({ h0: -0.4, h1: 0.55 })

  // Identification setting: x is AR-correlated (unit power), d = cᴴx + noise.
  const r0 = 1
  const r1 = inputCorr
  // r_xd = R c
  const rxd0 = r0 * TRUE_SYSTEM.c0 + r1 * TRUE_SYSTEM.c1
  const rxd1 = r1 * TRUE_SYSTEM.c0 + r0 * TRUE_SYSTEM.c1
  const pd = TRUE_SYSTEM.c0 * rxd0 + TRUE_SYSTEM.c1 * rxd1 + SIGMA_D * SIGMA_D

  const xi = (h0: number, h1: number) =>
    pd -
    2 * (h0 * rxd0 + h1 * rxd1) +
    (h0 * h0 * r0 + 2 * h0 * h1 * r1 + h1 * h1 * r0)

  // h_opt = R⁻¹ r  (2x2 inverse):
  const det = r0 * r0 - r1 * r1
  const hOpt0 = (r0 * rxd0 - r1 * rxd1) / det
  const hOpt1 = (-r1 * rxd0 + r0 * rxd1) / det
  const xiMin = xi(hOpt0, hOpt1)

  const eig = eigSym2(r0, r1, r0)
  const angleDeg = (-Math.atan2(eig.u1[1], eig.u1[0]) * 180) / Math.PI

  const currentXi = xi(h.h0, h.h1)
  // Orthogonality residual: E[x e*] = r_xd − R h.
  const resid0 = rxd0 - (r0 * h.h0 + r1 * h.h1)
  const resid1 = rxd1 - (r1 * h.h0 + r0 * h.h1)
  const residNorm = Math.hypot(resid0, resid1)

  const toX = (v: number) => CX + v * SCALE
  const toY = (v: number) => CY - v * SCALE

  const levels = [0.08, 0.3, 0.8, 1.6, 2.8]

  return (
    <FigureShell
      title="Feel for the bottom of the bowl"
      instruction="Every point is a 2-tap filter; the ellipses are iso-error contours of the honestly computed $\xi(\mathbf{h})$. Drag $\mathbf{h}$ downhill and watch the second meter: the correlation between input and residual error drains to zero exactly at the bottom — that is the orthogonality principle."
      controls={
        <>
          <SliderControl
            label="Input correlation"
            variable="r_x(1)"
            value={inputCorr}
            min={0}
            max={0.92}
            step={0.02}
            meaning="0: white input, round bowl. Large: stretched valley."
            onValueChange={setInputCorr}
            format={(v) => v.toFixed(2)}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            <MathText text="Scenario: identify the unknown system $\mathbf{c} = [0.8, -0.5]^T$ from its noisy output. Drag directly on the plot." />
          </p>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Error power $\xi(\mathbf{h})$"
            value={formatNumber(currentXi, 3)}
            tone="h1"
          />
          <ReadoutRow
            label="Floor $\xi_{\min}$ (noise on $d$)"
            value={formatNumber(xiMin, 3)}
            tone="good"
          />
          <ReadoutRow
            label="$\|E\{\mathbf{x}e\}\|$ — orthogonality meter"
            value={formatNumber(residNorm, 3)}
            tone={residNorm < 0.05 ? 'good' : 'bad'}
          />
          <ReadoutRow
            label="Excess $\Delta\mathbf{h}^T\mathbf{R}\,\Delta\mathbf{h}$"
            value={formatNumber(currentXi - xiMin, 3)}
          />
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'iso-error contours $\\xi(\\mathbf{h})$',
            swatchClass: 'stroke-h0',
          },
          {
            label: 'bottom $\\mathbf{h}_{opt} = \\mathbf{R}^{-1}\\mathbf{r}$',
            swatchClass: 'stroke-detection',
          },
          {
            label: 'your filter $\\mathbf{h}$',
            swatchClass: 'stroke-threshold',
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Iso-error contours of the Wiener cost with a draggable filter"
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
            cx={toX(hOpt0)}
            cy={toY(hOpt1)}
            rx={Math.sqrt(level / Math.max(eig.lambda1, 1e-9)) * SCALE}
            ry={Math.sqrt(level / Math.max(eig.lambda2, 1e-9)) * SCALE}
            transform={`rotate(${angleDeg.toFixed(2)} ${toX(hOpt0)} ${toY(hOpt1)})`}
            fill="none"
            className="stroke-h0"
            strokeWidth={1.1}
            opacity={0.6}
          />
        ))}
        <circle
          cx={toX(hOpt0)}
          cy={toY(hOpt1)}
          r={5}
          className="fill-detection stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={toX(hOpt0) + 9}
          y={toY(hOpt1) - 6}
          className="fill-detection font-mono text-[10px]"
        >
          h_opt
        </text>
        <line
          x1={toX(h.h0)}
          y1={toY(h.h1)}
          x2={toX(hOpt0)}
          y2={toY(hOpt1)}
          className="stroke-muted-foreground"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        <circle
          cx={toX(h.h0)}
          cy={toY(h.h1)}
          r={6.5}
          className="fill-threshold stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={toX(h.h0) + 10}
          y={toY(h.h1) + 4}
          className="fill-foreground font-mono text-[11px]"
        >
          h
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Turn the input correlation up and watch the bowl stretch: this exact
        stretching is what will slow LMS down in Tema 5.
      </p>
    </FigureShell>
  )
}

export { ErrorBowlFigure }
