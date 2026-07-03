# Design

## Visual Direction

Academic field notebook meets modern interactive science exhibit.

The page should feel like:

- a clean research notebook,
- a signal-processing lab,
- a high-quality science explainer,
- a calm Brilliant-style interactive lesson.

It should not feel like:

- a corporate dashboard,
- a crypto charting site,
- a generic online course,
- an over-styled AI landing page.

## Color System

Use a warm paper background with precise technical accents.

Suggested tokens:

```txt
--background: #F7F3EA
--foreground: #151515
--muted: #E8E1D3
--muted-foreground: #6B6257
--card: #FFFDF8
--card-foreground: #151515
--border: #D8CDBB

--primary: #1E3A8A
--primary-foreground: #FFFFFF

--accent: #D97706
--accent-foreground: #111111

--success: #047857
--danger: #B91C1C
--info: #0F766E
```

## Semantic Colors

H0:
Use cool muted blue. Label it as "world H0", "noise only", "normal", or the domain-specific null.

H1:
Use amber or green depending on context. Label it as "world H1", "signal present", "event", or the domain-specific alternative.

False alarm:
Use red shading, never only a red line.

Detection:
Use green shading.

Uncertainty:
Use translucent bands, noisy particle clouds, or density fills.

Threshold:
Use an amber vertical rule with a draggable handle.

Estimator output:
Use a blue marker.

True parameter:
Use a black or dark ink marker.

Prior:
Use a dashed purple or indigo line only if needed, and keep it subdued.

## Typography

Headings:
Elegant serif or high-quality humanist sans. Use generous line height and no negative letter spacing.

Body:
Highly readable sans. Use 17 to 19px on lesson pages.

Math:
Use KaTeX or MathJax. Equations should sit in calm bordered blocks. Never let equations dominate the first screen of a module.

Monospace:
Use for variables, small code-like annotations, and model summaries.

## Layout

Use a two-layer layout:

1. Narrative column
   - width: 640 to 760px
   - contains story, explanation, prompts, equations

2. Interactive lab panel
   - sticky on desktop
   - full-width between text blocks on mobile
   - contains simulation, sliders, live metrics

Desktop:
Left explanation, right interactive panel.

Mobile:
Stack explanation, interaction, explanation. Keep controls immediately below the visual they affect.

## Spacing

Use generous spacing. Lessons should breathe.

Section spacing:
`py-20` or `py-24`

Module cards:
`p-6` to `p-8`

Interactive panels:
`p-4` to `p-6`, `rounded-lg`, subtle border, and very light shadow only when needed.

## Motion

Motion must be explanatory.

Allowed:

- wave crests moving toward or away from observer,
- packet dots entering queues,
- sample dots falling onto a histogram,
- threshold sweeping across densities,
- ROC point moving as threshold changes,
- likelihood curve morphing as theta changes,
- estimate cloud tightening as sample count grows.

Avoid:

- decorative floating shapes,
- bouncing icons,
- excessive easing,
- looping animations that compete with reading.

Use `prefers-reduced-motion`.

## Component Style

Cards:
Soft paper-white background, visible quiet border, `rounded-lg`, no heavy shadows.

Buttons:
Primary for continue or run simulation. Ghost for secondary reveal actions. Destructive only for explicit error or reset actions.

Sliders:
Always label with variable, value, and plain-English meaning.

Badges:
Use for concept tags: Neyman-Pearson, MAP, ML, CRB, ROC, Bias, Variance, MSE.

Equations:
Place inside an `EquationReveal` component. First show the sentence meaning, then reveal the symbolic form.

## Visual Motifs

Detection:
Competing worlds, split panels, balance scales, thresholds, shaded tails, ROC paths, signal templates.

Estimation:
Hidden dials, likelihood landscapes, repeated-sample clouds, estimator machines, bias arrows, variance ellipses, CRB floors, prior elastic bands.

Filtering, future:
Time axis, evolving hidden state, prediction-correction loop.

## Accessibility

All charts must have:

- text labels,
- keyboard-controllable sliders,
- non-color encodings,
- aria labels for controls,
- reduced-motion fallback.

Never communicate H0/H1 only by color. Use labels and shapes.

## Copy Style

Use short, vivid sentences.

Good:
"A threshold is a promise about which mistake you are willing to control."

Bad:
"The detector is derived by applying the likelihood-ratio test pursuant to the Neyman-Pearson lemma."

Good:
"The estimator is a machine: data goes in, one number comes out."

Bad:
"Let g(X) be an arbitrary statistic..."

## Lesson Rule

Every module must contain:

1. A question.
2. A manipulable visual.
3. A prediction prompt.
4. The minimum equation.
5. A transfer check.

If a module lacks one of these, it is not ready.

---

# Implementation Reference

This section records committed engineering decisions so future work matches the existing build instead of reinventing it. Everything above is intent; everything below is how the code currently realizes it.

## Stack and conventions

- React 19, Vite, TypeScript, Tailwind CSS v4 (CSS-first, configured through `@theme inline` in `src/index.css`, not a JS config), shadcn primitives in the new-york style, `react-router-dom` v7.
- Fonts load from Google Fonts in `index.html`: Inter (`--font-sans`), Spectral (`--font-serif`), IBM Plex Mono (`--font-mono`). The serif is the brand voice for headings; the mono is for eyebrows, variables, and model summaries. Fonts use `display=optional`, with a small first-paint budget in `src/lib/initial-fonts.ts` so normal loads paint with web fonts and slow/error cases fall back without late swaps.
- The page background is warm paper plus a faint blue 24px grid (see `body` in `src/index.css`). Treat it as part of the field-notebook identity; do not paint full-bleed opaque backgrounds over it without reason.

