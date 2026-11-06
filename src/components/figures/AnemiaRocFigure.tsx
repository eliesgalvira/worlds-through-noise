import { AxisTicks, Plot, Sym } from '@/components/figures/shared.tsx'
import { linspace, normalCdf } from '@/domain/math/distributions.ts'
import { qFunc, qInv } from '@/domain/math/kernel.ts'

const W = 420
const H = 300
/** Separation √N(m0 − m1)/σ read off the exam figure (midterm, April 2025). */
const DELTA = 2.38
const PRIOR_SICK = 0.1
const PFA_MAX = 0.3

/**
 * The ROC of the anemia exam, redrawn from the model: △ is NP at α = 0.05,
 * + is MAP with a 10 % prior (computed, it lands where the exam put it), and
 * o is the exam's point above the curve that no threshold on y reaches.
 */
function AnemiaRocFigure() {
  const x = (pfa: number) => 44 + (pfa / PFA_MAX) * (W - 60)
  const y = (pd: number) => H - 40 - pd * (H - 60)
  const curve = linspace(0.0005, PFA_MAX, 160)
    .map(
      (pfa, i) =>
        `${i === 0 ? 'M' : 'L'} ${x(pfa).toFixed(1)} ${y(qFunc(qInv(pfa) - DELTA)).toFixed(1)}`,
    )
    .join(' ')
  const logPrior = Math.log(PRIOR_SICK / (1 - PRIOR_SICK)) / DELTA
  const map = {
    pfa: qFunc(DELTA / 2 - logPrior),
    pd: normalCdf(DELTA / 2 + logPrior, 0, 1),
  }
  const marks = [
    { label: '△', pfa: 0.05, pd: qFunc(qInv(0.05) - DELTA) },
    { label: '+', pfa: map.pfa, pd: map.pd },
    { label: 'o', pfa: 0.05, pd: 0.85 },
  ]
  return (
    <figure className="my-2">
      <Plot
        viewW={W}
        viewH={H}
        ariaLabel="ROC of the test variable y with three marked points"
      >
        <line
          x1={44}
          y1={H - 40}
          x2={W - 16}
          y2={H - 40}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <line
          x1={44}
          y1={H - 40}
          x2={44}
          y2={20}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <path
          d={curve}
          fill="none"
          className="stroke-foreground"
          strokeWidth={2}
        />
        {marks.map((mark) => (
          <text
            key={mark.label}
            x={x(mark.pfa)}
            y={y(mark.pd) + 5}
            textAnchor="middle"
            className="fill-false-alarm stroke-card font-mono plot-text"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {mark.label}
          </text>
        ))}
        <AxisTicks
          y={H - 40}
          ticks={[0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3].map((v) => ({
            x: x(v),
            label: String(v),
          }))}
        />
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
          <text
            key={v}
            x={38}
            y={y(v) + 4}
            textAnchor="end"
            className="fill-muted-foreground font-mono plot-text-xs"
          >
            {String(v)}
          </text>
        ))}
        <text
          x={(W + 44) / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          false-alarm probability <Sym base="P" sub="FA" />
        </text>
        <text
          x={12}
          y={(H - 40) / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${String((H - 40) / 2)})`}
          className="fill-muted-foreground font-mono plot-text-sm"
        >
          detection probability <Sym base="P" sub="D" />
        </text>
      </Plot>
      <figcaption className="mt-2 text-center text-xs leading-5 text-muted-foreground">
        The exam’s figure, redrawn: one ROC of y, its false-alarm axis cut at
        0.3, and the three marked points.
      </figcaption>
    </figure>
  )
}

export { AnemiaRocFigure }
