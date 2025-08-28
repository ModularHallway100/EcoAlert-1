
'use server';

/**
 * @fileOverview Provides personalized tips for reducing pollution based on current pollution levels.
 *
 * - getPollutionReductionTips - A function that generates pollution reduction tips.
 * - PollutionReductionTipsInput - The input type for the getPollutionReductionTips function.
 * - PollutionReductionTipsOutput - The return type for the getPollutionReductionTips function.
 */

import {ai, isAIConfigured} from '@/ai/genkit';
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

// Fallback tips generator when AI is not available
function generateFallbackTips(input: PollutionReductionTipsInput): PollutionReductionTipsOutput {
  const { aqi, ph, turbidity, noise } = input;
  
  // Determine the main concern
  let mainConcern = 'general environmental conditions';
  let concernLevel = 'moderate';
  
  if (aqi > 150) {
    mainConcern = 'poor air quality';
    concernLevel = 'high';
  } else if (aqi > 100) {
    mainConcern = 'elevated air pollution';
    concernLevel = 'moderate';
  } else if (ph && (ph < 6.5 || ph > 8.5)) {
    mainConcern = 'water quality issues';
    concernLevel = 'moderate';
  } else if (turbidity && turbidity > 50) {
    mainConcern = 'high water turbidity';
    concernLevel = 'moderate';
  } else if (noise && noise > 85) {
    mainConcern = 'elevated noise levels';
    concernLevel = 'moderate';
  }
  
  return {
    title: `Managing ${mainConcern}`,
    insight: `Your current ${mainConcern} is at a ${concernLevel} level. While not immediately dangerous, it's worth paying attention to these conditions and taking some simple precautions to protect your health and comfort.`,
    nextSteps: [
      'Monitor conditions regularly using the app',
      'Follow local environmental advisories',
      'Consider simple protective measures like air purifiers or noise-canceling headphones'
    ]
  };
}

export async function getPollutionReductionTips(input: PollutionReductionTipsInput): Promise<PollutionReductionTipsOutput> {
  try {
    // Validate input
    if (!input || typeof input !== 'object' || input.aqi === undefined) {
      throw new Error('Invalid input: AQI is required');
    }
    
    // Check if AI is configured
    if (!isAIConfigured()) {
      console.warn('AI not configured, using fallback tips');
      return generateFallbackTips(input);
    }

    return await pollutionReductionTipsFlow(input);
  } catch (error) {
    console.error('Error generating pollution reduction tips:', error);
    return generateFallbackTips(input);
  }
}

const prompt = ai.definePrompt({
  name: 'pollutionReductionTipsPrompt',
  input: {schema: PollutionReductionTipsInputSchema},
  output: {schema: PollutionReductionTipsOutputSchema},
  prompt: `You are an expert environmental advisor providing personalized, actionable tips based on real-time environmental data. Your advice should be practical, specific, and health-conscious.

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

Based on these readings, generate:
1. **Title**: A short, engaging title (under 60 characters)
2. **Insight**: A detailed paragraph (3-5 sentences) that:
   - Explains what the current conditions mean
   - Provides specific, personalized advice
   - Mentions health considerations if relevant
   - Suggests timing or context for actions
3. **Next Steps**: 2-3 concrete, actionable items that are:
   - Specific and practical
   - Easy to implement
   - Prioritized by importance
   - Include resources or tools when helpful

Guidelines:
- Be direct and empathetic
- Focus on safety and practicality
- Use simple, clear language
- Tailor advice to the specific pollutant/condition
- Include time-based recommendations when relevant
- Consider vulnerable populations if conditions are poor

Generate your response:`,
});

