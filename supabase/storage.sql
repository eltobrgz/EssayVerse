-- Set up Storage for user avatars and essay images.

-- Avatars Bucket
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly viewable." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload an avatar." on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');

create policy "Users can update their own avatar." on storage.objects
  for update using (auth.uid() = owner) with check (bucket_id = 'avatars');

create policy "Users can delete their own avatar." on storage.objects
  for delete using (auth.uid() = owner) with check (bucket_id = 'avatars');


-- Essay Images Bucket
insert into storage.buckets (id, name, public)
  values ('essay_images', 'essay_images', true)
on conflict (id) do nothing;

create policy "Essay images are publicly viewable." on storage.objects
  for select using (bucket_id = 'essay_images');

create policy "Authenticated users can upload essay images." on storage.objects
  for insert to authenticated with check (bucket_id = 'essay_images');

create policy "Users can update their own essay images." on storage.objects
  for update using (auth.uid() = owner) with check (bucket_id = 'essay_images');

create policy "Users can delete their own essay images." on storage.objects
  for delete using (auth.uid() = owner) with check (bucket_id = 'essay_images');
