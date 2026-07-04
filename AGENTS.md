# AGENTS

## Project

Worlds Through Noise is a Vite React TypeScript study companion for the PSAVC course (statistical signal processing: random processes, detection, estimation, Wiener filtering, adaptive filtering). Do not name the course on the website itself.

Non-negotiable tenet: **teach by example**, as defined in `EXAMPLES.md`. Every lesson module names a trap, hands the learner a concrete object, and makes them perform the unseen action in an interactive figure whose readouts are genuinely computed — never fabricated. Prose that merely describes a concept is a regression, and so is a meter that displays an invented number.

Use `PRODUCT.md` for product intent and `DESIGN.md` for visual direction before changing user-facing surfaces. The course source material (theory slides, exercise collections, past exams as Markdown transcriptions) lives in `course/`; lesson content and exam references were derived from it and should stay faithful to it.

**If `HANDOFF.md` exists, read it first** — it carries the current work-in-progress state and punch list.

## Architecture

- `src/content/` — lesson data, one file per tema (`processes`, `detection`, `estimation`, `wiener`, `adaptive`), aggregated in `lessons.ts`. Each module record carries trap/object/action/payoff copy, KaTeX equations, a prediction prompt, an exam transfer prompt, and exam references. Each lesson also carries `workedProblems`: real problems transcribed from `course/` (recent solved exams and the exercise collections) with faithful step-by-step solutions, rendered by `src/components/WorkedProblem.tsx` as an interactive stepper (statement → parts → steps revealed one at a time → boxed result). Prose fields support inline `$…$` KaTeX via `src/components/MathText.tsx`; keep solutions faithful to the printed resolutions, and escape `'` inside single-quoted LaTeX strings.
- `src/components/figures/` — one interactive figure per module, dispatched by module id in `src/components/LessonModule.tsx`. Shared frame in `figures/shared.tsx` (`FigureShell`, `Plot`, `ReadoutRow`, `Legend`); helpers in `figures/figure-utils.ts`.
- `src/domain/math/` — pure numerics: distributions, Q/chi-squared tails and inverses, seeded RNG, autocorrelation, periodogram, binomial pmf, 2×2 eigen tools (`kernel.ts`).
- `src/pages/LessonPage.tsx` renders any lesson; routes are generated from `src/content/lessons.ts`; nav/index derive from `src/lib/routes.ts`.
- `scripts/render-smoke.tsx` server-renders every page: `TSX_TSCONFIG_PATH=tsconfig.app.json pnpm dlx tsx scripts/render-smoke.tsx`.

## Figure conventions

- Readouts must derive from the model or a real simulation running in the figure. If a quantity is theoretical (a CRB, a misadjustment formula), label it as theory and, where possible, show the measured value beside it.
- SVG font sizes are in viewBox units: a `text-[10px]` label in a `viewBox` of width 250 renders twice as large on screen as in one of width 470. Keep full-width figures near W ≈ 470 and check adjacent figures for consistent apparent text size.
- Labels whose position depends on slider state can collide; check extreme slider values before calling a figure done.
- Interactions should work by both slider and direct drag on the plot (`Plot`'s `onDragPoint`).

## Commands

- `pnpm install` installs dependencies.
- `pnpm run typecheck` runs `tsc -b`.
- `pnpm run lint` runs ESLint.
- `pnpm run format:check` checks formatting (`format` writes).
- `pnpm run build` runs typecheck and creates a production build.

## Watch Commands and Visual Review

Never run watch/server commands in the foreground — they block forever.

For visual review only, you may run `pnpm dev --port 5199` as a **background** task, screenshot pages with headless Playwright, and kill the server before finishing:

```sh
pnpm dlx playwright install chromium   # first time only
pnpm dlx playwright screenshot --viewport-size=1440,2400 \
  http://localhost:5199/processes /tmp/processes.png
```

The `t3-code` browser MCP is an alternative when it is authorized. Everything else (typecheck, lint, build, render-smoke) must stay non-watch.

## TypeScript / ESLint gotchas

The lint setup is adapted from `github.com/mikearnaldi/accountability` and is strict. Write code that already complies:

- No `as` assertions, no non-null `!`; use type-only imports.
- Local imports need explicit `.ts`/`.tsx` extensions; package imports must not have extensions.
- `noUncheckedIndexedAccess`: indexed access needs `?? fallback` or an `undefined` check.
- `exactOptionalPropertyTypes`: never pass `undefined` to an optional prop — spread conditionally instead.
- No synchronous `setState` inside a `useEffect` body; interval/timeout callbacks are fine.
- Files that export components must export only components (react-refresh); keep non-component helpers in `.ts` files.

## Frontend

Use Tailwind CSS and the shadcn component pattern:

- shared utilities live in `src/lib`,
- shadcn-style components live in `src/components/ui`,
- path aliases use `@/`,
- semantic color utilities exist for inference roles: `h0` (blue), `h1` (amber), `detection` (green), `false-alarm` (red), `threshold` (amber), `truth` (ink), `prior` (indigo) — one color, one role per view.

Keep UI consistent with `DESIGN.md`: academic field notebook, signal-processing lab, public-science explainer. The owner explicitly likes two things — the wordmark (`src/components/Logo.tsx`, a committed SVG graphic; see `DESIGN.md` before touching it) and the table-of-contents nav (`StickyLessonNav`). Preserve both.
