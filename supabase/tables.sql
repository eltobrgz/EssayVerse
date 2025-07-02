-- Create custom types
CREATE TYPE public.user_role AS ENUM ('student', 'teacher');
CREATE TYPE public.resource_type AS ENUM ('VIDEO', 'MIND_MAP', 'QUIZ');
CREATE TYPE public.resource_visibility AS ENUM ('PUBLIC', 'RESTRICTED');

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role user_role NOT NULL DEFAULT 'student',
    points integer NOT NULL DEFAULT 0,
    level integer NOT NULL DEFAULT 1,
    current_streak integer NOT NULL DEFAULT 0,
    last_login_date date
);

-- Create essays table
CREATE TABLE public.essays (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    score integer,
    feedback text,
    suggestions text,
    estimated_grade text,
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    teacher_feedback_text text,
    corrected_image_url text,
    reviewed_by_teacher_at timestamp with time zone
);

-- Create community_posts table
CREATE TABLE public.community_posts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text,
    image_url text,
    video_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
    id integer NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    icon_name text NOT NULL,
    points_reward integer NOT NULL DEFAULT 0
);

-- Create user_badges table (join table)
CREATE TABLE public.user_badges (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id integer NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

-- Create resources table
CREATE TABLE public.resources (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    resource_type resource_type NOT NULL,
    visibility resource_visibility NOT NULL,
    video_url text,
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    "order" integer NOT NULL
);

-- Create quiz_options table
CREATE TABLE public.quiz_options (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false
);

-- Create student_quiz_attempts table
CREATE TABLE public.student_quiz_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    completed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create teacher_student_connections table
CREATE TABLE public.teacher_student_connections (
    teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (teacher_id, student_id)
);

-- Function to create a profile for a new user
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

-- Trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Pre-populate badges
INSERT INTO public.badges (id, name, description, icon_name, points_reward) VALUES
(1, 'Primeira Redação', 'Concedida por enviar sua primeira redação para avaliação.', 'Award', 20),
(2, 'Mestre do ENEM', 'Concedida por enviar 5 redações do tipo ENEM com nota acima de 80.', 'Trophy', 100),
(3, 'Espírito Comunitário', 'Concedida por fazer 10 comentários ou posts na comunidade.', 'Users', 50),
(4, 'Sequência Perfeita', 'Concedida por acessar o aplicativo por 7 dias seguidos.', 'Flame', 70);


-- Create DB functions for stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE(total_essays bigint, average_score numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(id) as total_essays,
        AVG(score) as average_score
    FROM
        public.essays
    WHERE
        user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_progress_overall(p_user_id uuid)
RETURNS TABLE(date text, score numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        AVG(score) as score
    FROM
        public.essays
    WHERE
        user_id = p_user_id
    GROUP BY
        date
    ORDER BY
        date ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_progress_by_type(p_user_id uuid)
RETURNS TABLE(type text, averageScore numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        essays.type,
        AVG(score) as averageScore
    FROM
        public.essays
    WHERE
        user_id = p_user_id
    GROUP BY
        essays.type;
END;
$$ LANGUAGE plpgsql;

-- Helper function to extract essay_id from corrected image path
-- Path format is expected to be: {teacher_id}/corrected-{essay_id}-{filename}
CREATE OR REPLACE FUNCTION get_essay_id_from_corrected_path(path text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  filename TEXT;
  essay_id_text TEXT;
BEGIN
  -- Extract filename from path, e.g., "corrected-uuid-original.png"
  filename := split_part(path, '/', 2);

  -- Check if filename starts with "corrected-"
  IF filename LIKE 'corrected-%' THEN
    -- Extract the 36-character UUID string that follows "corrected-"
    essay_id_text := substring(filename from 10 for 36);
    RETURN essay_id_text::uuid;
  ELSE
    RETURN NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RETURN NULL;
END;
$$;

-- Function to get a user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;
