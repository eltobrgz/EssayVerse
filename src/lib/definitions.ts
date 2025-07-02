
import { z } from 'zod';

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'student' | 'teacher';
  points: number;
  level: number;
  current_streak: number;
  last_login_date: string;
  email?: string;
};

export type Essay = {
  id: string; 
  user_id: string;
  title: string;
  type: 'ENEM' | 'Fuvest' | 'Custom';
  content: string;
  image_url?: string | null;
  created_at: string;
  score: number;
  feedback: string;
  suggestions: string;
  estimated_grade: string;
  corrected_image_url?: string | null;
  teacher_feedback_text?: string | null;
  reviewed_by_teacher_at?: string | null;
  // This is a joined property from `profiles`
  profiles?: { full_name: string; } | null;
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

// Types for Learning Resources
export type ResourceType = 'VIDEO' | 'MIND_MAP' | 'QUIZ';
export type VisibilityType = 'PUBLIC' | 'RESTRICTED';

export type Resource = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  visibility: VisibilityType;
  video_url: string | null;
  image_url: string | null;
  created_at: string;
  profiles: Pick<Profile, 'full_name' | 'avatar_url'> | null; // Joined creator profile
};

export type QuizQuestion = {
  id: string;
  resource_id: string;
  question_text: string;
  order: number;
  options: QuizOption[];
};

export type QuizOption = {
  id:string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
};

export type Quiz = Resource & {
  questions: QuizQuestion[];
};

export type StudentQuizAttempt = {
  id: string;
  student_id: string;
  quiz_resource_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

export type TeacherStudentConnection = {
    teacher_id: string;
    student_id: string;
    status: 'pending' | 'accepted';
    // Joined data from a 'profiles' table alias
    students?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>;
    teachers?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>;
}

// This is the type for the state of forms that use server actions.
export type State = {
  errors?: {
    title?: string[];
    essayType?: string[];
    essayText?: string[];
    role?: string[];
    content?: string[];
    image?: string[];
    video?: string[];
    resourceType?: string[];
    visibility?: string[];
    videoUrl?: string[];
    feedbackText?: string[];
    correctedImage?: string[];
  };
  message?: string | null;
};

// Types for AI Chat Tutor
export const ChatHistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })
);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;
