# Offee — Product Specification & Implementation Roadmap
**Based on:** OKR Final.txt (Full Document Analysis)

---

## What is Offee?

**Offee is an OKR + Execution OS** for high-growth startups. It's a **numbers-only, decision-driven** platform where:

1. **Company has 6-month OKRs** (5 total: Proof Engine, Fundraise, Business Growth, Govt, Innovation AI)
2. **Each OKR has 3-5 Key Results (KRs)** with one DRI (Directly Responsible Individual)
3. **13 leaders** submit **daily scorecards** (3 outputs + 2 pipeline + 1 quality KPI + 3 blockers)
4. **Weekly**, leaders report **KR progress** (target vs. actual vs. next week commit)
5. **Decisions** are logged and tracked (with due dates, owners, escalations)
6. **CEO Dashboard** shows: daily leader scorecards, KR run-rates, overdue decisions, risk alerts

---

## Required User Accounts (13 Leaders)

| # | Name | Role | Email | KRA Count | Key Responsibility |
|---|------|------|-------|-----------|-------------------|
| 1 | Amit | Founder/CEO | amit@test.com | 3 | Fundraise closure + investor confidence + decision speed |
| 2 | Dr. Nayan | Growth/Strategy/Investment | nayan@test.com | 3 | Investor pipeline + operating cadence + strategic deals |
| 3 | Nandkumar | Business/Partnerships | nandkumar@test.com | 3 | Revenue ownership + Govt pipeline + partner activation |
| 4 | Ishita | Direct Sales | ishita@test.com | 3 | Private college closures + pipeline conversion + discipline |
| 5 | Chetan | Finance | chetan@test.com | 3 | Collections + DSO + compliance + runway planning |
| 6 | Ambrish | Ops/Delivery | ambrish@test.com | 3 | Proof engine throughput + delivery reliability + pilot execution |
| 7 | Akshay | CTO + Product | akshay@test.com | 3 | Capability AI + product stack + security/stability |
| 8 | Manish | Infra/Security/IoT | manish@test.com | 3 | Uptime + security hardening + device readiness |
| 9 | Sakshi | Research/Assessment | sakshi@test.com | 3 | PLAT validity + research credibility + outcome framework |
| 10 | Rohan | Marketing | rohan@test.com | 3 | Demand contribution + proof assets + content engine |
| 11 | Ankit | Customer Success | ankit@test.com | 3 | Renewals + customer health + implementation coordination |
| 12 | Ankita | HR | ankita@test.com | 3 | Hiring + performance system + execution culture |
| 13 | Pratik | Founder Office | pratik@test.com | 3 | Company scoreboard accuracy + follow-ups + meeting briefs |

**Note:** Delete the 4 generic test users (admin@, editor@, member@, viewer@) — they're not needed.

---

## Core Features to Build (MVP)

### Phase 1: Foundation (Weeks 1-2)
- [ ] **Leader Profile Management** — Show each leader's name, role, KRAs
- [ ] **Daily Leader Scorecard** — Form to submit: 3 outputs + 2 pipeline + 1 quality + 3 blockers
- [ ] **Daily Dashboard** — CEO sees all leader scorecards (latest submission per leader)

### Phase 2: Weekly Tracking (Weeks 3-4)
- [ ] **Weekly KR Scoreboard** — Form per leader: KR owned, weekly target, actual, gap, next week commit
- [ ] **KR Status View** — Show all company OKRs + progress vs. targets

### Phase 3: Decision Log (Weeks 5-6)
- [ ] **Decision Log** — Create, track, escalate decisions (mandatory fields: date, decision, owner, due, KR, status, evidence)
- [ ] **Decision Escalation** — Show overdue decisions (7+ days → CEO strip, 14+ → penalty)
- [ ] **Blocker Surfacing** — Top 5 overdue decisions shown on CEO dashboard

### Phase 4: CEO Dashboard (Weeks 7-8)
- [ ] **Exec Summary** — Daily leader scorecard previews
- [ ] **KR Run-Rates** — Weekly progress vs. targets
- [ ] **Decision Log Status** — Overdue decisions, blockers, next steps
- [ ] **Alerts** — Leaders missing daily submission, KRs at risk, SLA misses

---

## Database Schema (Simplified)

**Tables Actually Needed:**

| Table | Purpose | Status |
|-------|---------|--------|
| workspaces | Org container | ✓ Use as-is |
| profiles | User profiles | ✓ Use as-is |
| workspace_members | User → workspace | ✓ Use as-is |
| okrs | Company OKRs | ✓ Use as-is |
| key_results | KRs under OKRs | ✓ Use as-is |
| **daily_leader_scorecards** | Daily: 3 output + 2 pipeline + 1 quality + 3 blockers | ✓ Use as-is |
| **weekly_kr_scorecards** | Weekly: KR target/actual/gap/next commit | ✓ Use as-is |
| **decisions** | Decision log | ✓ Use as-is |
| **decision_comments** | Comments/evidence on decisions | ✓ Use as-is (if exists) |
| leader_kpi_templates | KPI label templates | ✓ Use as-is (for labels) |

**Tables to REMOVE/IGNORE:**

