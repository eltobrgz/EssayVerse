-- Create a bucket for essay images with public access.
-- Run this in the Supabase SQL Editor.
insert into storage.buckets (id, name, public)
values ('essay_images', 'essay_images', true)
on conflict (id) do nothing;

-- Policies for storage
-- Run this in the Supabase SQL Editor.

-- 1. Allow authenticated users to upload images to the 'essay_images' bucket.
create policy "Authenticated users can upload essay images."
on storage.objects for insert to authenticated with check (
  bucket_id = 'essay_images' and auth.role() = 'authenticated'
);

-- 2. Allow anyone to view images in the 'essay_images' bucket.
create policy "Anyone can view essay images."
on storage.objects for select
using ( bucket_id = 'essay_images' );

-- 3. Allow users to update their own images.
create policy "Users can update their own images."
on storage.objects for update to authenticated
using ( auth.uid() = owner )
with check ( bucket_id = 'essay_images' );

-- 4. Allow users to delete their own images.
create policy "Users can delete their own images."
on storage.objects for delete to authenticated
using ( auth.uid() = owner );
