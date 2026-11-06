# Diario del hill-climb de estudio

Ejecución del 6 y 7 de noviembre de 2026, para el parcial del lunes 9. Autor: Claude Opus 5.5 en el hilo principal. Revisor: uno por ronda, Opus 5.5 effort high, nuevo y a ciegas. Las horas son CET y salen de `date`.

Para retomar tras perder el contexto: lee la tabla de progreso y el registro de defectos, y sigue por la primera fila sin cerrar.

## Tabla de progreso

| Pantalla     | Ronda  | Paquete | Revisor | Defectos abiertos | Cerrados        | Commits    | PR           |
| ------------ | ------ | ------- | ------- | ----------------- | --------------- | ---------- | ------------ |
| Base (julio) | hito 0 | —       | —       | —                 | 13 de contenido | `fad12015` | push directo |
| Banco y CI   | hito 1 | —       | —       | —                 | —               | —          | —            |

## Meta y escala (decidido por el agente, revisable)

Escala por tarea de 0 a 4, en enteros, ligada al defecto más grave citado: 0 `bloquea`, 1 `adivinar`, 2 `fricción`, 3 `menor`, 4 la tarea se hace a la primera en todas las imágenes de ese ancho. Un `detalle` se apunta pero no resta: si no, un revisor que busca defectos siempre encuentra uno y el 4 sería inalcanzable. Así está hoy en `REVIEWER.md` de la skill, que el hilo de Molí refinó después de mi cambio de las 21:56. Cada tarea lleva dos notas, ancho (1440 y 900) y móvil (390), y las dimensiones visuales siguen la misma regla con sus propias anclas. La meta del añadido de Elies del 6/11 a las 22:05 es el 95 % de la nota máxima en cada punto. Con enteros de 0 a 4, eso es un 4 en cada tarea y en cada ancho. Una ronda que no quita defectos no cierra la pantalla: obliga a cambiar de enfoque. La nota es el termómetro; el progreso se cuenta en defectos cerrados del registro. Al cerrar cada pantalla, un revisor nuevo compara a ciegas la base y la final (`version-x` y `version-y`, asignadas al azar), como pide ahora la skill.

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

### Puertas del hito 1 (PR #5)

Code-review en dos ejes de `fad12015..10c99521` y otro de `10c99521..090b5cc7` (los arreglos y el simplify), simplify con cuatro agentes, CI verde y `main` arrancado con las seis rutas sin errores. Arreglado: el test de render no podía fallar (contaba también el SVG del logo), `setSlider` no avisaba de un objetivo pasado, la auditoría daba positivo con la lista de skills, la CI no tenía ImageMagick, y el brief del revisor se contradecía con `storage.md`. Contestado por escrito, sin cambio:

- Nombres `leccion-<ancho>-<estado>-<seccion>-<n>.png` en vez de `leccion-<ancho>-<estado>.png`: una lección entera mide más de 10.000 px y un modelo de visión la reduce hasta no poder leerla, así que se corta en teselas de como mucho 1568 px, sin cortar nunca una figura. La rúbrica lo explica.
- `extremo` pone cada control en su máximo, no también en su mínimo: los mínimos son el estado de muchas tiras de interacción, que ya los enseñan.
- Animaciones: solo `DescentFigure` (filtrado adaptativo, fuera del parcial) anima. Cuando entre en una ronda, el banco usará `page.clock.install` y `runFor`.
- Las métricas de arranque y memoria se miden con los tres estados en paralelo: son orientativas, no se comparan entre rondas.
- Interacciones solo para P, D y E: Wiener y adaptativo quedan fuera de este parcial.

## Ronda de catálogo

Cada fila de `CATALOG.md` de la skill, contra `src/index.css`, `src/components/ui/` y `src/components/figures/shared.tsx`.

