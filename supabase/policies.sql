-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Policies for essays
CREATE POLICY "Users can view their own essays."
  ON public.essays FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own essays."
  ON public.essays FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own essays."
  ON public.essays FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own essays."
  ON public.essays FOR DELETE
  USING ( auth.uid() = user_id );

-- Policies for community_posts
CREATE POLICY "Community posts are viewable by everyone."
  ON public.community_posts FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own community posts."
  ON public.community_posts FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own community posts."
  ON public.community_posts FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own community posts."
  ON public.community_posts FOR DELETE
  USING ( auth.uid() = user_id );

-- Policies for storage (essay_images)
CREATE POLICY "Users can view their own images."
  ON storage.objects FOR SELECT
  USING ( auth.uid()::text = owner_id );

CREATE POLICY "Users can upload images to their own folder."
  ON storage.objects FOR INSERT
  WITH CHECK ( auth.uid()::text = owner_id );

-- Policies for badges
CREATE POLICY "Badges are viewable by everyone."
  ON public.badges FOR SELECT
  USING ( true );

-- Policies for user_badges
CREATE POLICY "User badges are viewable by everyone."
  ON public.user_badges FOR SELECT
  USING ( true );

CREATE POLICY "Users can view their own earned badges."
  ON public.user_badges FOR SELECT
  USING ( auth.uid() = user_id );
