import { useMemo, useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import { MathText } from '@/components/MathText.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { linspace } from '@/domain/math/distributions.ts'

const F0 = 0.12
const W = 470
const H = 230

/** Solve the small symmetric system R h = r by Gaussian elimination. */
function solve(
  matrix: Array<Array<number>>,
  rhs: Array<number>,
): Array<number> {
  const n = rhs.length
  const a = matrix.map((row, i) => [...row, rhs[i] ?? 0])
  for (let col = 0; col < n; col += 1) {
    let pivot = col
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row]?.[col] ?? 0) > Math.abs(a[pivot]?.[col] ?? 0)) {
        pivot = row
      }
    }
    const tmp = a[col]
    const piv = a[pivot]
    if (tmp === undefined || piv === undefined) {
      continue
    }
    a[col] = piv
    a[pivot] = tmp
    const diag = a[col]?.[col] ?? 1
    for (let row = col + 1; row < n; row += 1) {
      const factor = (a[row]?.[col] ?? 0) / diag
      for (let k = col; k <= n; k += 1) {
        const target = a[row]
        if (target !== undefined) {
          target[k] = (target[k] ?? 0) - factor * (a[col]?.[k] ?? 0)
        }
      }
    }
  }
  const h = Array.from({ length: n }, () => 0)
  for (let row = n - 1; row >= 0; row -= 1) {
    let acc = a[row]?.[n] ?? 0
    for (let k = row + 1; k < n; k += 1) {
      acc -= (a[row]?.[k] ?? 0) * (h[k] ?? 0)
    }
    h[row] = acc / (a[row]?.[row] ?? 1)
  }
  return h
}

function PredictorFigure() {
  const [snrDb, setSnrDb] = useState(6)
  const [taps, setTaps] = useState(3)

  const snr = 10 ** (snrDb / 10)
  const sigma2 = 1 / (1 + snr) // total power normalized to 1
  const tonePower = snr * sigma2

  // r_x(m) = tonePower·cos(2πf₀m) + σ²δ(m)  (real tone, random phase)
  const r = (m: number) =>
    tonePower * Math.cos(2 * Math.PI * F0 * m) + (m === 0 ? sigma2 : 0)

  const solution = useMemo(() => {
    const matrix = Array.from({ length: taps }, (_, i) =>
      Array.from({ length: taps }, (_, j) => r(Math.abs(i - j))),
    )
    const rhs = Array.from({ length: taps }, (_, i) => r(i + 1))
    const h = solve(matrix, rhs)
    const xiMin = r(0) - rhs.reduce((acc, v, i) => acc + v * (h[i] ?? 0), 0)
    return { h, xiMin }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taps, snrDb])

  // Prediction-ERROR filter response |1 − Σ h_k e^{-j2πf(k+1)}|².
  const frequencies = useMemo(() => linspace(0.002, 0.498, 240), [])
  const response = frequencies.map((f) => {
    let re = 1
    let im = 0
    solution.h.forEach((hk, k) => {
      const angle = -2 * Math.PI * f * (k + 1)
      re -= hk * Math.cos(angle)
      im -= hk * Math.sin(angle)
    })
    return re * re + im * im
  })
  const responseDb = response.map((v) => 10 * Math.log10(Math.max(v, 1e-6)))
  const dbMin = -40
  const dbMax = 12

  const xOf = (f: number) => 34 + (f / 0.5) * (W - 44)
  const yOf = (db: number) =>
    16 + ((dbMax - Math.max(db, dbMin)) / (dbMax - dbMin)) * (H - 48)

  const notchDepth = Math.min(
    ...frequencies.map((f, i) =>
      Math.abs(f - F0) < 0.015 ? (responseDb[i] ?? 0) : Infinity,
    ),
  )

  return (
    <FigureShell
      title="Watch the error filter dig its own notch"
      instruction="The predictor is designed only from the autocorrelation — nobody tells it the tone's frequency. The curve is the prediction-error filter's response $|H_{eq}(f)|^2$, honestly computed from $\mathbf{h}_{opt} = \mathbf{R}^{-1}\mathbf{r}$. Raise the SNR and watch a null carve itself at $f_0$."
      controls={
        <>
          <SliderControl
            label="Tone SNR"
            variable="SNR"
            value={snrDb}
            min={-10}
            max={30}
            step={0.5}
            meaning="How much memory survives the noise."
            onValueChange={setSnrDb}
            format={(v) => `${v.toFixed(1)} dB`}
          />
          <SliderControl
            label="Predictor length"
            variable="Q"
            value={taps}
            min={1}
            max={8}
            step={1}
            meaning="One tone needs $Q \geq 1$; $M$ tones need $Q \geq M$."
            onValueChange={setTaps}
            format={(v) => `Q = ${v.toFixed(0)}`}
          />
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="$\xi_{\min}$ (unpredictable part)"
            value={formatNumber(solution.xiMin, 3)}
            tone="h1"
          />
          <ReadoutRow
            label="Noise floor $\sigma_w^2$"
            value={formatNumber(sigma2, 3)}
            tone="good"
          />
          <ReadoutRow
            label="Notch depth at $f_0$"
            value={`${formatNumber(notchDepth, 1)} dB`}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            <MathText text="$\xi_{\min} \to \sigma_w^2$ as SNR grows: the tone becomes perfectly predictable and only the memoryless noise refuses." />
          </p>
        </>
      }
    >
      <Legend
        items={[
          {
            label: 'prediction-error filter $|H_{eq}(f)|^2$',
            swatchClass: 'stroke-h0',
          },
          {
            label: 'hidden tone frequency $f_0$',
            swatchClass: 'stroke-h1',
            dash: true,
          },
        ]}
      />
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="Frequency response of the prediction-error filter showing a notch at the tone frequency"
      >
        {[0, -10, -20, -30].map((db) => (
          <g key={db}>
            <line
              x1={30}
              y1={yOf(db)}
              x2={W - 10}
              y2={yOf(db)}
              className="stroke-border"
              strokeWidth={1}
              opacity={0.7}
            />
            <text
              x={26}
              y={yOf(db) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {db}
            </text>
          </g>
        ))}
        <line
          x1={xOf(F0)}
          y1={12}
          x2={xOf(F0)}
          y2={H - 30}
          className="stroke-h1"
          strokeWidth={1.4}
          strokeDasharray="4 4"
        />
        <path
          d={frequencies
            .map(
              (f, i) =>
                `${i === 0 ? 'M' : 'L'} ${xOf(f).toFixed(1)} ${yOf(responseDb[i] ?? 0).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={1.8}
        />
        <text x={xOf(F0) + 6} y={22} className="fill-h1 font-mono text-[10px]">
          f₀ (never disclosed to the filter)
        </text>
        <text
          x={W / 2}
          y={H - 10}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10px]"
        >
          frequency f — response in dB
        </text>
      </Plot>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <MathText text="This is the ALE: at the output $y(n)$ the tone survives, at the error $e(n)$ it has been notched away — separation without a tuner." />
      </p>
    </FigureShell>
  )
}

export { PredictorFigure }
