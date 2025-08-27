
'use server';

/**
 * @fileOverview An AI assistant that answers user questions about environmental topics.
 *
 * - askEnvironmentalAssistant - A function that gets an answer from the AI assistant.
 */

import {ai, isAIConfigured, getAIStatus} from '@/ai/genkit';
import {z} from 'genkit';

// Fallback responses when AI is not available
const FALLBACK_RESPONSES = {
  general: "I'm an environmental assistant focused on air quality, water quality, noise pollution, and general environmental topics. I can help you understand how these factors affect your health and provide practical advice for staying safe.",
  air_quality: "For air quality questions, I can help you understand AQI levels, pollutant types, and health impacts. When is the best time for outdoor activities, and how to protect yourself from poor air quality.",
  water_quality: "Regarding water quality, I can explain pH levels, turbidity, and safety considerations. Learn about drinking water quality and when to be concerned about water contamination.",
  noise_pollution: "For noise pollution, I can discuss decibel levels, health effects, and strategies to reduce noise exposure. Find out how noise affects your sleep and overall well-being.",
  error: "I apologize, but I'm currently experiencing technical difficulties. Please try again later or check your internet connection."
};

export async function askEnvironmentalAssistant(question: string): Promise<string> {
  try {
    // Check if AI is configured
    if (!isAIConfigured()) {
      console.warn('AI not configured, using fallback response');
      return getFallbackResponse(question);
    }

    return await environmentalAssistantFlow(question);
  } catch (error) {
    console.error('Error in environmental assistant:', error);
    
    // Provide helpful fallback response based on question content
    return getFallbackResponse(question);
  }
}

// Function to determine appropriate fallback response
function getFallbackResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('air') || lowerQuestion.includes('aqi') || lowerQuestion.includes('pm2.5') || lowerQuestion.includes('pollution')) {
    return FALLBACK_RESPONSES.air_quality;
  }
  
  if (lowerQuestion.includes('water') || lowerQuestion.includes('ph') || lowerQuestion.includes('turbidity')) {
    return FALLBACK_RESPONSES.water_quality;
  }
  
  if (lowerQuestion.includes('noise') || lowerQuestion.includes('sound') || lowerQuestion.includes('decibel')) {
    return FALLBACK_RESPONSES.noise_pollution;
  }
  
  return FALLBACK_RESPONSES.general;
}

const prompt = ai.definePrompt({
  name: 'environmentalAssistantPrompt',
  input: {schema: z.string()},
  output: {schema: z.string()},
  prompt: `You are EcoAlert, an expert environmental assistant specializing in air quality, water quality, noise pollution, and general environmental health. Your goal is to provide accurate, helpful, and easy-to-understand information about environmental topics.

Guidelines:
- Be scientifically accurate but accessible
- Focus on practical advice and actionable information
- Consider health implications, especially for vulnerable populations
- Keep responses concise but comprehensive (2-4 paragraphs)
- Use markdown formatting for better readability
- Include specific examples when relevant
- Be empathetic and reassuring

User Question: {{{prompt}}}

Please provide a helpful, informative response:`,
});

const environmentalAssistantFlow = ai.defineFlow(
  {
    name: 'environmentalAssistantFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (question) => {
    try {
      const {output} = await prompt(question);
      
      // Validate and clean the response
      if (!output || typeof output !== 'string' || output.trim().length < 10) {
        throw new Error('Invalid AI response');
      }
      
      return output.trim();
    } catch (error) {
      console.error('Error in AI flow:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  }
);

// Health-focused environmental assistant for personalized advice
export async function getHealthEnvironmentalAdvice(
  healthProfile: any,
  currentConditions: any,
  question: string
): Promise<string> {
  try {
    if (!isAIConfigured()) {
      return getHealthFallbackResponse(healthProfile, currentConditions);
    }

    return await healthEnvironmentalAdviceFlow(healthProfile, currentConditions, question);
  } catch (error) {
    console.error('Error in health environmental advice:', error);
    return getHealthFallbackResponse(healthProfile, currentConditions);
  }
}

function getHealthFallbackResponse(healthProfile: any, currentConditions: any): string {
  let advice = "Based on your current environmental conditions, ";
  
  if (healthProfile.vulnerable) {
    advice += "as someone with health sensitivities, it's especially important to pay attention to air quality. ";
    
    if (currentConditions.aqi > 100) {
      advice += "Current air quality is poor. Consider staying indoors, keeping windows closed, and using air purifiers if available.";
    } else {
      advice += "Current conditions are relatively good, but continue monitoring for changes.";
    }
  } else {
    advice += "current conditions are generally safe for most people. ";
    
    if (currentConditions.aqi > 150) {
      advice += "However, air quality is poor, so sensitive individuals should take precautions.";
    }
  }
  
  return advice;
}

const healthEnvironmentalAdviceFlow = ai.defineFlow(
  {
    name: 'healthEnvironmentalAdviceFlow',
    inputSchema: z.object({
      healthProfile: z.any(),
      currentConditions: z.any(),
      question: z.string()
    }),
    outputSchema: z.string(),
  },
  async ({ healthProfile, currentConditions, question }) => {
    const healthPrompt = ai.definePrompt({
      name: 'healthEnvironmentalAdvicePrompt',
      input: { schema: z.object({
        healthProfile: z.any(),
        currentConditions: z.any(),
        question: z.string()
      })},
      output: { schema: z.string() },
      prompt: `You are a health-focused environmental advisor. Provide personalized advice based on the user's health profile and current environmental conditions.

User Health Profile:
- Vulnerable: ${healthProfile.vulnerable}
- Respiratory Conditions: ${healthProfile.respiratoryConditions.join(', ') || 'None'}
- Age Group: ${healthProfile.ageGroup}
- Activity Level: ${healthProfile.activityLevel}

Current Environmental Conditions:
- AQI: ${currentConditions.aqi}
- Dominant Pollutant: ${currentConditions.dominantPollutant || 'N/A'}
- Water pH: ${currentConditions.ph || 'N/A'}
- Noise Level: ${currentConditions.noise || 'N/A'} dB

User Question: ${question}

Provide personalized, health-focused environmental advice:`,
    });

    const {output} = await healthPrompt({ healthProfile, currentConditions, question });
    return output!;
  }
);
