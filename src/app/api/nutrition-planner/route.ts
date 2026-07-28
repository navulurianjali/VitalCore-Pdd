import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { generateMultiMealRecommendations } from "@/utils/indianNutritionEngine";

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
    const preference = String(body.preference || "South Indian");
    const cuisine = String(body.cuisine || "South Indian");
    const mealCategory = String(body.mealCategory || "Breakfast");
    const queryPrompt = String(body.queryPrompt || "");
    const spiceLevel = String(body.spiceLevel || "Any");
    const maxPrepTimeMinutes = Number(body.maxPrepTimeMinutes) || 60;
    const budget = String(body.budget || "Any");
    const dislikedFoods = Array.isArray(body.dislikedFoods) ? body.dislikedFoods : [];
    const favoriteFoods = Array.isArray(body.favoriteFoods) ? body.favoriteFoods : [];
    const daySeed = Number(body.daySeed) || Date.now();

    const fallbackCards = generateMultiMealRecommendations({
      goal,
      preference,
      cuisine,
      mealCategory,
      queryPrompt,
      spiceLevel,
      maxPrepTimeMinutes,
      budget,
      dislikedFoods,
      favoriteFoods,
      userWeightKg: profile?.weight_kg || 70,
      daySeed
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        recommendations: fallbackCards,
        insights: [`Formulated top recommendations for ${goal}.`],
        habits: ["Pairing citrus fruits with lentils boosts iron absorption."],
        warnings: ["Maintain hydrated intake before meals."]
      });
    }

    const systemPrompt = `You are a world-class South Indian & Clinical AI Nutritionist.
Your task is to generate top authentic, familiar Indian meal recommendations matching user intent and profile.

User Request:
- User Prompt: "${queryPrompt}"
- Meal Category: ${mealCategory}
- Cuisine Preference: ${cuisine} (PRIORITIZE South Indian: Idli, Dosa, Pesarattu, Upma, Pongal, Ragi Mudde, Ragi Dosa, Puttu, Appam, Uttapam, Poori, Chapati, Phulka, Lemon Rice, Curd Rice, Pulihora, Bisi Bele Bath, Sambar Rice, Rasam Rice, Dal Rice, Rajma Rice, Chole, Veg Kurma, Paneer Curry, Egg Curry, Fish Curry, Chicken Curry, Andhra Meals, Millet Meals, Sprouts, Sundal, Makhana, Buttermilk, Lassi, Tender Coconut Water, etc.)
- Dietary Preference: ${preference}
- Health Goal: ${goal}
- Disliked Foods (EXCLUDE): ${JSON.stringify(dislikedFoods)}
- Favorite Foods (PRIORITIZE): ${JSON.stringify(favoriteFoods)}

Respond strictly with a raw JSON object matching:
{
  "recommendations": [
    {
      "name": "Authentic Indian Dish Name",
      "imageUrl": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      "servingSize": "Portion details",
      "shortTag": "Short 3-4 word tag (e.g. High Protein)",
      "badgeList": ["High Protein", "Iron", "Low Fat"],
      "calories": 350,
      "protein": 18,
      "carbs": 52,
      "fat": 8,
      "fiber": 7,
      "iron_mg": 3.5,
      "calcium_mg": 90,
      "matchScore": 96,
      "matchBadge": "96% Top AI Choice",
      "prepTime": "10 mins",
      "estimatedCost": "₹40",
      "whyHelps": "Concise 1-sentence benefit statement.",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }
  ]
}
DO NOT include markdown backticks or extra text outside JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Generate top recommendations for: ${queryPrompt || mealCategory}` }] }],
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
        return NextResponse.json(parsed);
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
