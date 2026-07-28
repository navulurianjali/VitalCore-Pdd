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
        insights: [
          `Formulated 6-10 ranked South Indian AI recommendations for ${goal}.`,
          `Filtered out ${dislikedFoods.length} disliked foods and prioritized your favorites.`
        ],
        habits: [
          "Pairing citrus fruits (Vitamin C) with iron-rich lentils or poha triples iron absorption.",
          "Drink 300ml warm water 15 minutes before main meals to ease digestive kinetics."
        ],
        warnings: [
          "Avoid consuming heavy sugar coffee/tea right after high-iron meals to prevent nutrient binding."
        ]
      });
    }

    const systemPrompt = `You are a world-class South Indian & Clinical AI Nutritionist.
Your task is to generate 6 to 10 distinct, ranked meal recommendation cards based on user intent and profile.

User Request:
- User Prompt / Desire: "${queryPrompt}"
- Selected Meal Type: ${mealCategory}
- Cuisine Preference: ${cuisine} (PRIORITIZE South Indian: Idli, Dosa, Pesarattu, Upma, Pongal, Ragi Mudde, Ragi Dosa, Puttu, Appam, Uttapam, Poori, Chapati, Phulka, Lemon Rice, Tomato Rice, Curd Rice, Pulihora, Bisi Bele Bath, Sambar Rice, Rasam Rice, Dal Rice, Rajma Rice, Chole, Veg Kurma, Paneer Curry, Egg Curry, Fish Curry, Chicken Curry, Andhra Meals, Millet Meals, Sprouts, Sundal, Boiled Corn, Groundnuts, Buttermilk, Lassi, Tender Coconut Water, etc.)
- Dietary Preference: ${preference}
- Health Goal: ${goal}
- Spice Level: ${spiceLevel}
- Max Prep Time: ${maxPrepTimeMinutes} mins
- Budget: ${budget}
- Disliked Foods (EXCLUDE ENTIRELY): ${JSON.stringify(dislikedFoods)}
- Favorite Foods (PRIORITIZE): ${JSON.stringify(favoriteFoods)}
- Body Weight: ${profile?.weight_kg || 70} kg

CRITICAL INSTRUCTIONS:
1. Provide 6 to 10 authentic, familiar Indian food recommendations ranked from Best Match to Alternative Choices.
2. DO NOT recommend foreign/Western foods (like oats, sandwiches, quinoa salads). Stick to realistic Indian dishes.
3. Every recommendation MUST include:
   - "name": Authentic Indian Dish Name
   - "servingSize": Portion details (e.g. "3 Idlis + 1 cup Sambar")
   - "calories", "protein", "carbs", "fat", "fiber", "iron_mg", "calcium_mg"
   - "matchScore": integer percentage (e.g. 96)
   - "matchBadge": string (e.g. "96% Top AI Choice" or "90% High Protein Match")
   - "prepTime": string (e.g. "10 mins")
   - "estimatedCost": string (e.g. "Low (₹30-50)")
   - "whyHelps": Conversational explanation of why it fits the user request
   - "ingredients": array of authentic ingredient strings
   - "instructions": array of cooking steps

Respond strictly with a raw JSON object matching:
{
  "recommendations": [ ...6 to 10 cards... ],
  "insights": ["Insight 1", "Insight 2"],
  "habits": ["Habit 1"],
  "warnings": ["Warning 1"]
}
DO NOT include markdown backticks or commentary outside JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Generate 6-10 ranked recommendations for: ${queryPrompt || mealCategory}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
      return NextResponse.json({ recommendations: fallbackCards, insights: ["AI fallback active."], habits: [], warnings: [] });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      try {
        const parsed = JSON.parse(replyText.trim());
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ recommendations: fallbackCards, insights: ["AI parse fallback active."], habits: [], warnings: [] });
      }
    }

    return NextResponse.json({ recommendations: fallbackCards, insights: [], habits: [], warnings: [] });
  } catch (err: any) {
    console.error("AI Nutrition Assistant API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
