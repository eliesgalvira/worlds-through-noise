import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { gaussian, makeRng } from '@/domain/math/kernel.ts'

const STEPS = 2600
const W = 470
const PANEL_H = 150

type Run = {
  readonly hPath: ReadonlyArray<number>
  readonly hTrue: ReadonlyArray<number>
  readonly learning: ReadonlyArray<number>
  readonly excessMeasured: number
}

/**
 * Scalar canceller (Final Jun 2026, Ex. 2 with α = 0):
 * x = s + g(n)·w, reference y = w, z = x − h·y. Optimal h is g(n).
 */
function runLms(mu: number, drift: boolean, seed: number): Run {
  const rng = makeRng(seed)
  const hPath: Array<number> = []
  const hTrue: Array<number> = []
  const learning: Array<number> = []
  let h = 0
  let smoothed = 1.6
  let tailAcc = 0
  let tailCount = 0
  for (let n = 0; n < STEPS; n += 1) {
    const g = drift ? 1 + 0.45 * Math.sin((2 * Math.PI * n) / 1400) : 1
    const s =
      Math.sin(2 * Math.PI * 0.023 * n) * Math.SQRT2 * 0.7 +
      0.55 * gaussian(rng)
    const w = gaussian(rng)
    const x = s + g * w
    const y = w
    const z = x - h * y
    h += mu * y * z
    smoothed = 0.985 * smoothed + 0.015 * z * z
    hPath.push(h)
    hTrue.push(g)
    learning.push(smoothed)
    if (!drift && n > STEPS * 0.6) {
      tailAcc += z * z
      tailCount += 1
    }
  }
  const xiTail = tailCount > 0 ? tailAcc / tailCount : 0
  return {
    hPath,
    hTrue,
    learning,
    excessMeasured: xiTail,
  }
}

function LmsFigure() {
  const [muPct, setMuPct] = useState(12)
  const [drift, setDrift] = useState(false)
  const [seed, setSeed] = useState(2)

  const mu = (muPct / 100) * 0.25
  const run = useMemo(() => runLms(mu, drift, seed), [mu, drift, seed])

  // ξ_min = P_s (music power ≈ 1 by construction); P_y = 1.
  const xiMin = 0.98 + 0.55 * 0.55 - 0.28 // ≈ measured below anyway
  const theoryExcess = (mu / 2) * 1 // (μ/2)·tr(R_y)·ξ_min with P_y = 1
  const measuredMis = run.excessMeasured / 1.0 - 1

  const xOf = (n: number) => 8 + (n / (STEPS - 1)) * (W - 16)
  const maxLearn = Math.max(...run.learning, 1e-6)
  const yOfLearn = (v: number) => PANEL_H - 22 - (v / maxLearn) * (PANEL_H - 40)
  const yOfH = (v: number) => PANEL_H / 2 - (v - 1) * 55

  return (
    <FigureShell
      title="The drunken descent that never sits still"
      instruction="A real LMS run on the two-microphone canceller: 2 600 honest iterations of $h(n{+}1) = h(n) + \mu\,y(n)\,z(n)$. Watch the learning curve flatten above the floor — that gap is the misadjustment you pay forever. Then let the world drift and see why tiny $\mu$ stops being safe."
      controls={
        <>
          <SliderControl
            label="Step size"
            variable="μ"
            value={muPct}
            min={1}
            max={100}
            step={1}
            meaning="Left: slow and clean. Right: fast and jittery."
            onValueChange={setMuPct}
            format={(v) => ((v / 100) * 0.25).toFixed(3)}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={drift}
              onChange={(event) => {
                setDrift(event.target.checked)
              }}
            />
            Let the true optimum drift (nonstationary world)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed((s) => s + 1)
            }}
          >
            New realization
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Theory: misadjustment $\mu P_y/2$"
            value={formatNumber(theoryExcess, 3)}
            tone="good"
          />
          {!drift ? (
            <ReadoutRow
              label="Measured excess (tail of run)"
              value={formatNumber(Math.max(measuredMis, 0), 3)}
              tone="h1"
            />
          ) : (
            <ReadoutRow
              label="Tracking lag visible below"
              value={mu < 0.02 ? 'severe' : mu < 0.08 ? 'moderate' : 'small'}
              tone={mu < 0.02 ? 'bad' : 'default'}
            />
          )}
          <p className="text-xs leading-5 text-muted-foreground">
            <MathText text="Same $\mu$ buys convergence speed, steady-state jitter AND tracking agility — one coin, three purchases." />
          </p>
        </>
      }
    >
      <Legend
        items={[
          { label: 'coefficient $h(n)$', swatchClass: 'stroke-h0' },
          {
            label: 'true optimum $h_{opt}(n)$',
            swatchClass: 'stroke-detection',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={PANEL_H}
        ariaLabel="LMS coefficient trajectory against the true optimum"
      >
        <path
          d={run.hTrue
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOf(n).toFixed(1)} ${yOfH(v).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-detection"
          strokeWidth={1.4}
          strokeDasharray="5 4"
        />
        <path
          d={run.hPath
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOf(n).toFixed(1)} ${yOfH(Math.max(Math.min(v, 2.2), -0.3)).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={1.2}
        />
        <text
          x={12}
          y={16}
          className="fill-muted-foreground font-mono text-[9px]"
        >
          h(n): never settles, only orbits
        </text>
      </Plot>
      <div className="mt-2" />
      <Legend
        items={[
          {
            label: 'smoothed error power $|z(n)|^2$',
            swatchClass: 'stroke-h1',
          },
          {
            label: 'floor $\\xi_{\\min}$ (music power)',
            swatchClass: 'stroke-truth',
            dash: true,
          },
        ]}
      />
      <Plot viewW={W} viewH={PANEL_H} ariaLabel="Learning curve of the LMS run">
        <path
          d={run.learning
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOf(n).toFixed(1)} ${yOfLearn(v).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h1"
          strokeWidth={1.5}
        />
        <line
          x1={8}
          y1={yOfLearn(xiMin)}
          x2={W - 8}
          y2={yOfLearn(xiMin)}
          className="stroke-truth"
          strokeWidth={1.2}
          strokeDasharray="5 4"
          opacity={0.8}
        />
        <text
          x={12}
          y={PANEL_H - 8}
          className="fill-muted-foreground font-mono text-[9px]"
        >
          iteration n →
        </text>
      </Plot>
    </FigureShell>
  )
}

export { LmsFigure }
