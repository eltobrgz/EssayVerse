-- Enable RLS
alter table "public"."profiles" enable row level security;
alter table "public"."essays" enable row level security;
alter table "public"."community_posts" enable row level security;
alter table "public"."badges" enable row level security;
alter table "public"."user_badges" enable row level security;
alter table "public"."resources" enable row level security;
alter table "public"."quiz_questions" enable row level security;
alter table "public"."quiz_options" enable row level security;
alter table "public"."teacher_student_connections" enable row level security;
alter table "public"."student_quiz_attempts" enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- Policies for essays
create policy "Users can view their own essays." on public.essays for select using (auth.uid() = user_id);
create policy "Users can create their own essays." on public.essays for insert with check (auth.uid() = user_id);
create policy "Teachers can view their students' essays." on public.essays for select using ((select role from public.profiles where id = auth.uid()) = 'teacher' AND user_id IN (SELECT student_id from public.teacher_student_connections where teacher_id = auth.uid()));
create policy "Teachers can update their students' essays with feedback." on public.essays for update using ((select role from public.profiles where id = auth.uid()) = 'teacher' AND user_id IN (SELECT student_id from public.teacher_student_connections where teacher_id = auth.uid()));


-- Policies for community_posts
create policy "Community posts are viewable by authenticated users." on public.community_posts for select to authenticated using (true);
create policy "Users can create their own posts." on public.community_posts for insert to authenticated with check (auth.uid() = user_id);

-- Policies for badges
create policy "Badges are viewable by everyone." on public.badges for select using (true);
create policy "User badges are viewable by everyone." on public.user_badges for select using (true);

-- Policies for resources
create policy "Resources are viewable by authenticated users." on public.resources for select to authenticated using (true);
create policy "Teachers can create resources." on public.resources for insert with check ((select role from public.profiles where id = auth.uid()) = 'teacher' AND creator_id = auth.uid());
create policy "Teachers can manage their own resources." on public.resources for update using ((select role from public.profiles where id = auth.uid()) = 'teacher' AND creator_id = auth.uid());
create policy "Teachers can delete their own resources." on public.resources for delete using ((select role from public.profiles where id = auth.uid()) = 'teacher' AND creator_id = auth.uid());

-- Policies for quiz questions and options
create policy "Quiz data is viewable by authenticated users." on public.quiz_questions for select to authenticated using (true);
create policy "Quiz data is viewable by authenticated users." on public.quiz_options for select to authenticated using (true);

-- Policies for quiz attempts
create policy "Users can view their own attempts." on public.student_quiz_attempts for select using (auth.uid() = student_id);
create policy "Users can create their own attempts." on public.student_quiz_attempts for insert with check (auth.uid() = student_id);

-- Policies for teacher_student_connections
create policy "Connections are viewable by authenticated users." on public.teacher_student_connections for select to authenticated using (true);


-- Storage Policies

-- Policies for essay_images bucket
CREATE POLICY "Allow authenticated users to upload to essay_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'essay_images' AND auth.uid() = owner_id);
CREATE POLICY "Allow users to see their own essay images" ON storage.objects FOR SELECT USING (bucket_id = 'essay_images' AND auth.uid() = owner_id);
CREATE POLICY "Allow teachers to view student essay images" ON storage.objects FOR SELECT USING (
    bucket_id = 'essay_images' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher' AND
    owner_id IN (SELECT student_id FROM public.teacher_student_connections WHERE teacher_id = auth.uid())
);

-- Policies for corrected_essay_images bucket
CREATE POLICY "Allow teachers to upload corrected images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'corrected_essay_images' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);
-- NOTE: The bucket is public, so read access is granted to anyone with the link.
-- Row Level Security on the `essays` table protects the URL itself.
CREATE POLICY "Allow users to view corrected images" ON storage.objects FOR SELECT USING (bucket_id = 'corrected_essay_images');

-- Policies for community_media
CREATE POLICY "Allow authenticated users to upload to community_media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'community_media' AND auth.uid() = owner_id);
CREATE POLICY "Allow authenticated users to view community_media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'community_media');

-- Policies for learning_resources
CREATE POLICY "Allow teachers to upload to learning_resources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'learning_resources' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher');
CREATE POLICY "Allow authenticated users to view learning_resources" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'learning_resources');
