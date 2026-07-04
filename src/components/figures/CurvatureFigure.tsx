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
import { linspace } from '@/domain/math/distributions.ts'
import { gaussianVector, makeRng } from '@/domain/math/kernel.ts'

const TRUTH = 1
const W = 470
const H = 290
const T_MIN = -1.5
const T_MAX = 3.5

function CurvatureFigure() {
  const [n, setN] = useState(5)
  const [sigma, setSigma] = useState(1)
  const [seed, setSeed] = useState(21)

  const sample = useMemo(() => {
    const rng = makeRng(seed)
    return gaussianVector(rng, n).map((g) => TRUTH + sigma * g)
  }, [n, sigma, seed])

  const sampleMean = sample.reduce((a, b) => a + b, 0) / sample.length

  // Log-likelihood of θ for the actual sample (up to a constant):
  const logLik = (theta: number) =>
    -sample.reduce((acc, x) => acc + (x - theta) * (x - theta), 0) /
    (2 * sigma * sigma)

  const grid = useMemo(() => linspace(T_MIN, T_MAX, 220), [])
  const maxLl = logLik(sampleMean)
  const values = grid.map((theta) => logLik(theta) - maxLl)
  const floor = -14

  const crbStd = sigma / Math.sqrt(n)

  // Wobble strip: peak positions over 40 independent hypothetical samples.
  const peaks = useMemo(() => {
    const rng = makeRng(seed + 5000)
    const out: Array<number> = []
    for (let k = 0; k < 40; k += 1) {
      const draws = gaussianVector(rng, n)
      out.push(TRUTH + (sigma * draws.reduce((a, b) => a + b, 0)) / n)
    }
    return out
  }, [n, sigma, seed])

  const xOf = (theta: number) =>
    10 + ((theta - T_MIN) / (T_MAX - T_MIN)) * (W - 20)
  const yOf = (ll: number) => 14 + (Math.max(ll, floor) / floor) * (H - 76)

  return (
    <FigureShell
      title="Watch the landscape sharpen — information is curvature"
      instruction="The curve is the log-likelihood of every candidate $\theta$, computed from the actual samples (dots). Its peak is $\hat{\theta}_{ML}$; its sharpness is Fisher information. Draw fresh samples and watch the peak wobble exactly as much as the flatness allows — then raise $N$."
      controls={
        <>
          <SliderControl
            label="Sample size"
            variable="N"
            value={n}
            min={1}
            max={100}
            step={1}
            meaning="Each sample multiplies another factor into the likelihood."
            onValueChange={setN}
            format={(v) => `N = ${v.toFixed(0)}`}
          />
          <SliderControl
            label="Noise level"
            variable="σ"
            value={sigma}
            min={0.4}
            max={2.5}
            step={0.05}
            meaning="Weaker arguments per sample: the landscape flattens."
            onValueChange={setSigma}
            format={(v) => v.toFixed(2)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed((s) => s + 1)
            }}
          >
            Draw a fresh sample
          </Button>
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Peak $\hat{\theta}_{ML}$ (sample mean)"
            value={formatNumber(sampleMean, 3)}
            tone="h1"
          />
          <ReadoutRow
            label="CRB std $\sigma/\sqrt{N}$"
            value={formatNumber(crbStd, 3)}
            tone="good"
          />
          <ReadoutRow
            label="Std of the 40 peaks below"
            value={formatNumber(
              Math.sqrt(
                peaks.reduce((a, p) => {
                  const m = peaks.reduce((x, y) => x + y, 0) / peaks.length
                  return a + (p - m) * (p - m)
                }, 0) / peaks.length,
              ),
              3,
            )}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            The measured wobble tracks the theoretical floor because this
            estimator is efficient: its score is a straight line through the
            peak.
          </p>
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'log-likelihood of $\\theta$ (this sample)',
            swatchClass: 'stroke-h0',
          },
          { label: 'CRB width at the peak', swatchClass: 'stroke-detection' },
          { label: 'true $\\theta$', swatchClass: 'stroke-truth', dash: true },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Log-likelihood landscape with CRB width and peak wobble strip"
      >
        <line
          x1={xOf(TRUTH)}
          y1={10}
          x2={xOf(TRUTH)}
          y2={H - 42}
          className="stroke-truth"
          strokeWidth={1.4}
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <path
          d={grid
            .map(
              (theta, i) =>
                `${i === 0 ? 'M' : 'L'} ${xOf(theta).toFixed(1)} ${yOf(values[i] ?? floor).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={2}
        />
        <line
          x1={xOf(sampleMean - crbStd)}
          y1={yOf(-0.5)}
          x2={xOf(sampleMean + crbStd)}
          y2={yOf(-0.5)}
          className="stroke-detection"
          strokeWidth={3}
        />
        <circle
          cx={xOf(sampleMean)}
          cy={yOf(0)}
          r={4}
          className="fill-h1 stroke-card"
          strokeWidth={1.5}
        />
        {sample.slice(0, 60).map((x, i) => (
          <circle
            key={i}
            cx={xOf(Math.min(Math.max(x, T_MIN), T_MAX))}
            cy={H - 52}
            r={2.4}
            className="fill-truth"
            opacity={0.55}
          />
        ))}
        <line
          x1={10}
          y1={H - 42}
          x2={W - 10}
          y2={H - 42}
          className="stroke-border"
          strokeWidth={1}
        />
        {peaks.map((p, i) => (
          <circle
            key={i}
            cx={xOf(Math.min(Math.max(p, T_MIN), T_MAX))}
            cy={H - 26}
            r={2.4}
            className="fill-h1"
            opacity={0.6}
          />
        ))}
        <text
          x={12}
          y={H - 48}
          className="fill-muted-foreground font-mono text-[9px]"
        >
          samples
        </text>
        <text
          x={12}
          y={H - 16}
          className="fill-muted-foreground font-mono text-[9px]"
        >
          peak positions over 40 re-runs
        </text>
      </Plot>
    </FigureShell>
  )
}

export { CurvatureFigure }
