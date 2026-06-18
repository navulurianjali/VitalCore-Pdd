import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// VULN-03 FIX: Upstash Redis rate limiter (10 scans/min — image AI is expensive)
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });
}

// In-memory fallback
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

// VULN-09 FIX: MIME type allowlist — reject any unlisted types
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
// Max base64 size = ~7MB decoded (5MB * 4/3 ratio + buffer)
const MAX_BASE64_LENGTH = 7_000_000;


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

    // VULN-03 FIX: Rate limit check
    const isAllowed = await checkRateLimit(user.id);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before scanning again." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }
    
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image payload provided. Please upload or capture an image." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please configure GEMINI_API_KEY in your environment variables." },
        { status: 400 }
      );
    }

    // Extract mimeType and base64Data
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats are JPEG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // VULN-09 FIX: Enforce MIME type allowlist and server-side size limit
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image type. Please upload JPEG, PNG, or WEBP only." },
        { status: 400 }
      );
    }
    if (base64Data.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "Image is too large. Maximum allowed size is 5MB." },
        { status: 413 }
      );
    }

    const systemPrompt = `You are a professional, helpful, and highly intelligent AI Nutrition Vision Scanner.
Your job is to analyze the food image using a layered Multi-Stage Food Analysis Pipeline:
1. DETECT meal type & cuisine style (Indian, South Indian, North Indian, Fast Food, Salads, Rice dishes, Beverages, Desserts, Homemade meals, etc.).
2. IDENTIFY visible ingredients or likely inferred ingredients based on cuisine type.
3. ESTIMATE portion size visually based on plate proportions.
4. ESTIMATE nutrition macros (calories, protein, carbs, fats, sugars, sodium, fiber).
5. GENERATE friendly, actionable wellness and recovery insights.

CRITICAL INSTRUCTIONS:
- PRIORITIZE BEST ESTIMATIONS OVER FAILURE. 
- If the image is blurry, out-of-focus, partially obscured, or low-light, DO NOT fail or say "Could not identify". Instead, INFER the likely foods (e.g. "Likely detected: Rice and Dal"), set the "confidence" field to "low_estimated", and output your best approximation of the ingredients and macros.
- Only return a true failure JSON if the image is completely pitch black, corrupted, or obviously does not contain any food or beverage whatsoever.

You MUST output strictly a valid JSON object matching this structure:
{
  "foodName": "Name of the detected food/meal (or best guess if blurry)",
  "confidence": "high" | "medium" | "low_estimated",
  "mealType": "e.g. South Indian breakfast, protein lunch, homemade dinner, fast food, dessert, snack",
  "portionSize": "e.g. 1 plate (approx 350g) or estimated portion",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "calories": 420,
  "protein": 18,
  "carbs": 52,
  "fat": 14,
  "sugar": 5,
  "sodium": 340,
  "fiber": 6,
  "healthScore": 85,
  "unhealthyAdditives": ["Additive 1 (or none)"],
  "alternatives": ["Alternative choice 1", "Alternative choice 2"],
  "insights": [
    "Simple, actionable, user-friendly wellness insight 1",
    "Actionable wellness insight 2"
  ],
  "nutritionRecommendation": "Helpful, conversational 1-2 sentence AI coach recommendation in plain simple language."
}

DO NOT return any markdown code blocks, backticks, or text outside of the JSON. Return only the raw JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // VULN-12 FIX: Log Gemini errors server-side only, do not return details to client
      console.warn("Gemini vision endpoint failed", errorData);
      return NextResponse.json(
        { error: "AI Scanner failed to process this image. Please try with a clearer image." },
        { status: 500 }
      );
    }

    const data = await response.json();
    let replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    replyText = replyText.trim();

    try {
      const parsedResult = JSON.parse(replyText);
      return NextResponse.json({ result: parsedResult });
    } catch (parseError) {
      console.warn("JSON parse error on Gemini reply:", replyText);
      return NextResponse.json(
        { error: "AI returned an invalid response format. Please try scanning the food again." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    // VULN-12 FIX: Never expose raw error messages to the client
    console.error("Food Scanner API Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred during image analysis. Please try again." },
      { status: 500 }
    );
  }
}