### Lint rules that shape the code

ESLint is strict and CI-blocking. Write code that already complies:

- Local imports need explicit extensions: `@/components/Logo.tsx`, `@/lib/routes.ts`.
- No `as` type assertions. No non-null `!`. Use type-only imports (`import { type Foo }`).
- Files that export components must export components only (react-refresh): keep `cva` variant objects in their own `*-variants.ts` files (see `button-variants.ts`, `badge-variants.ts`).
- Do not call `setState` synchronously inside a `useEffect` body (`react-hooks/set-state-in-effect`). Prefer event handlers. Example: the mobile menu closes via `onClick` on each link, not via a `useLocation` pathname effect.

## Color tokens in code

Base tokens live in `:root` and are exposed as Tailwind utilities through `@theme inline`. Use the utility, not a raw hex.

- Surfaces and UI: `background`, `foreground`, `card`, `muted`, `secondary`, `accent`, `border`, `ring`, `primary` (deep blue), `destructive`.
- Semantic inference roles (utilities like `bg-h0`, `text-estimate`, `bg-truth`): `h0` blue, `h1` amber, `detection` green, `false-alarm` red, `threshold` amber, `estimate` blue, `truth` ink, `prior` indigo.
- One color, one role per view. `truth` (hidden cause / true parameter) and `estimate` (inference output) are both blue-adjacent in spirit but are distinct tokens; never let a single color stand for two meanings in the same figure. When two roles sit close, separate them further with a ring or shape, as the home figure does for the inference marker.
- `--radius` is `0.5rem`; use `rounded-md` / `rounded-lg`, not ad hoc radii.

## Wordmark (`src/components/Logo.tsx`)

Two exports: `Logo` (full wordmark) and `LogoMark` (compact globe-with-noise icon, also the favicon in `public/favicon.svg`).

The wordmark is one signal traveling left to right: a wireframe globe replaces the O in WORLDS, then a single line crosses THROUGH clean and ramps into noise across NOISE.

`Logo` is an SVG graphic, not live text. The letters are Spectral SemiBold outlines committed as path data, and the orange strike is drawn in the same viewBox as the letters. This is intentional: the H crossbar alignment must not depend on webfont timing, fallback metrics, line boxes, tracking utilities, or browser font synthesis.

When changing the wordmark, edit it as a graphic:

1. Keep the root SVG viewBox and intrinsic aspect ratio stable unless the full mark is being redesigned.
2. Regenerate the letter paths by setting the wordmark text in Spectral 600, converting the text to outlines in a vector editor or font-outline tool, and exporting SVG path data into the existing groups.
3. Align the strike path directly to the outlined H crossbar in SVG coordinates.
4. Keep the globe optical overshoot relative to the solid letter outlines, not to CSS `em` metrics.
5. Verify the result visually at both header and hero sizes; the path data itself is not meaningfully reviewable by reading the code.

## Navigation and responsive behavior

- Breakpoint contract: Tailwind `md` (768px) is the divide between mobile and desktop chrome.
- `SiteHeader`: inline nav on `md` and up (`hidden md:flex`); below `md` a hamburger button (lucide `Menu` / `X`, `md:hidden`) toggles a stacked panel rendered under the bar. The panel lists each route as label + tagline, with the `Soon` tag for coming-soon routes. It carries `aria-expanded` / `aria-controls`, closes on `Escape`, and closes on link click.
- Lesson pages (`src/pages/LessonPage.tsx`) use a narrative column with a sticky table-of-contents (`StickyLessonNav`) on desktop and a collapsible variant on mobile. Figure controls sit beside the visual on desktop and stack under it on mobile (`FigureShell`).

## Component inventory (reuse, do not recreate)

- UI primitives (`src/components/ui/`): `Button` + `button-variants`, `Card` set, `Badge` + `badge-variants`, `Slider`, `Separator`, `Label`.
- Domain components (`src/components/`): `SliderControl` (label + variable + plain-English meaning), `EquationReveal` (sentence first, symbols on reveal), `PredictionPrompt`, `LessonModule` (trap/object/action/payoff + figure dispatch), `StickyLessonNav`, plus `Logo` / `LogoMark`.
- Figures (`src/components/figures/`): `FigureShell`, `Plot`, `ReadoutRow`, `Legend` in `shared.tsx`; one figure component per lesson module, dispatched by module id in `LessonModule.tsx`. All readouts must be genuinely computed.
- Frame: `SiteLayout`, `SiteHeader`, `SiteFooter` (carries the "Made by Elies" credit).
- Routes are declared once in `src/lib/routes.ts` as `siteRoutes`, each with `path`, `label`, `tagline`, and `status` (`available` | `coming-soon`). Drive nav and indexes from this list.

## Anti-slop notes specific to this site

- The home page deliberately avoids identical card grids and nested cards. The inference idea is carried by one signal-degradation SVG figure plus an editorial "Three questions" ordered list. Hold that line: prefer a purpose-built figure or a typographic index over a row of look-alike cards.

## SVG figures with non-uniform scaling

The hero signal figure uses `preserveAspectRatio="none"` so the trace stretches to full width. That stretch is non-uniform, so any shape with intrinsic proportions drawn inside it is distorted: a `<circle>` renders as a flattened ellipse, and uneven strokes thin out. Rules for these figures:

- Strokes inside them must use `vectorEffect="non-scaling-stroke"` to keep a constant visual width.
- Point markers (dots, handles) must not be `<circle>` elements inside the stretched SVG. Overlay them as absolutely positioned HTML on a `relative` wrapper around the SVG, positioned in percentages (the inference marker sits at `left-[83.333%] top-1/2`). This keeps them perfectly round at every width.
