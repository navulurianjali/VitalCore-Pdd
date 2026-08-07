import { BASE_API_URL, getAuthHeaders } from './supabase';
import { searchLocalMergedDatabase } from '../utils/foodDatabase';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface UserProfileContext {
  full_name?: string;
  age?: number;
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  fitness_level?: string;
  fitness_goal?: string;
  dietary_preferences?: string;
  allergies?: string;
  chronic_conditions?: string;
  previous_injuries?: string;
  sleep_problems?: boolean;
}

export interface HealthMetricsContext {
  caloriesConsumed?: number;
  caloriesTarget?: number;
  caloriesBurned?: number;
  hydrationMl?: number;
  hydrationTarget?: number;
  steps?: number;
  stepsTarget?: number;
  sleepHours?: number;
  sleepTarget?: number;
  sleepQuality?: number;
  stressLevel?: number;
  recoveryPercentage?: number;
  fatigueScore?: number;
}

/**
 * Generate response from AI Coach using LLM (Groq / Gemini / Vercel API).
 * Uses merged nutrition database (Food_Coded + Indian Nutrition) for meal recommendations.
 */
export async function generateAICoachResponse(
  userPrompt: string,
  history: ChatMessage[],
  profile?: UserProfileContext | null,
  metrics?: HealthMetricsContext | null
): Promise<string> {
  const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  // Query merged nutrition database for exact matching items
  const matchedFoods = searchLocalMergedDatabase(userPrompt);
  const nutritionDbSnippet = matchedFoods.length > 0
    ? '\nVerified Nutrition Database Match Insights (from Food_Coded & Indian Nutrition Dataset):\n' +
      matchedFoods.slice(0, 5).map(f => `* ${f.name}: ${f.per100gCalories} kcal/100g | Protein: ${f.per100gProtein}g | Carbs: ${f.per100gCarbs}g | Fat: ${f.per100gFat}g`).join('\n')
    : '';

  // 1. Build System Prompt with rich biometric and profile context
  const systemPrompt = `You are the VitalCore AI Preventive Health, Wellness, & Longevity Coach.
You are a world-class preventative medicine physician, sports therapist, endocrinologist, and metabolic scientist.
Your tone is premium, futuristic, clean, highly professional, deeply empathetic, and scientific yet actionable.

User Biometric Telemetry Profile:
- Full Name: ${profile?.full_name || 'Explorer'}
- Fitness Level: ${profile?.fitness_level || 'Intermediate'}
- Fitness Goal: ${profile?.fitness_goal || 'General Health & Wellness'}
- Age: ${profile?.age || 28} years
- Weight: ${profile?.weight_kg || 70} kg
- Height: ${profile?.height_cm || 175} cm
- Calculated BMI: ${profile?.bmi || 'Not calculated'}
- Dietary Preferences: ${profile?.dietary_preferences || 'Standard Mixed'}
- Allergies / Restrictions: ${profile?.allergies || 'None logged'}
- Medical Conditions: ${profile?.chronic_conditions || 'None logged'}
- Previous Injuries: ${profile?.previous_injuries || 'None logged'}

Today's Real-Time Health Telemetry Metrics:
- Calories Consumed: ${metrics?.caloriesConsumed || 0} kcal (Daily Target: ${metrics?.caloriesTarget || 2000} kcal)
- Calories Burned: ${metrics?.caloriesBurned || 0} kcal
- Fluid Hydration: ${metrics?.hydrationMl || 0} ml (Daily Target: ${metrics?.hydrationTarget || 2500} ml)
- Steps Taken: ${metrics?.steps || 0} steps (Daily Target: ${metrics?.stepsTarget || 10000} steps)
- Sleep Duration: ${metrics?.sleepHours || 0} hours (Target: ${metrics?.sleepTarget || 8.0} hours)
- Sleep Quality Score: ${metrics?.sleepQuality || 0}%
- Stress Load Rating: ${metrics?.stressLevel || 0}%
- HRV Recovery Index: ${metrics?.recoveryPercentage || 0}%
- Fatigue Score: ${metrics?.fatigueScore || 0}%
${nutritionDbSnippet}

Operational Directives:
1. Genuinely analyze the user's prompt, past conversation history, and biometric telemetry.
2. Provide specific, personalized health, recovery, sleep, nutrition, and workout recommendations.
3. Be direct, natural, and conversational. Do not output repetitive generic stock responses.
4. Adapt your answers directly to what the user asks (e.g. if asking for lunch, suggest specific meals based on their dietary preferences and remaining calorie target; if asking about sleep, analyze their sleep metrics).
5. Maintain conversation continuity by keeping past topics in mind.
6. Keep responses clean, well-formatted with bold headings or bullet points where appropriate.`;

  // 2. Format history for API payload
  const formattedHistory = history
    .filter((h) => h.text && !h.text.startsWith('Hello ') && !h.text.startsWith('⚠️'))
    .slice(-20)
    .map((h) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text,
    }));

  let lastError: string = '';

  // ─────────────────────────────────────────────────────────────
  // OPTION A: GROQ API (Primary - Llama 3.3 70B)
  // ─────────────────────────────────────────────────────────────
  if (groqApiKey) {
    try {
      console.log('[AI Coach Service] Sending prompt to Groq API (llama-3.3-70b-versatile)...');

      const messages = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: userPrompt },
      ];

      const startTime = Date.now();
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AI Coach Service] Groq API Response Status: ${res.status} (${elapsed}ms)`);

      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          console.log('[AI Coach Service] Successfully received answer from Groq LLM.');
          return reply.trim();
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = `Groq API Error HTTP ${res.status}: ${JSON.stringify(errJson)}`;
        console.warn('[AI Coach Service]', lastError);
      }
    } catch (groqErr: any) {
      lastError = `Groq Network Error: ${groqErr?.message || groqErr}`;
      console.warn('[AI Coach Service]', lastError);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // OPTION B: GEMINI API (Fallback 1)
  // ─────────────────────────────────────────────────────────────
  if (geminiApiKey) {
    try {
      console.log('[AI Coach Service] Groq failed or unconfigured. Trying Gemini API...');

      const contents = [
        ...formattedHistory.map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
          }),
        }
      );

      console.log(`[AI Coach Service] Gemini API Response Status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          console.log('[AI Coach Service] Successfully received answer from Gemini LLM.');
          return reply.trim();
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = `Gemini API Error HTTP ${res.status}: ${JSON.stringify(errJson)}`;
        console.warn('[AI Coach Service]', lastError);
      }
    } catch (geminiErr: any) {
      lastError = `Gemini Network Error: ${geminiErr?.message || geminiErr}`;
      console.warn('[AI Coach Service]', lastError);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // OPTION C: BACKEND API FALLBACK (Vercel Endpoint)
  // ─────────────────────────────────────────────────────────────
  try {
    console.log('[AI Coach Service] Trying Vercel backend AI route...');
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_API_URL}/api/ai-coach`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: userPrompt,
        history: history.map((m) => ({ sender: m.sender, text: m.text })),
        metrics,
      }),
    });

    console.log(`[AI Coach Service] Vercel API Response Status: ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      if (data?.reply && !data.reply.includes('Drink water...') && !data.reply.includes('fluid hydration')) {
        return data.reply;
      }
      if (data?.reply) {
        // If Vercel returned stock response, throw so real error is displayed
        throw new Error(`Server returned generic fallback response instead of LLM output.`);
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      lastError = errData.error || `Server HTTP ${res.status}`;
    }
  } catch (backendErr: any) {
    if (!lastError) lastError = backendErr?.message || 'Backend network request failed.';
    console.warn('[AI Coach Service] Vercel backend error:', backendErr);
  }

  // ─────────────────────────────────────────────────────────────
  // DO NOT RETURN GENERIC FALLBACK SILENTLY
  // ─────────────────────────────────────────────────────────────
  throw new Error(`AI Coach API Error: ${lastError || 'Unable to connect to Groq or Gemini AI services. Please verify your internet connection.'}`);
}
