import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Enhanced Genkit configuration with better error handling and fallbacks
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY,
    }),
  ],
  model: process.env.GOOGLE_GENAI_MODEL || 'googleai/gemini-1.5-flash-latest',
  config: {
    // Default generation config
    temperature: 0.7,
    maxOutputTokens: 1000,
    topP: 0.8,
    topK: 40,
  },
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
});

// Helper function to check if AI is properly configured
export function isAIConfigured(): boolean {
  return !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY);
}

// Helper function to get AI status
export function getAIStatus() {
  return {
    configured: isAIConfigured(),
    model: process.env.GOOGLE_GENAI_MODEL || 'googleai/gemini-1.5-flash-latest',
    environment: process.env.NODE_ENV || 'development',
    hasApiKey: !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY),
  };
}
