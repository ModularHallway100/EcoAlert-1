'use server';

/**
 * @fileOverview Provides personalized tips for reducing pollution based on current pollution levels.
 *
 * - getPollutionReductionTips - A function that generates pollution reduction tips.
 * - PollutionReductionTipsInput - The input type for the getPollutionReductionTips function.
 * - PollutionReductionTipsOutput - The return type for the getPollutionReductionTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PollutionReductionTipsInputSchema = z.object({
  aqi: z.number().describe('The current Air Quality Index (AQI) reading.'),
  dominantPollutant: z
    .string()
    .optional()
    .describe('The dominant pollutant contributing to the AQI.'),
});
export type PollutionReductionTipsInput = z.infer<typeof PollutionReductionTipsInputSchema>;

const PollutionReductionTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('A list of personalized tips for reducing pollution.'),
});
export type PollutionReductionTipsOutput = z.infer<typeof PollutionReductionTipsOutputSchema>;

export async function getPollutionReductionTips(input: PollutionReductionTipsInput): Promise<PollutionReductionTipsOutput> {
  return pollutionReductionTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pollutionReductionTipsPrompt',
  input: {schema: PollutionReductionTipsInputSchema},
  output: {schema: PollutionReductionTipsOutputSchema},
  prompt: `You are an environmental advisor providing personalized tips to users on how to reduce pollution based on the current Air Quality Index (AQI) and dominant pollutant.

  The current AQI is {{{aqi}}}.
  {{#if dominantPollutant}}
  The dominant pollutant is {{{dominantPollutant}}}.
  {{/if}}

  Provide 3-5 actionable and specific tips the user can take to reduce pollution. Be direct and concise. Take into account the pollution levels and dominant pollutant when providing tips.
  Tips:
  `,
});

const pollutionReductionTipsFlow = ai.defineFlow(
  {
    name: 'pollutionReductionTipsFlow',
    inputSchema: PollutionReductionTipsInputSchema,
    outputSchema: PollutionReductionTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
