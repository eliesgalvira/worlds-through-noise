# Diario del hill-climb de estudio

Ejecución del 6 y 7 de noviembre de 2026, para el parcial del lunes 9. Autor: Claude Opus 5.5 en el hilo principal. Revisor: uno por ronda, Opus 5.5 effort high, nuevo y a ciegas. Las horas son CET y salen de `date`.

Para retomar tras perder el contexto: lee la tabla de progreso y el registro de defectos, y sigue por la primera fila sin cerrar.

## Tabla de progreso

| Pantalla     | Ronda  | Paquete | Revisor | Defectos abiertos | Cerrados        | Commits    | PR           |
| ------------ | ------ | ------- | ------- | ----------------- | --------------- | ---------- | ------------ |
| Base (julio) | hito 0 | —       | —       | —                 | 13 de contenido | `fad12015` | push directo |
| Banco y CI   | hito 1 | —       | —       | —                 | —               | —          | —            |

## Meta y escala (decidido por el agente, revisable)

Escala por tarea de 0 a 4, en enteros, ligada al defecto más grave citado: 0 bloquea la tarea, 1 obliga a adivinar, 2 añade fricción visible, 3 solo quedan detalles, 4 sin defecto ni en el peor caso. Cada tarea lleva dos notas, ancho (1440 y 900) y móvil (390). La meta del añadido de Elies del 6/11 a las 22:05 es el 95 % de la nota máxima en cada punto. Con enteros de 0 a 4, eso es un 4 en cada tarea y en cada ancho. Una ronda que no quita defectos no cierra la pantalla: obliga a cambiar de enfoque. La nota es el termómetro; el progreso se cuenta en defectos cerrados del registro.

Por qué 0 a 4 y no 0 a 10 con nota global y objetivo de 9 o 9,5, como Theo:

- Una nota de 0 a 10 sin anclas no es fiable: en el vídeo de Theo, Sol puso 9,5 en todo mientras omitía un defecto de la ronda anterior (19:43). En la tercera prueba de Molí, la nota de 0 a 4 ya saltaba ±1 con la misma evidencia escrita.
- Una nota global esconde la tarea bloqueada. Para estudiar importa cada tarea.
- Un objetivo dicho al revisor arrastra la nota hacia él (Theo, 20:03).

Lo que un experto en evaluación de UX habría rechazado de la escala que teníamos, y se cambió en `REVIEWER.md` de la skill: llamar «gravedad» a una escala que va al revés que la de Nielsen (en Nielsen, 4 es catastrófico), y puntuar las dimensiones visuales sin regla. Ahora los defectos llevan la gravedad en palabras (`bloquea`, `adivinar`, `fricción`, `detalle`) y las dimensiones visuales siguen la misma regla que las tareas.

Un solo revisor por ronda (la cuota de Codex está agotada hasta el 11/11). Se pierde el acuerdo entre dos proveedores, que era el filtro contra el gusto de uno solo. Para compensarlo: cada hallazgo se comprueba en la imagen exacta del paquete contra la rúbrica antes de actuar, el revisor es nuevo en cada ronda, y un hallazgo que solo es preferencia no entra si no toca una tarea.

## Hito 0: la base de julio

Commit `fad12015` en `main`. Un subagente Opus comparó cada fórmula y afirmación nueva con `course/` (con las imágenes de página donde la extracción falla). Resultado: 3 errores y 10 dudosas, todas corregidas en el mismo commit.

| #   | Dónde | Qué estaba mal                                                                                                                                                               | Fuente                             |
| --- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | W1    | $\mathbf r_{xd} = E\{\mathbf x(n)\,d(n)\}$ sin conjugar                                                                                                                      | Tema 4, principio de ortogonalidad |
| 2   | E2    | «el bamboleo baja como $1/N$»: es la varianza, el ancho baja como $1/\sqrt N$                                                                                                | Tema 3, p. 26                      |
| 3   | A1    | desacoplo «por coeficiente»: es por autovector de $\mathbf R_x$                                                                                                              | Tema 5, p. 20                      |
| 4   | D2    | $\gamma = \sigma_y Q^{-1}(\alpha)$ sin la condición de media nula bajo $\mathcal H_0$                                                                                        | Tema 2, p. 36                      |
| 5   | D4    | ley de la raíz cuadrada ambigua; ahora como potencia mínima detectable ($1/\sqrt N$ frente a $1/N$) y deflexiones $\sqrt{N/2}\,P/\sigma_w^2$ frente a $\sqrt{NP/\sigma_w^2}$ | Final de junio de 2026, ap. f y g  |
| 6   | E2    | información de Fisher como curvatura de $f$: es la de $\ln f$                                                                                                                | Tema 3, p. 26 y 31                 |
| 7   | E3    | faltaban ruido independiente y gaussiano y prior gaussiano                                                                                                                   | Tema 3, p. 32                      |
| 8   | E3    | «la varianza combinada apenas empeora»: no en general                                                                                                                        | Tema 3, p. 32                      |
| 9   | W2    | «la SNR se desploma con $\alpha \to 1$»: vuelve a 0 dB                                                                                                                       | Final de junio de 2026, ej. 2      |
| 10  | P1    | estacionariedad como «mismo histograma»: el curso usa sentido amplio                                                                                                         | Tema 1, p. 39                      |
| 11  | P1    | atribuía a los exámenes una frase que no aparece en ellos                                                                                                                    | Tema 1, p. 35                      |
| 12  | P3    | «steering vector» y filtro unitario $\mathbf s$ en vez de $\mathbf s/\sqrt Q$                                                                                                | Tema 1, p. 63 y 79                 |
| 13  | A2    | desajuste como exceso absoluto: es relativo a $\xi_{\min}$                                                                                                                   | Tema 5, p. 42                      |

Además, P1 decía «páginas 30 y 60» y la figura «$n = 10$ y $n = 60$»: unificado en 30.

## Hito 1: check, CI y banco

- `pnpm run check`: typecheck (también de `scripts/`), lint, format:check y vitest. `render-smoke` pasa a ser un test (`src/pages/render-smoke.test.tsx`) que falla si un módulo pierde su figura. CI en `.github/workflows/ci.yml` con check y build.
- Fuentes servidas en local (Fontsource 5.3.0, OFL) con `font-display: block` y precarga: la de reserva no se pinta y el logo no salta. Decidido por el agente, revisable.
- Banco: `scripts/hill-climb/captura.ts` con `scripts/hill-climb-captura.nu`. Puerto libre por ejecución, reloj, idioma, zona horaria y render de Chromium fijos, fallo ante red o consola. Estados `inicial`, `extremo` (todos los controles al máximo) y `resuelto` (todo desplegado), a 1440, 900 y 390. Cada apartado se parte en texto, figura y después, sin cortar nunca una figura, en teselas de como mucho 1568 px. Dos ejecuciones seguidas dan las mismas imágenes byte a byte.
- Interacciones: `scripts/hill-climb/interacciones.ts` dice qué hace el banco con cada figura, tomado de su propio texto, con el teclado sobre el slider. De 3 a 5 fotogramas y un `.txt` que dice la acción y no lo que debería verse.
- Paquete y auditoría en nushell, con test del paquete.

Lo que el banco ya mide en `/detection` a 390 px: el texto de los SVG se ve a 6–7,5 px, y las ecuaciones del cuaderno necesitan scroll horizontal. Entran en la ronda de catálogo.
