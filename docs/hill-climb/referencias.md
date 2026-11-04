# Referencias para los revisores

Elegidas el 4 de noviembre de 2026. Todas las URL respondían 200 ese día. Las capturas las saca el hilo del viernes: una por URL de página, con el logotipo y el nombre tapados, renombradas `producto-a.png`, `producto-b.png`… en cada paquete. Guarda en `~/.cache/wtn-hill-climb/referencias/fuentes.md` la URL de la página, la URL o el selector de lo capturado, el ancho de la ventana y qué se tapó. Ese archivo nunca entra en un paquete.

## Criterio

1. **Misma tarea que la lección.** Cada referencia enseña el mismo concepto del temario, o uno con la misma figura: dos campanas que se solapan con un umbral, una nube de estimaciones, una función de verosimilitud, una elipse de covarianza. Si la figura es la misma, el revisor compara diseño y no gusto.
2. **Interactiva y con texto alrededor.** El estudiante lee, mueve y vuelve a leer. Se descartan los vídeos sueltos, aunque Elies tenga a 3Blue1Brown como modelo de explicación motivada. De 3Blue1Brown se usan las páginas de lección, que alternan texto y figuras.
3. **Nombradas por Elies primero.** En junio puso rpsychologist como ejemplo de lo que quería y el artículo de Distill sobre procesos gaussianos como ejemplo de gusto (`96faa2df #132`). Las dos entran.
4. **Tres a cinco por paquete**, con la misma disposición que la pantalla, a un tamaño legible. Si una figura interactiva tiene un estado inicial vacío, captura un estado con datos, y apunta cuál en `fuentes.md`.

Antes de capturar, comprueba que la página carga y que la figura es la que se describe aquí. Si una URL ha cambiado, sustitúyela por otra que cumpla el criterio y apunta el cambio en este archivo.

## Banco

| Id  | URL                                                                   | Qué capturar                                                                           | Para qué lección                                       |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| R1  | https://rpsychologist.com/d3/NHST/                                    | Dos campanas H0 y H1 con α, β y potencia sombreadas y el control del tamaño del efecto | Detección D1 y D2                                      |
| R2  | https://mlu-explain.github.io/roc-auc/                                | La curva ROC junto a las dos distribuciones y el umbral                                | Detección D2                                           |
| R3  | https://rpsychologist.com/cohend/                                     | Solape de dos normales con sus lecturas numéricas                                      | Detección D1, peor caso de solape                      |
| R4  | https://setosa.io/ev/principal-component-analysis/                    | Nube 2D con sus ejes propios y la proyección                                           | Detección D3 (blanquear y proyectar) y procesos P3     |
| R5  | https://distill.pub/2019/visual-exploration-gaussian-processes/       | La figura de la gaussiana bivariante con su elipse y las marginales                    | Detección D3 y procesos P3                             |
| R6  | https://immersivemath.com/ila/ch10_eigen/ch10.html                    | Una figura de vectores propios con texto alrededor                                     | Procesos P3 y el apartado de Lagrange y autovectores   |
| R7  | https://rpsychologist.com/likelihood/                                 | La función de verosimilitud con su curvatura e información de Fisher                   | Estimación E2 (Cramér-Rao) y E4 (máxima verosimilitud) |
| R8  | https://mlu-explain.github.io/bias-variance/                          | La figura de sesgo y varianza con su descomposición del error                          | Estimación E1                                          |
| R9  | https://seeing-theory.brown.edu/frequentist-inference/index.html      | El apartado de estimación puntual con muestras repetidas                               | Estimación E1 y E3                                     |
| R10 | https://rpsychologist.com/d3/bayes/                                   | Prior, verosimilitud y posterior superpuestas                                          | Estimación MAP y problemas con prior                   |
| R11 | https://www.3blue1brown.com/lessons/bayes-theorem                     | Una figura de la lección con el texto que la motiva                                    | Detección D5 (MAP) y estimación MAP                    |
| R12 | https://jackschaedler.github.io/circles-sines-signals/dotproduct.html | El producto punto de dos señales muestra a muestra                                     | Procesos P2 (autocorrelación) y filtro adaptado        |
| R13 | https://ciechanow.ski/sound/                                          | Una figura con su control debajo, en medio del texto                                   | Disposición de figura y controles en cualquier lección |
| R14 | https://distill.pub/2017/momentum/                                    | El cuenco cuadrático con su control y la explicación al lado                           | Procesos P3 (el terreno de la matriz de correlación)   |

## Paquetes por pantalla

| Pantalla              | Referencias                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detección             | R1, R2, R4, R11, R13                                                                                                                                                                                                                                                                                 |
| Estimación            | R7, R8, R9, R10, R13                                                                                                                                                                                                                                                                                 |
| Procesos              | R5, R6, R12, R14, R13                                                                                                                                                                                                                                                                                |
| Cuaderno de problemas | Ninguna de este banco enseña soluciones paso a paso. Busca una página pública de problema resuelto que revele pasos uno a uno, por ejemplo un ejercicio de Brilliant, y apunta su URL aquí. Si no hay ninguna accesible sin sesión, el paquete del cuaderno va sin referencias y la rúbrica lo dice. |
| Inicio e índice       | R13 y una página de documentación con índice lateral activo. Elies tomó como modelo el índice de Fumadocs (`96faa2df #99`): https://fumadocs.dev/docs                                                                                                                                                |

R13 entra en todos los paquetes porque la queja más repetida de Elies es la disposición de figura y controles (`96faa2df #144`, `eea3834b #0`).

## Descartadas

- Vídeos de 3Blue1Brown: los revisores solo ven imágenes fijas, y un fotograma suelto no enseña el ritmo. Para la rúbrica del hilo del viernes sí importan, a través de lo que Elies dice de ellos en el hilo de TD.
- Explorable Explanations (https://explorabl.es/): es un índice de enlaces, no una explicación.
- Brilliant como captura general: casi todo está tras una sesión. Solo se usa si una página de problema se ve sin entrar.
