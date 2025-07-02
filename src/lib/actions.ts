'use server';

import { z } from 'zod';
import { scoreEssay } from '@/ai/flows/score-essay';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  essayType: z.string(),
  essayText: z.string().min(100, { message: 'Essay must be at least 100 characters long.' }),
});

export type State = {
  errors?: {
    essayType?: string[];
    essayText?: string[];
  };
  message?: string | null;
  data?: {
    score: number;
    feedback: string;
    suggestions: string;
    estimatedGrade: string;
  } | null;
};

export async function submitAndScoreEssay(prevState: State, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    essayType: formData.get('essayType'),
    essayText: formData.get('essayText'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate essay. Please check the fields.',
    };
  }

  const { essayType, essayText } = validatedFields.data;

  try {
    const result = await scoreEssay({ essayType, essayText });
    
    // In a real application, you would save the essay and its score to the database here.
    // For this example, we'll assume it's saved and we get an ID.
    const newEssayId = Math.random().toString(36).substring(7);

    revalidatePath('/essays'); // Refresh the list of essays
    revalidatePath('/dashboard'); // Refresh dashboard data

    // Instead of redirecting here, we can return the data to be displayed on the same page.
    // Or we can redirect to a new page with the results.
    // Let's redirect for a cleaner UX.
    redirect(`/essay/${newEssayId}`);

  } catch (error) {
    console.error('Error scoring essay:', error);
    return {
      message: 'An unexpected error occurred while scoring the essay. Please try again.',
    };
  }
}
