-- Essay Images Bucket
INSERT INTO
  storage.buckets (id, name, public)
VALUES
  ('essay_images', 'essay_images', TRUE) ON CONFLICT (id) DO NOTHING;

-- Community Media Bucket
INSERT INTO
  storage.buckets (id, name, public)
VALUES
  ('community_media', 'community_media', TRUE) ON CONFLICT (id) DO NOTHING;
