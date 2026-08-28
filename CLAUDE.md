# CLAUDE.md

Project-wide guidance for Claude Code in this repository. Read alongside:

- `.github/copilot-instructions.md` — product/functional spec.
- `.github/instructions/component-atomization.instructions.md` — written for a stricter primitives/atoms/organisms tiering that this repo does not literally follow (see "Feature folders" below for what actually applies here).

## Stack

Next.js 15 (App Router) · Prisma/PostgreSQL · React Query · react-hook-form + Zod v4 · next-intl (`en`/`es` only) · Tailwind + shadcn/Radix.

Always use `pnpm`, never `npm` for security reasons. Use `pnpm install` or `pnpm add` for installing dependencies.

## Before considering any change done

Run, in order, and fix everything before finishing:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm format` for formatting application
4. `pnpm test` (or `pnpm test <path>` while iterating)
5. `pnpm build` for anything touching a server action, a new `'use client'`/`'use server'` boundary, or route files — `tsc --noEmit` does not catch everything Next's build does.

## Clean-code rules — apply to every component/hook/util you touch or add

- **Single responsibility, split when large.** If a component's JSX is hard to scan in one read, or it does more than one job, extract a smaller named component instead of growing the existing one.
- **Meaningful names.** Name for what a thing represents/does (`isUserLoggedIn`), not vague placeholders (`x`, `data2`).
- **No duplicated logic.** If the same snippet/behavior would appear twice, extract it into a shared component, hook, or `*.utils.ts` function first — never copy-paste a tweak.
- **Business logic stays out of JSX.** Derive data and side effects in hooks/utils; components render.
- **`useEffect` is for synchronizing with an external system only** (subscriptions, localStorage, non-React widgets, imperative `form.reset()` after an async/deferred value becomes available). Never use it to derive a value from other state/props that could just be computed inline during render.
- **Don't reach for `useMemo`/`useCallback`/`React.memo` by reflex.** Add them only once there's a concrete, identified reason (a measured expensive computation, or a proven re-render problem) — not preemptively.
- **Group and name props intentionally.** Prefer a few well-named, cohesive prop groups over long flat prop lists when a component's inputs naturally cluster; reconsider the component's responsibility if it needs dozens of unrelated props.
- **Handle loading/error/empty states explicitly.** Every query-backed or async view should visibly and intentionally handle all three — never let a state fall through implicitly.
- **Keep state as local as possible.** Lift state only as far as the nearest common owner that actually needs it; prefer component-local `useState` over context/global state by default.
- **Don't optimize prematurely.** First make the code correct and clear; optimize actual, identified bottlenecks.
- **Named exports only, `const` + `FC`.** `export const Foo: FC<FooProps> = (...) => ...`, using `PropsWithChildren<FooProps>` when a component accepts `children`. Use `Array<T>`, not `T[]`.

If you can't quickly explain what a component does, it's probably doing too much.

## Feature folders (`src/components/<feature>/`)

Follow the shape already used by `transactions/`, `categories/`, `bank-accounts/`: `types.ts`, `constants/`, `hooks/`, `transforms/`, and `components/<sub-feature>/*.tsx`. This codebase does **not** use barrel `index.ts` files for feature folders — import directly via the feature's path alias (see `tsconfig.json`, e.g. `@atoms/*`, `@molecules/*`, `@transactions/*`). Only introduce a nested subfolder under `components/` once a sub-feature's file count would otherwise clutter its parent folder.

## Server actions

Return `ResponseResult<T, $ZodIssue[] | string>` (or `FullErrorResult` for auth/authorization failures) — never throw for expected validation/business-rule failures. Schema factories (`someSchema(t)`) always take an already-resolved translator (`useTranslations(...)` client-side, `getTranslations(...)` server-side), never a namespace string.

## i18n

Any new copy key must be added to **both** `locales/en.json` and `locales/es.json` in the same change — never ship one without the other.
