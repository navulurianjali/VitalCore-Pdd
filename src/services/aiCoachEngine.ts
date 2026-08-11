/**
 * VitalCore AI — Rule, Keyword & Intent-Based AI Coach Engine
 * Local response generation using real user telemetry & profile data.
 * Zero external API dependencies.
 */

export interface UserProfileContext {
  full_name?: string | null;
  age?: number | null;
  biological_age?: number | null;
  gender?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  bmi?: number | null;
  fitness_level?: string | null;
  fitness_goal?: string | null;
  dietary_preferences?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  previous_injuries?: string | null;
  sleep_problems?: boolean | null;
  active_mode?: string | null;
  ai_coach_style?: string | null;
  unit_system?: string | null;
}

export interface HealthMetricsContext {
  caloriesConsumed?: number | null;
  caloriesTarget?: number | null;
  caloriesBurned?: number | null;
  hydrationMl?: number | null;
  hydrationTarget?: number | null;
  steps?: number | null;
  stepsTarget?: number | null;
  sleepHours?: number | null;
  sleepTarget?: number | null;
  sleepQuality?: number | null;
  stressLevel?: number | null;
  recoveryPercentage?: number | null;
  fatigueScore?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  mood?: string | null;
}

export type IntentCategory =
  | 'FITNESS'
  | 'FATIGUE'
  | 'CALORIES'
  | 'FOOD_NUTRITION'
  | 'HYDRATION'
  | 'SLEEP'
  | 'WEIGHT'
  | 'BMI'
  | 'WORKOUT'
  | 'RECOVERY'
  | 'HEALTHY_HABITS'
  | 'GENERAL_WELLNESS'
  | 'MEDICAL_DISCLAIMER'
  | 'UNKNOWN';

