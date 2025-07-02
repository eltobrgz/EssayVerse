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
  content: string;
  author: Pick<Profile, 'full_name' | 'avatar_url'>;
  created_at: string;
  replyCount: number; 
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
