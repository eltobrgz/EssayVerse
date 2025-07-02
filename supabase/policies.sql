-- Helper function to get user role
-- This function assumes you have a 'profiles' table with 'id' (uuid) and 'role' (text) columns.
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Clear existing policies to prevent conflicts from previous attempts
DROP POLICY IF EXISTS "Users can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Students can view their own essays." ON public.essays;
DROP POLICY IF EXISTS "Teachers can view their students' essays." ON public.essays;
DROP POLICY IF EXISTS "Users can create their own essays." ON public.essays;
DROP POLICY IF EXISTS "Teachers can update essays with feedback." ON public.essays;
DROP POLICY IF EXISTS "Users can view all community posts." ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own posts." ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts." ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts." ON public.community_posts;
DROP POLICY IF EXISTS "Users can view all badges." ON public.badges;
DROP POLICY IF EXISTS "Users can view all user badges." ON public.user_badges;
DROP POLICY IF EXISTS "Users can view public resources." ON public.resources;
DROP POLICY IF EXISTS "Creators can view their own resources." ON public.resources;
DROP POLICY IF EXISTS "Students can view restricted resources from their teachers." ON public.resources;
DROP POLICY IF EXISTS "Teachers can create resources." ON public.resources;
DROP POLICY IF EXISTS "Creators can update their own resources." ON public.resources;
DROP POLICY IF EXISTS "Creators can delete their own resources." ON public.resources;
DROP POLICY IF EXISTS "Users can view questions of accessible resources." ON public.quiz_questions;
DROP POLICY IF EXISTS "Teachers can create questions for their resources." ON public.quiz_questions;
DROP POLICY IF EXISTS "Users can view options of accessible questions." ON public.quiz_options;
DROP POLICY IF EXISTS "Teachers can create options for their questions." ON public.quiz_options;
DROP POLICY IF EXISTS "Users can view all connections." ON public.teacher_student_connections;
DROP POLICY IF EXISTS "Students can manage their own quiz attempts." ON public.student_quiz_attempts;
DROP POLICY IF EXISTS "Allow authenticated uploads to essay_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from essay_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to community_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from community_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow teacher uploads to learning_resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from learning_resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow teacher uploads to corrected_essay_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from corrected_essay_images" ON storage.objects;

-- ============== CREATE POLICIES ==============

-- 1. Profiles Table
CREATE POLICY "Users can view all profiles."
  ON public.profiles FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- 2. Essays Table
CREATE POLICY "Students can view their own essays."
  ON public.essays FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Teachers can view their students' essays."
  ON public.essays FOR SELECT
  USING (
    (get_user_role(auth.uid()) = 'teacher') AND
    EXISTS (
      SELECT 1 FROM teacher_student_connections
      WHERE teacher_id = auth.uid() AND student_id = essays.user_id
    )
  );

CREATE POLICY "Users can create their own essays."
  ON public.essays FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Teachers can update essays with feedback."
  ON public.essays FOR UPDATE
  USING (
    (get_user_role(auth.uid()) = 'teacher') AND
    EXISTS (
      SELECT 1 FROM teacher_student_connections
      WHERE teacher_id = auth.uid() AND student_id = essays.user_id
    )
  );

-- 3. Community Posts Table
CREATE POLICY "Users can view all community posts."
  ON public.community_posts FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Users can create their own posts."
  ON public.community_posts FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own posts."
  ON public.community_posts FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own posts."
  ON public.community_posts FOR DELETE
  USING ( auth.uid() = user_id );

-- 4. Badges Table
CREATE POLICY "Users can view all badges."
  ON public.badges FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- 5. User Badges Table
CREATE POLICY "Users can view all user badges."
  ON public.user_badges FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- 6. Resources Table
CREATE POLICY "Users can view public resources."
  ON public.resources FOR SELECT
  USING ( visibility = 'PUBLIC' );

CREATE POLICY "Creators can view their own resources."
  ON public.resources FOR SELECT
  USING ( auth.uid() = creator_id );

CREATE POLICY "Students can view restricted resources from their teachers."
  ON public.resources FOR SELECT
  USING (
    visibility = 'RESTRICTED' AND
    EXISTS (
      SELECT 1 FROM teacher_student_connections
      WHERE student_id = auth.uid() AND teacher_id = resources.creator_id
    )
  );

CREATE POLICY "Teachers can create resources."
  ON public.resources FOR INSERT
  WITH CHECK (
    (get_user_role(auth.uid()) = 'teacher') AND
    (creator_id = auth.uid())
  );

CREATE POLICY "Creators can update their own resources."
  ON public.resources FOR UPDATE
  USING ( auth.uid() = creator_id );

CREATE POLICY "Creators can delete their own resources."
  ON public.resources FOR DELETE
  USING ( auth.uid() = creator_id );

-- 7. Quiz Questions & Options
CREATE POLICY "Users can view questions of accessible resources."
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resources WHERE id = quiz_questions.resource_id
    )
  );

CREATE POLICY "Teachers can create questions for their resources."
  ON public.quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resources WHERE id = quiz_questions.resource_id AND creator_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can view options of accessible questions."
  ON public.quiz_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions WHERE id = quiz_options.question_id
    )
  );

CREATE POLICY "Teachers can create options for their questions."
  ON public.quiz_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_questions q
      JOIN resources r ON q.resource_id = r.id
      WHERE q.id = quiz_options.question_id AND r.creator_id = auth.uid()
    )
  );

-- 8. Teacher-Student Connections
CREATE POLICY "Users can view all connections."
  ON public.teacher_student_connections FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- 9. Student Quiz Attempts
CREATE POLICY "Students can manage their own quiz attempts."
  ON public.student_quiz_attempts FOR ALL
  USING ( auth.uid() = student_id )
  WITH CHECK ( auth.uid() = student_id );

-- 10. Storage Policies
-- Note: storage.path_tokens is a 1-based array of the path parts.

-- Bucket: essay_images
CREATE POLICY "Allow authenticated uploads to essay_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'essay_images' AND
    (storage.path_tokens(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated reads from essay_images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING ( bucket_id = 'essay_images' );

-- Bucket: community_media
CREATE POLICY "Allow authenticated uploads to community_media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community_media' AND
    (storage.path_tokens(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated reads from community_media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING ( bucket_id = 'community_media' );

-- Bucket: learning_resources
CREATE POLICY "Allow teacher uploads to learning_resources"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'learning_resources' AND
    (get_user_role(auth.uid()) = 'teacher') AND
    (storage.path_tokens(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated reads from learning_resources"
  ON storage.objects FOR SELECT
  TO authenticated
  USING ( bucket_id = 'learning_resources' );

-- Bucket: corrected_essay_images
CREATE POLICY "Allow teacher uploads to corrected_essay_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'corrected_essay_images' AND
    (get_user_role(auth.uid()) = 'teacher') AND
    (storage.path_tokens(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated reads from corrected_essay_images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING ( bucket_id = 'corrected_essay_images' );
