import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { 
  generateSimplifiedAIMealRecommendations
} from "@/utils/indianNutritionEngine";

let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
  });
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
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
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    let body;
    try {
      const rawBody = await req.text();
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const { data: serverProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const profile = serverProfile || {};

    const goal = String(body.goal || "Muscle Gain");
    const preference = String(body.preference || "No Preference");
    const dislikedFoods = Array.isArray(body.dislikedFoods) ? body.dislikedFoods : [];
    const favoriteFoods = Array.isArray(body.favoriteFoods) ? body.favoriteFoods : [];
    const loggedTodayNames = Array.isArray(body.loggedTodayNames) ? body.loggedTodayNames : [];
    const pantryIngredients = Array.isArray(body.pantryIngredients) ? body.pantryIngredients : [];
    const daySeed = Number(body.daySeed) || Date.now();

    const fallbackCards = generateSimplifiedAIMealRecommendations({
      goal,
      preference,
      pantryIngredients,
      dislikedFoods,
      favoriteFoods,
      loggedTodayNames,
      daySeed
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ recommendations: fallbackCards });
    }

    const systemPrompt = `You are a world-class Clinical AI Nutritionist.
Generate EXACTLY 3 TOP-SCORING Indian meal recommendations focusing on South Indian and regional cuisines.

USER CONSTRAINTS:
- Food Preference: ${preference} (Vegetarian | Non-Vegetarian | Vegan | Eggetarian | No Preference)
- Health Goal: ${goal} (Weight Loss | Weight Gain | Muscle Gain | Strength Building | Fat Loss | Healthy Lifestyle | Balanced Diet | High Protein | Diabetes Friendly | Heart Healthy)
- Available Pantry Ingredients (if provided): ${JSON.stringify(pantryIngredients)}
- Exclude Eaten Foods Today: ${JSON.stringify(loggedTodayNames)}

RANKING OUTPUT:
1. 🥇 Best Match
2. 🥈 Great Alternative
3. 🥉 Quick Healthy Option

Respond strictly with a raw JSON object:
{
  "recommendations": [
    {
      "name": "Authentic Dish Name",
      "servingSize": "Portion details",
      "shortTag": "Short 3-4 word tag (e.g. High Protein)",
      "badgeList": ["High Protein", "Iron Rich", "Low Fat"],
      "calories": 350,
      "protein": 18,
      "carbs": 52,
      "fat": 8,
      "fiber": 7,
      "iron_mg": 3.5,
      "calcium_mg": 90,
      "matchScore": 96,
      "matchBadge": "🥇 Best Match",
      "prepTime": "10 mins",
      "estimatedCost": "₹40",
      "whyHelps": "Concise 1-sentence benefit statement.",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }
  ]
}
DO NOT include markdown backticks outside JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Generate top 3 recommendations for preference: ${preference}, goal: ${goal}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
      return NextResponse.json({ recommendations: fallbackCards });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      try {
        const parsed = JSON.parse(replyText.trim());
        if (parsed.recommendations && parsed.recommendations.length > 0) {
          return NextResponse.json(parsed);
        }
      } catch {
        return NextResponse.json({ recommendations: fallbackCards });
      }
    }

    return NextResponse.json({ recommendations: fallbackCards });
  } catch (err: any) {
    console.error("AI Nutrition Assistant API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
