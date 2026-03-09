# Role and user-specific views

## Your question
> "Every username will show the different dashboard, different option. If I'm wrong or right, please correct me."

**Short answer:** We **do** show different dashboards and different sidebar options per role (admin vs editor).

---

## What is already per-user (same menu, different data)

| Area | Who sees what |
|------|-------------------------------|
| **Daily Scorecard** | Each user only submits/edits **their own** daily scorecard (by `leader_id`). |
| **Weekly Scorecard** | Each user only sees and edits key results where they are **DRI** (`dri_id` = current user). |
| **Settings** | Each user sees only **their own** profile and signs out their own session. |

So: same options for everyone, but **your data** in those pages is scoped to you.

---

## Different options per role (sidebar)

- **Admin** (`role === "admin"`): Sees **CEO Dashboard**, Daily Scorecard, Weekly Scorecard, **OKRs**, **Key Results**, Decisions, Settings.
- **Editor** (`role === "editor"` or other): Sees **My Dashboard**, Daily Scorecard, Weekly Scorecard, Decisions, Settings. **OKRs** and **Key Results** are hidden from the sidebar.
- Direct navigation to `/okrs` or `/key-results` by an editor redirects to `/workspace`.

---

## Different dashboard per role (Workspace home)

- **Admin (CEO)**  
  - **Title:** “CEO Dashboard”  
  - **Content:** Company-wide view: all active OKRs, all key results (on track / at risk), team count, completed OKRs, alerts for at-risk KRs and overdue decisions.  
  - **Actions:** “Add objective” (OKRs).

- **Editor (leader)**  
  - **Title:** “My Dashboard”  
  - **Content:** Only their own data:  
    - Daily scorecard status (submitted today or pending)  
    - **My key results** (KRs where they are DRI), with progress  
    - **Decisions I own** (open and overdue)  
  - **Actions:** “Submit daily scorecard” / “Edit today’s scorecard”.

So: **dashboard and options are different per username/role**: admins get the full company view and OKR/Key Result management; editors get “My Dashboard” and no OKRs/Key Results in the menu.

---

## How roles are set today

- In **`seed-leaders.sql`**:  
  - **admin**: Amit, Nayan, Akshay  
  - **editor**: Nandkumar, Ishita, Chetan, Ambrish, Manish, Sakshi, Rohan, Ankit, Ankita, Pratik  

So “different dashboard, different option” is only partly true: **same options**, **same data scope** on Workspace/OKRs/Key Results/Decisions, with **one** visible difference (CEO Dashboard vs Workspace) and **per-user** behaviour only on Daily Scorecard, Weekly Scorecard, and Settings.

---

## What would make “every username = different dashboard / different options”

To get to **clearly** different dashboards and options per user/role, we could add:

1. **CEO-only view**
   - e.g. “CEO Dashboard” that shows **all leaders’ daily scorecards**, overdue decisions, and KR roll-up (separate from the current Workspace).

2. **Role-based menu**
   - e.g. only `admin` see “OKRs” and “Key Results”; others see only “Workspace”, “Daily Scorecard”, “Weekly Scorecard”, “Decisions”, “Settings”.

3. **Data scoping by role**
   - e.g. editors see only decisions they own or are involved in; admins see all.

4. **Leader-specific Daily Scorecard labels**
   - Today, KPI labels on Daily Scorecard come from a template that can fall back to a default. We could map each leader (e.g. by `full_name` or a `leader_title` field) to the right template (CEO, Finance, Sales, etc.) so each username gets the **right** set of KPI labels.

If you want to move toward “every username shows a different dashboard and different options”, we can implement the above in steps (e.g. start with CEO-only dashboard and role-based menu).
