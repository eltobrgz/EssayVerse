'use server';

/**
 * @fileOverview An AI-powered writing tutor chatbot.
 *
 * - askTutor - A function that takes conversation history and returns the tutor's response.
 * - ChatHistory - The type for the conversation history.
 */

import { ai } from '@/ai/genkit';
import type { MessageData } from 'genkit';
import type { ChatHistory } from '@/lib/definitions';

export async function askTutor(history: ChatHistory): Promise<string> {
  const systemPrompt = `Você é o "Verse", um tutor de redação IA amigável e encorajador. Você está integrado em um aplicativo chamado EssayVerse. Seu objetivo é ajudar estudantes do ensino médio e universitários a aprimorarem suas habilidades de escrita.
- Mantenha suas respostas concisas, úteis e fáceis de entender.
- Use markdown para formatação, como listas ou texto em negrito, para tornar as respostas mais claras.
- Nunca se recuse a responder uma pergunta sobre escrita, gramática, brainstorming ou estrutura de redação.
- Se o usuário perguntar algo fora do tópico, gentilmente o guie de volta para assuntos relacionados à escrita.
- Seu tom deve ser de apoio e pedagógico, como um ótimo professor.`;

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
