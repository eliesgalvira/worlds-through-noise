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

## Detección: ronda base

Captura `det-base2` de `main` en `5d0f7298` (tras el catálogo). Detección se reparte en dos paquetes con la misma rúbrica, porque una captura entera son unas 300 imágenes y un revisor no puede leerlas (decidido por el agente, revisable). El paquete 1a lleva D3, D2 y el cuaderno, lo que más pesa en el parcial. El 1b lleva D1, D4 y D5. Cada paquete tiene 73 imágenes, a 1440 y 390 (900 queda fuera para que quepa), `extremo` solo con la figura y `resuelto` solo con lo que va tras la figura. Referencias: R1, R2, R4, R11 y R13, y en el 1a un problema resuelto con pasos.

Lanzados a las 23:26 y 23:28, informes a las 23:39 y 23:41. Auditorías limpias.

| Tarea                      | 1a ancho   | 1a móvil | 1b ancho       | 1b móvil       |
| -------------------------- | ---------- | -------- | -------------- | -------------- |
| T1 Motivada                | 2 (DET-07) | 2        | 1 (DET-13)     | 1              |
| T2 Leer la figura          | 1 (DET-06) | 1        | 1 (DET-10)     | 1              |
| T3 Predecir y comprobar    | 0 (DET-01) | 0        | 0 (DET-09)     | 0              |
| T4 Del dibujo a la fórmula | 0 (DET-03) | 0        | 0 (DET-08)     | 0              |
| T5 Problema de examen      | 0 (DET-02) | 0        | no verificable | no verificable |
| T6 Orientarse              | 2 (DET-12) | 2        | 3              | 2 (DET-12)     |

### Registro de defectos

| Id     | Gravedad | Qué                                                                                                                                                           | Visto por                                  | Estado  |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------- |
| DET-01 | bloquea  | Predicción de D3 falsa: con **p** sobre el eje ruidoso, $\mathbf C_w^{-1}\mathbf p \parallel \mathbf p$                                                       | 1a, verificado (Tema 2, p. 33 y 38)        | abierto |
| DET-02 | bloquea  | Cuaderno de la anemia, g) y h): piden un ROC que no se ve                                                                                                     | 1a, verificado (parcial 2025-04, p. 2 y 5) | abierto |
| DET-03 | bloquea  | ENR: la nota da $2\lvert A\rvert^2\mathbf p^H\mathbf C_w^{-1}\mathbf p$ como general, pero el 2 es del modelo complejo. Varios nombres para la misma magnitud | 1a, verificado (Tema 2, p. 23, 28 y 31)    | abierto |
| DET-04 | adivinar | D3 promete histogramas de las sombras y un medidor que la figura no dibuja. La lectura usa u, Δμ y C, y la ecuación h, p y C_w                                | 1a                                         | abierto |
| DET-05 | adivinar | Ecuaciones cortadas a 390 px sin señal (47 en el cuaderno)                                                                                                    | 1a, 1b                                     | abierto |
| DET-06 | adivinar | D2: α sale marrón bajo el verde, $P_D$ sin leyenda, el ROC en el ámbar de H1, la línea sin γ, los ejes sin escala, el rótulo cortado a 390                    | 1a                                         | abierto |
| DET-07 | fricción | La fórmula llega antes que el problema, y las metáforas tapan los términos técnicos                                                                           | 1a, 1b (DET-13)                            | abierto |
| DET-08 | bloquea  | D4 mezcla el modelo real (texto y examen) y el complejo (figura)                                                                                              | 1b                                         | abierto |
| DET-09 | bloquea  | Predicción de D4 con «$N = 2$ (complex)»: con $\chi^2_4$ la respuesta 0,32 es falsa                                                                           | 1b                                         | abierto |
| DET-10 | adivinar | D1: eje sin cifras, área ámbar sin nombre, «decide H0» fijo y tachado por el umbral                                                                           | 1b                                         | abierto |
| DET-11 | adivinar | D4: eje reescalado sin marcas, etiquetas que chocan                                                                                                           | 1b                                         | abierto |
| DET-12 | fricción | Índice: «Perform the action» y «Prediction & transfer» se repiten diez veces, la barra del móvil no dice el apartado, faltan problemas sin señal de scroll    | 1a, 1b                                     | abierto |
| DET-13 | adivinar | Siglas y símbolos sin presentar: NP, σ₀² y σ₁², ENR con una A que no existe en D1, MRB, εᵢ                                                                    | 1b                                         | abierto |
| DET-14 | adivinar | γ nombra el umbral de la media y el del cociente de verosimilitudes en D1                                                                                     | 1b                                         | abierto |
| DET-15 | adivinar | El $P_D$ del carcelero pasa a rojo, el color de la falsa alarma                                                                                               | 1b                                         | abierto |
| DET-16 | menor    | Mezcla de idiomas en las fuentes de examen («TEMA 02», «7 ABRIL 2025») y notación que cambia ($P_D$ y $P_d$)                                                  | 1a, 1b                                     | abierto |
| DET-17 | menor    | Rótulos SVG con guion bajo («P_FA →»)                                                                                                                         | 1a                                         | abierto |

