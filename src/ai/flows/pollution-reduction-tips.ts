
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
  ph: z.number().optional().describe('The current water pH level.'),
  turbidity: z.number().optional().describe('The current water turbidity in NTU.'),
  noise: z.number().optional().describe('The current noise level in dB.'),
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
  prompt: `You are an environmental advisor providing personalized tips to users on how to reduce pollution based on a holistic view of their environment.

  Current Environmental Readings:
  - Air Quality Index (AQI): {{{aqi}}}
  {{#if dominantPollutant}}
  - Dominant Air Pollutant: {{{dominantPollutant}}}
  {{/if}}
  {{#if ph}}
  - Water pH Level: {{{ph}}}
  {{/if}}
  {{#if turbidity}}
  - Water Turbidity: {{{turbidity}}} NTU
  {{/if}}
  {{#if noise}}
  - Noise Level: {{{noise}}} dB
  {{/if}}

  Provide 3-5 actionable and specific tips the user can take to reduce overall pollution. Be direct, concise, and encouraging. Your tips should consider all the provided environmental factors. For example, if noise is high, suggest ways to reduce noise pollution. If water quality is poor, provide relevant tips.
  
  Structure your response under the 'tips' key.
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
