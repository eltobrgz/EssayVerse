-- Drop existing policies to avoid conflicts during re-runs
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can create essays" ON public.essays;
DROP POLICY IF EXISTS "Teachers can view their students essays" ON public.essays;
DROP POLICY IF EXISTS "Teachers can update their students essays with feedback" ON public.essays;

DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;

DROP POLICY IF EXISTS "Users can see all badges" ON public.badges;
DROP POLICY IF EXISTS "Users can see their own badges" ON public.user_badges;

DROP POLICY IF EXISTS "Resources are visible to all authenticated users" ON public.resources;
DROP POLICY IF EXISTS "Teachers can create resources" ON public.resources;

DROP POLICY IF EXISTS "Quiz questions are visible alongside their resource" ON public.quiz_questions;
DROP POLICY IF EXISTS "Quiz options are visible alongside their questions" ON public.quiz_options;

DROP POLICY IF EXISTS "Students can see their own quiz attempts" ON public.student_quiz_attempts;
DROP POLICY IF EXISTS "Students can create their own quiz attempts" ON public.student_quiz_attempts;

DROP POLICY IF EXISTS "Connections are visible to involved student and teacher" ON public.teacher_student_connections;

-- Policies for storage objects
DROP POLICY IF EXISTS "Allow user to upload to their own folder in essay_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to view their own essay images" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to upload to their own folder in community_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view community_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow teachers to upload to learning_resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view learning_resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow teachers to upload corrected essay images" ON storage.objects;
DROP POLICY IF EXISTS "Allow student/teacher to view corrected essay images" ON storage.objects;


-- RLS Policies for tables

-- profiles table
CREATE POLICY "Allow authenticated users to read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- essays table
CREATE POLICY "Users can view their own essays" ON public.essays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create essays" ON public.essays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can view their students essays" ON public.essays FOR SELECT USING (
  get_user_role(auth.uid()) = 'teacher' AND
  user_id IN (SELECT student_id FROM public.teacher_student_connections WHERE teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update their students essays with feedback" ON public.essays FOR UPDATE USING (
  get_user_role(auth.uid()) = 'teacher' AND
  user_id IN (SELECT student_id FROM public.teacher_student_connections WHERE teacher_id = auth.uid())
) WITH CHECK (
  get_user_role(auth.uid()) = 'teacher'
);


-- community_posts table
CREATE POLICY "Authenticated users can view community posts" ON public.community_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create their own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- badges table
CREATE POLICY "Users can see all badges" ON public.badges FOR SELECT USING (auth.role() = 'authenticated');

-- user_badges table
CREATE POLICY "Users can see their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- resources table
CREATE POLICY "Resources are visible to all authenticated users" ON public.resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Teachers can create resources" ON public.resources FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'teacher' AND creator_id = auth.uid());

-- quiz related tables
CREATE POLICY "Quiz questions are visible alongside their resource" ON public.quiz_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Quiz options are visible alongside their questions" ON public.quiz_options FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Students can see their own quiz attempts" ON public.student_quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create their own quiz attempts" ON public.student_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);

-- teacher_student_connections table
CREATE POLICY "Connections are visible to involved student and teacher" ON public.teacher_student_connections FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);

--- RLS Policies for Storage Buckets

-- essay_images bucket
CREATE POLICY "Allow user to upload to their own folder in essay_images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'essay_images' AND
    auth.uid() IS NOT NULL AND
    split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Allow user to view their own essay images" ON storage.objects FOR SELECT USING (
    bucket_id = 'essay_images' AND
    auth.uid() IS NOT NULL AND
    split_part(name, '/', 1) = auth.uid()::text
);

-- community_media bucket
CREATE POLICY "Allow user to upload to their own folder in community_media" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'community_media' AND
    auth.uid() IS NOT NULL AND
    split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Allow authenticated users to view community_media" ON storage.objects FOR SELECT USING (
    bucket_id = 'community_media' AND
    auth.role() = 'authenticated'
);

-- learning_resources bucket
CREATE POLICY "Allow teachers to upload to learning_resources" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'learning_resources' AND
    get_user_role(auth.uid()) = 'teacher' AND
    split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Allow authenticated users to view learning_resources" ON storage.objects FOR SELECT USING (
    bucket_id = 'learning_resources' AND
    auth.role() = 'authenticated'
);

-- corrected_essay_images bucket
CREATE POLICY "Allow teachers to upload corrected essay images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'corrected_essay_images' AND
    get_user_role(auth.uid()) = 'teacher' AND
    split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Allow student/teacher to view corrected essay images" ON storage.objects FOR SELECT USING (
    bucket_id = 'corrected_essay_images' AND
    (
        -- Case 1: The current user is the student who owns the essay.
        auth.uid() = (SELECT user_id FROM public.essays WHERE id = get_essay_id_from_corrected_path(name))
        OR
        -- Case 2: The current user is the teacher who uploaded it.
        (get_user_role(auth.uid()) = 'teacher' AND auth.uid()::text = split_part(name, '/', 1))
    )
);