| Table | Reason |
|-------|--------|
| scorecards | Generic scorecards — not used (daily_leader_scorecards is primary) |
| daily_scorecards | Old version — use daily_leader_scorecards |
| teams | Not in MVP scope |
| products | Product scoreboard not in MVP (can add Phase 5) |
| quarters | Not needed if OKRs have quarter field |
| support_requests | Not in MVP |
| kr_check_ins | Not in MVP |
| audit_logs | Not in MVP (can add later) |
| performance_scores | Not in MVP (evaluation system later) |
| rewards_penalties | Not in MVP |
| kras | Schema exists but not UI (static, per leader) |
| notification_preferences | Not in MVP |

---

## Navigation Menu (MVP Only)

**Keep:**
- ✓ Workspace (home/dashboard)
- ✓ Daily Scorecard (form + view)
- ✓ Weekly Scorecard (form + view KRs)
- ✓ Decisions (log + escalations)
- ✓ Settings (profile)

**Remove (Placeholder):**
- ❌ CEO Dashboard (replace with Workspace home)
- ❌ Week in Review (covered by Weekly Scorecard)
- ❌ OKRs (admin only, not in MVP)
- ❌ Key Results (part of Weekly Scorecard)
- ❌ Support SLA
- ❌ Products
- ❌ Teams
- ❌ KRAs (static, no UI needed)
- ❌ Quarters
- ❌ Leader Performance
- ❌ AI Dashboard
- ❌ Audit Log
- ❌ Notifications
- ❌ Activity

**Result:** 5 menu items instead of 18 (focused MVP)

---

## Services to Export (Simplified)

**Keep:**
- `okrService` — Read company OKRs
- `keyResultService` — Read KRs for weekly view
- `dailyLeaderScorecardService` — CRUD daily scorecards
- `weeklyKRScorecardService` — CRUD weekly scorecards
- `decisionService` — CRUD decisions
- `userService` — Get user profile + leaders list
- `workspaceService` — Get workspace

**Remove from export:**
- `scorecardService`, `dailyScorecardService`, `kraService`, `teamService`, `quarterService`, `productService`, `supportRequestService`, `checkInService`, `auditLogService`, `notificationPrefsService`, `performanceScoreService`, `rewardsPenaltiesService`, `leaderKPITemplateService`, `weeklyKRTrackingService`, `aiReportService`

---

## User Access Levels

| Role | Can Do |
|------|--------|
| **Leader** (all 13) | Submit own daily/weekly scorecards, add blockers, view CEO dashboard |
| **CEO** (Amit only) | See all dashboards, escalate decisions, view everything |
| **Admin** (future) | Manage users, OKRs, KRAs setup |

**Current setup:**
- Amit, Dr. Nayan, Akshay → `admin` role
- Others (Nandkumar, Ishita, Chetan, Ambrish, Manish, Sakshi, Rohan, Ankit, Ankita, Pratik) → `editor` role

---

## Quick Cleanup Checklist

### Immediate Actions:

- [ ] **Delete test users:** Run SQL to remove admin@, editor@, member@, viewer@ accounts
- [ ] **Update nav-config.ts** — Keep only: Workspace, Daily Scorecard, Weekly Scorecard, Decisions, Settings
- [ ] **Update services/index.ts** — Export only 7 services (listed above)
- [ ] **Update App.tsx** — Only route to implemented + placeholder pages
- [ ] **Hide unused database tables** from services (don't delete, just don't use)

### Data Entry:
- [ ] **Enter 5 OKRs** into `okrs` table (with quarters, years, descriptions)
- [ ] **Enter ~30 KRs** into `key_results` table (linked to OKRs, with DRIs)
- [ ] **Set up KPI templates** for each leader (labels for 3 output + 2 pipeline + 1 quality)

### Phase 1 Build:
- [ ] Create **Daily Scorecard page** (form + list view)
- [ ] Create **Weekly Scorecard page** (form + KR tracking)
- [ ] Create **Decision Log page** (create + filter + escalations)
- [ ] Create **Workspace/Dashboard home** (summaries + alerts)

---

## Key Metrics (For Understanding)

### Daily Submission (Per Leader):
```
3 Output KPIs + 2 Pipeline KPIs + 1 Quality KPI + 3 Blockers
= 7 numbers + 3 decision blockers per day × 13 leaders
= 91 data points + 39 blockers daily
```

### Weekly Submission (Per Leader):
```
Per OKR-owned KR: target, actual, gap, next commit
= ~2-3 KRs per leader × 13 leaders
= 26-39 KRs tracked weekly
```

### Decision Log:
```
Expected: 20-30 decisions per week
Priority: overdue decisions (>7 days) surface to CEO
Escalation: >14 days = penalty or reassign
```

---

## Files to Edit Now

1. **`services/index.ts`** — Remove unused exports
2. **`components/layout/nav-config.ts`** — Simplify to 5 items
3. **`src/App.tsx`** — Keep only 5 routes + placeholders for future
4. **`supabase/seed-leaders.sql`** — Keep; delete seed-test-users.sql
5. **Delete:** `seed-test-users.sql` (or simplify to just Pratik for testing)

---

## Next: Implementation Order

1. **Week 1:** Daily Scorecard (form + list)
2. **Week 2:** Workspace Dashboard (daily summary)
3. **Week 3:** Weekly Scorecard + KR view
4. **Week 4:** Decision Log + escalations
5. **Week 5:** Polish + deployment

---

## Questions for You:

1. **Should we seed sample OKRs/KRs** with dummy data so login users see real content?
2. **Who else needs access** (beyond the 13 leaders)?
3. **What's the deployment target?** (Internal? External? Public?)
4. **Timeline?** When do you need MVP live?
