import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, profile, metrics } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "Hello! The `GEMINI_API_KEY` is not configured. Please add the API key to enable full personalized AI coaching!"
      }, { status: 400 });
    }

    // Formulate system instructions context-aware of user profile biometrics
    const systemPrompt = `You are the VitalCore AI Preventive Health, Wellness, & Longevity Coach.
You are a world-class preventative medicine physician, sports therapist, endocrinologist, and metabolic scientist.
Your tone is premium, futuristic, clean, highly professional, deeply empathetic, and scientific yet actionable.

User Biometric Telemetry Profile:
- Full Name: ${profile?.full_name || "Explorer"}
- Fitness Level: ${profile?.fitness_level || "Intermediate"}
- Fitness Goal: ${profile?.fitness_goal || "General Wellness"}
- Active Visual Mode: ${profile?.active_mode || "wellness"}
- Chronological/Biological Age: ${profile?.biological_age || 30} years
- Weight: ${profile?.weight_kg || 72} kg
- Height: ${profile?.height_cm || 178} cm
- Calculated BMI: ${profile?.bmi || "Not logged"}
- Estimated Body Fat: ${profile?.body_fat_estimate || "Not logged"}%
- Previous Injuries: ${profile?.previous_injuries || "None logged"}
- Chronic Conditions: ${profile?.chronic_conditions || "None logged"}
- Mobility Limitations: ${profile?.mobility_limitations || "None logged"}
- Sleep Problems: ${profile?.sleep_problems ? "Yes, user experiences sleep issues" : "No reported sleep issues"}
- Dietary Preferences: ${profile?.dietary_preferences || "Standard Mixed"}
- Allergies / Restrictions: ${profile?.allergies || "None logged"}
- Daily Screen Time: ${profile?.screen_time_hours || 0} hours
- Sedentary Sitting: ${profile?.sitting_hours || 0} hours

Today's Telemetry Metrics:
- Calories Burned: ${metrics?.caloriesBurned || 0} kcal (Target: ${metrics?.caloriesTarget || 600} kcal)
- Calories Consumed: ${metrics?.caloriesConsumed || 0} kcal (Target: ${metrics?.caloriesTarget ? metrics.caloriesTarget * 3 : 1800} kcal)
- Fluid Hydration: ${metrics?.hydrationMl || 0} ml (Target: ${metrics?.hydrationTarget || 2500} ml)
- Steps Taken: ${metrics?.steps || 0} (Target: ${metrics?.stepsTarget || 10000})
- Sleep Duration: ${metrics?.sleepHours || 0} hours (Target: ${metrics?.sleepTarget || 8.0} hours)
- Sleep Quality score: ${metrics?.sleepQuality || 0}%
- Stress Load: ${metrics?.stressLevel || 0}%
- HRV Recovery index: ${metrics?.recoveryPercentage || 0}%
- Central fatigue Score: ${metrics?.fatigueScore || 0}%

Operational Coach Directives:
1. Genuinely analyze the user's query, history, and biometric stats.
2. Provide specific, personalized health, recovery, sleep, and nutrition recommendations.
3. Be direct, natural, and conversational. Do not use generic lists or walls of text. Be Apple-level polished and futuristic.
4. Actively comment on fatigue warning triggers, muscle recovery delays, sugar consumption alerts, and sedentary risk signals if appropriate.
5. If the user mentions fatigue, soreness, or low sleep, explain how poor sleep surges cortisol stress and halts muscle protein synthesis or fat loss.
6. Maintain conversational continuity and reference past topics in the conversation if they are relevant.
7. Keep responses concise and easy to scan, using clear formatting (bold, bullet points).`;

    // Map history to Gemini REST API contents
    const contents: any[] = [];

    if (history && Array.isArray(history)) {
      // Map previous messages, filtering out welcome messages
      history
        .filter((h: any) => h.id !== "msg-welcome" && h.text !== "...")
        .forEach((h: any) => {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
    }


    // Make official REST API call to Google Gemini model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 800
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      
      // Fallback for demo purposes if API key is invalid/missing
      // Interpolate real-time data so the user gets actual feedback even offline.
      const waterStatus = metrics?.hydrationMl >= (metrics?.hydrationTarget || 2500) 
        ? "You're hitting your hydration targets beautifully." 
        : `You've logged ${metrics?.hydrationMl || 0}ml of water, but you're still short of your ${(metrics?.hydrationTarget || 2500)}ml target. Please drink more water!`;
        
      const sleepStatus = metrics?.sleepHours >= (metrics?.sleepTarget || 8)
        ? "Your sleep duration is optimal."
        : `Your sleep of ${metrics?.sleepHours || 0} hours is below the target. This might increase your fatigue later.`;
        
      const fallbackReply = `Hello ${profile?.full_name?.split(" ")[0] || "there"}! My connection to the central neural core is currently limited due to an invalid API key, so I'm operating in offline mode. However, looking at your real-time data: ${waterStatus} ${sleepStatus} Keep up the great work! How else can I help you fine-tune your routine?`;
      
      return NextResponse.json({ reply: fallbackReply });
    }

    const data = await response.json();
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I was unable to synthesize a biometric response. Please verify key parameters.";

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    console.error("AI Coach REST API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during query processing" },
      { status: 500 }
    );
  }
}
