-- Custom types
CREATE TYPE public.user_role AS ENUM ('student', 'teacher');
CREATE TYPE public.resource_type AS ENUM ('VIDEO', 'MIND_MAP', 'QUIZ');
CREATE TYPE public.visibility_type AS ENUM ('PUBLIC', 'RESTRICTED');

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role user_role DEFAULT 'student'::user_role,
    points integer DEFAULT 0,
    level integer DEFAULT 1,
    current_streak integer DEFAULT 0,
    last_login_date date
);

-- Essays Table
CREATE TABLE public.essays (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    image_url text,
    score integer NOT NULL,
    feedback text,
    suggestions text,
    estimated_grade text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Community Posts Table
CREATE TABLE public.community_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text,
    image_url text,
    video_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Badges Table (for Gamification)
CREATE TABLE public.badges (
    id serial PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    icon_name text NOT NULL,
    points_reward integer DEFAULT 0
);

-- User Badges Table (Junction Table)
CREATE TABLE public.user_badges (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id integer NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);

-- Learning Resources Table
CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    resource_type resource_type NOT NULL,
    visibility visibility_type NOT NULL DEFAULT 'PUBLIC',
    video_url text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Teacher-Student Connections Table
CREATE TABLE public.teacher_student_connections (
    teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, student_id)
);

-- Quiz Questions Table
CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    "order" integer NOT NULL
);

-- Quiz Options Table
CREATE TABLE public.quiz_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false
);

-- Student Quiz Attempts Table
CREATE TABLE public.student_quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (student_id, quiz_resource_id)
);


-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
END;
$$;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Pre-populate some badges
INSERT INTO public.badges (name, description, icon_name, points_reward) VALUES
('Primeira Redação', 'Você enviou sua primeira redação!', 'Award', 10),
('Mestre do ENEM', 'Enviou 5 redações do ENEM com nota acima de 80', 'Star', 50),
('Escritor Consistente', 'Manteve uma sequência de 7 dias', 'Flame', 25),
('Membro da Comunidade', 'Fez 10 posts ou comentários', 'Users', 20),
('Gênio da Retórica', 'Atingiu nota 100 em uma redação', 'Trophy', 100);

-- RPC for dashboard stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE (total_essays bigint, average_score float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(e.id) AS total_essays,
    AVG(e.score)::float AS average_score
  FROM
    public.essays e
  WHERE
    e.user_id = p_user_id;
END;
$$;

-- RPC for overall progress chart
CREATE OR REPLACE FUNCTION get_user_progress_overall(p_user_id uuid)
RETURNS TABLE (date text, score numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(e.created_at, 'YYYY-MM-DD') AS date,
    e.score::numeric
  FROM
    public.essays e
  WHERE
    e.user_id = p_user_id
  ORDER BY
    e.created_at
  LIMIT 20;
END;
$$;

-- RPC for score by type chart
CREATE OR REPLACE FUNCTION get_user_progress_by_type(p_user_id uuid)
RETURNS TABLE (type text, "averageScore" numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.type,
    AVG(e.score)::numeric AS "averageScore"
  FROM
    public.essays e
  WHERE
    e.user_id = p_user_id
  GROUP BY
    e.type
  ORDER BY
    e.type;
END;
$$;