interface IntentRule {
  intent: IntentCategory;
  keywords: string[];
  patterns: RegExp[];
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'MEDICAL_DISCLAIMER',
    keywords: [
      'chest pain', 'shortness of breath', 'difficulty breathing', 'severe headache',
      'numbness', 'fainting', 'high fever', 'dizziness', 'blood', 'heart attack',
      'stroke', 'emergency', 'diagnose', 'disease', 'prescription', 'medicine'
    ],
    patterns: [
      /chest\s+pain/i, /cannot\s+breathe/i, /severe\s+pain/i, /diagnose\s+me/i, /heart\s+attack/i
    ]
  },
  {
    intent: 'FATIGUE',
    keywords: [
      'fatigue', 'tired', 'tiredness', 'exhausted', 'low energy', 'weak', 'sleepy',
      'no energy', 'drained', 'lethargic', 'slump', 'burnout', 'exhaustion'
    ],
    patterns: [
      /why\s+am\s+i\s+(so\s+)?(tired|exhausted)/i, /feeling\s+(tired|weak|drained)/i,
      /low\s+energy/i, /what\s+can\s+i\s+do\s+about\s+fatigue/i, /feel\s+exhausted/i
    ]
  },
  {
    intent: 'CALORIES',
    keywords: [
      'calorie', 'calories', 'kcal', 'intake', 'food calories', 'daily calories',
      'calorie goal', 'calorie target', 'deficit', 'surplus', 'caloric'
    ],
    patterns: [
      /how\s+many\s+calories/i, /what\s+is\s+my\s+calorie\s+(intake|target|goal)/i,
      /how\s+much\s+(did|can)\s+i\s+eat/i, /calorie\s+(limit|remaining|left)/i
    ]
  },
  {
    intent: 'HYDRATION',
    keywords: [
      'water', 'hydration', 'drink', 'fluids', 'dehydration', 'thirst', 'thirsty',
      'fluid', 'liters', 'ml', 'ounces'
    ],
    patterns: [
      /how\s+much\s+water/i, /haven'?t\s+had\s+enough\s+water/i, /improve\s+hydration/i,
      /feel\s+dehydrated/i, /water\s+(intake|target|remaining)/i
    ]
  },
  {
    intent: 'SLEEP',
    keywords: [
      'sleep', 'sleeping', 'insomnia', 'bedtime', 'rest', 'asleep', 'wake up',
      'sleep quality', 'sleep duration', 'sleep hygiene', 'nap'
    ],
    patterns: [
      /how\s+(can|should)\s+i\s+sleep\s+better/i, /slept\s+(badly|poorly)/i,
      /good\s+bedtime/i, /insomnia/i, /sleep\s+(hours|target|quality)/i
    ]
  },
  {
    intent: 'BMI',
    keywords: [
      'bmi', 'body mass index', 'height weight ratio', 'underweight', 'overweight',
      'obese', 'normal weight', 'body mass'
    ],
    patterns: [
      /what\s+is\s+my\s+bmi/i, /calculate\s+bmi/i, /is\s+my\s+bmi/i, /ideal\s+bmi/i
    ]
  },
  {
    intent: 'WEIGHT',
    keywords: [
      'weight', 'lose weight', 'gain weight', 'fat loss', 'muscle gain',
      'weigh', 'scale', 'weight goal', 'weight loss', 'body weight'
    ],
    patterns: [
      /how\s+to\s+(lose|gain)\s+weight/i, /weight\s+loss/i, /current\s+weight/i,
      /ideal\s+weight/i, /manage\s+weight/i
    ]
  },
  {
    intent: 'FOOD_NUTRITION',
    keywords: [
      'food', 'nutrition', 'protein', 'carbs', 'carbohydrates', 'fat', 'meal',
      'breakfast', 'lunch', 'dinner', 'snack', 'healthy food', 'diet', 'eating',
      'recipe', 'macronutrients', 'macros', 'fiber', 'vitamins'
    ],
    patterns: [
      /what\s+should\s+i\s+eat/i, /suggest\s+a\s+(healthy\s+)?(breakfast|lunch|dinner|snack)/i,
      /high\s+in\s+protein/i, /what\s+to\s+eat\s+after\s+workout/i, /healthy\s+diet/i
    ]
  },
  {
    intent: 'WORKOUT',
    keywords: [
      'workout', 'gym', 'training', 'sets', 'reps', 'dumbbell', 'barbell',
      'cardio', 'strength', 'hiit', 'squat', 'bench', 'pushup', 'pullup'
    ],
    patterns: [
      /suggest\s+a\s+workout/i, /what\s+workout/i, /gym\s+routine/i,
      /strength\s+training/i, /cardio\s+routine/i
    ]
  },
  {
    intent: 'FITNESS',
    keywords: [
      'fitness', 'exercise', 'activity', 'fit', 'stronger', 'stamina',
      'endurance', 'physical fitness', 'mobility', 'flexibility'
    ],
    patterns: [
      /how\s+can\s+i\s+improve\s+my\s+fitness/i, /become\s+fit/i,
      /suggest\s+an\s+exercise/i, /exercises\s+good\s+for\s+me/i
    ]
  },
  {
    intent: 'RECOVERY',
    keywords: [
      'recovery', 'sore', 'soreness', 'doms', 'stiff', 'stretching', 'foam roller',
      'massage', 'rest day', 'hrv', 'active recovery'
    ],
    patterns: [
      /feeling\s+sore/i, /muscle\s+soreness/i, /how\s+to\s+recover/i,
      /rest\s+day/i, /muscle\s+recovery/i
    ]
  },
  {
    intent: 'HEALTHY_HABITS',
    keywords: [
      'habits', 'routine', 'morning routine', 'evening routine', 'discipline',
      'posture', 'screen time', 'sitting', 'walk', 'steps'
    ],
    patterns: [
      /healthy\s+habits/i, /daily\s+routine/i, /improve\s+my\s+lifestyle/i,
      /reduce\s+sitting/i, /walking\s+habits/i
    ]
  },
  {
    intent: 'GENERAL_WELLNESS',
    keywords: [
      'wellness', 'health', 'longevity', 'vitality', 'wellbeing', 'stress',
      'mindset', 'energy', 'feeling good', 'healthy'
    ],
    patterns: [
      /overall\s+health/i, /feel\s+better/i, /general\s+wellness/i,
      /boost\s+vitality/i, /reduce\s+stress/i
    ]
  }
];

