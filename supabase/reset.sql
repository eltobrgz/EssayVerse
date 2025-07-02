-- Drop policies
DROP POLICY IF EXISTS "Users can view their own essays." ON public.essays;
DROP POLICY IF EXISTS "Users can insert their own essays." ON public.essays;
DROP POLICY IF EXISTS "Users can view community posts." ON public.community_posts;
DROP POLICY IF EXISTS "Users can insert their own community posts." ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own badges." ON public.user_badges;
DROP POLICY IF EXISTS "Users can view all badges." ON public.badges;
DROP POLICY IF EXISTS "All users can view public resources." ON public.resources;
DROP POLICY IF EXISTS "Students can view restricted resources from their teachers." ON public.resources;
DROP POLICY IF EXISTS "Teachers can manage their own resources." ON public.resources;
DROP POLICY IF EXISTS "Users can view quiz questions for accessible resources." ON public.quiz_questions;
DROP POLICY IF EXISTS "Users can view options for accessible questions." ON public.quiz_options;
DROP POLICY IF EXISTS "Users can manage their own quiz attempts." ON public.student_quiz_attempts;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_stats(p_user_id uuid);
DROP FUNCTION IF EXISTS public.get_user_progress_overall(p_user_id uuid);
DROP FUNCTION IF EXISTS public.get_user_progress_by_type(p_user_id uuid);


-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop tables
DROP TABLE IF EXISTS public.student_quiz_attempts;
DROP TABLE IF EXISTS public.quiz_options;
DROP TABLE IF EXISTS public.quiz_questions;
DROP TABLE IF EXISTS public.teacher_student_connections;
DROP TABLE IF EXISTS public.resources;
DROP TABLE IF EXISTS public.user_badges;
DROP TABLE IF EXISTS public.badges;
DROP TABLE IF EXISTS public.community_posts;
DROP TABLE IF EXISTS public.essays;
DROP TABLE IF EXISTS public.profiles;

-- Drop types
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.resource_type;
DROP TYPE IF EXISTS public.visibility_type;


-- Drop storage buckets
-- Note: Deleting buckets via SQL is not directly supported.
-- You should delete them from the Supabase dashboard under Storage.
-- However, we can empty them.
-- This command requires the `storage.objects_admin` role.
-- DELETE FROM storage.objects WHERE bucket_id = 'essay_images';
-- DELETE FROM storage.objects WHERE bucket_id = 'community_media';
-- DELETE FROM storage.objects WHERE bucket_id = 'learning_resources';
