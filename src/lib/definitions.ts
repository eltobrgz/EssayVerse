export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'student' | 'teacher';
  points: number;
  level: number;
  current_streak: number;
  last_login_date: string;
};

export type Essay = {
  id: string; 
  user_id: string;
  title: string;
  type: 'ENEM' | 'Fuvest' | 'Custom';
  content: string;
  image_url?: string;
  created_at: string;
  score: number;
  feedback: string;
  suggestions: string;
  estimatedGrade: string;
};

export type CommunityPost = {
  id: string; 
  user_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  // This is a joined property from `profiles`
  profiles: Pick<Profile, 'full_name' | 'avatar_url'> | null;
};

export type Badge = {
    id: number;
    name: string;
    description: string;
    icon_name: string;
    points_reward: number;
}

export type UserBadge = {
    user_id: string;
    badge_id: number;
    created_at: string;
    badges: Badge; // This is for the joined result
}
