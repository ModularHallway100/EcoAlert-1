
'use server';

/**
 * @fileOverview An AI assistant that answers user questions about environmental topics.
 *
 * - askEnvironmentalAssistant - A function that gets an answer from the AI assistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function askEnvironmentalAssistant(question: string): Promise<string> {
  return environmentalAssistantFlow(question);
}

const prompt = ai.definePrompt({
  name: 'environmentalAssistantPrompt',
  input: {schema: z.string()},
  output: {schema: z.string()},
  prompt: `You are an expert environmental assistant. Your goal is to answer user questions about pollution, conservation, environmental science, and safety tips. Provide clear, concise, and helpful answers. Format your response using markdown.

  User Question: {{{prompt}}}
  `,
});

const environmentalAssistantFlow = ai.defineFlow(
  {
    name: 'environmentalAssistantFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (question) => {
    const {output} = await prompt(question);
    return output!;
  }
);
