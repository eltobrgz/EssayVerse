-- Use com cuidado! Este script apaga todos os dados das tabelas e o bucket de storage.

-- Desabilita a segurança de nível de linha temporariamente para apagar os dados
alter table "essays" disable row level security;
alter table "community_posts" disable row level security;
alter table "profiles" disable row level security;

-- Apaga todos os dados das tabelas
delete from "essays";
delete from "community_posts";
delete from "profiles";
delete from "auth.users"; -- Cuidado: isso apaga todos os usuários

-- Reabilita a segurança de nível de linha
alter table "essays" enable row level security;
alter table "community_posts" enable row level security;
alter table "profiles" enable row level security;

-- Apaga o bucket de imagens e seu conteúdo
delete from storage.objects where bucket_id = 'essay_images';
-- A exclusão do bucket em si deve ser feita na UI do Supabase se necessário.

-- Drop trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

-- Drop tables
drop table if exists essays;
drop table if exists community_posts;
drop table if exists profiles;


select 'Reset completo. Tabelas e storage limpos.' as status;
