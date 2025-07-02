-- Apaga tabelas antigas se existirem para um começo limpo
drop table if exists essays cascade;
drop table if exists community_posts cascade;
drop table if exists profiles cascade;

-- Tabela de Perfis de Usuários
-- Armazena dados públicos dos usuários.
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
);

-- Tabela de Redações (Essays)
create table essays (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  type text not null,
  content text not null,
  image_url text,
  score integer not null,
  feedback text not null,
  suggestions text not null,
  estimated_grade text not null
);

-- Tabela de Posts da Comunidade
create table community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null
);

-- Função para criar um perfil automaticamente ao registrar um novo usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Gatilho (trigger) que chama a função ao criar um usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Permite que o Supabase use a tabela de perfis
alter table profiles
  enable row level security;
