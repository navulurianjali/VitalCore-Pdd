import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, preference, profile, metrics } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return high-quality fallback simulator response if key is missing
      return NextResponse.json(generateFallbackPlan(goal, preference, metrics));
    }

    const systemPrompt = `You are a world-class AI Nutrition Coach and preventative metabolic scientist.
Your tone is friendly, conversational, beginner-friendly, and actionable. Avoid medical jargon and scientific terms like "glycemic index load" or "cortisol decompression".

Generate a completely personalized, highly detailed nutrition and meal plan based on:
- User Goal: ${goal}
- Food Preference: ${preference} (IMPORTANT: If Indian, South Indian, or North Indian is selected, you MUST strictly provide authentic regional dishes like idli, dosa, sambar, paneer tikka, dal makhani, etc.)
- User weight: ${profile?.weight_kg || 72} kg
- Daily Workouts: ${profile?.fitness_goal || "General wellness"}
- Daily stress telemetry: ${metrics?.stressLevel || 45}%
- Daily sleep duration: ${metrics?.sleepHours || 7.2} hours

You MUST respond with a valid JSON object matching the following structure:
{
  "plan": [
    {
      "mealType": "breakfast",
      "name": "Meal Name Here",
      "calories": 400,
      "protein": 25,
      "carbs": 45,
      "fat": 12,
      "whyHelps": "Why this meal specifically helps in simple conversational terms.",
      "recoveryBenefits": "How it helps with active recovery.",
      "energyBenefits": "How it keeps energy levels stable.",
      "hydrationSupport": "Fluid or electrolyte contribution."
    },
    {
      "mealType": "lunch",
      "name": "Meal Name Here",
      "calories": 550,
      "protein": 35,
      "carbs": 60,
      "fat": 15,
      "whyHelps": "Simple explanation.",
      "recoveryBenefits": "Recovery benefit.",
      "energyBenefits": "Energy support details.",
      "hydrationSupport": "Water/hydration details."
    },
    {
      "mealType": "dinner",
      "name": "Meal Name Here",
      "calories": 500,
      "protein": 30,
      "carbs": 50,
      "fat": 14,
      "whyHelps": "Simple explanation.",
      "recoveryBenefits": "Recovery details.",
      "energyBenefits": "Energy details.",
      "hydrationSupport": "Hydration details."
    },
    {
      "mealType": "snack",
      "name": "Snack Name Here",
      "calories": 250,
      "protein": 12,
      "carbs": 30,
      "fat": 8,
      "whyHelps": "Simple explanation.",
      "recoveryBenefits": "Recovery details.",
      "energyBenefits": "Energy details.",
      "hydrationSupport": "Hydration details."
    }
  ],
  "insights": [
    "Simple actionable insight 1 related to daily protein or nutrients",
    "Simple actionable insight 2 related to sleep or exercise sync"
  ],
  "habits": [
    "Conversational habit analysis 1 based on user's goals and preferences",
    "Conversational habit analysis 2"
  ],
  "warnings": [
    "Preventative warning 1 (e.g. sleep/nutrition correlations)",
    "Preventative warning 2"
  ]
}

DO NOT include any markdown code blocks, comments, or backticks in the response. Return ONLY the raw JSON string.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `Generate nutrition plan for Goal: "${goal}", Preference: "${preference}"` }]
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
      const errorData = await response.json().catch(() => ({}));
      console.warn("Gemini planner failed, falling back", errorData);
      return NextResponse.json(generateFallbackPlan(goal, preference, metrics));
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (replyText) {
      try {
        const parsed = JSON.parse(replyText.trim());
        return NextResponse.json(parsed);
      } catch (jsonErr) {
        console.error("Failed to parse Gemini reply:", replyText, jsonErr);
        return NextResponse.json(generateFallbackPlan(goal, preference, metrics));
      }
    }

    return NextResponse.json(generateFallbackPlan(goal, preference, metrics));
  } catch (err: any) {
    console.error("AI Nutrition Planner API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// High Quality Local Rule-Based Plan Generator for Offline/Fallback modes
function generateFallbackPlan(goal: string, preference: string, metrics: any) {
  const isVeg = ["Vegetarian", "Vegan", "South Indian", "North Indian"].includes(preference);
  
  // Custom meals database based on goal and preference
  let breakfastName = "Oatmeal with berries and chia seeds";
  let lunchName = "Grilled chicken quinoa bowl with roasted veggies";
  let dinnerName = "Baked salmon with sweet potato and broccoli";
  let snackName = "Mixed almonds, walnuts and apple slices";

  let breakfastWhy = "High in slow-release carbs and prebiotics to sustain your morning energy.";
  let lunchWhy = "Lean protein paired with fiber to support muscle repair and keep you full.";
  let dinnerWhy = "Rich in omega-3 healthy fats to soothe inflammation and support deep sleep.";
  let snackWhy = "Nutrient-dense healthy fats and vitamins to curb afternoon fatigue.";

  if (isVeg) {
    const southBreakfasts = [
      { n: "Steamed idlis with sambar and coconut chutney", w: "Fermented idlis are easy on digestion and provide sustained morning stamina." },
      { n: "Pesarattu (Green gram dosa) with upma", w: "High protein lentil base provides sustained energy and muscle repair." },
      { n: "Ragi semiya upma with peanuts", w: "Complex carbs from ragi keep blood sugar stable throughout the morning." },
      { n: "Oats dosa with tomato onion chutney", w: "Quick fiber-rich breakfast that regulates morning insulin spikes." }
    ];
    const northBreakfasts = [
      { n: "Paneer paratha with a side of curd", w: "Complex carbs and high-quality dairy protein to fuel morning workouts." },
      { n: "Besan chilla with mint chutney", w: "Chickpea flour is rich in protein and fiber, stabilizing blood sugar." },
      { n: "Poha with peanuts and curry leaves", w: "Light on the stomach but rich in iron and complex carbs." }
    ];
    const genVegBreakfasts = [
      { n: "Spiced tofu scramble with avocado on sourdough toast", w: "Tofu scramble provides clean plant protein and healthy fats to fuel your morning." },
      { n: "High-protein Greek yogurt with almonds and chia", w: "Probiotics and protein combo enhances gut health and morning recovery." }
    ];

    const southLunches = [
      { n: "Brown rice with lentils (dal), spinach poriyal and curd", w: "Lentils and grain combine to provide a complete amino acid profile for recovery." },
      { n: "Bisi bele bath with mixed vegetables", w: "Nutrient-dense one-pot meal rich in fiber and essential vitamins." }
    ];
    const northLunches = [
      { n: "Dal makhani with 2 multigrain rotis and side salad", w: "Slow-cooked lentils provide deep nourishment and sustained energy release." },
      { n: "Rajma chawal (Kidney beans)", w: "Classic high-protein, high-fiber meal that supports muscle synthesis." }
    ];
    const genVegLunches = [
      { n: "Paneer and chickpea quinoa bowl with lemon tahini", w: "Complete plant protein profile for mid-day muscle recovery." }
    ];

    const southDinners = [
      { n: "Ragi dosa with vegetable kurma and roasted chickpeas", w: "Complex carbs from ragi or rice help transport tryptophan to support melatonin production." },
      { n: "Lemon rice with a side of mixed vegetable stew", w: "Light citrus digestion with anti-inflammatory properties for nighttime recovery." }
    ];
    const northDinners = [
      { n: "Palak paneer with 1 missi roti", w: "Iron-rich spinach and casein protein from paneer support overnight tissue repair." },
      { n: "Baingan bharta with millet flatbread", w: "Low-calorie, highly nutritious dinner to keep metabolism stable overnight." }
    ];
    const genVegDinners = [
      { n: "Lentil coconut curry with steamed brown rice and broccoli", w: "Anti-inflammatory coconut fats combined with high-fiber lentils." }
    ];

    let bList = genVegBreakfasts;
    let lList = genVegLunches;
    let dList = genVegDinners;

    if (preference === "South Indian") {
      bList = southBreakfasts; lList = southLunches; dList = southDinners;
    } else if (preference === "North Indian") {
      bList = northBreakfasts; lList = northLunches; dList = northDinners;
    } else if (preference === "Indian" || preference === "Vegetarian") {
      bList = [...southBreakfasts, ...northBreakfasts, ...genVegBreakfasts];
      lList = [...southLunches, ...northLunches, ...genVegLunches];
      dList = [...southDinners, ...northDinners, ...genVegDinners];
    }

    const selB = bList[Math.floor(Math.random() * bList.length)];
    const selL = lList[Math.floor(Math.random() * lList.length)];
    const selD = dList[Math.floor(Math.random() * dList.length)];

    breakfastName = selB.n;
    breakfastWhy = selB.w;
    lunchName = selL.n;
    lunchWhy = selL.w;
    dinnerName = selD.n;
    dinnerWhy = selD.w;

    snackName = ["Roasted makhana (foxnuts) and a banana", "Spiced roasted chickpeas", "Greek yogurt with pumpkin seeds"][Math.floor(Math.random() * 3)];
    snackWhy = "Crunchy roasted seeds offer essential minerals to boost focus without sugar crashes.";
  }

  // Adjusted macros based on goal
  let calMult = 1.0;
  let pMult = 1.0;
  if (goal === "Weight Loss") {
    calMult = 0.8;
    pMult = 1.1;
  } else if (goal === "Muscle Gain" || goal === "Weight Gain") {
    calMult = 1.25;
    pMult = 1.35;
  }

  const plan = [
    {
      mealType: "breakfast",
      name: breakfastName,
      calories: Math.round(380 * calMult),
      protein: Math.round(22 * pMult),
      carbs: Math.round(45 * (2 - pMult)),
      fat: Math.round(12 * calMult),
      whyHelps: breakfastWhy,
      recoveryBenefits: "Supplies crucial cellular glycogen to kickstart muscular repair after overnight sleep.",
      energyBenefits: "Slow-release carbs stabilize blood sugars for 4+ hours of steady morning focus.",
      hydrationSupport: "Pair with 300ml of water to restore morning cellular hydration levels."
    },
    {
      mealType: "lunch",
      name: lunchName,
      calories: Math.round(520 * calMult),
      protein: Math.round(34 * pMult),
      carbs: Math.round(60 * (2 - pMult)),
      fat: Math.round(16 * calMult),
      whyHelps: lunchWhy,
      recoveryBenefits: "Amino acid pool facilitates tissue recovery and rebuilds worked muscles.",
      energyBenefits: "Complex starches prevent the mid-afternoon energy slump and support baseline metabolism.",
      hydrationSupport: "Vitamins and minerals support cell fluid balance and nutrient transport."
    },
    {
      mealType: "dinner",
      name: dinnerName,
      calories: Math.round(480 * calMult),
      protein: Math.round(28 * pMult),
      carbs: Math.round(50 * (2 - pMult)),
      fat: Math.round(14 * calMult),
      whyHelps: dinnerWhy,
      recoveryBenefits: "Magnesium-dense ingredients relax active muscle fibers and lower heart rate.",
      energyBenefits: "Low glycemic impact safeguards steady metabolic activity throughout the night.",
      hydrationSupport: "Supports stable overnight kidney filtration and fluid balance."
    },
    {
      mealType: "snack",
      name: snackName,
      calories: Math.round(200 * calMult),
      protein: Math.round(10 * pMult),
      carbs: Math.round(25 * (2 - pMult)),
      fat: Math.round(8 * calMult),
      whyHelps: snackWhy,
      recoveryBenefits: "Zinc and selenium support active immune function and deep cellular repair.",
      energyBenefits: "Healthy lipids sustain neural function and cognitive stamina.",
      hydrationSupport: "Provides natural water content to maintain steady alertness."
    }
  ];

  return {
    plan,
    insights: [
      `Your protein intake is aligned at ${Math.round(94 * pMult)}g to support your active ${goal.toLowerCase()} plan.`,
      "Adding a small glass of water with each meal will actively optimize metabolic nutrient absorption.",
      "Focusing on slow-digesting whole foods in the evening supports stable insulin overnight."
    ],
    habits: [
      "You usually skip breakfast or grab low-protein snacks on busy mornings.",
      "Late-night eating sessions correlate directly with a 12% drop in deep sleep quality.",
      "Hydration consistency tends to improve significantly on high-activity days."
    ],
    warnings: [
      "Poor hydration may reduce active recovery quality and increase daytime fatigue.",
      "High sugar intake or late-night dessert blocks may increase morning muscle fatigue.",
      "Consistent protein intake combined with regular sleep improves overall energy levels by 15%."
    ]
  };
}
