-- Apaga o bucket antigo se ele existir
-- Note: A exclusão de buckets via SQL pode ter limitações. É mais seguro fazer isso pela UI do Supabase.
-- Esta linha é um placeholder para a lógica de limpeza.
-- delete from storage.buckets where id = 'essay_images';

-- Cria o bucket para imagens das redações
insert into storage.buckets (id, name, public)
values ('essay_images', 'essay_images', true)
on conflict(id) do nothing;

-- Define as permissões do bucket (serão controladas por políticas)
-- As políticas de acesso estão em 'policies.sql'
