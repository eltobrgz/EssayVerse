-- WARNING: This script will delete all data in the specified tables.
-- It's intended for development and testing purposes.
-- Make sure you have backups if you are running this on a production database.

-- Drop tables in reverse order of dependency
drop table if exists public.community_posts;
drop table if exists public.essays;
drop table if exists public.profiles;

-- Supabase creates a trigger on auth.users which needs to be removed.
drop trigger if exists on_auth_user_created on auth.users;
-- and the function associated with the trigger
drop function if exists public.handle_new_user();

-- NOTE: Storage buckets and their objects are not deleted by this script.
-- You might need to manually delete them from the Supabase UI.
