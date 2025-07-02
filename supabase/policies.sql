-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can only update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Essays
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own essays." ON essays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own essays." ON essays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own essays." ON essays FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Teachers can view essays of their students." ON essays FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
  user_id IN (SELECT student_id FROM teacher_student_connections WHERE teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update essays of their students (for feedback)." ON essays FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
  user_id IN (SELECT student_id FROM teacher_student_connections WHERE teacher_id = auth.uid())
);


-- Community Posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all community posts." ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts." ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts." ON community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all badges" ON badges FOR SELECT USING (true);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all user badges" ON user_badges FOR SELECT USING (true);

-- Storage (essay_images)
CREATE POLICY "Users can upload essay images" FOR INSERT ON storage.objects WITH CHECK (
  bucket_id = 'essay_images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view their own essay images" FOR SELECT ON storage.objects USING (
  bucket_id = 'essay_images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage (community_media)
CREATE POLICY "Users can upload community media" FOR INSERT ON storage.objects WITH CHECK (
  bucket_id = 'community_media' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view all community media" FOR SELECT ON storage.objects USING ( bucket_id = 'community_media' );

-- Learning Resources
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_connections ENABLE ROW LEVEL SECURITY;

-- Resources Policies
CREATE POLICY "Public and restricted resources are viewable by appropriate users." ON resources FOR SELECT USING (
  visibility = 'PUBLIC' OR
  creator_id = auth.uid() OR
  (
    visibility = 'RESTRICTED' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student' AND
    creator_id IN (SELECT teacher_id FROM teacher_student_connections WHERE student_id = auth.uid())
  )
);
CREATE POLICY "Teachers can create resources." ON resources FOR INSERT WITH CHECK (
  auth.uid() = creator_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
);
CREATE POLICY "Teachers can update their own resources." ON resources FOR UPDATE USING ( auth.uid() = creator_id );

-- Quiz Policies
CREATE POLICY "Users can view questions of accessible quizzes." ON quiz_questions FOR SELECT USING (
  (SELECT true FROM resources WHERE id = resource_id)
);
CREATE POLICY "Users can view options of accessible questions." ON quiz_options FOR SELECT USING (
  (SELECT true FROM quiz_questions WHERE id = question_id)
);
CREATE POLICY "Students can create/view their own quiz attempts." ON student_quiz_attempts FOR ALL USING ( auth.uid() = student_id );

-- Teacher Student Connections Policies
CREATE POLICY "All users can view connections." ON teacher_student_connections FOR SELECT USING (true);

-- Storage (learning_resources)
CREATE POLICY "Teachers can upload learning resources" FOR INSERT ON storage.objects WITH CHECK (
  bucket_id = 'learning_resources' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
);
CREATE POLICY "Anyone can view learning resources" FOR SELECT ON storage.objects USING ( bucket_id = 'learning_resources' );

-- Storage (corrected_essay_images)
CREATE POLICY "Teachers can upload corrected images." FOR INSERT ON storage.objects WITH CHECK (
  bucket_id = 'corrected_essay_images' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
);

CREATE POLICY "Users can view corrected images for their own essays." FOR SELECT ON storage.objects USING (
    bucket_id = 'corrected_essay_images' AND
    auth.uid() = (
        SELECT user_id FROM essays WHERE essays.id = (substring(storage.filename(name) from 'corrected-([0-9a-f-]{36})'))::uuid
    )
);

CREATE POLICY "Teachers can view corrected images they uploaded." FOR SELECT ON storage.objects USING (
    bucket_id = 'corrected_essay_images' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
