-- Create users table to store public user data
-- This table will be populated by a trigger when a new user signs up in Supabase Auth.
create table public.users (
  id uuid not null references auth.users on delete cascade,
  name text,
  email text unique,
  avatar_url text,
  primary key (id)
);

-- Function to copy new user data from auth.users to public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create essays table
create table public.essays (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  title text not null,
  type text not null,
  content text not null,
  image_url text,
  submitted_at timestamptz not null default now(),
  score integer,
  feedback text,
  suggestions text,
  estimated_grade text,
  primary key (id)
);

-- Create community_posts table
create table public.community_posts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- Create replies table for community posts
create table public.community_replies (
    id uuid not null default gen_random_uuid(),
    post_id uuid not null references public.community_posts on delete cascade,
    user_id uuid not null references public.users on delete cascade,
    content text not null,
    created_at timestamptz not null default now(),
    primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.essays enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;

-- RLS Policies for users table
create policy "Users can view their own profile." on public.users
  for select using (auth.uid() = id);
create policy "Users can update their own profile." on public.users
  for update using (auth.uid() = id);
  
-- RLS Policies for essays table
create policy "Users can view their own essays." on public.essays
  for select using (auth.uid() = user_id);
create policy "Users can create essays." on public.essays
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own essays." on public.essays
  for update using (auth.uid() = user_id);
create policy "Users can delete their own essays." on public.essays
  for delete using (auth.uid() = user_id);
  
-- RLS Policies for community_posts table
create policy "Authenticated users can view all community posts." on public.community_posts
  for select to authenticated using (true);
create policy "Users can create community posts." on public.community_posts
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts." on public.community_posts
  for update using (auth.uid() = user_id);
create policy "Users can delete their own posts." on public.community_posts
  for delete using (auth.uid() = user_id);

-- RLS Policies for community_replies table
create policy "Authenticated users can view all replies." on public.community_replies
  for select to authenticated using (true);
create policy "Users can create replies." on public.community_replies
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own replies." on public.community_replies
  for update using (auth.uid() = user_id);
create policy "Users can delete their own replies." on public.community_replies
  for delete using (auth.uid() = user_id);
