-- Bucket for user avatars (from profiles table trigger)
-- Bucket for essay-related images submitted by students
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('essay_images', 'essay_images', true, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Bucket for community forum media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community_media', 'community_media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Bucket for learning resources uploaded by teachers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('learning_resources', 'learning_resources', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Bucket for teacher's corrected essay images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('corrected_essay_images', 'corrected_essay_images', true, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;
