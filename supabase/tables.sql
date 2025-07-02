-- Create ENUM types for roles, essay types, etc.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'teacher');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'essay_type') THEN
        CREATE TYPE essay_type AS ENUM ('ENEM', 'Fuvest', 'Custom');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
        CREATE TYPE resource_type AS ENUM ('VIDEO', 'MIND_MAP', 'QUIZ');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_type') THEN
        CREATE TYPE visibility_type AS ENUM ('PUBLIC', 'RESTRICTED');
    END IF;
END$$;


-- Create profiles table
-- This table will store public user data.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  points INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  current_streak INT NOT NULL DEFAULT 0,
  last_login_date DATE
);
COMMENT ON TABLE public.profiles IS 'Public user data including gamification stats.';

-- Create essays table
CREATE TABLE IF NOT EXISTS public.essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type essay_type NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  score INT NOT NULL,
  feedback TEXT,
  suggestions TEXT,
  estimated_grade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.essays IS 'Stores user-submitted essays and their scores.';

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.community_posts IS 'Posts for the community forum.';

-- Create badges table for gamification
CREATE TABLE IF NOT EXISTS public.badges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    points_reward INT NOT NULL DEFAULT 0
);
COMMENT ON TABLE public.badges IS 'Definitions for all available badges/achievements.';

-- Create user_badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id INT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);
COMMENT ON TABLE public.user_badges IS 'Tracks which users have earned which badges.';

-- Create teacher_student_connections table
CREATE TABLE IF NOT EXISTS public.teacher_student_connections (
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (teacher_id, student_id)
);
COMMENT ON TABLE public.teacher_student_connections IS 'Connects students to teachers they follow.';


-- Tables for Learning Resources
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type resource_type NOT NULL,
    visibility visibility_type NOT NULL DEFAULT 'PUBLIC',
    video_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.resources IS 'Learning resources like videos, mind maps, and quizzes.';

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    "order" INT NOT NULL
);
COMMENT ON TABLE public.quiz_questions IS 'Questions for a quiz resource.';

CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON TABLE public.quiz_options IS 'Options for a quiz question.';

CREATE TABLE IF NOT EXISTS public.student_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, quiz_resource_id) -- A student can only have one completed attempt per quiz. Can be changed if re-takes are allowed.
);
COMMENT ON TABLE public.student_quiz_attempts IS 'Tracks student scores on quizzes.';


-- Function to automatically create a profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Trigger to call the function on new user creation.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE(total_essays BIGINT, average_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(id) AS total_essays,
        AVG(score)::NUMERIC(10, 2) AS average_score
    FROM
        public.essays
    WHERE
        user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Pre-populate badges
INSERT INTO public.badges (name, description, icon_name, points_reward) VALUES
('Primeira Redação', 'Você enviou sua primeira redação!', 'Award', 10),
('Mestre do ENEM', 'Enviou 5 redações do ENEM com nota acima de 80', 'Trophy', 50),
('Espírito Comunitário', 'Fez 10 posts ou comentários na comunidade', 'Users', 25),
('Sequência Perfeita', 'Entrou no app por 7 dias seguidos', 'Flame', 30),
('Nota Máxima', 'Alcançou a nota 100 em uma redação', 'Star', 100)
ON CONFLICT (name) DO NOTHING;
