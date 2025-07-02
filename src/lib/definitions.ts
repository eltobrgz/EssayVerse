export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Essay = {
  id: string;
  user_id: string;
  title: string;
  type: 'ENEM' | 'Fuvest' | 'Custom';
  content: string;
  imageUrl?: string;
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
  author: Pick<User, 'name' | 'avatarUrl'>;
  created_at: string;
  replyCount: number;
};