## Detección: ronda 1

Commits `b110bfc8` y `434339b4`. Los dos paquetes se arreglan en una sola ronda, porque casi todo vive en piezas compartidas. Un subagente Opus verificó contra el temario los tres hallazgos de contenido del paquete 1a (DET-01, DET-02 y DET-03). El revisor tenía razón en los tres, aunque en DET-03 solo a medias: el 2 es correcto en el modelo complejo.

Qué cambió y qué defecto ataca:

- DET-01: la predicción de D3 pregunta ahora por un **p** entre los dos ejes, y la respuesta explica por qué **p** solo es óptimo si es autovector.
- DET-03: la nota separa el caso real ($NA^2/\sigma^2$ y $d_M^2$) del complejo ($SNR_y$ con su 2), y la figura de D3 usa los nombres del temario.
- DET-08 y DET-09: D4 pasa a muestras reales, como el examen de junio de 2026. La predicción con $N = 2$ es ahora exacta ($\chi^2_2$ es exponencial).
- DET-02: el enunciado de g) da los tres puntos leídos del ROC del examen.
- DET-13 y DET-14: η para el umbral del cociente, $q_0$ y $q_1$ en la binomial, MRB desplegada, ENR con $m_1 - m_0$.
- DET-06, DET-10, DET-11 y DET-17: piezas nuevas `AxisTicks` y `Sym` en la librería, áreas con su símbolo, rótulos de decisión junto al umbral, D2 apilada en el móvil, ROC en tinta con el punto en color cursor, D4 en eje fijo de potencia media.
- DET-05: `MathBlock` reduce la ecuación hasta el 60 % para que quepa, y desvanece el borde si aún desborda. En el cuaderno a 390 px, de 47 ecuaciones con scroll se pasa a 29, y esas 29 llevan la señal.
- DET-12: el índice pierde las dos subentradas genéricas de cada apartado, y la barra del móvil dice el apartado.
- DET-15: el $P_D$ del carcelero ya no pasa a rojo.

Regresión vista antes de lanzar: a 390 px, en D1, los rótulos de decisión, que ahora siguen al umbral, chocaban con «H1» y «H0». Se arregló en `434339b4` antes de lanzar.

Lo que el banco enseñó sobre sí mismo: una captura de página entera agranda la ventana, y con ella cada unidad `svh`, así que la página se reorganizaba a mitad de captura (cuelgues de 30 s y teselas fuera de la página). `Plot` lee ahora su tope de alto de `--plot-max-h`, que el banco fija en píxeles. Además, un `ResizeObserver` por ecuación hacía que la captura del estado resuelto pasara de 37 s a más de 5 minutos; se cambió por una medida única al montar.

Notas tras la ronda 1 (informes a las 00:46 y 00:47, auditorías limpias):

