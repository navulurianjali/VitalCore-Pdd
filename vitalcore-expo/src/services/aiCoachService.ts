import { generateLocalAICoachResponse, UserProfileContext, HealthMetricsContext } from './aiCoachEngine';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export type { UserProfileContext, HealthMetricsContext };

/**
 * VitalCore AI — Local Rule, Keyword & Intent-Based AI Coach Service.
 * Generates local responses using real user telemetry & profile data.
 * ZERO external API calls (Groq, Gemini, OpenAI eliminated).
 */
export async function generateAICoachResponse(
  userPrompt: string,
  _history: ChatMessage[],
  profile?: UserProfileContext | null,
  metrics?: HealthMetricsContext | null
): Promise<string> {
  const intent = userPrompt ? userPrompt.trim() : '';
  console.log(`[AI Coach] Generating local response for intent query: "${intent.substring(0, 30)}..."`);
  
  const response = generateLocalAICoachResponse(userPrompt, profile, metrics);
  
  console.log('[AI Coach] Response generated locally ✓');
  return response;
}
