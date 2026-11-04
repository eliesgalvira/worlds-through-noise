# Qué quería Elies de Worlds Through Noise

Resumen de los nueve hilos T3 del proyecto, leídos enteros el 4 de noviembre de 2026. Las citas son literales, en el idioma en que las escribió, con sus erratas. Cada una lleva el hilo (ocho primeras letras del id) y su posición. Solo se citan frases de Elies. En `96faa2d…#0` casi todo el texto es el plan de otro agente que Elies pegó, así que de ese mensaje solo se usa su última frase.

| Hilo                                                  | Fecha  | Tema                                         |
| ----------------------------------------------------- | ------ | -------------------------------------------- |
| `96faa2df` «Interactive signal processing textbook»   | 8 jun  | El encargo original y la primera versión     |
| `496709f2` «Tailwind website frame and logo»          | 8 jun  | Marco de la web y logo                       |
| `a56f1d4d`, `5a9e2343`                                | 8 jun  | Git. Nada de UI                              |
| `eea3834b` «Enlarge interactive ellipse graph»        | 9 jun  | Tamaño de una figura                         |
| `aed29919` «Fix web font layout shift»                | 19 jun | Layout shift de las fuentes (PR #4)          |
| `a640d1eb` «Improve example-led visual design»        | 3 jul  | El rediseño actual                           |
| `f7b97664` «Interactive exam solutions and UX review» | 4 jul  | Soluciones paso a paso y crítica del texto   |
| `7d3a81f0` «Generalize project architecture»          | 7 jul  | La app como plantilla para otras asignaturas |

## Para qué es la app

- «I want to create a website to understand, and by understand here I mean what Richard Feynman meant by understand, the subject of detection and estimation» (`96faa2df #71`).
- «a Brilliant style explanation where the minimum facts to understand the underlying problem are interactively presented … it is critical to explain the underlying problem. And not just at a surface level.» (`96faa2df #71`).
- «…both an intuitive and understanding, that is being able to predict the behaviour of systems with these characteristics, and a practical understanding, being able to identify and apply these concepts to existing problems.» (`96faa2df #71`).
- «Revamp the whole app so I can actually use it to study.» (`a640d1eb #6`).
- «It should be a mix between academic but also "divulgativo"» (`96faa2df #71`).
- «All of the exams are either in Spanish or Catalan, but I want the website to be in English to be the most accessible» (`96faa2df #71`).
- «I want this to be a template and scaffold for future learning projects of other university courses. … I want it to look beautiful each time as well.» (`7d3a81f0 #0`).

## Los problemas de examen son lo más valioso

- «The exam and ecercise problem statements and solutions are the most valuable part of this whole thing. It needs to have an interactive step by step solution.» (`f7b97664 #0`).
- «I'd prefer grabbing problems from the exercises and from exams in the years 2026 and 2025, since they are recent and closest to how the course is taught.» (`f7b97664 #0`).
- «add as many problems as your judgement allows. If you think they willa aid the learner and raise their knowledge assuming he has read everyhing before it, then do it.» (`f7b97664 #36`).
- «the detection and estimation problems in "2023 04 PSAVC Parcial.pdf" are amazing, they're both applied to real life problems.» (`96faa2df #71`).

## Explicaciones: contexto primero, estilo Feynman, sin magia

- «Barely any context for anything... You mention ROC like a dozen times but never explain intuitively what they are and why they belong here» (`96faa2df #71`).
- «There is way too little text and it all reads like AI slop.» (`96faa2df #99`).
- «In fact, the whole explanation from beginning to end is not direct. I prefer explanations in the Feynman style.» (`f7b97664 #55`).
- «And much is left to the reader. Why pick S? because of Sample? Many symbols appear without prior introduction, even a brief one.» (`f7b97664 #55`).
- «You also have not even explained what White, FIltered (AR) or Burst is supposed to mean.» (`f7b97664 #55`).
- «The current way of explaining "the trap" "the object" "the unseen action" is hard to parse for a human. It should still be there but well explained.» (`f7b97664 #59`).
- «You don't introduce the "unseen action" by titling it but by explaining it well and then introducing it in that context.» … «contextualize explanations.» (`f7b97664 #59`).
- «for an astute reader there should be no magical explanations, symbols or representations. Take care to make sure explanations are human-readable.» (`f7b97664 #59`).
- «Can you make all mathematical symbols KaTeX?» (`f7b97664 #41`).

Su propia analogía para el proceso aleatorio, que considera «central to the theory» (`f7b97664 #52`): «Imagina una biblioteca infinita. El experimento $S$ consiste en elegir un libro al azar.» «El tiempo $n$ es el número de página dentro de un libro.» La regla es «dime el número de veces que aparece la letra 'e' en la página $n$ del libro $S$». Está integrada en P1 en los cambios sin commit de julio.

Ejemplo que le gustó por simple: la explicación del efecto Doppler en la que «cada pico de la onda luminosa tardará un poquito menos en llegar hasta nosotros» (`96faa2df #71`, transcripción de un vídeo en español).

## Figuras: que se lean sin leyenda

- «the animations, visualizations, and website is quite amateurish, it has no taste.» (`a640d1eb #0`).
- «Currently it looks unprofessional and AI slop (no attention to detail, very loaded with stuff so it's hard for a complete beginner to tell what's going on, where to touch, no effort done in simplifying, and I don't mean dumbing down, etc. etc.).» (`96faa2df #99`).
- «the sandbox do NOT look professional, they do kind of fit the style of the website but they do not like like mathematical functions.» (`96faa2df #132`).
- «Now, without the legend, can you tell what each element is? You can't, because they look like garbled dots and lines.» (`96faa2df #252`).
- «Every single color, transparency, length design choice has to be DELIBERATE and it has to represent simply the underlying behaviour of the concept.» (`96faa2df #277`).
- Sobre una marca hecha más fina: «you just made it invisible for people with relatively poor eyesight. Please think through the design decisions properly.» (`96faa2df #277`).
- «Regarding the estimation charts, better, but still very confusing and low contrast.» (`96faa2df #277`).
- «make sure to confirm it looks good: easily understandable at first glance, with contrast and tasteful.» (`96faa2df #336`).
- «Also the placement of the labels in the graphs need some work.» (`96faa2df #180`). «And the ROC curve doesn't look smooth it's bumpy, is that intentional?» (`96faa2df #182`).
- Tras el rediseño de julio: «The first image doesn't look great. The second has a lot of wasted space.» (`a640d1eb #19`). La primera era D1 con etiquetas que chocaban, la segunda P1 con un gráfico bajo junto a una columna alta de controles.
- Propuso él mismo una gramática de marcas para la figura de estimación: segmentos cortos del mismo ancho, hairlines que salen de cada marca y agujeros para la media del prior y el MAP (`96faa2df #316`, `#372`).

## Disposición: una columna, figura grande, controles a mano

- «Cards everywhere, that is not a good design philosophy. Cards have to serve a special purpose.» (`96faa2df #71`).
- «making the focus of the current thing 1 column instead of three columns» (`96faa2df #71`).
- «Also in the sandbox you have two columns... One for the chart another for the variables... Why do you like to put columns everywhere, isn't it ovbious that using the free vertical space is much better than the very limited horizontal space????» (`96faa2df #144`).
- «Make the ellipse graph a bit bigger. Find the perfect ratio so that it occupies the most amount of screen size while being able to manipulate the sliders.» (`eea3834b #0`).

Las dos peticiones juntas piden una figura lo más grande posible y los controles a la vista mientras se mueve. Hoy `FigureShell` pone los controles en un raíl a la derecha desde `lg`, que es lo que criticó en `#144`.

## Interacción y animación

- «Also the case banks SHOULD ALL HAVE INTERACTIVE SANDBOXES.» (`96faa2df #99`).
- «Again, THIS IS SUPPOSED TO BE AN ANIMATION. Meaning, when I click an animate button, it should animate the sample taking, etc.» (`96faa2df #277`).
- «I want an awe-inspiringly tasteful animation. Currently it's big balls and rectangles lol.» (`96faa2df #180`).
- «Also are you using shadcn sliders? … The sliders feel weird.» (`96faa2df #180`).
- «the vertical slider on top of the charts in detection does not look tasteful.» (`96faa2df #252`).

## Lo que le gusta y no se toca

- «The only think I really like about the website's design right now is the table of contents and the logo.» (`a640d1eb #6`).
- Tras el rediseño de julio: «It looks amazing! Thank you! Now we just need to refine it.» (`a640d1eb #19`).
- El logo es idea suya: «the O in WORLDS being a world, then a line crossing through to THROUGH» (`496709f2 #0`).
- El índice lo quería como el de Fumadocs (`96faa2df #99` a `#387`), con línea activa animada y sin saltos al hacer scroll.
- Cero layout shift: «Showing the fallback font at all destroys the title because the orange line doesn't overlay correctly on top of the H letter crossbar.» (`aed29919 #0`). La fuente de reserva no debe verse en el caso normal (`aed29919 #48`).

## Cómo quiere que se trabaje

- «Please take screenshots or however you can navigate through the website … to check your work» (`96faa2df #180`).
- «spend as much time as possible exploring the site and interacting with it to make sure there's no quirks and everything is tasteful.» (`f7b97664 #0`).
- «DO NOT USE SHORTCUTS. DO NOT DIRTY THE CODEBASE. USE GOOD JUDGEMENT.» (`96faa2df #252`).
- «For the love of god, write good tailwind» (`496709f2 #0`).
- «at first glance it does seem like a hacky solution.» Pide valorar si una solución compromete la calidad del código (`aed29919 #45`).
- «Only expose to me important decisions that might change the look and feel of the app if there are any.» (`7d3a81f0 #27`).
- Referencias que nombró: Brilliant, Feynman, Fumadocs, https://rpsychologist.com/viz («an example of a website that does this sort of well», `96faa2df #132`) y el artículo de Distill sobre procesos gaussianos («has taste in their visualizations but not much in the way of interactivity», `96faa2df #132`).

## Lo que nunca llegó a revisar

- Solo comentó la prosa del tema 1 (`f7b97664 #55`). La reescritura de los 17 módulos que cerró ese hilo está en los cambios sin commit y nunca la vio.
- Según el traspaso del agente de `a640d1eb`, de las 17 figuras solo D1 y P1 tuvieron revisión visual humana.
- Las etiquetas dentro de los SVG y las fichas de los sliders siguen sin KaTeX (`f7b97664`, mensaje #51 del agente).
- Las marcas de la figura de estimación de junio no las dio por buenas (`96faa2df #372`), aunque esa figura se rehízo en julio.

## Qué sale de aquí para el hill-climb

1. La disposición de las figuras: figura grande, controles debajo y a la vista a la vez. Es un cambio de `FigureShell`, en la librería, y afecta a las 17 figuras.
2. Figuras legibles sin leyenda, con contraste y una marca por significado, en el peor caso de los sliders.
3. El cuaderno de problemas paso a paso, que Elies considera lo más valioso.
4. Texto que da contexto antes de cada símbolo y sigla. La reescritura de julio va en esa dirección y hay que comprobar que es correcta.
5. Se conservan el logo, el índice, el inglés y el tema de papel.
