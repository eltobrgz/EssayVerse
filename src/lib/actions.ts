
'use server';

import { z } from 'zod';
import { scoreEssay } from '@/ai/flows/score-essay';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';
import { isToday, isYesterday } from 'date-fns';
import type { Essay, Profile, Quiz, QuizOption, QuizQuestion, Resource, State } from './definitions';

const EssayFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres.'}),
  essayType: z.string({ required_error: 'Por favor, selecione um tipo de redação.'}),
  essayText: z.string().min(100, { message: 'A redação deve ter pelo menos 100 caracteres.' }),
  image: z.any().optional(),
});

const PostFormSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.'}),
  content: z.string().optional(),
  image: z.instanceof(File).optional(),
  video: z.instanceof(File).optional(),
});

const ResourceFormSchema = z.object({
    resourceType: z.enum(['VIDEO', 'MIND_MAP', 'QUIZ']),
    visibility: z.enum(['PUBLIC', 'RESTRICTED']),
    title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.'),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    image: z.instanceof(File).optional(),
});

const TeacherFeedbackSchema = z.object({
  essayId: z.string(),
  feedbackText: z.string().min(10, { message: 'O feedback deve ter pelo menos 10 caracteres.'}),
  correctedImage: z.instanceof(File).optional(),
});

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
    return { message: 'Erro de autenticação. Por favor, faça login novamente.' };
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
      message: 'Falha ao validar a redação. Por favor, verifique os campos.',
    };
  }

  const { title, essayType, essayText, image } = validatedFields.data;
  let imageUrl: string | undefined = undefined;

  if (image && image.size > 0) {
    const filePath = `${user.id}/${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage.from('essay_images').upload(filePath, image);
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { message: 'Falha ao enviar a imagem. Por favor, tente novamente.' };
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
      return { message: 'Falha ao salvar sua redação após a correção. Por favor, tente novamente.' };
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
    return { message: 'Ocorreu um erro inesperado ao corrigir a redação. Por favor, tente novamente.' };
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
}


export async function createCommunityPost(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Erro de autenticação. Por favor, faça login novamente.' };
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
      message: 'Falha ao validar o post. Por favor, verifique os campos.',
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
        throw new Error(`Falha ao enviar o arquivo. Por favor, tente novamente.`);
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
      return { message: 'Erro no banco de dados: Falha ao criar o post.' };
    }

    revalidatePath('/community');
    return { message: 'Post criado com sucesso.' };

  } catch (e: any) {
    return { message: e.message || 'Ocorreu um erro inesperado.' };
  }
}

// --- Learning Resources Actions ---

export async function createResource(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { message: 'Não autenticado.' };
  
  const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'teacher') return { message: 'Apenas professores podem criar recursos.' };

  const validatedFields = ResourceFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Campos inválidos.' };
  }

  const { resourceType, visibility, title, description, videoUrl, image } = validatedFields.data;
  let resourceImageUrl: string | undefined = undefined;

  // Handle image upload for Mind Maps
  if (resourceType === 'MIND_MAP') {
    if (!image || image.size === 0) return { message: 'Uma imagem é obrigatória para Mapas Mentais.' };
    const filePath = `${user.id}/mind_maps/${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage.from('learning_resources').upload(filePath, image);
    if (uploadError) return { message: 'Falha ao enviar a imagem.' };
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

  if (resourceError || !newResource) return { message: 'Falha ao criar o recurso no banco de dados.' };

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
      
      if (qError || !newQuestion) return { message: `Falha ao criar a questão ${qIndex + 1}.` };

      const optionsToInsert = qData.options.map((opt: any) => ({
          question_id: newQuestion.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
      }));

      const { error: oError } = await supabase.from('quiz_options').insert(optionsToInsert);
      if (oError) return { message: `Falha ao criar as opções para a questão ${qIndex + 1}.`};
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
        .filter('creator_id', 'in', `(SELECT teacher_id FROM teacher_student_connections WHERE student_id = '${studentId}' AND status = 'accepted')`)
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

    if (!user) throw new Error("Usuário não autenticado");

    const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id, options:quiz_options(id, is_correct)')
        .eq('resource_id', quizId);
    
    if (!questions) throw new Error("Quiz não encontrado ou sem questões.");

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
    .eq('teacher_id', teacherId)
    .eq('status', 'accepted');

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
    .eq('status', 'accepted')
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
    return { message: 'Apenas professores podem enviar feedback.' };
  }

  const validatedFields = TeacherFeedbackSchema.safeParse({
    essayId: formData.get('essayId'),
    feedbackText: formData.get('feedbackText'),
    correctedImage: formData.get('correctedImage'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Campos inválidos.' };
  }

  const { essayId, feedbackText, correctedImage } = validatedFields.data;
  let correctedImageUrl: string | undefined = undefined;

  if (correctedImage && correctedImage.size > 0) {
    const filePath = `${user.id}/corrected-${essayId}-${correctedImage.name}`;
    const { error: uploadError } = await supabase.storage.from('corrected_essay_images').upload(filePath, correctedImage);
    if (uploadError) {
      console.error('Error uploading corrected image:', uploadError);
      return { message: 'Falha ao enviar a imagem corrigida.' };
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
    return { message: 'Falha ao salvar o feedback.' };
  }

  revalidatePath('/teacher/submissions');
  revalidatePath(`/teacher/submissions/${essayId}`);
  revalidatePath(`/essay/${essayId}`);
  redirect(`/teacher/submissions/${essayId}`);
}


// --- Teacher/Student Connection Actions ---

export async function getStudentConnections(studentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('teacher_student_connections')
    .select('status, teachers:teacher_id(id, full_name, email, avatar_url)')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching student connections:', error);
    return { accepted: [], pending: [] };
  }
  
  const accepted = data.filter(d => d.status === 'accepted').map(d => d.teachers as Profile);
  const pending = data.filter(d => d.status === 'pending').map(d => d.teachers as Profile);

  return { accepted, pending };
}

export async function getTeacherConnections(teacherId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('teacher_student_connections')
        .select('status, students:student_id(id, full_name, email, avatar_url)')
        .eq('teacher_id', teacherId);

    if (error) {
        console.error('Error fetching teacher connections:', error);
        return { accepted: [], pending: [] };
    }
    
    const accepted = data.filter(d => d.status === 'accepted').map(d => d.students as Profile);
    const pending = data.filter(d => d.status === 'pending').map(d => d.students as Profile);

    return { accepted, pending };
}

export async function searchTeachers(query: string): Promise<Profile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'teacher')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
    
    if (error) {
        console.error('Error searching teachers:', error);
        return [];
    }
    return data || [];
}

