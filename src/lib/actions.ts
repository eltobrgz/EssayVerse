'use server';

import { z } from 'zod';
import { scoreEssay } from '@/ai/flows/score-essay';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';
import { isToday, isYesterday } from 'date-fns';
import type { Essay, Quiz, QuizOption, QuizQuestion, Resource } from './definitions';

const EssayFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.'}),
  essayType: z.string({ required_error: 'Please select an essay type.'}),
  essayText: z.string().min(100, { message: 'Essay must be at least 100 characters long.' }),
  image: z.any().optional(),
});

const PostFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long.'}),
  content: z.string().optional(),
  image: z.instanceof(File).optional(),
  video: z.instanceof(File).optional(),
});

const ResourceFormSchema = z.object({
    resourceType: z.enum(['VIDEO', 'MIND_MAP', 'QUIZ']),
    visibility: z.enum(['PUBLIC', 'RESTRICTED']),
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    image: z.instanceof(File).optional(),
});

const TeacherFeedbackSchema = z.object({
  essayId: z.string(),
  feedbackText: z.string().min(10, { message: 'Feedback must be at least 10 characters long.'}),
  correctedImage: z.instanceof(File).optional(),
});


export type State = {
  errors?: {
    title?: string[];
    essayType?: string[];
    essayText?: string[];
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

const XP_PER_ESSAY = 50;
const XP_BONUS_HIGH_SCORE = 25; // score > 80
const XP_BONUS_EXCELLENT_SCORE = 50; // score > 90
const XP_PER_LEVEL = 100;

async function awardBadge(userId: string, badgeId: number, supabase: ReturnType<typeof createClient>) {
  // Check if user already has the badge
  const { data: existingBadge, error: checkError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .maybeSingle();

  if (checkError || existingBadge) {
    return; // User already has badge or an error occurred
  }

  // Award the badge
  await supabase.from('user_badges').insert({ user_id: userId, badge_id: badgeId });

  // Get badge points
  const { data: badge } = await supabase.from('badges').select('points_reward').eq('id', badgeId).single();
  const pointsFromBadge = badge?.points_reward || 0;

  // Add points to user profile
  if (pointsFromBadge > 0) {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single();
    if (profile) {
      await supabase
        .from('profiles')
        .update({ points: (profile.points || 0) + pointsFromBadge })
        .eq('id', userId);
    }
  }
}


export async function submitAndScoreEssay(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication error. Please log in again.' };
  }
  
  const validatedFields = EssayFormSchema.safeParse({
    title: formData.get('title'),
    essayType: formData.get('essayType'),
    essayText: formData.get('essayText'),
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate essay. Please check the fields.',
    };
  }

  const { title, essayType, essayText, image } = validatedFields.data;
  let imageUrl: string | undefined = undefined;

  if (image && image.size > 0) {
    const filePath = `${user.id}/${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage.from('essay_images').upload(filePath, image);
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { message: 'Failed to upload image. Please try again.' };
    }
    const { data: { publicUrl } } = supabase.storage.from('essay_images').getPublicUrl(filePath);
    imageUrl = publicUrl;
  }

  try {
    const result = await scoreEssay({ essayType, essayText });
    
    // 1. Save the essay
    const { data: newEssay, error } = await supabase
      .from('essays')
      .insert({
        user_id: user.id,
        title,
        type: essayType,
        content: essayText,
        score: result.score,
        feedback: result.feedback,
        suggestions: result.suggestions,
        estimated_grade: result.estimatedGrade,
        image_url: imageUrl,
      })
      .select('id, score, type')
      .single();

    if (error || !newEssay) {
      console.error('Error saving essay to DB:', error);
      return { message: 'Failed to save your essay after scoring. Please try again.' };
    }

    // 2. Gamification Logic
    let xpFromEssay = XP_PER_ESSAY;
    if (newEssay.score > 90) xpFromEssay += XP_BONUS_EXCELLENT_SCORE;
    else if (newEssay.score > 80) xpFromEssay += XP_BONUS_HIGH_SCORE;
    
    // Check and award badges
    const { count: essayCount } = await supabase.from('essays').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (essayCount === 1) {
      await awardBadge(user.id, 1, supabase); // "Primeira Redação"
    }

    const { count: enemCount } = await supabase.from('essays').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'ENEM').gt('score', 80);
    if (enemCount === 5) {
       await awardBadge(user.id, 2, supabase); // "Mestre do ENEM"
    }

    // 3. Update user points and level
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
    const currentPoints = profile?.points || 0;
    const totalPoints = currentPoints + xpFromEssay;
    const newLevel = Math.floor(totalPoints / XP_PER_LEVEL) + 1;

    await supabase.from('profiles').update({ points: totalPoints, level: newLevel }).eq('id', user.id);

    revalidatePath('/essays');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/teacher/submissions');
    redirect(`/essay/${newEssay.id}`);

  } catch (error) {
    console.error('Error scoring essay:', error);
    return { message: 'An unexpected error occurred while scoring the essay. Please try again.' };
  }
}

export async function updateUserStreak() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('last_login_date, current_streak')
        .eq('id', user.id)
        .single();
    
    if (!profile) return;

    const today = new Date();
    const lastLogin = profile.last_login_date ? new Date(profile.last_login_date) : null;

    if (lastLogin && isToday(lastLogin)) {
        return; // Already logged in today
    }
    
    let newStreak = profile.current_streak || 0;
    if (lastLogin && isYesterday(lastLogin)) {
        newStreak++;
    } else {
        newStreak = 1; // Reset streak if last login wasn't yesterday or it's the first login
    }
    
    await supabase.from('profiles').update({
        last_login_date: today.toISOString(),
        current_streak: newStreak
    }).eq('id', user.id);

    revalidatePath('/dashboard');
    revalidatePath('/profile');
}


export async function createCommunityPost(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication error. Please log in again.' };
  }

  const validatedFields = PostFormSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    image: formData.get('image'),
    video: formData.get('video'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate post. Please check the fields.',
    };
  }
  
  const { title, content, image, video } = validatedFields.data;
  let imageUrl: string | undefined = undefined;
  let videoUrl: string | undefined = undefined;

  const uploadFile = async (file: File | undefined, folder: string) => {
    if (file && file.size > 0) {
      const filePath = `${user.id}/${folder}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('community_media').upload(filePath, file);

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw new Error(`Failed to upload ${folder}. Please try again.`);
      }

      const { data: { publicUrl } } = supabase.storage.from('community_media').getPublicUrl(filePath);
      return publicUrl;
    }
    return undefined;
  };

  try {
    imageUrl = await uploadFile(image, 'images');
    videoUrl = await uploadFile(video, 'videos');

    const { error: insertError } = await supabase.from('community_posts').insert({
      user_id: user.id,
      title,
      content: content || null,
      image_url: imageUrl,
      video_url: videoUrl,
    });

    if (insertError) {
      console.error('Insert Error:', insertError);
      return { message: 'Database error: Failed to create post.' };
    }

    revalidatePath('/community');
    return { message: 'Post created successfully.' };

  } catch (e: any) {
    return { message: e.message || 'An unexpected error occurred.' };
  }
}

