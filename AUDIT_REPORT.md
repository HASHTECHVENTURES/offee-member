# Offee OKR App - Full Audit Report
**Generated:** March 9, 2026

---

## Executive Summary

The codebase is **70% implemented** but has significant confusion:
- **13 test user accounts** created but no clear purpose
- **25 services** exported but only ~4 actually used
- **18 navigation items** in sidebar but all are placeholders
- **Unclear data model**: Multiple scoring systems (daily scorecards, leader KPIs, KRA scorecards, performance scores)
- **Recommended action**: Simplify to MVP scope and remove unused accounts/services

---

## 1. USER ACCOUNTS (Confusion)

### Test Users Created:
```
Email                  | Role   | Purpose
---------------------+--------+------------------------------------------
admin@test.com        | admin  | Generic test (unclear)
editor@test.com       | editor | Generic test (unclear)
member@test.com       | member | Generic test (unclear)
viewer@test.com       | viewer | Generic test (unclear)
amit@test.com         | admin  | Amit (Founder/CEO) - has KRAs defined
nayan@test.com        | admin  | Dr. Nayan (Growth/Strategy) - has KRAs defined
nandkumar@test.com    | editor | Nandkumar (Business/Partnerships) - has KRAs defined
ishita@test.com       | editor | Ishita (Direct Sales) - has KRAs defined
chetan@test.com       | editor | Chetan (Finance) - has KRAs defined
ambrish@test.com      | editor | Ambrish (Ops/Delivery) - has KRAs defined
akshay@test.com       | admin  | Akshay (CTO + Product) - has KRAs defined
manish@test.com       | editor | Manish (Infra/Security/IoT) - has KRAs defined
sakshi@test.com       | editor | Sakshi (Research/Assessment) - has KRAs defined
rohan@test.com        | editor | Rohan (Marketing) - has KRAs defined
ankit@test.com        | editor | Ankit (Customer Success) - has KRAs defined
ankita@test.com       | editor | Ankita (HR) - has KRAs defined
pratik@test.com       | editor | Pratik (Founder Office) - has KRAs defined
```

### Problem:
- **4 generic test users** (admin/editor/member/viewer) are **not needed** - they're from old Next.js scaffold
- **13 leader accounts** exist with defined KRAs but **no UI to view/manage them**
- **Unclear roles**: Some marked "admin", some "editor" — why?

### Recommendation:
**Option A (Clean):** Remove admin/editor/member/viewer; keep only the 13 leaders.
**Option B (Keep testing):** Rename them to clarify purpose (e.g., "test-admin@test.com").

---

## 2. DATABASE SCHEMA (Complexity)

### Tables Created:
| Table | Purpose | Used? |
|-------|---------|-------|
| workspaces | Organization container | ✓ Yes (1 test workspace) |
| profiles | User profiles | ✓ Yes |
| workspace_members | User → workspace mapping | ✓ Yes |
| okrs | Objectives & Key Results | ✗ No UI |
| key_results | KRs under OKRs | ✗ No UI |
| scorecards | Weekly scorecards (generic) | ✗ No UI |
| daily_scorecards | Daily scorecard entries | ✗ No UI |
| decisions | Strategic decisions | ✗ No UI |
| comments | Comments on decisions/KRs | ✗ No UI |
| **daily_leader_scorecards** | Leader daily metrics (3 output + 2 pipeline + 1 quality KPI) | ✗ No UI |
| **leader_kpi_templates** | KPI label templates per leader | ✗ No UI |
| **weekly_kr_tracking** | Weekly KR run-rates | ✗ No UI |
| **performance_scores** | Leader performance scoring | ✗ No UI |
| **rewards_penalties** | Rewards/penalties ledger | ✗ No UI |
| products | Product listings | ✗ No UI |
| teams | Team definitions | ✗ No UI |
| quarters | Quarters/periods | ✗ No UI |
| kras | Key Result Areas (per leader) | ✗ No UI |
| support_requests | Support SLA tracking | ✗ No UI |
| kr_check_ins | KR check-in history | ✗ No UI |
| audit_logs | Audit trail | ✗ No UI |
| notification_preferences | User notification settings | ✗ No UI |

### Problem:
- **3 different scoring systems**:
  1. **daily_scorecards** (generic metrics)
  2. **daily_leader_scorecards** (leader KPIs)
  3. **weekly_kr_scorecards** (KR tracking)
  
  → Unclear which one is used for what.

- **25 services exported** but **frontend has zero UI** for them (all placeholder pages).

---

## 3. NAVIGATION & ROUTES (All Placeholders)