| Tarea | 1a ancho          | 1a móvil | 1b ancho            | 1b móvil       |
| ----- | ----------------- | -------- | ------------------- | -------------- |
| T1    | 2                 | 2        | 1                   | 1              |
| T2    | 1                 | 1        | 0 (pie de D5 falso) | 0              |
| T3    | 0 (sombras de D3) | 0        | 1                   | 1              |
| T4    | 1                 | 1        | 0 (frase √N en D4)  | 0              |
| T5    | 2                 | 2        | no verificable      | no verificable |
| T6    | **4**             | **4**    | **4**               | 3              |

Cerrados en la ronda 1: DET-01, DET-03 (a medias, falta la línea que une la figura con la ecuación compleja), DET-08, DET-09, DET-10 (en parte), DET-12, DET-13 (en parte), DET-14 y DET-15. Abiertos nuevos: DET-18 (`bloquea`, el pie de D5 decía que las dos probabilidades suman las barras sombreadas), DET-19 (`bloquea`, «la separación es √N» contra √(N/2) en la ecuación de D4), DET-20 (cuerpo de la lección desalineado con la cabecera a 1440) y DET-21 (las lecturas lejos de su marca).

## Detección: ronda 2

Commits `0c3a9ac0` y el siguiente (marcas del ROC). Ataca DET-04 (la sombra de D3: las dos densidades proyectadas, con la SNR entre los centros), DET-18 y DET-19 (verificados a mano contra la propia ecuación), DET-03 (línea bajo la ecuación de D3), DET-02 (el ROC del examen redibujado en el enunciado, con el + calculado con el umbral MAP), DET-20 (un solo contenedor de 80 rem), DET-21 (valores junto a $P_{FA}$, $P_M$, γ y el punto del ROC), DET-16 (fuentes en inglés y sin «·»), DET-07 en las tarjetas (títulos con los términos del examen), D5 (barras de error con contorno y riesgo de Bayes) y la notación (μ, $P_D$). El brief prohíbe «;» como separador en la UI: los 67 «;» de la prosa de detección, estimación y procesos pasaron a punto.

Un fallo mío visto antes de lanzar: el significado del control de D3 mostraba «mathbfh» porque escapé dos veces una barra en un atributo JSX. Quedó arreglado, y el test de guarda lo detecta desde ahora.

## Detección: rondas 3 a 5 y fusión

| Tarea                      | base 1a | r5 1a ancho          | r5 1a móvil | base 1b        | r5 1b ancho                 | r5 1b móvil   |
| -------------------------- | ------- | -------------------- | ----------- | -------------- | --------------------------- | ------------- |
| T1 Motivada                | 2       | 2                    | 2           | 1              | 2                           | 2             |
| T2 Leer la figura          | 1       | 1                    | 1           | 1              | 0 → arreglado en `458104c7` | 0 → arreglado |
| T3 Predecir y comprobar    | 0       | 3 (4 en la r4)       | 2           | 0              | 2                           | 2             |
| T4 Del dibujo a la fórmula | 0       | 2                    | 2           | 0              | 1 → arreglado en `458104c7` | 1 → arreglado |
| T5 Problema de examen      | 0       | 2 (4 en las r3 y r4) | 2           | no verificable | —                           | —             |
| T6 Orientarse              | 2       | **4**                | **4**       | 3              | **4**                       | **4**         |

Revisores: 12 en total (dos por ronda, de la base a la r5), todos Opus 5.5 effort high, nuevos y en hilos del proyecto de revisores, y todas las auditorías limpias. Cada informe se leyó entero, y cada hallazgo raro se miró en la imagen exacta antes de actuar.

Qué cambió en las rondas 3 a 5:

- r3: rótulos de D3 coherentes con el blanqueo (regresión de la r2, ya fijada), $Q_{\chi^2_N}$ (era $Q_{\chi_N}$), $\sigma_z^2$ definido, $\eta$ en D5, lecturas justo bajo cada figura (cambio de librería en `FigureShell`), D3 con nube y sombra lado a lado, D4 con colas sombreadas, D5 con barras ponderadas por prior y coste.
- r4: frases rotas por el cambio de «;» reescritas, γ en serif cursiva (en monoespaciada se leía como y), valores dentro de las áreas, D5 con barras de error rotuladas, el banco calcula bien el desplazamiento de la vista en el móvil.
- r5: `Hatch` en la librería (α rayado sobre $P_D$ en vez de marrón), D4 con curvas y áreas rotuladas, sombra de D3 con su barra nombrada.
- Simplify: utilidad `plot-halo` en vez de 13 halos escritos a mano, `StatementFigure` con clave tipada y sin cadena de props.

