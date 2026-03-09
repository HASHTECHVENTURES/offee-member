# How to use Offee – step-by-step guide

This guide walks you through setup, admin login, and managing team members. No hardcoded users: you create the first admin, then add everyone else from the Admin panel.

---

## Step 1: One-time setup (env + Supabase)

1. **Copy env file**
   ```bash
   cp env.example .env.local
   ```

2. **Get Supabase keys**  
   In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API**:
   - **Project URL** → put in `.env.local` as `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

3. **Create the first admin (and optional test users)**  
   From the project root:
   ```bash
   node --env-file=.env.local scripts/create-test-users-admin.mjs
   ```
   This creates:
   - `admin@test.com` (password: `Test1234`) – use this to log in as Admin.
   - Optionally: `editor@test.com`, `member@test.com`, `viewer@test.com` with the same password.

4. **Apply database migrations** (if not already done)  
   In Supabase Dashboard → **SQL Editor**, run the migration files under `supabase/migrations/` in order (e.g. `20250306000000_*.sql` through `20250312000000_*.sql`). This sets up `roles`, `workspace_members`, and RLS policies for roles.  
   If you see **"new row violates row-level security policy for table 'roles'"**, run `supabase/migrations/20250312000000_roles_rls_policies.sql` in the SQL Editor.

---

## Step 2: Run the app

**Terminal 1 – frontend**
```bash
npm install
npm run dev
```
Open the URL shown (e.g. [http://localhost:3000](http://localhost:3000) or 3001).

**Terminal 2 – create-member API (needed only for “Add member” in Admin panel)**  
If you want to add new members from the Admin panel:
```bash
node --env-file=.env.local server/create-member-server.mjs
```
Leave it running. The dev server proxies `/api` to this process.

---

## Step 3: Log in

1. Go to **/login** (or click “Sign in” if you’re not logged in).

2. **Log in as Admin**
   - Choose **Admin** (toggle at top).
   - Email is pre-filled: `admin@test.com`.
   - Enter password: `Test1234`.
   - Click **Sign in as admin**.  
   You’ll land on the **Admin panel** (not the CEO Dashboard).

3. **Log in as a team member**
   - Choose **Team member**.
   - Enter their email and password (the one you set when adding them, or from the seed script).
   - Click **Sign in**.  
   They land on the **Workspace** (CEO or “My” dashboard depending on role).

---

## Step 4: Use the Admin panel (admin only)

When logged in as Admin you only see: **Admin panel**, **Team**, **Settings** in the sidebar. No CEO Dashboard / OKRs / scorecards in the nav.

### Add a new member (they can log in right away)

1. Click **Add member** (top right of Admin panel).
2. Fill in:
   - **Email** (required)
   - **Full name** (optional)
   - **Password** (min 6 characters) – they’ll use this to sign in.
3. Click **Create member**.  
   **Requirement:** the create-member API must be running (Step 2, Terminal 2). If it’s not, you’ll see a message to start it.
4. The new person appears in the **Team members** table. Assign a **Role** (dropdown) if you want.
5. They can go to **/login** → choose **Team member** → sign in with that email and password.

### Create a role

1. Click **Create role**.
2. Enter **Role name** (e.g. “Finance lead”), optional **Slug**.
3. Set **Dashboard** (CEO full view vs My dashboard).
4. Check **Admin panel**, **Manage OKRs**, **Manage key results** as needed.
5. Click **Create role**. The role appears in the **Roles** list and in the Role dropdown for each member.

### Assign roles to members

In the **Team members** table, use the **Role** dropdown for each row to assign one of the roles you created (or the default Admin / Leader). Save is immediate.

### Team and Settings

- **Team** – same member list in a team view.
- **Settings** – app/user settings.

---

## Step 5: How new members use the app

1. You add them in Admin panel (Step 4) with email + password (and optionally run the create-member API).
2. They open the app and go to **/login**.
3. They choose **Team member**, enter the **email** and **password** you set, then **Sign in**.
4. They see the sidebar and dashboard allowed by their role (e.g. Workspace, Daily/Weekly Scorecard, Decisions, Team).

---

## Quick reference

| I want to…                    | Do this |
|------------------------------|--------|
| Log in as admin              | Login → **Admin** → `admin@test.com` / `Test1234` → **Sign in as admin** |
| Add a new member from UI     | Run `server/create-member-server.mjs`, then Admin panel → **Add member** |
| Create a custom role         | Admin panel → **Create role** |
| Assign a role to someone     | Admin panel → Team members table → **Role** dropdown |
| Let someone log in           | They use **Team member** login with the email/password you set when adding them |

---

## Troubleshooting

- **“Invalid login credentials” for admin**  
  Run the script again:  
  `node --env-file=.env.local scripts/create-test-users-admin.mjs`

- **“Cannot reach create-member API” when adding a member**  
  Start the API in a second terminal:  
  `node --env-file=.env.local server/create-member-server.mjs`

- **Admin still sees CEO Dashboard**  
  You’re on `/workspace`. Click **Admin panel** in the sidebar (or go to `/admin`). Admins are redirected from `/workspace` to `/admin`.

- **No roles in the dropdown**  
  Run the migration `20250310000000_admin_roles_and_member_status.sql` so default roles (Admin, Leader) exist. Then create more roles with **Create role** if needed.
