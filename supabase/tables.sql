-- Custom user role type
CREATE TYPE
  public.user_role AS ENUM ('student', 'teacher');

-- Profiles table
CREATE TABLE
  public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role DEFAULT 'student'::user_role NOT NULL,
    points INT DEFAULT 0 NOT NULL,
    level INT DEFAULT 1 NOT NULL,
    current_streak INT DEFAULT 0 NOT NULL,
    last_login_date TIMESTAMPTZ
  );

-- Essays table
CREATE TABLE
  public.essays (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    score INT NOT NULL,
    feedback TEXT NOT NULL,
    suggestions TEXT NOT NULL,
    estimated_grade TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );

-- Community Posts table
CREATE TABLE
  public.community_posts (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );

-- Badges table
CREATE TABLE
  public.badges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    points_reward INT DEFAULT 0 NOT NULL
  );

-- User Badges table (join table)
CREATE TABLE
  public.user_badges (
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    badge_id INT REFERENCES public.badges ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, badge_id)
  );

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION
  public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
CREATE TRIGGER
  on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION
  public.handle_new_user ();

-- Pre-populate badges table
INSERT INTO
  public.badges (name, description, icon_name, points_reward)
VALUES
  (
    'Primeira Redação',
    'Enviou sua primeira redação para correção.',
    'Award',
    10
  ),
  (
    'Mestre do ENEM',
    'Enviou 5 redações do ENEM com nota acima de 80.',
    'Trophy',
    50
  ),
  (
    'Escritor Consistente',
    'Enviou uma redação por semana durante um mês.',
    'Star',
    30
  ),
  (
    'Espírito Comunitário',
    'Fez 10 comentários construtivos na comunidade.',
    'Users',
    20
  ) ON CONFLICT (name) DO NOTHING;