Verificación de contenido antes de fusionar: dos subagentes Opus contra `course/` (informes `merge1` y `merge2`). `merge1` encontró 1 error (la acción de D3 decía que **p** se inclina hacia el eje ruidoso, cuando está justo a medio camino) y 4 dudosos. `merge2` no encontró ningún error y sí 4 dudosos. Todos arreglados o anotados en el texto («las transparencias llaman $\gamma_{MRB}$ a este umbral», «la resolución impresa llama γ al multiplicador»). Code-review en dos ejes de `origin/main..69958458`, y después de cada rango nuevo (`..e24445d8`, `..133dcce2`, `..2af386f4`, `..458104c7`). Simplify con cuatro ángulos.

Compromisos al fusionar (decidido por el agente, revisable). Lo que no llega al 95 %:

- **T1 (2):** los revisores piden abrir D2 a D5 con el problema concreto antes de la fórmula. La gramática de la lección («nombrar la trampa») abre con la fórmula del examen a propósito. Reordenar la prosa de cinco apartados es reescribir contenido verificado, y no da tiempo antes del corte. Queda para el lunes.
- **T3 y T5 en el móvil (2):** a 390 px la figura y su control no caben juntos, y las ecuaciones largas del cuaderno se encogen o desplazan. La solución correcta es partir cada ecuación en líneas (`aligned`), una por una, más de 29 ecuaciones. Queda para el lunes.
- **T2 (1) en el paquete 1a:** quedan etiquetas que se rozan en D3 y dos marcas sin rótulo en la sombra.
- **T4 (2) en el paquete 1a:** las ecuaciones de D3 son del modelo complejo del curso, y la figura es el caso real. La nota lo explica, pero el revisor sigue pidiendo una marca por término.
- **T5 en ancho (2 en la r5):** el ROC del examen queda arriba en el enunciado, lejos de los apartados g y h que lo usan.

Contraste con la meta: T6 llega a 4 en los dos anchos y los dos paquetes. T3 llegó a 4 en ancho en la r4. Los errores de contenido de la base (9 que bloqueaban) están cerrados.

## Estimación: ronda base

Captura `est-base2` de `main` en `9d60ae15`. Dos paquetes como en detección: el 2a lleva E2, E1 y el cuaderno, el 2b lleva E3 y E4. Referencias: cinco productos de estimación, y en el 2a un problema resuelto con pasos.

| Tarea                      | 2a ancho   | 2a móvil | 2b ancho       | 2b móvil       |
| -------------------------- | ---------- | -------- | -------------- | -------------- |
| T1 Motivada                | 1          | 1        | 2              | 2              |
| T2 Leer la figura          | 1          | 1        | 0 (EST-05)     | 0              |
| T3 Predecir y comprobar    | 1          | 1        | 0 (EST-05)     | 0              |
| T4 Del dibujo a la fórmula | 0 (EST-01) | 0        | 0 (EST-02)     | 0              |
| T5 Problema de examen      | 4          | 2        | no verificable | no verificable |
| T6 Orientarse              | 4          | 4        | 3              | 4              |

### Registro de defectos

