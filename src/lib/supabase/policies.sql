-- This file contains the RLS policies for your tables.
-- It is not intended to be run directly, but rather to be copied and pasted into the Supabase SQL editor.

-- Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.essays enable row level security;
alter table public.community_posts enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.resources enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.student_quiz_attempts enable row level security;
alter table public.teacher_student_connections enable row level security;


-- Policies for profiles
create policy "Users can read all profiles" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Policies for essays
create policy "Users can see their own essays" on public.essays for select using (auth.uid() = user_id);
create policy "Users can insert their own essays" on public.essays for insert with check (auth.uid() = user_id);

create policy "Teachers can see their students' essays" on public.essays for select using (
    get_user_role(auth.uid()) = 'teacher' AND
    user_id IN (
        SELECT student_id FROM public.teacher_student_connections WHERE teacher_id = auth.uid()
    )
);
create policy "Teachers can update their students' essays" on public.essays for update using (
    get_user_role(auth.uid()) = 'teacher' AND
    user_id IN (
        SELECT student_id FROM public.teacher_student_connections WHERE teacher_id = auth.uid()
    )
) with check (
    get_user_role(auth.uid()) = 'teacher' AND
    user_id IN (
        SELECT student_id FROM public.teacher_student_connections WHERE teacher_id = auth.uid()
    )
);


-- Policies for community_posts
create policy "Users can read all community posts" on public.community_posts for select using (true);
create policy "Users can insert their own posts" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on public.community_posts for update using (auth.uid() = user_id);

-- Policies for badges and user_badges
create policy "All users can read badges" on public.badges for select using (true);
create policy "All users can read user_badges" on public.user_badges for select using (true);
create policy "Service roles can insert user_badges" on public.user_badges for insert with check (auth.role() = 'service_role');


-- Storage Policies

-- essay_images
CREATE POLICY "Users can upload essay images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'essay_images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);
CREATE POLICY "Users can view their own essay images" ON storage.objects FOR SELECT USING (
    bucket_id = 'essay_images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- corrected_essay_images
CREATE POLICY "Teachers can upload corrected images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'corrected_essay_images' AND
    get_user_role(auth.uid()) = 'teacher'
);

CREATE POLICY "Users can view corrected images for their essays" ON storage.objects FOR SELECT USING (
    bucket_id = 'corrected_essay_images' AND
    (
        -- Teacher who corrected it can see it
        get_user_role(auth.uid()) = 'teacher' 
        OR 
        -- Student who owns the essay can see it
        auth.uid() = (
            SELECT user_id FROM public.essays WHERE id = (regexp_replace(name, '^.+/corrected-([a-fA-F0-9-]+)-.+$', '\1'))::uuid
        )
    )
);


-- community_media
CREATE POLICY "Users can upload community media" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'community_media' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);
CREATE POLICY "All users can view community media" ON storage.objects FOR SELECT USING (
    bucket_id = 'community_media'
);

-- learning_resources
CREATE POLICY "Teachers can upload learning resources" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'learning_resources' AND
    get_user_role(auth.uid()) = 'teacher'
);
CREATE POLICY "All users can view learning resources" ON storage.objects FOR SELECT USING (
    bucket_id = 'learning_resources'
);


-- Policies for Learning Resources
create policy "All users can read public resources" on public.resources for select using (visibility = 'PUBLIC');
create policy "Students can read restricted resources from their teachers" on public.resources for select using (
    visibility = 'RESTRICTED' AND
    creator_id IN (
        SELECT teacher_id from public.teacher_student_connections where student_id = auth.uid()
    )
);
create policy "Teachers can see their own restricted resources" on public.resources for select using (
    (visibility = 'RESTRICTED' AND creator_id = auth.uid() AND get_user_role(auth.uid()) = 'teacher') OR
    (visibility = 'PUBLIC' AND creator_id = auth.uid() AND get_user_role(auth.uid()) = 'teacher')
);
create policy "Teachers can create resources" on public.resources for insert with check (
    get_user_role(auth.uid()) = 'teacher' and
    creator_id = auth.uid()
);
create policy "Teachers can update their own resources" on public.resources for update using (
    get_user_role(auth.uid()) = 'teacher' and
    creator_id = auth.uid()
) with check (
    get_user_role(auth.uid()) = 'teacher' and
    creator_id = auth.uid()
);

-- Policies for Quizzes
create policy "All users can read questions and options" on public.quiz_questions for select using (true);
create policy "All users can read options" on public.quiz_options for select using (true);

-- Policies for Quiz Attempts
create policy "Students can see their own attempts" on public.student_quiz_attempts for select using (student_id = auth.uid());
create policy "Students can create their own attempts" on public.student_quiz_attempts for insert with check (student_id = auth.uid());
create policy "Teachers can see attempts for their quizzes" on public.student_quiz_attempts for select using (
    quiz_resource_id IN (
        SELECT id from public.resources where creator_id = auth.uid()
    )
);

-- Policies for Teacher-Student Connections
create policy "Users can see all connections" on public.teacher_student_connections for select using (true);
create policy "Students can follow/unfollow teachers" on public.teacher_student_connections for all using (student_id = auth.uid());
