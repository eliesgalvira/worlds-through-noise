# Rúbrica de estudio

Es el único texto que lee un revisor además de las imágenes. Se escribe una vez y no cambia entre rondas de una misma pantalla. El autor solo rellena los huecos entre `<…>` antes de la ronda base de cada pantalla y los deja fijos.

---

## 1. Contexto

La pantalla es una lección de una web interactiva para estudiar un curso universitario de procesado estadístico de señal: procesos aleatorios, detección y estimación. La usa un estudiante de ingeniería de telecomunicación que domina el cálculo pero quiere _ver_ qué hace cada fórmula antes del examen. Estudia solo, en un portátil, en sesiones de una a tres horas, con papel al lado para resolver problemas. El examen se hace sin calculadora y con un formulario oficial, así que el estudiante tiene que razonar y derivar, no consultar.

Cada lección se lee de arriba abajo. Cada apartado plantea un problema real, da un objeto concreto que se puede manipular en una figura interactiva, deja que el estudiante haga la acción y solo entonces muestra la ecuación. Cierra con una pregunta de transferencia y, al final de la lección, problemas reales de examen que se resuelven paso a paso. Todos los números de las figuras se calculan con el modelo o con una simulación real.

Reglas visuales del producto: tema claro de papel cálido (fondo `#F7F3EA`, texto `#151515`, texto secundario `#6B6257` sobre `#F7F3EA`, tarjetas `#FFFDF8`, bordes `#D8CDBB`), titulares en serif, texto en sans, cifras y variables en monoespaciada. Fórmulas con KaTeX. Color de cada rol en las figuras: H0 `#1E3A8A`, H1 `#D97706`, detección `#047857`, falsa alarma `#B91C1C`, umbral `#D97706`, estimación `#1E3A8A`, valor verdadero `#151515`, prior `#6D28D9`. El acento de los rótulos es `#D97706`. Botón principal relleno `#1E3A8A` con texto blanco.

## 2. Qué son las imágenes

- `leccion-<ancho>-<estado>.png`: la pantalla del producto. Anchos 1440, 900 y 390 px. Los estados son `inicial` (como se abre), `extremo` (controles en los valores límite y textos más largos) y `resuelto` (ecuaciones y pasos de solución desplegados).
- `interaccion-<figura>-<ancho>-<n>.png`: fotogramas numerados de una misma manipulación, en orden. `interaccion-<figura>.txt` dice qué acción hace el estudiante entre un fotograma y el siguiente («mueve el control N de 1 a 16»). No dice qué debería verse.
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

## 5. Tareas

Cada tarea dice qué mirar en las imágenes.

**T1. Entender por qué existe la herramienta.** Antes de ver la fórmula, ¿puede el estudiante decir qué problema resuelve y por qué hace falta? Mira la primera pantalla de cada apartado: si el problema real aparece antes que la notación, si cada símbolo y cada sigla («ROC», «ENR», «AR») se presentan antes de usarse, y si hay rótulos de taxonomía que obligan a leer una etiqueta antes de tener contexto.

**T2. Leer la figura sin leyenda.** ¿Se sabe qué es cada marca a primera vista y con vista regular? Mira si cada color, grosor y forma significa una sola cosa, si las marcas de cosas distintas se distinguen sin color, si las etiquetas chocan o se cortan en `extremo`, si las curvas parecen funciones matemáticas y si los ejes dicen qué miden.

**T3. Predecir y comprobar.** Con los fotogramas de una manipulación, ¿puede el estudiante predecir el cambio antes y comprobarlo después? Mira si la figura y el control que la mueve caben juntos en la pantalla, si el cambio es visible entre fotogramas, si la lectura numérica que cambia está junto a lo que mide, y si la figura tiene el tamaño que necesita o deja espacio vacío.

**T4. Del dibujo a la fórmula.** Al desplegar la ecuación, ¿se reconoce en ella lo que se acaba de hacer en la figura? Mira si cada término de la ecuación tiene su marca o su control con el mismo símbolo, si la frase que la acompaña dice qué conserva, y si la fórmula se lee entera a 390 px.

**T5. Resolver un problema de examen paso a paso.** Mira el bloque de problemas de examen en `inicial` y `resuelto`. ¿Encuentra el estudiante el enunciado, puede intentarlo sin ver la solución, revela un paso cada vez, ve por qué se da cada paso y reconoce el resultado final? ¿Se leen las fórmulas largas a 390 px sin cortarse?

**T6. Orientarse y retomar.** Tras una pausa, ¿sabe el estudiante en qué apartado está, qué le queda y cómo ir a otro tema o a los problemas? Mira el índice, los títulos y la navegación en los tres anchos.

## 6. Escala y formato del informe

- 0 bloquea la tarea. 1 obliga a adivinar. 2 funciona con fricción visible. 3 claro y legible. 4 claro incluso en `extremo`, sin añadir ruido.
- Puntúa cada tarea y también estas dimensiones visuales: tipografía, jerarquía, espaciado y densidad, color y contraste aparentes, iconos y estados, coherencia.
- Puntúa cada `producto-*` en las tareas que pueda cubrir, con una línea cada uno. Para cada tarea, nombra el producto que mejor la resuelve y qué tomarías de él, en concreto.
- No des una media global.

Devuelve:

1. La tabla de puntuaciones, con la evidencia de cada nota (imagen y zona).
2. La tabla de referencias.
3. Hasta ocho defectos, ordenados por impacto. Para cada uno: id, imagen y zona, tarea, gravedad, evidencia, arreglo mínimo, y si es un defecto observable o una preferencia.
4. Lo que hay que conservar.
