import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { generateIndianMealPlan } from "@/utils/indianNutritionEngine";

let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
  });
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

async function checkRateLimit(userId: string): Promise<boolean> {
  if (ratelimit) {
    const { success } = await ratelimit.limit(userId);
    return success;
  }
  
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

const VALID_GOALS = new Set([
  "Weight Loss", "Muscle Gain", "Weight Gain", "General Wellness",
  "Endurance", "Energy", "Recovery", "Stress Management", "Diabetes-Friendly", "Heart-Healthy", "Fat Loss"
]);
const VALID_PREFERENCES = new Set([
  "Standard", "Vegetarian", "Vegan", "Keto", "South Indian",
  "North Indian", "East Indian", "West Indian", "Pan-Indian", "Indian", "Mediterranean", "Paleo", "Eggetarian", "Non-Vegetarian", "Balanced", "High Protein"
]);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid Supabase session required." },
        { status: 401 }
      );
    }

    const isAllowed = await checkRateLimit(user.id);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

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
    
    const rawGoal = String(body.goal || "");
    const rawPreference = String(body.preference || "");

    const goal = VALID_GOALS.has(rawGoal) ? rawGoal : "General Wellness";
    const preference = VALID_PREFERENCES.has(rawPreference) ? rawPreference : "South Indian";
    const rawMetrics = body.metrics || {};
    const metrics = {
      stressLevel: Math.max(0, Math.min(Number(rawMetrics.stressLevel) || 45, 100)),
      sleepHours: Math.max(0, Math.min(Number(rawMetrics.sleepHours) || 7.2, 24))
    };

    const { data: serverProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const profile = serverProfile || {};

    const daySeed = Number(body.daySeed) || Date.now();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(generateIndianMealPlan({ goal, preference, userWeightKg: profile?.weight_kg || 70, daySeed }));
    }

    const systemPrompt = `You are an elite Indian Clinical Dietitian and AI Nutrition Scientist.
Generate an authentic, highly nutritious, personalized Indian meal plan using familiar Indian food names (e.g. Idli, Sambar, Pesarattu, Upma, Poha, Pongal, Ragi Dosa/Mudda, Chapati, Phulka, Jowar/Bajra Roti, Dal Makhani, Rajma Chawal, Chole, Palak Paneer, Baingan Bharta, Makhana, Chaach, Litti Chokha, Fish Curry, Chicken Curry, Khichdi, etc.).

User Parameters:
- Target Goal: ${goal}
- Preference & Region: ${preference}
- Body Weight: ${profile?.weight_kg || 70} kg
- Fitness Goal: ${profile?.fitness_goal || "General Wellness"}
- Daily stress level: ${metrics?.stressLevel}%
- Daily sleep duration: ${metrics?.sleepHours} hours

CRITICAL RULES:
1. Recommend ONLY realistic Indian foods that everyday Indian households recognize and eat.
2. DO NOT recommend generic Western meals (like oatmeal, sandwiches, or western salads) unless requested.
3. Intra-Day Variety: Ensure breakfast, lunch, dinner, and snack use different staples (e.g., if rice for breakfast, no rice for dinner).
4. Return strictly raw JSON with the following structure:
{
  "plan": [
    {
      "mealType": "breakfast",
      "name": "Indian Dish Name",
      "servingSize": "Serving portion",
      "calories": 380,
      "protein": 18,
      "carbs": 50,
      "fat": 10,
      "fiber": 8,
      "whyHelps": "Why this meal helps for ${goal}.",
      "recoveryBenefits": "Recovery benefit",
      "energyBenefits": "Energy benefit",
      "hydrationSupport": "Hydration benefit",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"],
      "prepTime": "15 mins",
      "timingIntelligence": "Metabolic timing insight"
    },
    ... (lunch, dinner, snack)
  ],
  "insights": ["Insight 1", "Insight 2"],
  "habits": ["Habit 1", "Habit 2"],
  "warnings": ["Warning 1", "Warning 2"]
}
DO NOT include codeblock backticks or extra text outside JSON.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `Generate authentic Indian nutrition plan for Goal: "${goal}", Preference: "${preference}", Day Seed: ${daySeed}` }]
      }
    ];

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
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      return NextResponse.json(generateIndianMealPlan({ goal, preference, userWeightKg: profile?.weight_kg || 70, daySeed }));
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (replyText) {
      try {
        const parsed = JSON.parse(replyText.trim());
        return NextResponse.json(parsed);
      } catch (jsonErr) {
        return NextResponse.json(generateIndianMealPlan({ goal, preference, userWeightKg: profile?.weight_kg || 70, daySeed }));
      }
    }

    return NextResponse.json(generateIndianMealPlan({ goal, preference, userWeightKg: profile?.weight_kg || 70, daySeed }));
  } catch (err: any) {
    console.error("AI Indian Nutrition Planner API error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
