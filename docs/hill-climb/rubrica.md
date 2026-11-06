# Rúbrica de estudio

Es el único texto que lee un revisor además de las imágenes. Quedó fija el 6 de noviembre, antes de la primera ronda base, y no cambia entre rondas. El paquete de cada pantalla lleva una copia sin esta cabecera.

---

## 1. Contexto

La pantalla es una lección de una web interactiva para estudiar un curso universitario de procesado estadístico de señal: procesos aleatorios, detección y estimación. La usa un estudiante de ingeniería de telecomunicación que domina el cálculo pero quiere _ver_ qué hace cada fórmula antes del examen. Estudia solo, en un portátil, en sesiones de una a tres horas, con papel al lado para resolver problemas. El examen se hace sin calculadora y con un formulario oficial, así que el estudiante tiene que razonar y derivar, no consultar.

Cada lección se lee de arriba abajo. Cada apartado plantea un problema real, da un objeto concreto que se puede manipular en una figura interactiva, deja que el estudiante haga la acción y solo entonces muestra la ecuación. Cierra con una pregunta de transferencia y, al final de la lección, problemas reales de examen que se resuelven paso a paso. Todos los números de las figuras se calculan con el modelo o con una simulación real.

Reglas visuales del producto: tema claro de papel cálido (fondo `#F7F3EA`, texto `#151515`, texto secundario `#6B6257` sobre `#F7F3EA`, tarjetas `#FFFDF8`, bordes `#D8CDBB`), titulares en serif, texto en sans, cifras y variables en monoespaciada. Fórmulas con KaTeX. Color de cada rol en las figuras: H0 `#1E3A8A`, H1 `#D97706`, detección `#047857`, falsa alarma `#B91C1C`, umbral `#44403C` discontinuo, lo que mueve el estudiante (una dirección, una frecuencia candidata, un filtro, un corte) `#A21CAF`, estimación `#1E3A8A`, valor verdadero `#151515`, prior `#6D28D9`. El texto en ámbar usa `#92400E`; `#D97706` solo se usa en trazos, rellenos y el logotipo. Los controles (botón principal, slider, foco) son de tinta `#151515`: en una figura, el color es de los datos.

## 2. Qué son las imágenes

- `leccion-<ancho>-<estado>-<seccion>-<n>.png`: la pantalla del producto. Anchos 1440, 900 y 390 px. Los estados son `inicial` (como se abre), `extremo` (cada control en su valor máximo) y `resuelto` (ecuaciones, respuestas y pasos de solución desplegados). La sección es `cabecera` (lo primero que se ve al abrir), `vista` (la ventana tal como se ve con la primera figura en pantalla, con la navegación), un apartado (`d1`, `d2`…) o `cuaderno` (los problemas de examen). Una sección larga va en varias imágenes seguidas, `-1`, `-2`…, cortadas siempre fuera de las figuras.
- `interaccion-<figura>-<ancho>-<n>.png`: fotogramas numerados de una misma manipulación de la figura, en orden. `interaccion-<figura>.txt` dice qué hace el estudiante entre un fotograma y el siguiente («mueve el control N hasta 25»). No dice qué debería verse.
- `producto-a.png`, `producto-b.png`…: capturas públicas de otras explicaciones interactivas, para comparar. No llevan nombre a propósito.

## 3. Alcance

Juzga estas imágenes tal como está el producto hoy, solo con estos archivos. Escribe únicamente tu informe. El teclado, el foco, la persistencia, el tiempo de las animaciones y la sensación al arrastrar no se ven en una imagen: márcalos «no verificable». El contraste se calcula con los colores de la sección 1, no se mide en una captura comprimida. Puedes juzgar si una fórmula o una afirmación de la pantalla es incorrecta. Si lo es, es un defecto de máxima gravedad.

## 4. Decisiones del producto que no son defectos

- La web está en inglés.
- Un solo tema claro, con el fondo de papel y su cuadrícula azul tenue.
- El logotipo y el índice lateral de la lección se conservan.
- Las tres familias tipográficas y el fondo, el texto y las tarjetas de la sección 1. Los colores de rol sí se pueden juzgar.
- El orden de cada apartado: problema, objeto, acción en la figura, ecuación y transferencia.
- Las soluciones de examen siguen la resolución oficial. No se acortan para ganar espacio.
- No se nombra la asignatura ni la universidad en la web.
- No se usan librerías de gráficos de terceros. Las figuras son SVG propios.
- Las fórmulas del texto van en KaTeX. Las etiquetas dentro de las figuras SVG y las fichas de valor de los controles usan símbolos Unicode en monoespaciada, como una lectura de laboratorio.
- Cada figura ocupa todo el ancho con sus controles debajo, no en una columna al lado.
- El estudiante hace el examen sin calculadora y con un formulario oficial: las soluciones derivan, no consultan tablas.

## 5. Tareas

Lo que este estudiante pide a una explicación, y lo que cuenta como defecto en cualquier tarea:

