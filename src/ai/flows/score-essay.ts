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
  essayText: z.string().describe('O texto da redação a ser corrigida.'),
  essayType: z.string().describe('O tipo de redação (ex: ENEM, Fuvest).'),
});
export type ScoreEssayInput = z.infer<typeof ScoreEssayInputSchema>;

const ScoreEssayOutputSchema = z.object({
  score: z.number().describe('A nota geral da redação, de 0 a 100.'),
  feedback: z.string().describe('Feedback detalhado sobre a redação, destacando pontos fortes e fracos na estrutura, argumentação e linguagem.'),
  suggestions: z.string().describe('Sugestões práticas para melhorar a redação, focando em áreas específicas como clareza, gramática ou profundidade.'),
  estimatedGrade: z.string().describe('A nota estimada para a redação, como "A-", "B+", ou equivalente com base no sistema de pontuação.'),
});
export type ScoreEssayOutput = z.infer<typeof ScoreEssayOutputSchema>;

export async function scoreEssay(input: ScoreEssayInput): Promise<ScoreEssayOutput> {
  return scoreEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreEssayPrompt',
  input: {schema: ScoreEssayInputSchema},
  output: {schema: ScoreEssayOutputSchema},
  system: `Você é um assistente de correção de redações por IA. Sua tarefa é fornecer uma avaliação detalhada de uma redação com base em seu tipo e conteúdo. Analise a redação quanto à estrutura, argumentação, clareza e gramática.

Você DEVE responder com um objeto JSON válido que siga estritamente o esquema de saída. Não inclua nenhum texto, markdown ou delimitadores de bloco de código fora do próprio objeto JSON.`,
  prompt: `Por favor, avalie a seguinte redação.

Tipo de Redação: {{{essayType}}}

Texto da Redação:
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
