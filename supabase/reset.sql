-- Drop all tables in the public schema
DROP TABLE IF EXISTS public.student_quiz_attempts;
DROP TABLE IF EXISTS public.quiz_options;
DROP TABLE IF EXISTS public.quiz_questions;
DROP TABLE IF EXISTS public.resources;
DROP TABLE IF EXISTS public.teacher_student_connections;
DROP TABLE IF EXISTS public.user_badges;
DROP TABLE IF EXISTS public.badges;
DROP TABLE IF EXISTS public.community_posts;
DROP TABLE IF EXISTS public.essays;
DROP TABLE IF EXISTS public.profiles;

-- Drop all custom types
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.essay_type;
DROP TYPE IF EXISTS public.resource_type;
DROP TYPE IF EXISTS public.visibility_type;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.get_user_stats(UUID);

-- Drop storage buckets
-- Note: This requires emptying the bucket first. This script won't do that automatically.
-- You might need to manually delete buckets from the Supabase dashboard if they contain files.
-- The Supabase JS client can be used to empty and delete buckets programmatically.

-- Example of deleting objects and then the bucket (run from a client or script):
-- const { data, error } = await supabase.storage.emptyBucket('essay_images')
-- const { data, error } = await supabase.storage.deleteBucket('essay_images')