### Navigation Items (18 total):
**Main:**
- CEO Dashboard → PlaceholderPage ❌
- Daily Scorecard → PlaceholderPage ❌
- Week in Review → PlaceholderPage ❌
- OKRs → PlaceholderPage ❌
- Key Results → PlaceholderPage ❌
- Weekly Scorecard → PlaceholderPage ❌
- Decisions → PlaceholderPage ❌
- Support SLA → PlaceholderPage ❌
- Products → PlaceholderPage ❌
- Teams → PlaceholderPage ❌
- KRAs → PlaceholderPage ❌
- Quarters → PlaceholderPage ❌
- Leader Performance → PlaceholderPage ❌
- AI Dashboard → PlaceholderPage ❌
- Audit Log → PlaceholderPage ❌

**Bottom:**
- Notifications → PlaceholderPage ❌
- Activity → PlaceholderPage ❌
- Settings → PlaceholderPage ❌

### Implemented Pages:
- `/login` → LoginPage ✓
- `/workspace` → WorkspacePage ✓

### Problem:
User clicks any nav item → sees empty page. Unclear what the priority is or what to build first.

---

## 4. FRONTEND CODE (Partially Built)

### Components:
- ✓ **Design system** (UI components: buttons, inputs, cards, etc.)
- ✓ **Layout** (sidebar, dashboard shell)
- ✓ **Auth** (login, context, protected routes)
- ❌ **Feature pages** (all placeholders)

### Services (25 total):
- Only **auth flow** works end-to-end
- All other services have no UI calling them

### Actions (4 files):
- `actions/okrs.ts` → no UI
- `actions/key-results.ts` → no UI
- `actions/decisions.ts` → no UI
- `actions/comments.ts` → no UI

---

## 5. CONFUSION SOURCES

### Why is it confusing?

1. **Too many accounts:**
   - 4 generic test users (from old scaffold)
   - 13 leader accounts (with defined KRAs)
   - Unclear which to use for testing

2. **Multiple data models:**
   - OKRs + Key Results + Decisions (traditional OKR model)
   - Daily Leader Scorecards (daily metrics)
   - Weekly KR Tracking (weekly run-rates)
   - Performance Scores + Rewards/Penalties (evaluation)
   
   → No UI to see how these connect

3. **18 empty navigation items:**
   - User sees big menu but can't do anything
   - Creates false sense of functionality

4. **25 services with no UI:**
   - Backend data model is complete but frontend is 90% placeholders
   - Hard to know what was actually intended to be built

---

## RECOMMENDED CLEANUP

### Phase 1: Simplify Test Users (1 hour)

**Option A: Clean Start**
```sql
DELETE FROM auth.users WHERE email IN (
  'admin@test.com', 'editor@test.com', 'member@test.com', 'viewer@test.com'
);
```
Keep only: amit@, nayan@, nandkumar@, ishita@, chetan@, ambrish@, akshay@, manish@, sakshi@, rohan@, ankit@, ankita@, pratik@

**Option B: Clarify Names**
Rename generic users to clarify testing role:
- `test-admin@test.com` (tests admin permissions)
- `test-editor@test.com` (tests editor permissions)
- `test-viewer@test.com` (tests viewer permissions)

**Action:** Choose one option.

---

### Phase 2: Define MVP Scope (2 hours)

**Question:** What are the **3-5 core features** users need first?

For example:
- **Option 1 (OKR-focused):** OKRs → Key Results → Daily Scorecards → Decisions
- **Option 2 (Leader-focused):** Leader KRAs → Daily Leader Scorecards → Performance Scores
- **Option 3 (Hybrid):** OKRs + Daily Leader Scorecards + Decisions

Once you choose, we can:
1. Hide unused nav items
2. Remove unused services from exports
3. Build the 3-5 core pages
4. Archive extra database tables

---

### Phase 3: Clean Up Code (1-2 hours)

1. **Remove unused services** from `services/index.ts`
2. **Hide unused navigation items** from `nav-config.ts`
3. **Delete placeholder database tables** (if decided in Phase 2)
4. **Update `AUDIT_REPORT.md`** with final architecture

---

## NEXT STEPS

**To proceed, please decide:**

1. **Which test users to keep?**
   - Keep all 13 leaders + delete 4 generic test users?
   - Or keep both?

2. **What's the MVP scope?**
   - What should a user be able to do on day 1?
   - (E.g., "View my OKRs and submit daily scorecard")

3. **Which scoring system is primary?**
   - Daily leader scorecards?
   - OKR tracking?
   - Weekly run-rates?

Once you answer these, I can clean up the codebase in **2-3 hours** so everything is clear and focused.

---

## Files to Review

- `supabase/seed-leaders.sql` — 13 leader accounts
- `supabase/seed-test-users.sql` — 4 generic test accounts (possibly remove)
- `components/layout/nav-config.ts` — 18 navigation items (most are placeholders)
- `services/index.ts` — 25 exported services (most have no UI)
- `src/App.tsx` — route definitions (mostly placeholders)
