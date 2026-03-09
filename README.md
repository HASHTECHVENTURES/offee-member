# Execution OS

Internal execution platform for companies to run OKRs, track execution numbers, and generate AI-powered dashboards.

## Tech stack

- **Vite** + **React** + **TypeScript** (Lovable-style stack)
- **React Router** (client-side routing)
- **TailwindCSS** (v4) + design system
- **Supabase** (data & auth, browser client only)
- **Gemini** (AI dashboards & insights; API routes need a separate backend if you use them)

## Getting started

```bash
npm install
cp env.example .env.local
# Set in .env.local: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` (e.g. `admin@test.com` / `Test1234` if you’ve run the Supabase seed).

**Full step-by-step (setup, admin login, add members):** [docs/HOW_TO_USE.md](docs/HOW_TO_USE.md).

## Deploy to Vercel (single-portal — one login per site)

Use **Root Directory** so the build sets the correct portal; the login page will show only that role (no Team member/Admin toggle).

| Repo / site | Root Directory | Login shown |
|-------------|----------------|-------------|
| **offee.admin** | **`admin`** | Admin sign in only |
| **offee.leader** | **`leader`** | Leader sign in only |

| Setting | Value |
|--------|--------|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Environment variables** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

If the deployment URL contains the role (e.g. `offee-admin.vercel.app`, `offee-leader.vercel.app`), that role’s login is also detected automatically.

## Scripts

| Command         | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |
| `npm run format` | Format with Prettier   |
| `npm run format:check` | Check formatting   |

## Project structure

```
/index.html         # Vite entry
/src                # Vite entry (main.tsx, App.tsx, index.css)
  main.tsx          # React root + Router + AuthProvider
  App.tsx           # Routes (login, dashboard layout, workspace, placeholders)
/contexts           # Auth context (useAuth)
/pages              # Login, Workspace, Placeholder pages
/components         # Layout (AppShell, SidebarClient, DashboardLayout), UI, design-system
/lib                # supabase-browser client, utils
/services           # API and business logic (use with supabase from lib/supabase-browser)
/types              # TypeScript types
/utils              # Pure utilities
/actions            # Client-side actions (decisions, okrs, key-results, comments)
```

## Placeholder pages

- **Workspace** – `/workspace`
- **OKRs** – `/okrs`
- **Key Results** – `/key-results`
- **Targets** – `/targets`
- **Scorecards** – `/scorecards`
- **Weekly Board** – `/weekly-board`
- **Decisions** – `/decisions`
- **AI Dashboard** – `/ai-dashboard`
- **Follow-ups** – `/follow-ups`
- **Leader Performance** – `/leader-performance`
- **Notifications** – `/notifications`
- **Activity** – `/activity`
- **Settings** – `/settings`

Design follows modern dashboard patterns (Linear/Stripe-style sidebar and layout).

## Supabase

- **Client**: `@/lib/supabase-browser` — single browser client; use `import { supabase } from "@/lib/supabase-browser"`.
- **Auth**: `@/contexts/AuthContext` — `useAuth()` returns `{ user, loading, signOut }`. Login at `/login`; session is stored by Supabase in the browser.
- **Actions**: `@/actions` — `createDecisionAction`, `createOkrAction`, `createKeyResultAction`, `addCommentAction`, etc. They use the browser Supabase client.
- **Services**: All DB access lives in `@/services` — `okrService`, `keyResultService`, `decisionService`, `userService`, etc. Each function takes a Supabase client (e.g. `okrService.getOkrs(supabase, { workspace_id })`). Pass `supabase` from `@/lib/supabase-browser`.
- **Types**: `@/types` — `UserProfile`, `OKR`, `KeyResult`, `Decision`, etc., plus `*Insert` types for creates/updates.
