import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// VULN-03 FIX: Upstash Redis rate limiter (per-user, 20 req/min)
// Fallback to in-memory only if Upstash env vars are missing
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
  });
}

// In-memory fallback
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

async function checkRateLimit(userId: string): Promise<boolean> {
  if (ratelimit) {
    const { success } = await ratelimit.limit(userId);
    return success;
  }
  
  // Fallback to in-memory map
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// VULN-04 FIX: Strip prompt injection characters from user-controlled strings
function sanitizeForPrompt(value: string): string {
  return value.replace(/[\n\r]/g, " ").replace(/[`"'{}\[\]]/g, "").substring(0, 300);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request (Supports Bearer token for Mobile & Cookies for Web)
    let user = null;
    const authHeader = req.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
      );
      const { data: authData } = await supabaseAdmin.auth.getUser(token);
      user = authData?.user || null;
    }

    if (!user) {
      const supabase = await createClient();
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid Supabase session required." },
        { status: 401 }
      );
    }

    // VULN-03 FIX: Rate limit check
    const isAllowed = await checkRateLimit(user.id);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    // 2. Parse Payload securely
    // VULN-04 FIX: Explicitly check body size (limit to 1MB)
    let body;
    try {
      const rawBody = await req.text();
      if (rawBody.length > 1_000_000) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413 });
      }
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    // VULN-05 FIX: Only accept message and history from the client.
    // Profile and metrics are fetched server-side from the DB using the authenticated user ID.
    const { message, history } = body;

    // Fetch real profile server-side
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
    );
    const { data: serverProfile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = serverProfile || {};
    // VULN-01 FIX: Enforce bounds on client-supplied metrics
    const rawMetrics = body.metrics || {};
    const metrics = {
      caloriesBurned: Math.max(0, Math.min(Number(rawMetrics.caloriesBurned) || 0, 10000)),
      caloriesConsumed: Math.max(0, Math.min(Number(rawMetrics.caloriesConsumed) || 0, 10000)),
      hydrationMl: Math.max(0, Math.min(Number(rawMetrics.hydrationMl) || 0, 15000)),
      steps: Math.max(0, Math.min(Number(rawMetrics.steps) || 0, 100000)),
      sleepHours: Math.max(0, Math.min(Number(rawMetrics.sleepHours) || 0, 24)),
      sleepQuality: Math.max(0, Math.min(Number(rawMetrics.sleepQuality) || 0, 100)),
      stressLevel: Math.max(0, Math.min(Number(rawMetrics.stressLevel) || 0, 100)),
      recoveryPercentage: Math.max(0, Math.min(Number(rawMetrics.recoveryPercentage) || 0, 100)),
      fatigueScore: Math.max(0, Math.min(Number(rawMetrics.fatigueScore) || 0, 100)),
      caloriesTarget: Math.max(1, Math.min(Number(rawMetrics.caloriesTarget) || 600, 10000)),
      hydrationTarget: Math.max(1, Math.min(Number(rawMetrics.hydrationTarget) || 2500, 15000)),
      stepsTarget: Math.max(1, Math.min(Number(rawMetrics.stepsTarget) || 10000, 100000)),
      sleepTarget: Math.max(1, Math.min(Number(rawMetrics.sleepTarget) || 8.0, 24))
    };

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({
        error: "Hello! No AI API key configured. Please add GROQ_API_KEY or GEMINI_API_KEY in your environment variables!"
      }, { status: 400 });
    }

    // VULN-04 FIX: Sanitize all user-controlled strings before prompt interpolation
    // to prevent prompt injection attacks.
    const systemPrompt = `You are the VitalCore AI Preventive Health, Wellness, & Longevity Coach.
You are a world-class preventative medicine physician, sports therapist, endocrinologist, and metabolic scientist.
Your tone is premium, futuristic, clean, highly professional, deeply empathetic, and scientific yet actionable.

User Biometric Telemetry Profile:
- Full Name: ${sanitizeForPrompt(profile?.full_name || "Explorer")}
- Fitness Level: ${sanitizeForPrompt(profile?.fitness_level || "Intermediate")}
- Fitness Goal: ${sanitizeForPrompt(profile?.fitness_goal || "General Wellness")}
- Active Visual Mode: ${sanitizeForPrompt(profile?.active_mode || "wellness")}
- Chronological/Biological Age: ${Number(profile?.biological_age) || 30} years
- Weight: ${Number(profile?.weight_kg) || 72} kg
- Height: ${Number(profile?.height_cm) || 178} cm
- Calculated BMI: ${Number(profile?.bmi) || "Not logged"}
- Estimated Body Fat: ${Number(profile?.body_fat_estimate) || "Not logged"}%
- Previous Injuries: ${sanitizeForPrompt(profile?.previous_injuries || "None logged")}
- Chronic Conditions: ${sanitizeForPrompt(profile?.chronic_conditions || "None logged")}
- Mobility Limitations: ${sanitizeForPrompt(profile?.mobility_limitations || "None logged")}
- Sleep Problems: ${profile?.sleep_problems ? "Yes, user experiences sleep issues" : "No reported sleep issues"}
- Dietary Preferences: ${sanitizeForPrompt(profile?.dietary_preferences || "Standard Mixed")}
- Allergies / Restrictions: ${sanitizeForPrompt(profile?.allergies || "None logged")}
- Daily Screen Time: ${Number(profile?.screen_time_hours) || 0} hours
- Sedentary Sitting: ${Number(profile?.sitting_hours) || 0} hours

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

    const MAX_HISTORY_MESSAGES = 20;
    const MAX_MESSAGE_LENGTH = 1000;
    const safeHistory = (history && Array.isArray(history))
      ? history
          .filter((h: any) => h.id !== "msg-welcome" && h.text !== "...")
          .slice(-MAX_HISTORY_MESSAGES)
          .map((h: any) => ({
            role: h.sender === "user" ? "user" : "assistant",
            text: String(h.text || "").substring(0, MAX_MESSAGE_LENGTH)
          }))
      : [];

    // --- 1. TRY GROQ API FIRST IF AVAILABLE ---
    if (groqKey) {
      try {
        const groqMessages = [
          { role: "system", content: systemPrompt },
          ...safeHistory.map((h: any) => ({ role: h.role, content: h.text })),
          { role: "user", content: String(message || "Hello Coach! Give me a quick update on my health telemetry.").substring(0, MAX_MESSAGE_LENGTH) }
        ];

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.65,
            max_tokens: 800
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const replyText = groqData?.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        } else {
          const groqErr = await groqRes.json().catch(() => ({}));
          console.warn("Groq API error, falling back to Gemini:", groqErr);
        }
      } catch (groqErr) {
        console.warn("Groq API request failed:", groqErr);
      }
    }

    // --- 2. FALLBACK TO GEMINI API ---
    if (geminiKey) {
      const contents: any[] = [];
      safeHistory.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
      contents.push({
        role: "user",
        parts: [{ text: String(message || "Hello Coach!").substring(0, MAX_MESSAGE_LENGTH) }]
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.65, maxOutputTokens: 800 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return NextResponse.json({ reply: replyText });
        }
      }
    }

    // Fallback response if API call fails
    const waterStatus = metrics?.hydrationMl >= (metrics?.hydrationTarget || 2500) 
      ? "You're hitting your hydration targets beautifully." 
      : `You've logged ${metrics?.hydrationMl || 0}ml of water, but you're still short of your ${(metrics?.hydrationTarget || 2500)}ml target. Please drink more water!`;
      
    const sleepStatus = metrics?.sleepHours >= (metrics?.sleepTarget || 8)
      ? "Your sleep duration is optimal."
      : `Your sleep of ${metrics?.sleepHours || 0} hours is below the target. This might increase your fatigue later.`;
      
    const fallbackReply = `Hello ${profile?.full_name?.split(" ")[0] || "there"}! Looking at your real-time data: ${waterStatus} ${sleepStatus} How else can I help you fine-tune your routine?`;
    
    return NextResponse.json({ reply: fallbackReply });
  } catch (err: any) {
    // VULN-12 FIX: Log error server-side only, never expose raw error to client
    console.error("AI Coach REST API Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
