-- Remove all seeded/legacy members from the default workspace EXCEPT the admin.
-- Run once in Supabase SQL Editor if you want to start with only admin (then add members from Admin panel).
-- Default workspace id used by the app:
-- a0000000-0000-0000-0000-000000000001

DELETE FROM public.workspace_members
WHERE workspace_id = 'a0000000-0000-0000-0000-000000000001'::uuid
  AND user_id IN (
    SELECT id FROM public.profiles
    WHERE email IN (
      'amit@test.com', 'nayan@test.com', 'nandkumar@test.com', 'ishita@test.com',
      'chetan@test.com', 'ambrish@test.com', 'akshay@test.com', 'manish@test.com',
      'sakshi@test.com', 'rohan@test.com', 'ankit@test.com', 'ankita@test.com',
      'pratik@test.com', 'editor@test.com', 'member@test.com', 'viewer@test.com'
    )
  )
  AND user_id != (SELECT id FROM public.profiles WHERE email = 'admin@test.com' LIMIT 1);

-- After this, only admin@test.com remains in the workspace. Add new members from Admin panel → Add member.
