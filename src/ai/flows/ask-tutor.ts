'use server';

/**
 * @fileOverview An AI-powered writing tutor chatbot.
 *
 * - askTutor - A function that takes conversation history and returns the tutor's response.
 * - ChatHistory - The type for the conversation history.
 */

import { ai } from '@/ai/genkit';
import type { MessageData } from 'genkit';
import { z } from 'zod';

// Define the schema for chat history publicly, so client can use it.
export const ChatHistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })
);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;

export async function askTutor(history: ChatHistory): Promise<string> {
  const systemPrompt = `You are "Verse", a friendly and encouraging AI writing tutor. You are embedded in an application called EssayVerse. Your goal is to help high school and university students improve their writing skills.
- Keep your answers concise, helpful, and easy to understand.
- Use markdown for formatting, like lists or bold text, to make responses clearer.
- Never refuse to answer a question about writing, grammar, brainstorming, or essay structure.
- If the user asks something off-topic, gently guide them back to writing-related subjects.
- Your tone should be supportive and pedagogical, like a great teacher.`;

  // The last message in the history is the new prompt.
  const prompt = history[history.length - 1].content;

  // The rest of the history is the context.
  const genkitHistory: MessageData[] = history.slice(0, -1).map(item => ({
    role: item.role,
    parts: [{ text: item.content }],
  }));


  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    prompt: prompt,
    history: genkitHistory,
  });

  return llmResponse.text;
}
