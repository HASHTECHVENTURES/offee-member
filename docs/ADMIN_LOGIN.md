# Admin login (admin@test.com / Test1234)

If you see **"Invalid login credentials"** when signing in as Admin with password `Test1234`, Supabase Auth does not have that user or the password does not match.

## Fix: create or reset the admin user

Use the **Admin API script** so Supabase sets the password correctly (SQL seed can fail on hosted Supabase):

1. In **Supabase Dashboard** → **Settings** → **API**, copy the **service_role** key (keep it secret).
2. In your project root, ensure `.env.local` has:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
3. Run:
   ```bash
   node --env-file=.env.local scripts/create-test-users-admin.mjs
   ```
4. Try again: **Admin** → password `Test1234` → **Sign in as admin**.

The script creates `admin@test.com` (and other test users) with password `Test1234`, or resets the password if the user already exists.

## Alternative: create user in Dashboard

In **Supabase Dashboard** → **Authentication** → **Users** → **Add user**:

- Email: `admin@test.com`
- Password: `Test1234`
- Confirm email (or enable “Auto Confirm” for testing).

Then ensure this user has a row in `public.profiles` and `public.workspace_members` (e.g. by running the rest of your seed or the script above).

---

## Add members from Admin panel (no hardcoded seed)

To create new members directly from the Admin panel (they can then log in with the email/password you set):

1. Start the create-member API (same env as above):
   ```bash
   node --env-file=.env.local server/create-member-server.mjs
   ```
2. Keep it running (e.g. in a second terminal). The app proxies `/api` to it when you run `npm run dev`.
3. In **Admin panel** → **Add member**: enter email, optional name, and password → **Create member**. The new user appears in the list and can sign in.
