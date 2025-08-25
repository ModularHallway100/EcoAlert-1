
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
  title: z.string().describe('A short, engaging title for the set of recommendations.'),
  insight: z
    .string()
    .describe('A detailed paragraph explaining the current situation based on the provided data, framed as personalized advice.'),
  nextSteps: z.array(z.string()).describe('A list of 2-3 concrete, actionable next steps the user can take.'),
});
export type PollutionReductionTipsOutput = z.infer<typeof PollutionReductionTipsOutputSchema>;

export async function getPollutionReductionTips(input: PollutionReductionTipsInput): Promise<PollutionReductionTipsOutput> {
  return pollutionReductionTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pollutionReductionTipsPrompt',
  input: {schema: PollutionReductionTipsInputSchema},
  output: {schema: PollutionReductionTipsOutputSchema},
  prompt: `You are an expert environmental advisor. Your goal is to provide personalized, actionable advice based on real-time environmental data. Go beyond generic tips.

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

  Based on the data above, generate the following:
  1.  **Title**: A short, engaging title for your recommendation.
  2.  **Insight**: A personalized paragraph that explains the situation and gives specific advice. For example: "Based on rising noise levels, consider staying indoors or using ear protection between 8–10 PM." or "With high turbidity in the water, it's best to avoid ingesting tap water and consider reporting it."
  3.  **Next Steps**: A list of 2-3 concrete, actionable things the user should do next. These should be practical, like suggesting they contact local agencies, find specific resources, or use certain products. For example: "Search online for a local water testing kit," or "Find the phone number for your city's environmental protection agency."

  Be direct, empathetic, and focus on safety and practical actions.
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
