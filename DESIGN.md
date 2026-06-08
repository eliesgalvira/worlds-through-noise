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
