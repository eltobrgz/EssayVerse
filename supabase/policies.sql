-- Enable Row Level Security for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all essays" ON public.essays;
DROP POLICY IF EXISTS "Users can insert their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can update their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can delete their own essays" ON public.essays;
DROP POLICY IF EXISTS "Users can view all community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can insert their own community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Public can view all badges" ON public.badges;
DROP POLICY IF EXISTS "Users can view all user_badges" ON public.user_badges;

-- Policies for 'profiles' table
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies for 'essays' table
CREATE POLICY "Users can view all essays" ON public.essays
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own essays" ON public.essays
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essays" ON public.essays
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own essays" ON public.essays
FOR DELETE USING (auth.uid() = user_id);

-- Policies for 'community_posts' table
CREATE POLICY "Users can view all community posts" ON public.community_posts
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own community posts" ON public.community_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community posts" ON public.community_posts
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts" ON public.community_posts
FOR DELETE USING (auth.uid() = user_id);

-- Policies for 'badges' and 'user_badges'
CREATE POLICY "Public can view all badges" ON public.badges
FOR SELECT USING (true);

CREATE POLICY "Users can view all user_badges" ON public.user_badges
FOR SELECT USING (true);

-- Policies for Learning Resources
-- resources
CREATE POLICY "Allow read access to public and restricted resources" ON public.resources
FOR SELECT USING (
  visibility = 'PUBLIC' OR
  (
    visibility = 'RESTRICTED' AND
    creator_id IN (
      SELECT teacher_id FROM public.teacher_student_connections WHERE student_id = auth.uid()
    )
  ) OR
  creator_id = auth.uid() -- creator can always see their own stuff
);

CREATE POLICY "Teachers can create resources" ON public.resources
FOR INSERT WITH CHECK (
  creator_id = auth.uid() AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);

CREATE POLICY "Teachers can update their own resources" ON public.resources
FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Teachers can delete their own resources" ON public.resources
FOR DELETE USING (creator_id = auth.uid());

-- quiz_questions and quiz_options
CREATE POLICY "Allow read access based on parent resource" ON public.quiz_questions
FOR SELECT USING (
  (SELECT p.visibility FROM public.resources p WHERE p.id = resource_id) = 'PUBLIC' OR
  (
    (SELECT p.visibility FROM public.resources p WHERE p.id = resource_id) = 'RESTRICTED' AND
    (SELECT p.creator_id FROM public.resources p WHERE p.id = resource_id) IN (
      SELECT teacher_id FROM public.teacher_student_connections WHERE student_id = auth.uid()
    )
  ) OR
  (SELECT p.creator_id FROM public.resources p WHERE p.id = resource_id) = auth.uid()
);

CREATE POLICY "Allow read access to options based on parent question" ON public.quiz_options
FOR SELECT USING (
  question_id IN (SELECT id FROM public.quiz_questions) -- This implicitly uses the policy on quiz_questions
);

CREATE POLICY "Teachers can manage questions/options for their resources" ON public.quiz_questions
FOR INSERT, UPDATE, DELETE USING (
  (SELECT creator_id FROM public.resources WHERE id = resource_id) = auth.uid()
);

CREATE POLICY "Teachers can manage options for their questions" ON public.quiz_options
FOR INSERT, UPDATE, DELETE USING (
  (SELECT r.creator_id FROM public.resources r JOIN public.quiz_questions q ON r.id = q.resource_id WHERE q.id = question_id) = auth.uid()
);


-- teacher_student_connections
CREATE POLICY "Students can follow/unfollow teachers" ON public.teacher_student_connections
FOR INSERT, DELETE USING (student_id = auth.uid());

CREATE POLICY "Users can see their own connections" ON public.teacher_student_connections
FOR SELECT USING (student_id = auth.uid() OR teacher_id = auth.uid());

-- student_quiz_attempts
CREATE POLICY "Students can create and view their own quiz attempts" ON public.student_quiz_attempts
FOR SELECT, INSERT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view attempts on their quizzes" ON public.student_quiz_attempts
FOR SELECT USING (
  (SELECT r.creator_id FROM public.resources r WHERE r.id = quiz_resource_id) = auth.uid()
);
