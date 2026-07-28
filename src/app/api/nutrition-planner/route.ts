import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { 
  generateFullDailyDietPlan,
  generateIngredientBasedRecipes
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

    const mode = String(body.mode || "diet_plan"); // "diet_plan" | "cook_with_pantry"
    const goal = String(body.goal || "Weight Loss");
    const preference = String(body.preference || "No Preference");
    const pantryIngredients = Array.isArray(body.pantryIngredients) ? body.pantryIngredients : [];
    const loggedTodayNames = Array.isArray(body.loggedTodayNames) ? body.loggedTodayNames : [];

    if (mode === "cook_with_pantry") {
      const recipes = generateIngredientBasedRecipes(pantryIngredients);
      return NextResponse.json({ recipes });
    }

    // MODE 1: DIET PLAN GENERATOR
    const dailyPlan = generateFullDailyDietPlan({
      goal,
      preference,
      loggedTodayNames
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ dailyPlan });
    }

    const systemPrompt = `You are a certified clinical nutrition coach.
Generate a complete structured 4-meal daily diet plan for goal: ${goal}, preference: ${preference}.

CRITICAL NUTRITION RULES:
- Weight Loss / Fat Loss: Lower calories, high protein, high fiber.
- Muscle Gain / Lean Muscle / Strength: High protein (120g+ daily total), calorie surplus/balance.
- Diabetes Friendly: Low GI foods, high fiber.
- Heart Healthy: Low sodium, healthy fats.

Respond strictly with a raw JSON object:
{
  "dailyPlan": {
    "goal": "${goal}",
    "preference": "${preference}",
    "totalCalories": 1650,
    "totalProtein": 110,
    "totalCarbs": 160,
    "totalFat": 45,
    "totalFiber": 32,
    "breakfast": {
      "mealType": "breakfast",
      "name": "Vegetable Oats Porridge with 2 Boiled Eggs",
      "dietType": "eggetarian",
      "prepTime": "10 mins",
      "estimatedCost": "₹45",
      "shortTag": "Low Calorie High Fiber Opener",
      "badgeList": ["Weight Loss Friendly", "High Fiber"],
      "calories": 320,
      "protein": 18,
      "carbs": 38,
      "fat": 9,
      "fiber": 7,
      "iron_mg": 3.2,
      "calcium_mg": 90,
      "servingSize": "1 bowl Oats + 2 Eggs",
      "whyHelps": "Soluble beta-glucan fiber slows gastric emptying.",
      "ingredients": ["oats", "eggs", "vegetables"],
      "instructions": ["Cook oats with veggies.", "Boil eggs."]
    },
    "lunch": {
      "mealType": "lunch",
      "name": "Grilled Chicken Breast with Brown Rice",
      "dietType": "non-veg",
      "prepTime": "20 mins",
      "estimatedCost": "₹120",
      "shortTag": "Lean Muscle Power",
      "badgeList": ["High Protein", "Lean Muscle"],
      "calories": 520,
      "protein": 44,
      "carbs": 52,
      "fat": 10,
      "fiber": 6,
      "iron_mg": 3.8,
      "calcium_mg": 60,
      "servingSize": "150g Chicken + 1 cup Brown Rice",
      "whyHelps": "Delivers maximum leucine for post-workout muscle repair.",
      "ingredients": ["chicken", "rice", "salad"],
      "instructions": ["Grill chicken breast.", "Serve with brown rice."]
    },
    "snack": {
      "mealType": "snack",
      "name": "Greek Yogurt Bowl with Almonds",
      "dietType": "veg",
      "prepTime": "5 mins",
      "estimatedCost": "₹60",
      "shortTag": "Probiotic Muscle Snack",
      "badgeList": ["High Protein", "Probiotics"],
      "calories": 220,
      "protein": 16,
      "carbs": 14,
      "fat": 9,
      "fiber": 4,
      "iron_mg": 1.5,
      "calcium_mg": 240,
      "servingSize": "1 cup Greek Yogurt + Almonds",
      "whyHelps": "Casein protein maintains positive nitrogen balance.",
      "ingredients": ["curd", "almonds"],
      "instructions": ["Top Greek yogurt with nuts."]
    },
    "dinner": {
      "mealType": "dinner",
      "name": "Paneer Vegetable Stir-Fry",
      "dietType": "veg",
      "prepTime": "15 mins",
      "estimatedCost": "₹75",
      "shortTag": "Slow Digesting Casein Dinner",
      "badgeList": ["Muscle Repair", "Low Carb"],
      "calories": 380,
      "protein": 24,
      "carbs": 16,
      "fat": 22,
      "fiber": 6,
      "iron_mg": 3.1,
      "calcium_mg": 350,
      "servingSize": "150g Paneer + Vegetables",
      "whyHelps": "Slow casein protein feeds muscle tissue through night sleep.",
      "ingredients": ["paneer", "peppers", "spinach"],
      "instructions": ["Sauté paneer with peppers."]
    }
  }
}
DO NOT include markdown backticks outside JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Generate full daily diet plan for goal: ${goal}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
      return NextResponse.json({ dailyPlan });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      try {
        const parsed = JSON.parse(replyText.trim());
        if (parsed.dailyPlan) {
          return NextResponse.json(parsed);
        }
      } catch {
        return NextResponse.json({ dailyPlan });
      }
    }

    return NextResponse.json({ dailyPlan });
  } catch (err: any) {
    console.error("AI Nutrition Assistant API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
