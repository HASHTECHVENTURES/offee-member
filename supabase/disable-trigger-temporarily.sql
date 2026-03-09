-- Run in Supabase SQL Editor to temporarily disable the profile trigger.
-- If login works after this, the trigger was causing "Database error".
-- You can re-enable later with: run-this-in-order.sql (Part 1 trigger section).

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
