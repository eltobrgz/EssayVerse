'use server';

import { z } from 'zod';
import { scoreEssay } from '@/ai/flows/score-essay';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';

const FormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.'}),
  essayType: z.string({ required_error: 'Please select an essay type.'}),
  essayText: z.string().min(100, { message: 'Essay must be at least 100 characters long.' }),
  image: z.any().optional(),
});

export type State = {
  errors?: {
    title?: string[];
    essayType?: string[];
    essayText?: string[];
  };
  message?: string | null;
};

export async function submitAndScoreEssay(prevState: State, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: 'Authentication error. Please log in again.',
    };
  }
  
  const validatedFields = FormSchema.safeParse({
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

  // Handle image upload if provided
  if (image && image.size > 0) {
    const filePath = `${user.id}/${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from('essay_images')
      .upload(filePath, image);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return {
        message: 'Failed to upload image. Please try again.',
      };
    }
    const { data: { publicUrl } } = supabase.storage.from('essay_images').getPublicUrl(filePath);
    imageUrl = publicUrl;
  }


  try {
    const result = await scoreEssay({ essayType, essayText });
    
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
      .select('id')
      .single();

    if (error) {
      console.error('Error saving essay to DB:', error);
      return {
        message: 'Failed to save your essay after scoring. Please try again.',
      }
    }

    revalidatePath('/essays');
    revalidatePath('/dashboard'); 
    redirect(`/essay/${newEssay.id}`);

  } catch (error) {
    console.error('Error scoring essay:', error);
    return {
      message: 'An unexpected error occurred while scoring the essay. Please try again.',
    };
  }
}
