import { useMemo, useState } from 'react'
import { SliderControl } from '@/components/SliderControl.tsx'
import {
  FigureShell,
  Legend,
  Plot,
  ReadoutRow,
} from '@/components/figures/shared.tsx'
import { formatNumber } from '@/components/figures/figure-utils.ts'
import { makeRng, gaussian } from '@/domain/math/kernel.ts'

const N = 300
const W = 470
const TRACE_H = 100
const CURVE_H = 150

function makeScene(seed: number): {
  music: Array<number>
  noise: Array<number>
} {
  const rng = makeRng(seed)
  const music: Array<number> = []
  const noise: Array<number> = []
  for (let n = 0; n < N; n += 1) {
    music.push(
      0.9 * Math.sin(2 * Math.PI * 0.021 * n) +
        0.45 * Math.sin(2 * Math.PI * 0.053 * n + 1.2) +
        0.12 * gaussian(rng),
    )
    // Jackhammer: hard periodic bursts.
    const phase = (n % 46) / 46
    const burst = phase < 0.3 ? Math.sign(Math.sin(2 * Math.PI * 0.23 * n)) : 0
    noise.push(1.15 * burst + 0.1 * gaussian(rng))
  }
  // Normalize both to unit power (the exam's assumption).
  const norm = (arr: Array<number>) => {
    const p = arr.reduce((a, v) => a + v * v, 0) / arr.length
    const g = 1 / Math.sqrt(Math.max(p, 1e-9))
    return arr.map((v) => v * g)
  }
  return { music: norm(music), noise: norm(noise) }
}

function CancelKnobFigure() {
  const [gain, setGain] = useState(0.3)
  const [alphaPct, setAlphaPct] = useState(0)

  const alpha = alphaPct / 100
  const { music, noise } = useMemo(() => makeScene(9), [])

  // x = s + w (main mic), y = αs + w (reference mic), z = x − h·y.
  const z = music.map((s, n) => {
    const w = noise[n] ?? 0
    return s + w - gain * (alpha * s + w)
  })
  const x = music.map((s, n) => s + (noise[n] ?? 0))

  const pz = z.reduce((a, v) => a + v * v, 0) / z.length
  const hOpt = (alpha + 1) / (alpha * alpha + 1)
  const a = 1 - gain * alpha
  const b = 1 - gain
  const snrZ = (a * a) / Math.max(b * b, 1e-9)
  const snrDb = 10 * Math.log10(Math.min(snrZ, 1e6))

  const pzCurve = (h: number) => (1 - h * alpha) ** 2 + (1 - h) ** 2

  const xOfTrace = (n: number) => 8 + (n / (N - 1)) * (W - 16)
  const yOfTrace = (v: number) => TRACE_H / 2 - v * (TRACE_H / 7)

  const hMin = -0.2
  const hMax = 1.8
  const xOfH = (h: number) => 34 + ((h - hMin) / (hMax - hMin)) * (W - 44)
  const maxCurve = 3.2
  const yOfP = (p: number) =>
    CURVE_H - 26 - (Math.min(p, maxCurve) / maxCurve) * (CURVE_H - 44)

  const curve = Array.from({ length: 120 }, (_, i) => {
    const h = hMin + (i / 119) * (hMax - hMin)
    return { h, p: pzCurve(h) }
  })

  return (
    <FigureShell
      title="Turn the knob until the jackhammer disappears"
      instruction="Mic 1 hears music + jackhammer (top trace). Mic 2 hears the jackhammer with a music leak α. The knob subtracts h·(mic 2). Find the quietest h by ear/eye, check it against the parabola — then raise the leak α and feel the tradeoff appear."
      controls={
        <>
          <SliderControl
            label="Cancellation gain"
            variable="h"
            value={gain}
            min={hMin}
            max={hMax}
            step={0.01}
            meaning="How much of the reference mic you subtract."
            onValueChange={setGain}
            format={(v) => v.toFixed(2)}
          />
          <SliderControl
            label="Music leak into mic 2"
            variable="α"
            value={alphaPct}
            min={0}
            max={100}
            step={1}
            meaning="0: mic 2 hears only the jackhammer — perfect placement."
            onValueChange={setAlphaPct}
            format={(v) => (v / 100).toFixed(2)}
          />
        </>
      }
      readout={
        <>
          <ReadoutRow
            label="Measured residual power P_z"
            value={formatNumber(pz, 3)}
            tone="h1"
          />
          <ReadoutRow
            label="Optimum h_opt = (α+1)/(α²+1)"
            value={formatNumber(hOpt, 3)}
            tone="good"
          />
          <ReadoutRow
            label="SNR of the cleaned signal"
            value={
              snrZ > 5e5
                ? '∞ (total cancellation)'
                : `${formatNumber(snrDb, 1)} dB`
            }
          />
          <p className="text-xs leading-5 text-muted-foreground">
            P_z is measured from the actual waveform; the parabola is the theory
            (1−hα)² + (1−h)². They agree — that is the point.
          </p>
        </>
      }
    >
      <Legend
        items={[
          { label: 'mic 1: music + jackhammer', swatchClass: 'stroke-h0' },
          { label: 'output z(n) after subtraction', swatchClass: 'stroke-h1' },
        ]}
      />
      <Plot
        viewW={W}
        viewH={TRACE_H}
        ariaLabel="Contaminated microphone signal"
      >
        <path
          d={x
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOfTrace(n).toFixed(1)} ${yOfTrace(v).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={1.1}
          opacity={0.8}
        />
      </Plot>
      <div className="mt-2" />
      <Plot viewW={W} viewH={TRACE_H} ariaLabel="Cleaned output signal">
        <path
          d={z
            .map(
              (v, n) =>
                `${n === 0 ? 'M' : 'L'} ${xOfTrace(n).toFixed(1)} ${yOfTrace(v).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h1"
          strokeWidth={1.1}
        />
      </Plot>
      <div className="mt-2" />
      <Plot
        viewW={W}
        viewH={CURVE_H}
        ariaLabel="Residual power as a function of the gain — a one-dimensional error bowl"
        onDragPoint={(px) => {
          const h = hMin + ((px - 34) / (W - 44)) * (hMax - hMin)
          setGain(Math.min(hMax, Math.max(hMin, h)))
        }}
      >
        <line
          x1={30}
          y1={CURVE_H - 26}
          x2={W - 10}
          y2={CURVE_H - 26}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <path
          d={curve
            .map(
              (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${xOfH(p.h).toFixed(1)} ${yOfP(p.p).toFixed(1)}`,
            )
            .join(' ')}
          fill="none"
          className="stroke-h0"
          strokeWidth={1.8}
        />
        <line
          x1={xOfH(hOpt)}
          y1={16}
          x2={xOfH(hOpt)}
          y2={CURVE_H - 22}
          className="stroke-detection"
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
        <circle
          cx={xOfH(gain)}
          cy={yOfP(pzCurve(gain))}
          r={6}
          className="fill-threshold stroke-card"
          strokeWidth={1.5}
        />
        <text
          x={xOfH(hOpt) + 6}
          y={26}
          className="fill-detection font-mono text-[10px]"
        >
          h_opt
        </text>
        <text
          x={W / 2}
          y={CURVE_H - 8}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10px]"
        >
          gain h — the 1-D slice of the Wiener bowl (drag)
        </text>
      </Plot>
    </FigureShell>
  )
}

export { CancelKnobFigure }