const pollutionReductionTipsFlow = ai.defineFlow(
  {
    name: 'pollutionReductionTipsFlow',
    inputSchema: PollutionReductionTipsInputSchema,
    outputSchema: PollutionReductionTipsOutputSchema,
  },
  async (input: PollutionReductionTipsInput) => {
    try {
      const {output} = await prompt(input);
      
      // Validate and clean the response
      if (!output || typeof output !== 'object') {
        throw new Error('Invalid AI response structure');
      }
      
      // Ensure required fields exist
      const result: PollutionReductionTipsOutput = {
        title: output.title?.trim() || 'Environmental Tips',
        insight: output.insight?.trim() || 'Here are some recommendations for your current conditions.',
        nextSteps: Array.isArray(output.nextSteps) ? output.nextSteps.filter(step => typeof step === 'string') : []
      };
      
      // Validate content
      if (result.title.length === 0 || result.insight.length < 10 || result.nextSteps.length === 0) {
        throw new Error('Invalid AI response content');
      }
      
      return result;
    } catch (error) {
      console.error('Error in AI flow:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  }
);

// Advanced health-aware tips generator
export async function getHealthAwarePollutionTips(
  input: PollutionReductionTipsInput,
  healthProfile: any
): Promise<PollutionReductionTipsOutput> {
  try {
    if (!isAIConfigured()) {
      return generateHealthAwareFallbackTips(input, healthProfile);
    }

    return await healthAwarePollutionTipsFlow(input, healthProfile);
  } catch (error) {
    console.error('Error generating health-aware pollution tips:', error);
    return generateHealthAwareFallbackTips(input, healthProfile);
  }
}

function generateHealthAwareFallbackTips(
  input: PollutionReductionTipsInput,
  healthProfile: any
): PollutionReductionTipsOutput {
  const { aqi } = input;
  const isVulnerable = healthProfile?.vulnerable || false;
  const hasRespiratoryConditions = healthProfile?.respiratoryConditions?.length > 0;
  
  let title = 'Environmental Health Advisory';
  let insight = 'Based on your current conditions and health profile, here are some recommendations.';
  let nextSteps = [
    'Continue monitoring environmental conditions',
    'Follow local health advisories'
  ];
  
  if (aqi > 100) {
    if (isVulnerable || hasRespiratoryConditions) {
      title = 'High-Risk Air Quality Alert';
      insight = 'Air quality is poor, which poses significant risks for individuals with health sensitivities or respiratory conditions. Consider taking extra precautions to protect your health.';
      nextSteps = [
        'Limit outdoor activities, especially exercise',
        'Keep windows closed and use air purifiers',
        'Have quick-relief medications readily available',
        'Consult your healthcare provider if symptoms worsen'
      ];
    } else {
      title = 'Elevated Pollution Levels';
      insight = 'Air quality has declined to moderate levels. While generally healthy people may experience minor symptoms, sensitive individuals should take precautions.';
      nextSteps = [
        'Sensitive groups should reduce prolonged outdoor exertion',
        'Consider rescheduling strenuous activities',
        'Stay hydrated and monitor for symptoms'
      ];
    }
  }
  
  return {
    title,
    insight,
    nextSteps
  };
}

const healthAwarePollutionTipsPrompt = ai.definePrompt({
  name: 'healthAwarePollutionTipsPrompt',
  input: {
    schema: z.object({
      ...PollutionReductionTipsInputSchema.shape,
      healthProfile: z.any(),
    }),
  },
  output: { schema: PollutionReductionTipsOutputSchema },
  prompt: `You are a health-focused environmental advisor providing personalized recommendations based on both environmental conditions and the user's health profile.

Environmental Data:
- AQI: ${'{{aqi}}'}
{{#if dominantPollutant}}
- Dominant Pollutant: ${'{{dominantPollutant}}'}
{{/if}}
{{#if ph}}
- Water pH Level: ${'{{ph}}'}
{{/if}}
{{#if turbidity}}
- Water Turbidity: ${'{{turbidity}}'} NTU
{{/if}}
{{#if noise}}
- Noise Level: ${'{{noise}}'} dB
{{/if}}

User Health Profile:
- Vulnerable: ${'{{healthProfile.vulnerable}}'}
- Respiratory Conditions: ${'{{healthProfile.respiratoryConditions}}'}
- Age Group: ${'{{healthProfile.ageGroup}}'}
- Activity Level: ${'{{healthProfile.activityLevel}}'}

Generate health-aware environmental recommendations that consider both the current conditions and the user's specific health needs.

Provide:
1. **Title**: A title that reflects the urgency and health focus
2. **Insight**: Detailed advice considering health implications
3. **Next Steps**: Health-specific actionable recommendations

Focus on:
- Health risks specific to the user's profile
- Timing of activities to minimize exposure
- Specific protective measures
- When to seek medical advice
- Practical accommodations for daily life

Generate your response:`,
});

const healthAwarePollutionTipsFlow = ai.defineFlow(
  {
    name: 'healthAwarePollutionTipsFlow',
    inputSchema: z.object({
      ...PollutionReductionTipsInputSchema.shape,
      healthProfile: z.any(),
    }),
    outputSchema: PollutionReductionTipsOutputSchema,
  },
  async (input) => {
    const { output } = await healthAwarePollutionTipsPrompt(input);
    return output!;
  }
);
