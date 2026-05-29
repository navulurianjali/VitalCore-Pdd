import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
        { 
          error: "Gemini API key is missing. Please configure GEMINI_API_KEY in your environment variables to enable active AI image scanning." 
        },
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
      console.warn("Gemini vision endpoint failed", errorData);
      return NextResponse.json(
        { error: "AI Scanner failed to process this image. Please ensure the image is clear and try again.", details: errorData },
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
    console.error("Food Scanner API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during image analysis" },
      { status: 500 }
    );
  }
}

// Fallback high-fidelity scan result to ensure 100% reliability and robust user experience
function generateFallbackVisionScan() {
  return {
    foodName: "Steamed Idli with Sambar & Chutney",
    confidence: "low_estimated",
    mealType: "South Indian breakfast",
    portionSize: "1 plate (3 idlis with bowls of sambar/chutney)",
    ingredients: ["Fermented rice & black lentil batter", "Pigeon peas (Toor dal)", "Drumstick", "Coconut", "Mustard seeds"],
    calories: 310,
    protein: 10,
    carbs: 58,
    fat: 4,
    sugar: 3,
    sodium: 480,
    fiber: 5,
    healthScore: 88,
    unhealthyAdditives: ["None detected"],
    alternatives: ["Oats Idli", "Ragi Roti"],
    insights: [
      "Likely detected a traditional fermented South Indian plate.",
      "Idlis are easily digestible and provide steady morning glucose.",
      "Sambar adds clean plant protein and dietary fiber."
    ],
    nutritionRecommendation: "This appears to be a healthy, low-fat meal. The slow-release carbs will keep your morning focus high and sustain recovery."
  };
}
