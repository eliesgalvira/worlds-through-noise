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
- Fonts load from Google Fonts in `index.html`: Inter (`--font-sans`), Spectral (`--font-serif`), IBM Plex Mono (`--font-mono`). The serif is the brand voice (wordmark, headings); the mono is for eyebrows, variables, and model summaries.
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

### Strike-line alignment (read before touching the logo)

The strike is an absolutely positioned SVG overlaid on the THROUGH+NOISE span. It must sit on the capital H crossbar, NOT the line-box center (`top-50%` is wrong because the line box includes descender space) and NOT the geometric cap center either. In Spectral the H crossbar sits about 1.5 percent of cap height above the geometric cap center, so measure the actual crossbar, not the midpoint between cap top and baseline. The committed value is:

```
top-[46.85%] ... -translate-y-1/2
```

Because `top` is a percentage of the em box, this one value holds at every font size, so the small header logo and the large hero logo stay aligned together. If the serif, weight, tracking, or `leading` ever changes, re-measure rather than eyeballing:

1. Temporarily render the hero `Logo` at a large fixed size with a unique class.
2. To find the true crossbar, element-screenshot the logo once with the strike hidden (`opacity-0`), and read the black crossbar band of the H directly.
3. Restore the strike and solve for `top%` so the orange line center lands on that crossbar center. Two data points pin the linear relationship exactly; target tolerance is sub-pixel on the large render.

The stroke is also slightly thicker than the crossbar (`strokeWidth={2.2}` in the 240x24 viewBox) so it fully covers the crossbar with margin on both edges. This matters at small sizes: when the line only just matches the crossbar thickness, sub-pixel rounding lets a one-pixel sliver of the black crossbar show through. Keep the line centered and a touch thicker rather than nudging it off-center to hide a sliver.

### Globe-O sizing

The globe replacing the O is a thin wireframe, so matching it to cap height makes it read smaller than the solid letters. It is set to overshoot to about 1.10x cap height (`h-[0.78em] w-[0.78em]`) and nudged with `-translate-y-[0.035em]` so its center matches the caps. If the globe ever looks small again, it is the hollow-shape optical effect, increase the overshoot rather than assuming a scaling bug.

## Navigation and responsive behavior

- Breakpoint contract: Tailwind `md` (768px) is the divide between mobile and desktop chrome.
- `SiteHeader`: inline nav on `md` and up (`hidden md:flex`); below `md` a hamburger button (lucide `Menu` / `X`, `md:hidden`) toggles a stacked panel rendered under the bar. The panel lists each route as label + tagline, with the `Soon` tag for coming-soon routes. It carries `aria-expanded` / `aria-controls`, closes on `Escape`, and closes on link click.
- Lesson pages use the two-column narrative + sticky lab layout on desktop and stack on mobile (`LessonLayout`). Keep controls directly beneath the visual they drive.

## Component inventory (reuse, do not recreate)

- UI primitives (`src/components/ui/`): `Button` + `button-variants`, `Card` set, `Badge` + `badge-variants`, `Slider`, `Separator`, `Label`.
- Domain components (`src/components/`): `SliderControl` (label + variable + plain-English meaning), `MetricStat`, `EquationReveal` (sentence first, symbols on reveal), `LabPanel`, `ConceptBadge`, `PredictionPrompt`, plus `Logo` / `LogoMark`.
- Frame: `SiteLayout`, `SiteHeader`, `SiteFooter` (carries the "Made by Elies" credit), `LessonLayout`.
- Routes are declared once in `src/lib/routes.ts` as `siteRoutes`, each with `path`, `label`, `tagline`, and `status` (`available` | `coming-soon`). Drive nav and indexes from this list.

## Anti-slop notes specific to this site

- The home page deliberately avoids identical card grids and nested cards. The inference idea is carried by one signal-degradation SVG figure plus an editorial "Three questions" ordered list. Hold that line: prefer a purpose-built figure or a typographic index over a row of look-alike cards.

## SVG figures with non-uniform scaling

The hero signal figure uses `preserveAspectRatio="none"` so the trace stretches to full width. That stretch is non-uniform, so any shape with intrinsic proportions drawn inside it is distorted: a `<circle>` renders as a flattened ellipse, and uneven strokes thin out. Rules for these figures:

- Strokes inside them must use `vectorEffect="non-scaling-stroke"` to keep a constant visual width.
- Point markers (dots, handles) must not be `<circle>` elements inside the stretched SVG. Overlay them as absolutely positioned HTML on a `relative` wrapper around the SVG, positioned in percentages (the inference marker sits at `left-[83.333%] top-1/2`). This keeps them perfectly round at every width.
