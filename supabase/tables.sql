-- Create a user_role type
CREATE TYPE public.user_role AS ENUM ('student', 'teacher');

-- Create a table for public profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  points integer DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL,
  last_login_date date,
  PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a table for essays
CREATE TABLE public.essays (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    score integer,
    feedback text,
    suggestions text,
    estimated_grade text
);
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Create a table for community posts
CREATE TABLE public.community_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create a table for badges
CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text NOT NULL,
    icon text NOT NULL -- e.g., 'Award', 'BookOpenCheck', etc. from lucide-react
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Create a join table for users and badges
CREATE TABLE public.user_badges (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;


-- Function to create a public profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed badges table with initial data
INSERT INTO public.badges (name, description, icon) VALUES
('Primeira Redação', 'Você enviou sua primeira redação e começou sua jornada!', 'Feather'),
('Estudante Consistente', 'Enviou 3 redações em uma semana. A prática leva à perfeição!', 'CalendarClock'),
('Nota Alta', 'Alcançou uma nota 90+ em uma redação. Impressionante!', 'Sparkles'),
('Superação', 'Aumentou sua nota em 10 pontos em relação à redação anterior.', 'TrendingUp'),
('Mestre do ENEM', 'Enviou 5 redações do tipo ENEM com nota acima de 80.', 'BookMarked'),
('Mestre da Fuvest', 'Enviou 5 redações do tipo Fuvest com nota acima de 80.', 'BookMarked'),
('Participante Ativo', 'Fez 5 posts ou comentários na comunidade.', 'MessageSquarePlus'),
('Mentor da Comunidade', 'Seu post na comunidade foi marcado como "Redação Modelo".', 'GraduationCap'),
('Sequência de 3 Dias', 'Entrou no aplicativo por 3 dias seguidos.', 'Flame'),
('Sequência de 7 Dias', 'Entrou no aplicativo por uma semana inteira!', 'Flame');
