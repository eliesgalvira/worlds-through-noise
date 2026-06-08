# AGENTS

## Project

Worlds Through Noise is a Vite React TypeScript app for interactive lessons on detection, estimation, and later filtering in audiovisual signal processing.

Use `PRODUCT.md` for product intent and `DESIGN.md` for visual direction before changing user-facing surfaces.

## Commands

- `pnpm install` installs dependencies.
- `pnpm run typecheck` runs `tsc -b` and Effect language-service diagnostics.
- `pnpm run effect:diagnostics` runs Effect diagnostics for app and node tsconfigs.
- `pnpm run effect:check` checks whether the Effect TypeScript patch is active.
- `pnpm run effect:patch` patches the local TypeScript installation so Effect diagnostics can participate in TypeScript checking.
- `pnpm run lint` runs ESLint.
- `pnpm run format:check` checks formatting.
- `pnpm run build` runs typecheck and creates a production build.

## Hard Rule: No Watch Commands

Never run commands in watch mode.

Do not run:

- `pnpm run dev`
- `pnpm run preview`
- `pnpm run test:watch`
- any Vite dev server
- any watcher or long-running server command

Use non-watch verification commands only.

## Effect v4

This project uses `effect@beta`, currently Effect v4 beta.

Effect diagnostics are configured in `tsconfig.base.json` through `@effect/language-service`, and every listed Effect diagnostic is set to `error`.

The Effect source repository is vendored at `.repos/effect`. Use it to extract best practices, inspect how Effect v4 is structured, and verify API usage before guessing. Prefer direct module imports such as `effect/Effect` over the package barrel when Effect diagnostics require it.

## ESLint

The lint setup is adapted from `github.com/mikearnaldi/accountability`.

It includes strict TypeScript rules, explicit local import extensions, and local Effect-safety rules for common mistakes such as `Effect.ignore`, `Effect.catchAllCause`, silent `Effect.void` catch handlers, and `Effect.serviceOption`.

## Frontend

Use Tailwind CSS and the shadcn component pattern:

- shared utilities live in `src/lib`,
- shadcn-style components live in `src/components/ui`,
- path aliases use `@/`,
- local TypeScript imports include `.ts` or `.tsx` extensions.

Keep UI consistent with `DESIGN.md`: academic field notebook, signal-processing lab, and public-science explainer.
