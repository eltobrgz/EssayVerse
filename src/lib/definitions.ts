export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Essay = {
  id: string;
  title: string;
  type: 'ENEM' | 'Fuvest' | 'Custom';
  content: string;
  imageUrl?: string;
  submittedAt: string;
  score: number;
  feedback: string;
  suggestions: string;
  estimatedGrade: string;
};

export type CommunityPost = {
  id: string;
  title: string;
  content: string;
  author: Pick<User, 'name' | 'avatarUrl'>;
  createdAt: string;
  replyCount: number;
};
