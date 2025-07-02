export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
};

export type Essay = {
  id: string; // Changed to string to support UUID
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
  id: string; // Changed to string to support UUID
  user_id: string;
  title: string;
  content: string;
  author: Pick<Profile, 'full_name' | 'avatar_url'>;
  created_at: string;
  replyCount: number; // This might be handled differently with a real DB
};