- **Motivada.** Primero el objetivo y el problema que hay que resolver; cada objeto, símbolo o figura entra cuando un problema lo pide, nunca antes.
- **Precisa.** Cada cosa se llama por su término técnico, y cada símbolo que puede significar varias cosas ($N$, $\sigma$, $\alpha$) se dice qué es en ese apartado.
- **Señalada.** El texto que explica una marca está junto a ella, dentro de la figura o pegado a ella. Si para saber qué es algo hay que bajar la vista a un párrafo, es un defecto.
- **Paso a paso.** Una idea por paso. Una figura que lo enseña todo a la vez obliga a adivinar dónde mirar.
- **Sin intriga ni relleno.** Ninguna frase que insinúe en vez de decir («lo que pasó», «es el dibujo»). Ningún texto que no ayude a la tarea.
- **Ejes y controles con su significado.** Un eje o un control nombrado con dos o tres palabras sin decir qué mide es un defecto.
- **La fórmula sale del dibujo.** Cada término de una ecuación tiene en la figura algo que se puede señalar.

Cada tarea dice qué mirar en las imágenes.

**T1. Entender por qué existe la herramienta.** Antes de ver la fórmula, ¿puede el estudiante decir qué problema resuelve y por qué hace falta? Mira la primera pantalla de cada apartado: si el problema real aparece antes que la notación, si cada símbolo y cada sigla («ROC», «ENR», «AR») se presentan antes de usarse, y si hay rótulos de taxonomía que obligan a leer una etiqueta antes de tener contexto.

**T2. Leer la figura sin leyenda.** ¿Se sabe qué es cada marca a primera vista y con vista regular? Mira si cada color, grosor y forma significa una sola cosa, si las marcas de cosas distintas se distinguen sin color, si cada etiqueta está junto a lo que nombra, si las etiquetas chocan o se cortan en `extremo` y en los fotogramas, si las curvas parecen funciones matemáticas y si los ejes dicen qué miden.

**T3. Predecir y comprobar.** Con los fotogramas de una manipulación, ¿puede el estudiante predecir el cambio antes y comprobarlo después? Mira si la figura y el control que la mueve caben juntos en la pantalla, si el cambio es visible entre fotogramas, si la lectura numérica que cambia está junto a lo que mide, y si la figura tiene el tamaño que necesita o deja espacio vacío.

**T4. Del dibujo a la fórmula.** Al desplegar la ecuación, ¿se reconoce en ella lo que se acaba de hacer en la figura? Mira si cada término de la ecuación tiene su marca o su control con el mismo símbolo, si la frase que la acompaña dice qué conserva, y si la fórmula se lee entera a 390 px.

**T5. Resolver un problema de examen paso a paso.** Mira el bloque de problemas de examen en `inicial` y `resuelto`. ¿Encuentra el estudiante el enunciado, puede intentarlo sin ver la solución, revela un paso cada vez, ve por qué se da cada paso y reconoce el resultado final? ¿Se leen las fórmulas largas a 390 px sin cortarse?

**T6. Orientarse y retomar.** Tras una pausa, ¿sabe el estudiante en qué apartado está, qué le queda y cómo ir a otro tema o a los problemas? Mira el índice, los títulos y la navegación en los tres anchos.

## 6. Escala y formato del informe

Cada defecto lleva una gravedad, dicha con palabras, nunca con un número:

- `bloquea`: el estudiante no puede hacer la tarea o la hace mal. Una fórmula o una afirmación incorrecta en pantalla siempre es `bloquea`.
- `adivinar`: tiene que adivinar qué es algo, a qué pertenece o dónde mirar.
- `fricción`: le cuesta algo claro, como un paso de más, una búsqueda, releer, abrir o desplazarse.
- `menor`: se nota al usarla y frena la vista, pero no cuesta ningún paso.
- `detalle`: solo se ve mirando de cerca, y nadie lo notaría estudiando. Apúntalo, pero no baja la nota de la tarea.

Cada tarea lleva dos notas, una para `ancho` (imágenes de 1440 y 900) y otra para `móvil` (imágenes de 390). La nota es la del defecto más grave que cites para esa tarea en esas imágenes, con su id al lado: 0 `bloquea`, 1 `adivinar`, 2 `fricción`, 3 `menor`, 4 la tarea se hace a la primera y sin dudas en todas las imágenes de ese ancho, `extremo` incluido. Escribe «no verificable» solo si ninguna imagen enseña la tarea en ese ancho. No des una media ni una nota global.

Puntúa también, una vez cada una y con la misma regla, estas dimensiones visuales: tipografía, jerarquía, espaciado y densidad, color y contraste, iconos y estados, coherencia y acabado. Para una dimensión, 0 es un texto o una forma que engaña, 1 una que deja dudando qué va con qué, 2 un fallo que cualquiera ve de un vistazo (desalineado, incoherente, apretado, sin acabar), 3 un fallo que se nota al usarla y 4 solo detalles. Un 4 nombra además el `producto-*` que mejor resuelve esa dimensión y dice que esta pantalla está a su nivel.

Devuelve:

1. La tabla de notas: una fila por tarea, T1 a T6, con sus notas `ancho` y `móvil`, el id del defecto que fija cada nota y la imagen y zona donde se ve. Después, las dimensiones visuales.
2. La tabla de referencias: una línea por `producto-*` con lo que resuelve de cada tarea. Para cada tarea, el producto que mejor la resuelve y qué tomarías de él, en concreto.
3. Hasta ocho defectos, ordenados por impacto. Para cada uno: id, imagen y zona, tarea, gravedad, evidencia, arreglo mínimo, y si es un defecto observable o una preferencia.
4. Lo que hay que conservar.
