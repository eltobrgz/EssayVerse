-- Drop existing tables
DROP TABLE IF EXISTS "public"."user_badges" CASCADE;
DROP TABLE IF EXISTS "public"."badges" CASCADE;
DROP TABLE IF EXISTS "public"."essays" CASCADE;
DROP TABLE IF EXISTS "public"."community_posts" CASCADE;
DROP TABLE IF EXISTS "public"."profiles" CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS "public"."user_role" CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS "public"."handle_new_user"() CASCADE;

-- Drop storage buckets
DROP BUCKET IF EXISTS "essay_images" CASCADE;
DROP BUCKET IF EXISTS "community_media" CASCADE;
