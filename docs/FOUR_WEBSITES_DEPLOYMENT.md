# 4 Different Websites (Same Repo, 4 Deployments)

You can deploy the same Offee OKR repo **4 times** so each role has its **own website** (own URL, own login page, own dashboard). No shared login; each link is a separate site.

## How it works

- Set **`VITE_APP_ROLE`** in each deployment to one of: `admin` | `ceo` | `leader` | `member`.
- That deployment becomes a **single-role portal**:
  - **Login**: Only that role’s sign-in (no Admin/Team toggle).
  - **After login**: User is sent to that role’s home (`/admin`, `/ceo`, `/leader`, or `/member`).
  - **Wrong role**: If someone signs in with a different role, they see “Wrong portal” and must sign out and use their role’s link.

## Deploy 4 sites on Vercel

1. **One project per role**  
   Create 4 Vercel projects, all from the same GitHub repo (`HASHTECHVENTURES/offee.okr`).

2. **Same build settings for all**  
   - Build command: `npm run build`  
   - Output directory: `dist`  
   - Root directory: `./`

3. **Environment variables (each project)**  
   - `VITE_SUPABASE_URL` = your Supabase URL  
   - `VITE_SUPABASE_ANON_KEY` = your anon key  
   - **`VITE_APP_ROLE`** = **different per project**:
     - Project 1 (e.g. offee-admin): `VITE_APP_ROLE=admin`
     - Project 2 (e.g. offee-ceo): `VITE_APP_ROLE=ceo`
     - Project 3 (e.g. offee-leader): `VITE_APP_ROLE=leader`
     - Project 4 (e.g. offee-member): `VITE_APP_ROLE=member`

4. **Optional custom domains**  
   - admin.offee.com → Admin project  
   - ceo.offee.com → CEO project  
   - leader.offee.com → Leader project  
   - member.offee.com → Member project  

## Resulting links

| Role   | Example URL              | Login page     | After login |
|--------|--------------------------|----------------|-------------|
| Admin  | offee-admin.vercel.app   | Admin sign in  | /admin      |
| CEO    | offee-ceo.vercel.app     | CEO sign in    | /ceo        |
| Leader | offee-leader.vercel.app  | Leader sign in | /leader     |
| Member | offee-member.vercel.app  | Member sign in | /member     |

Same codebase; 4 different “websites” by setting `VITE_APP_ROLE` per deployment.
