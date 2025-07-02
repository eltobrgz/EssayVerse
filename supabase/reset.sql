-- This script will delete all data and reset the database schema.
-- Use with caution.

-- Drop tables in reverse order of creation due to dependencies
DROP TABLE IF EXISTS public.user_badges;
DROP TABLE IF EXISTS public.badges;
DROP TABLE IF EXISTS public.community_posts;
DROP TABLE IF EXISTS public.essays;
DROP TABLE IF EXISTS public.profiles;

-- Drop custom types
DROP TYPE IF EXISTS public.user_role;

-- Drop functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Empty storage buckets
TRUNCATE storage.objects;

-- Re-create the function and trigger if needed (or run tables.sql again)
-- This part is commented out as you'd typically run the setup scripts again.
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/

SELECT 'Database reset complete.';
