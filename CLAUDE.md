# DailyDabba — Claude Code Master Prompt
## Replace mock data with real Supabase backend

## Project Context (read this first, every session)

**What this is:** DailyDabba — a walk-in order manager for Indian tiffin centers. Web app (React 18 + Vite + TypeScript + Tailwind v4 + Motion). Exported from Figma Make, now being wired to Supabase.

**App root:** `app/` — all source lives here.

**Current state:**
- All 9 screens render with full design fidelity
- State is held in `src/app/context/AppContext.tsx` (in-memory React state)
- Menu, orders, and history come from `src/app/data/mockData.ts` (fake data)
- 6-language i18n in `src/app/data/translations.ts` is wired and works — **do not touch it**
- Supabase schema lives in `supabase/migrations/001_initial_schema.sql` (8 tables + RLS + auto-profile trigger)
- `src/lib/supabase.ts` is a stub with commented-out client code

**Hard constraints — do not break these:**
1. **Visual fidelity stays identical.** Phone frame, screen transitions, fonts, colors, animations, layouts — none of these change. If a refactor requires a UI change, ask first.
2. **i18n stays intact.** All user-facing strings still come from `translations.ts` via `useApp().t(key)`. Never hardcode English.
3. **Type-safety.** Use `src/lib/database.types.ts` (generated from schema). No `any` in queries.
4. **RLS-safe queries always.** Every Supabase query must rely on `auth.uid()` matching `owner_id`. Never write a query that would only work with service-role key from the client.
5. **One screen at a time.** Don't refactor multiple screens in one diff. Each screen migration is its own commit-worthy chunk.

**What "done" looks like:**
- `mockData.ts` deleted (or kept only as type definitions)
- App is fully functional after a fresh signup: user creates a menu item, takes an order, closes the day, sees real summary, reopens app next day and history is there
- No mock orders, no `DEFAULT_MENU_ITEMS`, no `generateHistoricalData()` calls anywhere
- All loading states + error states are real (Supabase calls can fail / be slow)
- Builds clean with `npm run build` and zero `tsc` errors

---

## Commands

```bash
npm run dev               # localhost:5173
npm run typecheck         # tsc --noEmit, must pass after every phase
npm run build             # full prod build, must pass before commit

supabase gen types typescript --project-id <REF> > src/lib/database.types.ts
```

## Files to reference frequently

- `supabase/migrations/001_initial_schema.sql` — source of truth for DB shape
- `src/app/data/translations.ts` — every user-facing string lives here
- `src/app/context/AppContext.tsx` — global state, will grow significantly
- `src/lib/database.types.ts` — Supabase row types (never edit manually)
- `src/lib/adapters.ts` — snake_case ↔ camelCase bridges

## Rules

- After every code change: run `npm run typecheck` and report the result
- Use the adapters from `src/lib/adapters.ts` — never hand-map snake_case ↔ camelCase inline
- When adding a new user-facing string: add it to ALL 6 translation files in the same commit
- When making a Supabase query: wrap in try/catch + show toast on error
- Never change visual design without asking
- Never use `any` in queries
- Never hardcode English text — must go through `t()`
- Never use service-role key from the client