export async function sendConnectionRequest(formData: FormData) {
    const teacherId = formData.get('teacherId') as string;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'Não autenticado.' };
    
    const { data: existing } = await supabase
        .from('teacher_student_connections')
        .select('id')
        .eq('student_id', user.id)
        .eq('teacher_id', teacherId)
        .maybeSingle();

    if (existing) {
        // This should ideally not happen due to UI filtering, but as a safeguard.
        return;
    }

    await supabase.from('teacher_student_connections').insert({
        student_id: user.id,
        teacher_id: teacherId,
        status: 'pending',
    });

    revalidatePath('/my-teachers');
}

export async function acceptConnectionRequest(formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const supabase = createClient();
    const { data: { user: teacher } } = await supabase.auth.getUser();
    if (!teacher) return;

    await supabase
        .from('teacher_student_connections')
        .update({ status: 'accepted' })
        .eq('teacher_id', teacher.id)
        .eq('student_id', studentId);

    revalidatePath('/teacher/my-students');
}

export async function rejectConnectionRequest(formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const supabase = createClient();
    const { data: { user: teacher } } = await supabase.auth.getUser();
    if (!teacher) return;

    await supabase
        .from('teacher_student_connections')
        .delete()
        .eq('teacher_id', teacher.id)
        .eq('student_id', studentId);
    
    revalidatePath('/teacher/my-students');
}