| Tipo                            | Veredicto en esta app                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fuentes                         | Ya resuelto en el hito 1: Inter 400/500, Spectral 400/600 y Plex Mono 400/500/600 servidas en local. Ningún `font-semibold` en sans (Inter no tiene 600 cargado); solo en titulares serif.                                                                                                                                                                                                                                                                             |
| Escala y peso                   | Tres niveles por apartado: titular serif 3xl a 4xl, prosa base 16 px, secundario 14 px. Las etiquetas mono en mayúsculas son un cuarto nivel: la de «Perform the action» se quita (rótulo de taxonomía, que Elies pidió quitar).                                                                                                                                                                                                                                       |
| Radio                           | Ya se cumple: `--radius` 0,5 rem, solo `rounded-md` y `rounded-lg`.                                                                                                                                                                                                                                                                                                                                                                                                    |
| Iconos                          | Lucide, trazo por defecto. Una sola marca por fila. Sin cambio.                                                                                                                                                                                                                                                                                                                                                                                                        |
| Espacio y densidad              | Tarjetas solo para la figura (`FigureShell`) y el aviso de predicción. Sin tarjetas dentro de tarjetas. Las lecturas pasan de filas «etiqueta … valor» a cifras con su etiqueta encima, en rejilla.                                                                                                                                                                                                                                                                    |
| Jerarquía                       | En las lecturas manda el número (mono 16 px) con su etiqueta encima en gris pequeño. Antes el número iba en 13 px al final de una fila de texto.                                                                                                                                                                                                                                                                                                                       |
| Contraste                       | Ver la tabla de abajo. El ámbar #d97706 como texto se queda entre 2,45 y 3,13 en todas las superficies: pasa a `accent-ink` #92400e (6,4 sobre el papel, 5,5 sobre `muted`) en todo el texto. #d97706 queda para trazos, rellenos y el logo. `muted-foreground` al 70 % y al 80 % (2,9 y 3,8) pasa a opaco.                                                                                                                                                            |
| Botones                         | El botón principal deja de ser azul H0 y pasa a tinta: en una figura de detección, un botón azul junto a la curva azul de H0 decía «esto es H0». El enlace «I have a prediction» se queda como enlace en `accent-ink`.                                                                                                                                                                                                                                                 |
| Una marca de color por elemento | Los controles (relleno del slider, borde del pulgador, foco) pasan a tinta. En una figura, el color queda solo para los datos.                                                                                                                                                                                                                                                                                                                                         |
| Navegación                      | El índice lateral se conserva; sus entradas inactivas pasan del 70 % de gris (2,9:1) a gris opaco.                                                                                                                                                                                                                                                                                                                                                                     |
| Recortes                        | El banco no ve texto cortado en `inicial` a ningún ancho. Las ecuaciones largas del cuaderno se desplazan en horizontal a 390 px (se mira en la ronda base).                                                                                                                                                                                                                                                                                                           |
| Color de identidad y estado     | Se mantiene: H0 azul, H1 ámbar, detección verde, falsa alarma roja, prior violeta. El umbral deja de ser ámbar (se confundía con H1 en la misma figura) y pasa a tinta piedra #44403c, discontinuo. Lo que mueve el estudiante (dirección de proyección, frecuencia candidata, filtro, corte, trayectoria, punto de equilibrio) usaba también el token del umbral; pasa a un rol propio, `cursor`, rosa #be185d (5,9 sobre las tarjetas), lejos del violeta del prior. |
| Foco frente a selección         | `--ring` pasa de azul H0 a tinta: el foco no se confunde con H0 ni con el umbral.                                                                                                                                                                                                                                                                                                                                                                                      |
| Textos y recuentos              | Se ve en las rondas.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Las cinco decisiones que pedía el brief:

1. **Disposición de `FigureShell`.** Elies pidió la figura lo más grande posible con los controles a mano (`eea3834b #0`) y rechazó gráfico y controles en dos columnas (`96faa2df #144`). Ahora la figura ocupa todo el ancho, con un alto máximo del 55 % de la ventana para que título, figura y controles quepan en una pantalla de 1440×900. Los controles van justo debajo, en rejilla de una a tres columnas, y las lecturas después. Decidido por el agente, revisable.
2. **Colores con dos papeles.** H0 y estimación comparten azul, pero nunca aparecen en la misma vista. El azul del botón principal sí coincidía con H0 en las figuras de detección y pasa a tinta. H1, umbral y acento compartían #d97706: el umbral pasa a tinta discontinua y el acento de texto a `accent-ink`. El logo conserva sus colores.
3. **Tamaño aparente del texto SVG.** Medido por el banco en `/detection`: antes, de 10 a 12,4 px a 1440 y de 6 a 7,5 px a 390. `Plot` publica ahora `--plot-px` (unidades del viewBox por píxel de pantalla) y las figuras usan las utilidades `plot-text-xs`, `plot-text-sm` y `plot-text` del tema. Ahora, de 10 a 12 px en los tres anchos.
4. **Etiquetas SVG y fichas de los sliders sin KaTeX.** Se quedan en Unicode mono: KaTeX no se puede pintar dentro de `<text>`, y las fichas son estilo de lectura de laboratorio, como dice `AGENTS.md`.
5. **Fuentes de Google.** Resuelto en el hito 1, sin salto del logo: el banco mide layout shift 0 en la carga.

