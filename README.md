# DailyDabba 🍱

Walk-in Order Manager for Tiffin Centers & Mobile Restaurants. Multilingual (6 languages), mobile-first, exported from Figma Make and ready for local development.

## Quick Start

```bash
# 1. Install deps (pnpm recommended, npm or yarn also work)
pnpm install

# 2. Run dev server
pnpm dev

# Opens at http://localhost:5173
```

That's it — the app runs as a phone-frame preview in your browser with all 9 screens working (welcome, onboarding, auth, home/order, order summary, close day, menu, history, settings) and full mock data.

## Project Structure

```
DailyDabba-App/
├── index.html                      ← Vite entry
├── package.json                    ← Deps + scripts
├── vite.config.ts                  ← React + Tailwind v4 plugin
├── tsconfig.json                   ← TypeScript config
├── postcss.config.mjs              ← PostCSS for Tailwind
├── .env.example                    ← Copy → .env.local for Supabase
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  ← Full PRD schema (8 tables + RLS)
│
└── src/
    ├── main.tsx                    ← React mount
    ├── lib/
    │   └── supabase.ts             ← Stub client (commented; uncomment when wiring)
    ├── styles/
    │   ├── fonts.css               ← Google Fonts (Noto Sans + DM Mono + Indic)
    │   └── globals.css             ← Tailwind v4 + design tokens
    └── app/
        ├── App.tsx                 ← Phone frame + screen router
        ├── context/
        │   └── AppContext.tsx      ← Global state (screen, language, order, etc.)
        ├── data/
        │   ├── mockData.ts         ← Sample menu, orders, history
        │   └── translations.ts     ← All 6 languages (en/hi/te/ta/kn/ml)
        └── components/
            ├── BottomNav.tsx       ← 4-tab bottom navigation
            ├── Toast.tsx           ← Success/error toast
            └── screens/
                ├── WelcomeScreen.tsx       ← Language picker
                ├── OnboardingScreen.tsx    ← 3-slide carousel
                ├── AuthScreen.tsx          ← Login / Signup
                ├── HomeScreen.tsx          ← Order taking (main)
                ├── OrderSummaryScreen.tsx  ← Review + payment mode
                ├── CloseDayScreen.tsx      ← End-of-day summary
                ├── MenuScreen.tsx          ← Menu management
                ├── HistoryScreen.tsx       ← Daily/weekly/monthly
                └── SettingsScreen.tsx      ← Language, profile, sign out
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Animation | Motion for React (Framer Motion successor) |
| Icons | Lucide React |
| Charts | Recharts |
| Confetti | canvas-confetti |
| Backend (planned) | Supabase (schema in `/supabase/migrations`) |
| Language | TypeScript |

## What's Working Today

✅ All 9 screens render with full design fidelity  
✅ Phone-frame preview with iPhone-style notch + home indicator  
✅ Screen-to-screen transitions (Motion fade + slide)  
✅ Language switching (6 languages: English, हिंदी, తెలుగు, தமிழ், ಕನ್ನಡ, മലയാളം)  
✅ Order cart with quantity controls  
✅ Confetti animation on Close Day  
✅ Charts on History screen  
✅ Toast notifications  
✅ Mock data flows (orders persist in-memory during session)

## What's Next (Supabase Wiring)

The Figma Make output uses **mock data** stored in React state — no real backend. To wire Supabase:

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy `.env.example` to `.env.local` and fill in:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2 — Run the Migration

In the Supabase Dashboard:
- Open **SQL Editor**
- Paste contents of `supabase/migrations/001_initial_schema.sql`
- Click **Run**

This creates 8 tables (`profiles`, `operators`, `menu_items`, `daily_menu_overrides`, `day_sessions`, `orders`, `order_items`, `daily_summaries`) with full RLS policies.

### Step 3 — Install Supabase Client

```bash
pnpm add @supabase/supabase-js
```

Then uncomment the code block in `src/lib/supabase.ts`.

### Step 4 — Replace Mock Data with Real Queries

In each screen, replace imports from `'../data/mockData'` with Supabase queries. For example, in `MenuScreen.tsx`:

```ts
// Before
import { mockMenuItems } from '../../data/mockData';

// After
import { supabase } from '@/lib/supabase';
const { data: items } = await supabase
  .from('menu_items')
  .select('*')
  .eq('owner_id', user.id)
  .order('sort_order');
```

## About the "No Code to Deploy" Issue from Figma Make

If you see this in Figma Make's Supabase deploy panel — it's expected. Figma Make's deploy only pushes Supabase **edge functions** and **migrations** present in your codebase. Since the project was UI-only (using `mockData.ts`), there was nothing to deploy.

Now that this repo includes `supabase/migrations/001_initial_schema.sql`, you can either:
- Push the migration via the **Supabase CLI**: `supabase db push`
- Or paste the SQL into the Supabase dashboard's SQL Editor manually (simpler for one-off)

## Working with Claude Code

This codebase is structured to be Claude Code friendly:
- Each screen is a single self-contained file
- All translations centralized in `data/translations.ts`
- Global state in `context/AppContext.tsx`
- Mock data in `data/mockData.ts` (replace with Supabase queries)

Suggested next prompts to give Claude Code:
1. `"Wire AuthScreen.tsx to real Supabase auth (signup creates a profile row)"`
2. `"Replace mockMenuItems in MenuScreen with live queries to the menu_items table"`
3. `"Implement the summaryEngine.ts that computes daily summaries from orders + order_items"`
4. `"Add the token number flow to OrderSummaryScreen (only when profiles.token_system_enabled = true)"`

## Going Native (React Native + Expo)

This is a **web app** (Vite + browser). The original PRD targets a **React Native + Expo** mobile app for the App Store / Play Store. If that's your goal:

- The current web app is a solid visual reference / PWA
- For native, follow the prompts in `DailyDabba_PRD.md` (§15) with Claude Code
- Reuse `translations.ts` as-is (works in both)
- Map screen components 1:1: `<div>` → `<View>`, Tailwind classes → NativeWind v4

## License

ATTRIBUTIONS.md is preserved from the Figma Make export. shadcn/ui components were referenced in the Make environment but not used directly in screen code, so they're not included here.

---

*Generated from Figma Make file `DailyDabba App` (key: 3Ugg9cYGGVGfjF5OU6hhOD) on 2026-06-21.*
