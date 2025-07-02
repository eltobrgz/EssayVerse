'use server';

/**
 * @fileOverview AI agent that scores essays and provides feedback.
 *
 * - scoreEssay - A function that scores an essay and provides feedback.
 * - ScoreEssayInput - The input type for the scoreEssay function.
 * - ScoreEssayOutput - The return type for the scoreEssay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreEssayInputSchema = z.object({
  essayText: z.string().describe('The text of the essay to be scored.'),
  essayType: z.string().describe('The type of essay (e.g., ENEM, Fuvest).'),
});
export type ScoreEssayInput = z.infer<typeof ScoreEssayInputSchema>;

const ScoreEssayOutputSchema = z.object({
  score: z.number().describe('The overall score of the essay.'),
  feedback: z.string().describe('Feedback on the essay, including strengths and weaknesses.'),
  suggestions: z.string().describe('Suggestions for improving the essay.'),
  estimatedGrade: z.string().describe('The estimated grade for the essay.'),
});
export type ScoreEssayOutput = z.infer<typeof ScoreEssayOutputSchema>;

export async function scoreEssay(input: ScoreEssayInput): Promise<ScoreEssayOutput> {
  return scoreEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreEssayPrompt',
  input: {schema: ScoreEssayInputSchema},
  output: {schema: ScoreEssayOutputSchema},
  prompt: `You are an AI essay scoring assistant. You will receive an essay and its type. You will then provide a score, feedback, suggestions, and an estimated grade for the essay.

Essay Type: {{{essayType}}}
Essay Text: {{{essayText}}}

Score (0-100): 
Feedback:
Suggestions:
Estimated Grade:
`,
});

const scoreEssayFlow = ai.defineFlow(
  {
    name: 'scoreEssayFlow',
    inputSchema: ScoreEssayInputSchema,
    outputSchema: ScoreEssayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