export function detectIntent(userPrompt: string): IntentCategory {
  const clean = userPrompt.toLowerCase().trim();
  if (!clean) return 'UNKNOWN';

  // 1. Check pattern regex matches first
  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(clean)) {
        return rule.intent;
      }
    }
  }

  // 2. Score keyword matches
  let bestIntent: IntentCategory = 'UNKNOWN';
  let maxScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (clean.includes(kw)) {
        score += kw.length > 4 ? 2 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestIntent = rule.intent;
    }
  }

  return maxScore > 0 ? bestIntent : 'UNKNOWN';
}

export function generateLocalAICoachResponse(
  userPrompt: string,
  profile?: UserProfileContext | null,
  metrics?: HealthMetricsContext | null
): string {
  const intent = detectIntent(userPrompt);

  const name = profile?.full_name || 'Explorer';
  const age = profile?.biological_age || profile?.age || 28;
  const weight = profile?.weight_kg || 70;
  const height = profile?.height_cm || 175;
  const goal = profile?.fitness_goal || 'General Wellness';
  const level = profile?.fitness_level || 'Intermediate';
  const dietPref = profile?.dietary_preferences || 'Standard Mixed';

  const caloriesTarget = metrics?.caloriesTarget || 2000;
  const caloriesConsumed = metrics?.caloriesConsumed || 0;
  const caloriesRemaining = Math.max(0, caloriesTarget - caloriesConsumed);

  const hydrationTarget = metrics?.hydrationTarget || 2500;
  const hydrationMl = metrics?.hydrationMl || 0;
  const hydrationRemaining = Math.max(0, hydrationTarget - hydrationMl);

  const sleepTarget = metrics?.sleepTarget || 8.0;
  const sleepHours = metrics?.sleepHours || 0;
  const sleepDeficit = Number((sleepTarget - sleepHours).toFixed(1));

  const stepsTarget = metrics?.stepsTarget || 10000;
  const stepsTaken = metrics?.steps || 0;
  const stepsRemaining = Math.max(0, stepsTarget - stepsTaken);

  // Height in meters for BMI
  const hMeters = height > 0 ? height / 100 : 1.75;
  const calculatedBmi = profile?.bmi ? Number(profile.bmi) : Number((weight / (hMeters * hMeters)).toFixed(1));

  switch (intent) {
    case 'MEDICAL_DISCLAIMER':
      return `⚠️ **Important Health Notice**\n\n` +
        `I am your VitalCore wellness assistant, but I am **not** a medical doctor and cannot diagnose medical conditions or prescribe treatments.\n\n` +
        `If you are experiencing severe symptoms such as chest pain, extreme shortness of breath, sudden numbness, or dizziness, please seek immediate assistance from a healthcare professional or contact emergency medical services right away.`;

    case 'FATIGUE': {
      let sleepContext = '';
      if (sleepHours > 0 && sleepHours < 6.5) {
        sleepContext = ` You logged **${sleepHours} hours** of sleep recently (target: **${sleepTarget} hours**), which significantly elevates fatigue and cortisol levels.`;
      } else if (hydrationMl < 1000) {
        sleepContext = ` You have only logged **${hydrationMl}ml** of water today. Mild dehydration is a primary trigger for mental and physical exhaustion.`;
      }

      return `Hi **${name}**, addressing fatigue requires optimizing sleep quality, hydration, and recovery status.${sleepContext}\n\n` +
        `**Key Recommendations to Restore Energy:**\n` +
        `• **Hydrate Immediately**: Drink at least 500ml of fresh water with electrolytes.\n` +
        `• **Active Micro-Break**: Take a brisk 10-minute walk to stimulate circulation and oxygen intake.\n` +
        `• **Sleep Discipline**: Aim for 7.5 to 8 hours of sleep tonight with a cooling room temperature (18-20°C).\n` +
        `• **Nutrition Check**: Avoid refined sugar spikes; pair complex carbs with lean protein.`;
    }

    case 'CALORIES':
      return `Here is your dynamic calorie status, **${name}**:\n\n` +
        `• **Daily Calorie Target**: **${caloriesTarget} kcal**\n` +
        `• **Calories Consumed Today**: **${caloriesConsumed} kcal**\n` +
        `• **Calories Remaining**: **${caloriesRemaining} kcal**\n\n` +
        (caloriesRemaining === 0
          ? `You have reached your daily calorie target! Focus on hydration and gentle recovery.`
          : `You have **${caloriesRemaining} kcal** left for today. Choose nutrient-dense foods rich in protein and fiber to maintain steady glycemic control and align with your **${goal}** goal.`);

    case 'HYDRATION':
      return `Here is your current fluid hydration update, **${name}**:\n\n` +
        `• **Daily Hydration Goal**: **${hydrationTarget} ml**\n` +
        `• **Logged Today**: **${hydrationMl} ml**\n` +
        `• **Remaining Target**: **${hydrationRemaining} ml**\n\n` +
        (hydrationRemaining === 0
          ? `Excellent work! You've met your daily hydration target of **${hydrationTarget} ml**.`
          : `Drink approximately **${Math.ceil(hydrationRemaining / 250)} glasses of water** (${hydrationRemaining} ml) throughout the rest of the day to support optimal cellular function and cognitive focus.`);

    case 'SLEEP':
      return `Here is your sleep telemetry breakdown, **${name}**:\n\n` +
        `• **Target Sleep**: **${sleepTarget} hours**\n` +
        `• **Recorded Sleep**: **${sleepHours} hours**` +
        (sleepDeficit > 0 ? ` (Deficit: **${sleepDeficit} hours**)` : ` (Met target!)`) + `\n` +
        `• **Sleep Quality Score**: **${metrics?.sleepQuality || 75}%**\n\n` +
        `**Sleep Optimization Tips:**\n` +
        `1. Keep your bedroom dark, quiet, and cool (around 18-20°C).\n` +
        `2. Stop screen exposure 45-60 minutes before bedtime.\n` +
        `3. Avoid caffeine intake past 2:00 PM to preserve deep slow-wave sleep.`;

    case 'BMI':
      return `Based on your profile metrics (**${weight} kg**, **${height} cm**), **${name}**:\n\n` +
        `• **Calculated Body Mass Index (BMI)**: **${calculatedBmi}**\n\n` +
        `**BMI Classification Context:**\n` +
        `• Underweight: < 18.5\n` +
        `• Normal weight: 18.5 – 24.9\n` +
        `• Overweight: 25.0 – 29.9\n` +
        `• Obese: ≥ 30.0\n\n` +
        `*Note: BMI is a broad indicator. For personalized body composition tracking (lean mass vs body fat), combine this with physical activity and waist-to-hip measurements.*`;

    case 'WEIGHT':
      return `Here is your weight management insight, **${name}**:\n\n` +
        `• **Current Weight**: **${weight} kg**\n` +
        `• **Current Goal**: **${goal}**\n` +
        `• **Fitness Level**: **${level}**\n\n` +
        `**Action Plan:**\n` +
        `• **For Fat Loss**: Maintain a moderate caloric deficit of 300-500 kcal below maintenance while keeping protein intake high (1.6-2.0g per kg of body weight).\n` +
        `• **For Muscle Gain**: Consistently progress in resistance exercises and consume a slight caloric surplus with adequate sleep recovery.`;

    case 'FOOD_NUTRITION':
      return `Nutrition guidance for **${name}** (Dietary Preference: **${dietPref}**):\n\n` +
        `• **Remaining Calories Today**: **${caloriesRemaining} kcal**\n` +
        `• **Calories Consumed**: **${caloriesConsumed} / ${caloriesTarget} kcal**\n\n` +
        `**Healthy Meal Suggestions:**\n` +
        `• **High-Protein Option**: Grilled chicken breast / paneer / tofu with mixed roasted vegetables and quinoa.\n` +
        `• **Balanced Snack**: Greek yogurt with mixed berries and seeds, or a handful of raw almonds.\n` +
        `• **Hydrating Option**: Fresh cucumber salad with olive oil dressing and lemon juice.`;

    case 'WORKOUT':
      return `Custom workout recommendation for **${name}** (Level: **${level}**, Goal: **${goal}**):\n\n` +
        `**Suggested Routine:**\n` +
        `1. **Warmup (5 mins)**: Jumping jacks, arm circles, bodyweight squats.\n` +
        `2. **Main Circuit (3 Sets)**:\n` +
        `   • Bodyweight / Dumbbell Squats — 12-15 reps\n` +
        `   • Push-ups (or knee push-ups) — 10-12 reps\n` +
        `   • Dumbbell Rows / Resistance Band Rows — 12 reps\n` +
        `   • Plank Hold — 45 seconds\n` +
        `3. **Cool-down (5 mins)**: Hamstring, quad, and chest stretches.`;

    case 'FITNESS':
      return `Fitness improvement recommendations for **${name}**:\n\n` +
        `• **Daily Step Progress**: **${stepsTaken} / ${stepsTarget} steps** (${stepsRemaining} steps remaining today)\n` +
        `• **Active Goal**: **${goal}**\n\n` +
        `**Core Fitness Principles:**\n` +
        `• **Progressive Overload**: Gradually increase resistance, repetitions, or workout duration weekly.\n` +
        `• **Consistency over Intensity**: Aim for at least 150 minutes of moderate exercise per week.\n` +
        `• **Balanced Training**: Mix resistance exercises with aerobic cardio and joint mobility routines.`;

    case 'RECOVERY':
      return `Recovery telemetry assessment for **${name}**:\n\n` +
        `• **HRV Recovery Score**: **${metrics?.recoveryPercentage || 85}%**\n` +
        `• **Fatigue Index**: **${metrics?.fatigueScore || 20} / 100**\n` +
        `• **Stress Level**: **${metrics?.stressLevel || 30}%**\n\n` +
        `**Optimal Recovery Protocol:**\n` +
        `• Perform 15 minutes of light stretching or foam rolling.\n` +
        `• Prioritize 8 hours of restful sleep and hydrate with 2.5L+ of water.\n` +
        `• Consume sufficient protein to support muscle protein synthesis.`;

    case 'HEALTHY_HABITS':
      return `Daily habit enhancement for **${name}**:\n\n` +
        `1. **Hydration First**: Drink a glass of water immediately upon waking up.\n` +
        `2. **Break Sedentary Time**: Stand and stretch for 2 minutes every hour of sitting.\n` +
        `3. **Consistent Sleep Window**: Go to bed and wake up at the same times every day.\n` +
        `4. **Daily Steps**: Complete **${stepsRemaining} more steps** today to reach your target of ${stepsTarget}.`;

    case 'GENERAL_WELLNESS':
      return `Hello **${name}**! Here is your preventive health overview:\n\n` +
        `• **Calories**: ${caloriesConsumed} / ${caloriesTarget} kcal\n` +
        `• **Hydration**: ${hydrationMl} / ${hydrationTarget} ml\n` +
        `• **Steps**: ${stepsTaken} / ${stepsTarget} steps\n` +
        `• **Sleep**: ${sleepHours} / ${sleepTarget} hours\n\n` +
        `You're on track with your **${goal}** goal. Focus on keeping your daily hydration high and getting quality sleep tonight.`;

    case 'UNKNOWN':
    default:
      return `I can currently help with fitness, nutrition, calories, hydration, sleep, recovery and healthy habits. Try asking me something related to one of these areas.`;
  }
}
