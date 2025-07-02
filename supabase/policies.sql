-- Policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR
UPDATE
  USING (auth.uid () = id);

-- Policies for essays table
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view their own essays" ON public.essays;
CREATE POLICY "Allow users to view their own essays" ON public.essays FOR
SELECT
  USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Allow users to create essays" ON public.essays;
CREATE POLICY "Allow users to create essays" ON public.essays FOR INSERT
WITH
  CHECK (auth.uid () = user_id);

-- Policies for community_posts table
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to community posts" ON public.community_posts;
CREATE POLICY "Allow public read access to community posts" ON public.community_posts FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.community_posts;
CREATE POLICY "Allow authenticated users to create posts" ON public.community_posts FOR INSERT
WITH
  CHECK (auth.role () = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow owners to update their posts" ON public.community_posts;
CREATE POLICY "Allow owners to update their posts" ON public.community_posts FOR
UPDATE
  USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Allow owners to delete their posts" ON public.community_posts;
CREATE POLICY "Allow owners to delete their posts" ON public.community_posts FOR DELETE USING (auth.uid () = user_id);

-- Policies for badges table
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to badges" ON public.badges;
CREATE POLICY "Allow public read access to badges" ON public.badges FOR
SELECT
  USING (TRUE);

-- Policies for user_badges table
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view their own badges" ON public.user_badges;
CREATE POLICY "Allow users to view their own badges" ON public.user_badges FOR
SELECT
  USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Allow service roles to insert user badges" ON public.user_badges;
CREATE POLICY "Allow service roles to insert user badges" ON public.user_badges FOR INSERT
WITH
  CHECK (auth.role () = 'service_role');

-- Policies for storage
CREATE POLICY "Allow public read access to essay images" ON storage.objects FOR
SELECT
  USING (bucket_id = 'essay_images');

CREATE POLICY "Allow authenticated users to upload essay images" ON storage.objects FOR INSERT
WITH
  CHECK (
    bucket_id = 'essay_images'
    AND auth.role () = 'authenticated'
  );

-- Policies for community_media
CREATE POLICY "Allow public read access to community media" ON storage.objects FOR
SELECT
  USING (bucket_id = 'community_media');

CREATE POLICY "Allow authenticated users to upload community media" ON storage.objects FOR INSERT
WITH
  CHECK (
    bucket_id = 'community_media'
    AND auth.role () = 'authenticated'
  );

CREATE POLICY "Allow owners to update their community media" ON storage.objects FOR
UPDATE
  USING (
    bucket_id = 'community_media'
    AND auth.uid () = owner
  );

CREATE POLICY "Allow owners to delete their community media" ON storage.objects FOR DELETE USING (
  bucket_id = 'community_media'
  AND auth.uid () = owner
);