| Id     | Gravedad | Qué                                                                                                          | Visto por                        | Estado               |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------- |
| EST-01 | bloquea  | E2: la CRB revelada lleva el 2 del ruido complejo y contradice el $\sigma^2/N$ del módulo, y no define **p** | 2a, verificado (Tema 3, p. 55)   | cerrado en r1        |
| EST-02 | bloquea  | E4: la CRB revelada es la de A conocida, y la banda de la figura usaba una fórmula de ningún modelo          | 2b, verificado (p. 97, Kay 3.41) | cerrado en r1        |
| EST-03 | bloquea  | E3: con el prior, la lectura de varianza decía $1/\sum 1/\sigma_i^2$ y mostraba la varianza a posteriori     | 2b, verificado                   | cerrado en r1        |
| EST-04 | adivinar | E2: la parábola se aplana en una meseta, eje θ sin escala, θ verdadero sin valor                             | 2a                               | cerrado en r1        |
| EST-05 | bloquea  | E3: el pie dice que el grosor es $1/\sigma_i^2$ y el muelle cambia sin tocar su σ                            | 2b, verificado                   | cerrado en r1        |
| EST-06 | adivinar | E1: el histograma se reescala entre fotogramas y el solape crea un tercer color                              | 2a                               | cerrado en r1        |
| EST-07 | adivinar | E4: ejes sin escala, $\hat f_{ML}$ sin marca                                                                 | 2b                               | cerrado en r1        |
| EST-08 | adivinar | Colores de rol: estimaciones en magenta o ámbar, sensores en azul, lecturas en verde de detección            | 2a, 2b                           | cerrado en r1        |
| EST-09 | fricción | Siglas y fórmulas antes del problema (introducción, E2, E3, E4) y frases de intriga                          | 2a, 2b                           | cerrado en r1        |
| EST-10 | fricción | El texto nombra controles que no existen: estrategia de dos bloques, «score meter»                           | 2b, verificado                   | cerrado en r1        |
| EST-11 | adivinar | «Prior confidence» funciona al revés de su nombre                                                            | 2b                               | cerrado en r1        |
| EST-12 | menor    | Guiones bajos en rótulos SVG, casilla nativa, «TEMA 03»                                                      | 2b                               | cerrado salvo «Tema» |

«Tema» se quedó en la ronda 1 y pasó a «Topic» en la ronda 3 (ver más abajo): los revisores lo marcaban en cada ronda como mezcla de idiomas.

## Estimación: ronda 1

Commits `d922d635` a la corrección del rótulo recortado de E1. Un subagente Opus verificó contra el temario los tres hallazgos de contenido (informe `est-r1`): el revisor tenía razón en los tres, y además encontró que la frase de los dos bloques describía un control inexistente. Los reemplazos salen literalmente del informe: Tema 3 p. 55 para E2, p. 97 para la ecuación de E4 y Kay 1993, ec. 3.41, para la sinusoide real que simula la figura.

Piezas nuevas en la librería: tonos `estimate` y `cursor` en `ReadoutRow`, y `niceTicks` con su test. El banco pierde el paso «marcar» (ninguna figura usa ya una casilla).

Notas tras la ronda 1 (auditorías limpias). Revisores nuevos, sin ningún `bloquea`, y todas las fórmulas visibles comprobadas como correctas:

| Tarea | 2a ancho   | 2a móvil | 2b ancho       | 2b móvil       |
| ----- | ---------- | -------- | -------------- | -------------- |
| T1    | 3          | 3        | 3              | 3              |
| T2    | 1          | 1        | 1              | 1              |
| T3    | 3          | 3        | **4**          | 2              |
| T4    | 1          | 1        | 1              | 1              |
| T5    | 3          | 2        | no verificable | no verificable |
| T6    | 1 (índice) | 1        | **4**          | **4**          |

## Estimación: ronda 2

Ataca lo que la ronda 1 dejó en `adivinar`: términos de ecuación sin marca (E1 dibuja centro y ±σ de cada montón y lee sesgo y MSE; E2 añade la franja del score con su pendiente $-I(\theta)$), títulos con el término técnico para el índice, la ecuación MAP con los sensores de la figura, muestras de leyenda con la forma de su marca (la librería cambia `square` por `mark`). En el cuaderno, los botones pasan a `Button` de la librería y el resultado lleva el recuadro.

| Tarea | 2a ancho | 2a móvil | 2b ancho       | 2b móvil       |
| ----- | -------- | -------- | -------------- | -------------- |
| T1    | 3        | 3        | 2              | 2              |
| T2    | 1        | 1        | 1              | 1              |
| T3    | 2        | 2        | 1              | 1              |
| T4    | 3        | 3        | 1              | 1              |
| T5    | 2        | 2        | no verificable | no verificable |
| T6    | **4**    | **4**    | **4**          | **4**          |

