-- Set up Row Level Security (RLS) for all tables.
-- RLS ensures that users can only access their own data.
-- See https://supabase.com/docs/guides/auth/row-level-security

-- PROFILES
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can create their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ESSAYS
alter table public.essays enable row level security;

create policy "Users can view their own essays." on public.essays
  for select using (auth.uid() = user_id);

create policy "Users can insert their own essays." on public.essays
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own essays." on public.essays
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own essays." on public.essays
  for delete using (auth.uid() = user_id);

-- COMMUNITY POSTS
alter table public.community_posts enable row level security;

create policy "Community posts are viewable by everyone." on public.community_posts
  for select using (true);

create policy "Users can insert their own posts." on public.community_posts
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts." on public.community_posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Users can delete their own posts." on public.community_posts
  for delete using (auth.uid() = author_id);
