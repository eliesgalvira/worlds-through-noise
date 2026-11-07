/**
 * What the bench does to each figure, taken from the figure's own
 * instruction. Frame 1 is the figure after `antes`; each later frame follows
 * one step. Step text says the action only, never what should appear.
 */

export type Paso =
  | { readonly deslizar: string; readonly valor: number }
  | { readonly pulsar: string }

export type Interaccion = {
  readonly antes: ReadonlyArray<Paso>
  readonly pasos: ReadonlyArray<ReadonlyArray<Paso>>
}

const deslizar = (control: string, valor: number): Paso => ({
  deslizar: control,
  valor,
})
const pulsar = (boton: string): Paso => ({ pulsar: boton })

export const INTERACCIONES: Readonly<Record<string, Interaccion>> = {
  P1: {
    antes: [deslizar('Fix the page', 30)],
    pasos: [
      [deslizar('Fix the page', 60)],
      [pulsar('Burst'), deslizar('Fix the page', 30)],
      [deslizar('Fix the page', 60)],
    ],
  },
  P2: {
    antes: [deslizar('Lag', 0)],
    pasos: [[deslizar('Lag', 5)], [deslizar('Lag', 20)], [pulsar('White')]],
  },
  P3: {
    antes: [deslizar('Tone amplitude', 0)],
    pasos: [[deslizar('Tone amplitude', 1)], [deslizar('Tone amplitude', 2.5)]],
  },
  D1: {
    antes: [deslizar('Samples averaged', 1)],
    pasos: [
      [deslizar('Samples averaged', 4)],
      [deslizar('Samples averaged', 9)],
      [deslizar('Samples averaged', 25)],
    ],
  },
  D2: {
    antes: [deslizar('False-alarm budget', 1)],
    pasos: [
      [deslizar('False-alarm budget', 10)],
      [deslizar('False-alarm budget', 30)],
      [deslizar('Energy-to-noise ratio', 12)],
    ],
  },
  D3: {
    antes: [deslizar('Whitening', 0), deslizar('Projection direction', 0)],
    pasos: [
      [deslizar('Projection direction', 60)],
      [deslizar('Projection direction', 120)],
      [deslizar('Whitening', 100)],
      [deslizar('Projection direction', 60)],
    ],
  },
  D4: {
    antes: [deslizar('Observation length', 2)],
    pasos: [
      [deslizar('Observation length', 20)],
      [deslizar('Observation length', 150)],
      [deslizar('Signal-to-noise ratio', 2)],
    ],
  },
  D5: {
    antes: [],
    pasos: [
      [deslizar('Prior of a one', 10)],
      [deslizar('Cost of missing a 1', 10)],
      [deslizar('Flip probability', 45)],
    ],
  },
  E1: {
    antes: [deslizar('Samples per experiment', 8)],
    pasos: [
      [deslizar('Samples per experiment', 64)],
      [deslizar('Samples per experiment', 256)],
      [pulsar('Uniform noise')],
    ],
  },
  E2: {
    antes: [deslizar('Sample size', 1)],
    pasos: [
      [deslizar('Sample size', 10)],
      [deslizar('Sample size', 100)],
      [deslizar('Noise std', 2.5)],
    ],
  },
  E3: {
    antes: [],
    pasos: [
      [deslizar('Sensor 1 noise', 12)],
      [pulsar('Prior spring')],
      [deslizar('Prior spread', 1)],
    ],
  },
  E4: {
    antes: [deslizar('Samples', 16)],
    pasos: [
      [deslizar('Candidate frequency', 50)],
      [deslizar('Candidate frequency', 70)],
      [deslizar('Samples', 256), pulsar('Show the answer')],
    ],
  },
}

/** One line per transition, for the reviewer's `interaccion-<figura>.txt`. */
export function describirInteraccion(interaccion: Interaccion): string {
  const lineas = interaccion.pasos.map((paso, index) => {
    const acciones = paso.map(describirPaso).join(', luego ')
    return `Entre ${String(index + 1)} y ${String(index + 2)}: ${acciones}.`
  })
  return `${lineas.join('\n')}\n`
}

function describirPaso(paso: Paso): string {
  if ('deslizar' in paso) {
    return `mueve el control «${paso.deslizar}» hasta ${String(paso.valor)} con el teclado`
  }
  return `pulsa «${paso.pulsar}»`
}
