-- Create the bucket for essay images
INSERT INTO storage.buckets (id, name, public)
VALUES ('essay_images', 'essay_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for essay_images bucket
-- Allow public read access to all images
CREATE POLICY "Public read access for all"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'essay_images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'essay_images');

-- Users can only update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- Users can only delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);


-- Create the bucket for community media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community_media', 'community_media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for community_media bucket
-- Allow public read access
CREATE POLICY "Public read access for community media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community_media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to community"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community_media');

-- Users can only manage their own media
CREATE POLICY "Users can manage their own community media"
ON storage.objects FOR UPDATE, DELETE
TO authenticated
USING (auth.uid() = owner);


-- Create the bucket for learning resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning_resources', 'learning_resources', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for learning_resources bucket
-- Allow public read access
CREATE POLICY "Public read access for learning resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'learning_resources');

-- Allow teachers to upload resources
CREATE POLICY "Teachers can upload to learning resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'learning_resources' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);

-- Teachers can only manage their own resources
CREATE POLICY "Teachers can manage their own learning resources"
ON storage.objects FOR UPDATE, DELETE
TO authenticated
USING (
    auth.uid() = owner AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);