Contraste WCAG calculado con los tokens (✗ < 3, ⚠ < 4,5):

| Texto               | background | card   | card/80 sobre fondo | card/40 sobre fondo | muted #e8e1d3 | muted/70 sobre card | secondary/60 sobre fondo | accent/5 sobre fondo | accent/15 sobre card | h1/15 sobre card | h0/10 sobre card | detection/12 sobre card | false-alarm/12 sobre card |
| ------------------- | ---------- | ------ | ------------------- | ------------------- | ------------- | ------------------- | ------------------------ | -------------------- | -------------------- | ---------------- | ---------------- | ----------------------- | ------------------------- |
| foreground          | 16.49      | 17.96  | 17.66               | 17.07               | 14.04         | 15.15               | 14.99                    | 15.70                | 15.33                | 15.33            | 15.12            | 15.17                   | 14.67                     |
| muted-foreground    | 5.40       | 5.89   | 5.79                | 5.59                | 4.60          | 4.96                | 4.91                     | 5.14                 | 5.02                 | 5.02             | 4.95             | 4.97                    | 4.81                      |
| accent              | 2.88 ✗     | 3.13 ⚠ | 3.08 ⚠              | 2.98 ✗              | 2.45 ✗        | 2.64 ✗              | 2.61 ✗                   | 2.74 ✗               | 2.67 ✗               | 2.67 ✗           | 2.64 ✗           | 2.65 ✗                  | 2.56 ✗                    |
| primary/h0/estimate | 9.35       | 10.19  | 10.02               | 9.68                | 7.96          | 8.59                | 8.50                     | 8.90                 | 8.70                 | 8.70             | 8.57             | 8.60                    | 8.32                      |
| detection           | 4.95       | 5.39   | 5.30                | 5.13                | 4.22 ⚠        | 4.55                | 4.50                     | 4.71                 | 4.60                 | 4.60             | 4.54             | 4.56                    | 4.41 ⚠                    |
| false-alarm         | 5.84       | 6.36   | 6.26                | 6.05                | 4.97          | 5.37                | 5.31                     | 5.56                 | 5.43                 | 5.43             | 5.36             | 5.37                    | 5.20                      |
| prior               | 6.42       | 6.99   | 6.87                | 6.64                | 5.46          | 5.89                | 5.83                     | 6.11                 | 5.97                 | 5.97             | 5.88             | 5.90                    | 5.71                      |
| amber-700           | 4.53       | 4.94   | 4.86                | 4.69                | 3.86 ⚠        | 4.17 ⚠              | 4.12 ⚠                   | 4.32 ⚠               | 4.22 ⚠               | 4.22 ⚠           | 4.16 ⚠           | 4.17 ⚠                  | 4.03 ⚠                    |
| stone-600           | 6.89       | 7.50   | 7.38                | 7.13                | 5.86          | 6.33                | 6.26                     | 6.56                 | 6.41                 | 6.41             | 6.32             | 6.34                    | 6.13                      |

Las etiquetas SVG en ámbar pasan a `h1-ink` #92400e: el #d97706 se queda para curvas y rellenos (3,1 sobre las tarjetas, suficiente para gráficos). Blanco sobre el azul primario: 10,4. Tinta sobre papel: 16,5. `accent-ink` #92400e: 6,4 sobre el papel, 7,0 sobre las tarjetas, 5,5 sobre `muted`. Tinta piedra #44403c: 9,3 sobre el papel.

Colores nuevos de esta ronda (texto o trazo sobre cada superficie):

| Color                               | fondo | tarjeta | muted | h1/15 sobre tarjeta | botón tinta/85 |
| ----------------------------------- | ----- | ------- | ----- | ------------------- | -------------- |
| accent-ink y h1-ink #92400e         | 6.40  | 6.97    | 5.45  | 5.95                | 1.70           |
| umbral #44403c                      | 9.28  | 10.10   | 7.90  | 8.62                | 1.17           |
| cursor #be185d                      | 5.45  | 5.94    | 4.64  | 5.07                | 1.99           |
| texto del botón (papel) sobre tinta | 1.00  | 1.09    | 1.17  | 1.08                | 10.86          |

Detección sobre `muted` (4,22) y sobre `false-alarm/12` (4,41) no se pintan como texto en ninguna pantalla: solo como trazo en las figuras, donde basta 3:1.
