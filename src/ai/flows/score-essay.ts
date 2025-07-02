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
  score: z.number().describe('The overall score of the essay, from 0 to 100.'),
  feedback: z.string().describe('Detailed feedback on the essay, highlighting strengths and weaknesses in structure, argumentation, and language.'),
  suggestions: z.string().describe('Actionable suggestions for improving the essay, focusing on specific areas like clarity, grammar, or depth.'),
  estimatedGrade: z.string().describe('The estimated grade for the essay, such as "A-", "B+", or equivalent based on the scoring system.'),
});
export type ScoreEssayOutput = z.infer<typeof ScoreEssayOutputSchema>;

export async function scoreEssay(input: ScoreEssayInput): Promise<ScoreEssayOutput> {
  return scoreEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreEssayPrompt',
  input: {schema: ScoreEssayInputSchema},
  output: {schema: ScoreEssayOutputSchema},
  system: `You are an AI essay scoring assistant. Your task is to provide a detailed evaluation of an essay based on its type and content. Analyze the essay for structure, argumentation, clarity, and grammar.

You MUST respond with a valid JSON object that strictly adheres to the output schema. Do not include any text, markdown, or code block delimiters outside of the JSON object itself.`,
  prompt: `Please evaluate the following essay.

Essay Type: {{{essayType}}}

Essay Text:
---
{{{essayText}}}
---
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
