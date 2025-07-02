-- Create a table for public profiles
-- This table will store data for users that is publicly accessible.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  name text,
  avatar_url text,
  updated_at timestamp with time zone,

  primary key (id)
);

-- This trigger automatically creates a profile entry when a new user signs up.
-- This is a common pattern in Supabase applications.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-a-trigger
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Essays Table
-- This table stores all the essays submitted by users.
create table public.essays (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    type text not null,
    content text not null,
    image_url text,
    submitted_at timestamp with time zone not null default now(),
    score integer,
    feedback text,
    suggestions text,
    estimated_grade text,

    primary key (id)
);


-- Community Posts Table
-- This table stores posts made by users in the community forum.
create table public.community_posts (
    id uuid not null default gen_random_uuid(),
    author_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    content text not null,
    created_at timestamp with time zone not null default now(),
    reply_count integer not null default 0,

    primary key (id)
);
