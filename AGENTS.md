# AGENTS

## Project

Worlds Through Noise is a Vite React TypeScript study companion for the PSAVC course (statistical signal processing: random processes, detection, estimation, Wiener filtering, adaptive filtering).

Non-negotiable tenet: **teach by example**, as defined in `EXAMPLES.md`. Every lesson module names a trap, hands the learner a concrete object, and makes them perform the unseen action in an interactive figure whose readouts are genuinely computed — never fabricated. Prose that merely describes a concept is a regression.

Use `PRODUCT.md` for product intent and `DESIGN.md` for visual direction before changing user-facing surfaces. The course source material (theory slides, exercise collections, past exams as Markdown transcriptions) lives in `course/`.

## Architecture

- `src/content/` — lesson data, one file per tema (`processes`, `detection`, `estimation`, `wiener`, `adaptive`). Each module record carries trap/object/action/payoff copy, KaTeX equations, a prediction prompt, an exam transfer prompt, and exam references.
- `src/components/figures/` — one interactive figure per module, dispatched by module id in `LessonModule.tsx`. Figures compute their readouts from real math/simulation in `src/domain/math/`.
- `src/domain/math/` — pure numerics: distributions, Q/chi-squared tails, seeded RNG, autocorrelation, periodogram, 2×2 eigen tools.
- `src/pages/LessonPage.tsx` renders any lesson; routes are generated from `src/content/lessons.ts`.
- `scripts/render-smoke.tsx` server-renders every page (run with `TSX_TSCONFIG_PATH=tsconfig.app.json pnpm dlx tsx scripts/render-smoke.tsx`).

## Commands

- `pnpm install` installs dependencies.
- `pnpm run typecheck` runs `tsc -b`.
- `pnpm run lint` runs ESLint.
- `pnpm run format:check` checks formatting.
- `pnpm run build` runs typecheck and creates a production build.

## Hard Rule: No Watch Commands

Never run commands in watch mode.

Do not run:

- `pnpm run dev`
- `pnpm run preview`
- any Vite dev server
- any watcher or long-running server command

Use non-watch verification commands only.

## ESLint

The lint setup is adapted from `github.com/mikearnaldi/accountability`: strict TypeScript rules and explicit local import extensions.

## Frontend

Use Tailwind CSS and the shadcn component pattern:

- shared utilities live in `src/lib`,
- shadcn-style components live in `src/components/ui`,
- path aliases use `@/`,
- local TypeScript imports include `.ts` or `.tsx` extensions.

Keep UI consistent with `DESIGN.md`: academic field notebook, signal-processing lab, and public-science explainer. The wordmark (`src/components/Logo.tsx`) is a committed SVG graphic — see `DESIGN.md` before touching it.