Cada revisor nuevo encuentra defectos que ya estaban y que el anterior no citó (en 2b, la frase «as sensors accumulate» sin control para añadir sensores, que lleva ahí desde julio). Se arreglan igual: el objetivo son los defectos, no la nota.

## Estimación: ronda 3

- `MathBlock` parte en líneas una ecuación demasiado ancha (tras sus relaciones, y entre las fórmulas que separa un `\qquad`) en vez de encogerla al 60 % y desvanecer el borde. Ataca el compromiso del móvil que quedó abierto en detección, y vale para todas las lecciones.
- E4 simula el tono complejo $Ae^{j2\pi fn}$ con ruido circular, el modelo del temario (p. 97), así que la lectura de la CRB y la ecuación revelada usan la misma cota y la misma SNR. Desaparece el pie que reconciliaba tono real y complejo.
- Texto: nada adelanta el resultado antes de la acción, ninguna entradilla del cuaderno responde a sus apartados, «Tema» pasa a «Topic» en todo el sitio (decidido por el agente, revisable: los revisores lo marcaban en cada ronda como mezcla de idiomas, y la regla es conservar el inglés).

## Estimación: rondas 4 a 7

Notas por ronda (ancho/móvil). Revisores nuevos en cada ronda, todos Opus 5.5 effort high, auditorías limpias.

| Tarea | 2a r3 | 2a r4 | 2a r5 | 2a r6 | 2b r3 | 2b r4 | 2b r5 | 2b r6 |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| T1    | 2/2   | 3/3   | 1/1   | 1/1   | 2/2   | 1/1   | 1/1   | 0/0   |
| T2    | 2/1   | 3/2   | 3/2   | 2/2   | 1/1   | 3/1   | 0/0   | 3/1   |
| T3    | 2/2   | 2/2   | 2/2   | 2/2   | 2/2   | 2/2   | 0/0   | 1/1   |
| T4    | 2/2   | 0/0   | 1/1   | 3/3   | 2/2   | 1/1   | 2/2   | 3/3   |
| T5    | 3/0   | 3/2   | 3/3   | 0/0   | —     | —     | —     | —     |
| T6    | 4/4   | 4/4   | 4/4   | 4/4   | 4/4   | 4/4   | 4/4   | 4/3   |

Lo que la nota no cuenta: cada ronda cerró los defectos que citaba la anterior, y los ceros nuevos son casi siempre errores de contenido que estaban desde julio y que un revisor nuevo encontró por primera vez. Cuatro, todos corregidos:

- «Si el score se curva, ningún estimador insesgado alcanza la cota» (E2). Falso: el criterio es la factorización $I(\theta)(g(\mathbf{x}) - \theta)$, y la exponencial y la Poisson del cuaderno tienen un score curvo que factoriza (r4).
- σ² sin definir en la transferencia del píxel (r4), y una nota mía con α en dos sentidos (r4, corregida en r5).
- «La media muestral tiene esperanza βαNA» en el paso b)01 del amplificador. Es la suma escalada β1ᵀx (r6).
- La tesis de la lección decía que la CRB acota la nube «de cualquier estimador». Solo la de los insesgados (r6).

Cambios de fondo en estas rondas:

- `MathBlock` parte en líneas las ecuaciones que no caben. El primer intento no funcionaba en el cuaderno: React 19 reescribía el `innerHTML` en cada re-render porque el objeto `{__html}` era nuevo. Se encontró midiendo la caja en un navegador real: el ajuste se aplicaba y un re-render posterior lo deshacía. Ahora el objeto está memoizado, y hay un solo oyente de fuentes para todas las ecuaciones.
- E4 simula el tono complejo del temario, dibuja la plantilla sobre las muestras, esconde el tono verdadero tras «Show the answer» y dibuja la banda de la CRB a escala (antes tenía un ancho mínimo que la exageraba hasta 60 veces).
- E2 dibuja el score, y E1 dibuja centro y dispersión de cada montón.