// --- Learning Resources Actions ---

export async function createResource(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { message: 'Not authenticated.' };
  
  const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'teacher') return { message: 'Only teachers can create resources.' };

  const validatedFields = ResourceFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid fields.' };
  }

  const { resourceType, visibility, title, description, videoUrl, image } = validatedFields.data;
  let resourceImageUrl: string | undefined = undefined;

  // Handle image upload for Mind Maps
  if (resourceType === 'MIND_MAP') {
    if (!image || image.size === 0) return { message: 'An image is required for Mind Maps.' };
    const filePath = `${user.id}/mind_maps/${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage.from('learning_resources').upload(filePath, image);
    if (uploadError) return { message: 'Failed to upload image.' };
    resourceImageUrl = supabase.storage.from('learning_resources').getPublicUrl(filePath).data.publicUrl;
  }

  // Insert resource into DB
  const { data: newResource, error: resourceError } = await supabase.from('resources')
    .insert({
      creator_id: user.id,
      title,
      description,
      resource_type: resourceType,
      visibility,
      video_url: resourceType === 'VIDEO' ? videoUrl : null,
      image_url: resourceImageUrl,
    }).select('id').single();

  if (resourceError || !newResource) return { message: 'Failed to create resource in database.' };

  // Handle Quiz questions and options
  if (resourceType === 'QUIZ') {
    const questionsData = [];
    for (const [key, value] of formData.entries()) {
        const questionMatch = key.match(/questions\[(\d+)\]\[question_text\]/);
        if (questionMatch) {
            const index = parseInt(questionMatch[1], 10);
            if (!questionsData[index]) questionsData[index] = { options: [] };
            questionsData[index].question_text = value;
        }

        const optionMatch = key.match(/questions\[(\d+)\]\[options\]\[(\d+)\]/);
        if (optionMatch) {
             const qIndex = parseInt(optionMatch[1], 10);
             const oIndex = parseInt(optionMatch[2], 10);
             if (!questionsData[qIndex].options[oIndex]) questionsData[qIndex].options[oIndex] = {};
             questionsData[qIndex].options[oIndex].option_text = value;
        }

        const correctOptionMatch = key.match(/questions\[(\d+)\]\[correct_option_index\]/);
        if (correctOptionMatch) {
             const qIndex = parseInt(correctOptionMatch[1], 10);
             const correctIndex = parseInt(value as string, 10);
             questionsData[qIndex].options.forEach((opt: any, idx: number) => {
                opt.is_correct = (idx === correctIndex);
             });
        }
    }
    
    for (const [qIndex, qData] of questionsData.entries()) {
      const { data: newQuestion, error: qError } = await supabase.from('quiz_questions')
        .insert({ resource_id: newResource.id, question_text: qData.question_text, order: qIndex })
        .select('id').single();
      
      if (qError || !newQuestion) return { message: `Failed to create question ${qIndex + 1}.` };

      const optionsToInsert = qData.options.map((opt: any) => ({
          question_id: newQuestion.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
      }));

      const { error: oError } = await supabase.from('quiz_options').insert(optionsToInsert);
      if (oError) return { message: `Failed to create options for question ${qIndex + 1}.`};
    }
  }
  
  revalidatePath('/teacher/resources');
  revalidatePath('/resources');
  redirect(`/resources/${newResource.id}`);
}


export async function getPublicResources(): Promise<Resource[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('resources')
        .select('*, profiles(full_name, avatar_url)')
        .eq('visibility', 'PUBLIC')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching public resources:', error);
        return [];
    }
    return data as unknown as Resource[];
}

export async function getRestrictedResourcesForStudent(studentId: string): Promise<Resource[]> {
    const supabase = createClient();
     const { data, error } = await supabase
        .from('resources')
        .select('*, profiles(full_name, avatar_url)')
        .eq('visibility', 'RESTRICTED')
        .filter('creator_id', 'in', `(SELECT teacher_id FROM teacher_student_connections WHERE student_id = '${studentId}')`)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching restricted resources:', error);
        return [];
    }
    return data as unknown as Resource[];
}

export async function getResourceById(resourceId: string, userId: string): Promise<Quiz | null> {
    const supabase = createClient();
    const { data: resource, error } = await supabase
        .from('resources')
        .select('*, profiles(full_name, avatar_url)')
        .eq('id', resourceId)
        .single();
    
    if (error || !resource) {
        console.error("Error fetching resource", error);
        return null;
    }

    if (resource.resource_type === 'QUIZ') {
        const { data: questions, error: qError } = await supabase
            .from('quiz_questions')
            .select('*, options:quiz_options(*)')
            .eq('resource_id', resourceId)
            .order('order', { ascending: true });
        
        if (qError) {
             console.error("Error fetching questions", qError);
             return null;
        }
        (resource as unknown as Quiz).questions = questions as (QuizQuestion & { options: QuizOption[] })[];
    }
    
    return resource as unknown as Quiz;
}

export async function submitQuizAttempt(quizId: string, answers: Record<string, string>): Promise<{ score: number, total: number }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id, options:quiz_options(id, is_correct)')
        .eq('resource_id', quizId);
    
    if (!questions) throw new Error("Quiz not found or has no questions.");

    let score = 0;
    for (const question of questions) {
        const correctOption = question.options.find(o => o.is_correct);
        const userAnswer = answers[question.id];
        if (correctOption && userAnswer === correctOption.id) {
            score++;
        }
    }
    
    const total = questions.length;
    
    // Save attempt to DB
    await supabase.from('student_quiz_attempts').upsert({
        student_id: user.id,
        quiz_resource_id: quizId,
        score,
        total_questions: total,
        completed_at: new Date().toISOString()
    });

    revalidatePath(`/resources/${quizId}`);
    return { score, total };
}

// --- Teacher Feedback Actions ---
export async function getSubmissionsForTeacher(teacherId: string) {
  const supabase = createClient();
  const { data: connections } = await supabase
    .from('teacher_student_connections')
    .select('student_id')
    .eq('teacher_id', teacherId);

  if (!connections || connections.length === 0) return [];
  
  const studentIds = connections.map(c => c.student_id);

  const { data: essays, error } = await supabase
    .from('essays')
    .select('id, title, created_at, image_url, reviewed_by_teacher_at, profiles!user_id(full_name)')
    .in('user_id', studentIds)
    .not('image_url', 'is', null) // Only fetch essays with images
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions for teacher:', error);
    return [];
  }
  return essays;
}

export async function getEssayForTeacher(essayId: string, teacherId: string): Promise<Essay | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('essays')
    .select('*, profiles:user_id(full_name)')
    .eq('id', essayId)
    .single();

  if (error || !data) {
    console.error('Error fetching essay for teacher:', error);
    return null;
  }
  
  // Security check: ensure the essay belongs to a student of this teacher
  const { data: connection } = await supabase
    .from('teacher_student_connections')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('student_id', data.user_id)
    .maybeSingle();

  if (!connection) {
    return null; // Teacher is not connected to the student who wrote this essay
  }
  
  return data as Essay;
}

export async function submitTeacherFeedback(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role !== 'teacher') {
    return { message: 'Only teachers can submit feedback.' };
  }

  const validatedFields = TeacherFeedbackSchema.safeParse({
    essayId: formData.get('essayId'),
    feedbackText: formData.get('feedbackText'),
    correctedImage: formData.get('correctedImage'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Invalid fields.' };
  }

  const { essayId, feedbackText, correctedImage } = validatedFields.data;
  let correctedImageUrl: string | undefined = undefined;

  if (correctedImage && correctedImage.size > 0) {
    const filePath = `${user.id}/corrected-${essayId}-${correctedImage.name}`;
    const { error: uploadError } = await supabase.storage.from('corrected_essay_images').upload(filePath, correctedImage);
    if (uploadError) {
      console.error('Error uploading corrected image:', uploadError);
      return { message: 'Failed to upload corrected image.' };
    }
    correctedImageUrl = supabase.storage.from('corrected_essay_images').getPublicUrl(filePath).data.publicUrl;
  }
  
  const { error: updateError } = await supabase
    .from('essays')
    .update({
      teacher_feedback_text: feedbackText,
      corrected_image_url: correctedImageUrl,
      reviewed_by_teacher_at: new Date().toISOString(),
    })
    .eq('id', essayId);
  
  if (updateError) {
    console.error('Error updating essay with feedback:', updateError);
    return { message: 'Failed to save feedback.' };
  }

  revalidatePath('/teacher/submissions');
  revalidatePath(`/teacher/submissions/${essayId}`);
  revalidatePath(`/essay/${essayId}`);
  redirect(`/teacher/submissions/${essayId}`);
}
