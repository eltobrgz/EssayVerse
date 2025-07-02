-- Apaga políticas existentes para um começo limpo
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Users can view their own essays." on essays;
drop policy if exists "Users can insert their own essays." on essays;
drop policy if exists "Users can update their own essays." on essays;
drop policy if exists "Users can delete their own essays." on essays;
drop policy if exists "Anyone can view community posts." on community_posts;
drop policy if exists "Users can insert their own community posts." on community_posts;
drop policy if exists "Users can update their own community posts." on community_posts;
drop policy if exists "Users can delete their own community posts." on community_posts;
drop policy if exists "Anyone can upload an image." on storage.objects;
drop policy if exists "Anyone can view images." on storage.objects;

-- Políticas para a tabela PROFILES
-- 1. Perfis públicos podem ser vistos por qualquer pessoa.
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);
-- 2. Usuários podem criar seu próprio perfil (acionado pelo trigger).
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);
-- 3. Usuários podem atualizar seu próprio perfil.
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Políticas para a tabela ESSAYS
-- 1. Usuários podem ver apenas suas próprias redações.
create policy "Users can view their own essays." on essays
  for select using (auth.uid() = user_id);
-- 2. Usuários podem criar redações para si mesmos.
create policy "Users can insert their own essays." on essays
  for insert with check (auth.uid() = user_id);
-- 3. Usuários podem atualizar suas próprias redações.
create policy "Users can update their own essays." on essays
  for update using (auth.uid() = user_id);
-- 4. Usuários podem deletar suas próprias redações.
create policy "Users can delete their own essays." on essays
  for delete using (auth.uid() = user_id);

-- Políticas para a tabela COMMUNITY_POSTS
-- 1. Qualquer pessoa pode ver os posts da comunidade.
create policy "Anyone can view community posts." on community_posts
  for select using (true);
-- 2. Usuários logados podem criar posts.
create policy "Users can insert their own community posts." on community_posts
  for insert with check (auth.uid() = user_id);
-- 3. Usuários podem atualizar seus próprios posts.
create policy "Users can update their own community posts." on community_posts
  for update using (auth.uid() = user_id);
-- 4. Usuários podem deletar seus próprios posts.
create policy "Users can delete their own community posts." on community_posts
  for delete using (auth.uid() = user_id);

-- Políticas para o STORAGE (Bucket: essay_images)
-- 1. Usuários autenticados podem fazer upload de imagens.
create policy "Authenticated users can upload an image." on storage.objects
  for insert to authenticated with check (bucket_id = 'essay_images');
-- 2. Qualquer pessoa pode ver as imagens.
create policy "Anyone can view images." on storage.objects
  for select using (bucket_id = 'essay_images');