La auditoría de la r4 marcó «hill-climb» en las dos sesiones. Era el revisor describiendo el producto de referencia `producto-a` («the hill-climbing maximum likelihood figure»), no una fuga. Comprobado a mano en las dos sesiones.

### Puertas: code-review, simplify y verificación de contenido

Code-review en dos ejes de `9d60ae15..316321d9` (informe `code-review-est-1`). Respuestas:

- Arreglado: banda CRB no a escala, `MathBlock boxed` y `ControlRow` en la librería en vez de clases sueltas, «;» como separador, CRB etiquetada como teoría, pie de E1 por `MathText`, nota de E1 calculada, muestras de E2 sin tope de 60, `coarseStep` derivado, doble render de KaTeX, frases que destripaban predicciones, regla W ≈ 470 de AGENTS.md (con `plot-text-*` el tamaño aparente no depende del viewBox).
- Contestado sin cambio: los 9 commits que no dicen qué borraron ya están publicados (reescribir la historia de una rama con PR abierto no compensa); los siguientes sí lo dicen. Arrastre en E1–E3: no es una regresión, venía de julio, y E1 no tiene un parámetro continuo sobre el plano. Dispersión medida de f̂ en E4: exigiría cientos de periodogramas por render; la CRB va etiquetada como teoría. Los «;» de `adaptive.ts` y `wiener.ts` quedan fuera de alcance.

Simplify (cuatro ángulos). Arreglado: `AxisTicksY` en la librería, un solo oyente de fuentes con refit en un frame, HTML partido perezoso, `mse` y `sampleMean` del dominio, `periodogramAt` muerto borrado, refinado del pico memoizado, constantes con nombre. Contestado: un helper común para colocar etiquetas a un lado u otro; la regla de cada figura depende de sus propias marcas y un helper no la simplificaría.

Verificación de contenido: tres verificadores Opus contra `course/` (`est-r1`, `est-r2`, `est-r4`), todos sus errores y dudas aplicados o anotados. La verificación final de la lección entera (`est-merge`) encontró 2 errores (una referencia a un examen sin estimación de frecuencia y una errata de signo copiada de la resolución impresa del cable, ahora con una nota que lo dice) y 7 dudas. Todo aplicado.

Notas de las rondas 7 y 8 (ancho/móvil):

| Tarea | 2a r7 | 2a r8 | 2b r7 | 2b r8 |
| ----- | ----- | ----- | ----- | ----- |
| T1    | 1/1   | 2/2   | 3/3   | 2/2   |
| T2    | 3/2   | 3/2   | 3/2   | 1/1   |
| T3    | 3/2   | 3/2   | 3/2   | 2/2   |
| T4    | 3/3   | 3/3   | 1/1   | 3/3   |
| T5    | 3/3   | 3/3   | —     | —     |
| T6    | 4/4   | 4/4   | 4/4   | 4/4   |

En la ronda 8 el paquete 2a no tuvo ningún defecto por encima de `fricción`.

Ronda 8: «Predict first» pasó a ir antes de la figura en todas las lecciones (predecir después de ver no es predecir). El segundo code-review vio la regresión: en P1, D3, D5, A1 y A2 el párrafo de acción da la respuesta y quedaba justo encima. Ahora la predicción va entre el párrafo del objeto y el de la acción.

Code-review del segundo rango (`code-review-est-2`). Arreglado: el orden de la predicción, `populationStd` en el dominio, sumas de pesos de E3, `LegendItem` exportado, umbral de fórmulas irrompibles a 36 caracteres (a 360 px una fórmula del cuaderno de Wiener ensanchaba la página; comprobado a 360 px que ninguna lección desborda), «Noise std» en E2 y E4, tests de `\implies` y del caso sin espaciar, AGENTS.md (W hasta 640, figuras repartidas desde `CourseFigure.tsx`). Contestado: los commits sin cuerpo de este rango ya están publicados; el resto los lleva. `complexToneInNoise` tiene seis parámetros posicionales como `toneInNoise`, su gemelo real; un objeto de opciones solo para uno de los dos rompería la simetría. Los umbrales de lado de las etiquetas de E4 (0.12, 0.42) son márgenes de borde en unidades de frecuencia, comentados encima.
