# HANDOFF — visual refinement pass

State as of 2026-07-04: the app was fully rebuilt around the teach-by-example
tenet (see `AGENTS.md`, `PRODUCT.md`, `EXAMPLES.md`). All five lessons and all
17 figures work; `pnpm typecheck`, `pnpm lint` and `pnpm build` pass; every
page server-renders (see `scripts/render-smoke.tsx`). **Nothing is committed
yet** — the whole rebuild sits in the working tree.

What has NOT happened: a visual review. The owner spot-checked two figures and
found real problems; the other 15 figures have never been looked at by anyone.
Your job is that review pass. Content and interactions are approved — refine
presentation, don't redesign.

## Known issues (owner-reported)

### 1. D1 `TwoWorldsFigure` — overlapping labels

`src/components/figures/TwoWorldsFigure.tsx`. Two `<text>` label pairs collide
near the top of the plot:

- the "← decide H1" / "decide H0 →" labels are anchored at
  `xOf(threshold) ± 6, y = 22`;
- the "H1" / "H0" peak labels are drawn at `yOf(peak) − 8`, which at small N
  is the same height, and the peaks (x = 42, 58) sit right beside the default
  threshold (50).

Suggested fix: pin the "decide" labels to the top corners of the plot
(left-aligned at x ≈ 14, right-aligned at x ≈ W − 14) instead of hugging the
threshold; keep the peak labels where they are. Re-check at N = 1 (widest
densities) and N = 25 (narrowest), and with the threshold dragged to both
extremes.

### 2. P1 `EnsembleFigure` — wasted space

`src/components/figures/EnsembleFigure.tsx`. The plots (H = 210) are much
shorter than the control column, leaving a large empty band under the visual.
Contributing factor: the three process-kind buttons have long labels
("Filtered (AR) noise", "Amplitude burst") so they stack vertically and make
the control column tall.

Suggested fix: raise the plot viewBox height to ~280 and shorten the button
labels ("White", "Filtered (AR)", "Burst") so they fit in one or two rows.
Check that the histogram panel still aligns with the trace amplitudes (both
map value v through the same ±4.5 range).

### 3. Everything else — unreviewed

Sweep all 17 figures (list in `src/components/LessonModule.tsx`) at ~1440px
and at a narrow width (~390px, where `FigureShell` stacks controls under the
plot). Things to look for, based on how these figures are built:

- Label collisions between `<text>` elements whose positions depend on
  slider state (same failure class as issue 1).
- SVG text size: font sizes are in viewBox units, so a figure with a narrow
  viewBox (e.g. `BudgetRocFigure` panels are W = 250) renders text larger
  than one with W = 470. Compare adjacent figures on one page.
- Empty space between the visual column and the control column (same failure
  class as issue 2) — `FigureShell` is
  `grid-cols-[minmax(0,1fr)_minmax(15rem,19rem)]` on `lg`.
- The home page and lesson intro/exam-bank sections have not been reviewed
  either.

## How to review visually

The `t3-code` browser MCP may need re-authorization (`/mcp` in an interactive
session). If it is unavailable, use headless Playwright — this works without
any user help:

```sh
pnpm dev --port 5199 &          # background server (kill it when done)
pnpm dlx playwright install chromium   # first time only
pnpm dlx playwright screenshot --viewport-size=1440,2400 \
  http://localhost:5199/processes /tmp/processes.png
```

Then read the PNGs. Screenshot each route; for interaction-state checks
(dragged thresholds, extreme slider values) write a small Playwright script
instead of the CLI. Kill the dev server before finishing.

## Constraints (do not regress)

- The teach-by-example tenet and honest readouts are non-negotiable — every
  displayed number must derive from the model or a real simulation. Never
  decorate with a fake meter.
- Keep the logo (`src/components/Logo.tsx`) and the table-of-contents nav
  (`StickyLessonNav`) — the owner explicitly likes both.
- Figures share `FigureShell` / `Plot` / `ReadoutRow` / `Legend` from
  `src/components/figures/shared.tsx`; refine there when the fix applies to
  all figures, locally when it doesn't.
- Lint/type gotchas that will bite you: no `as` assertions, no non-null `!`,
  local imports need `.ts`/`.tsx` extensions, indexed access needs `?? x`
  (noUncheckedIndexedAccess), optional props can't be passed `undefined`
  (exactOptionalPropertyTypes — spread conditionally instead), no synchronous
  `setState` inside `useEffect` bodies.
- Verify with: `pnpm typecheck && pnpm lint && pnpm build` plus
  `TSX_TSCONFIG_PATH=tsconfig.app.json pnpm dlx tsx scripts/render-smoke.tsx`.

Delete this file when the punch list is done.
