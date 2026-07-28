export interface IndianMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  dishesCategory: "breakfast" | "lunch" | "dinner" | "evening_snack" | "healthy_snack" | "pre_workout" | "post_workout" | "dessert" | "quick_meal";
  name: string;
  hindiName?: string;
  imageUrl?: string;
  region: "south" | "north" | "east" | "west" | "andhra" | "telangana" | "tamil_nadu" | "karnataka" | "kerala" | "mixed" | "pan-indian";
  cuisineRegion: string;
  dietType: "veg" | "vegan" | "eggetarian" | "non-veg";
  spiceLevel: "Mild" | "Medium" | "Spicy";
  prepTimeMinutes: number;
  prepTime: string;
  estimatedCost: string;
  shortTag: string;
  badgeList: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron_mg: number;
  calcium_mg: number;
  vitamins: string[];
  keyNutrients: string[];
  servingSize: string;
  whyHelps: string;
  recoveryBenefits: string;
  energyBenefits: string;
  hydrationSupport: string;
  ingredients: string[];
  instructions: string[];
  timingIntelligence: string;
  stapleCategory: "rice" | "millet" | "wheat" | "lentil" | "egg_meat" | "dairy" | "snack_seed" | "semolina" | "sprouts";
}

export interface RecommendationCard extends IndianMeal {
  matchScore: number;
  matchBadge: string;
}

export interface MultiPlanOptions {
  goal?: string; // "Weight Loss" | "Weight Gain" | "Muscle Gain" | "Strength Building" | "Fat Loss" | "Healthy Lifestyle" | "Balanced Diet" | "High Protein" | "Diabetes Friendly" | "Heart Healthy"
  preference?: string; // "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Eggetarian" | "No Preference"
  mealCategory?: string;
  queryPrompt?: string;
  pantryIngredients?: string[];
  dislikedFoods?: string[];
  favoriteFoods?: string[];
  loggedTodayNames?: string[];
  remainingCalories?: number;
  proteinDeficitGrams?: number;
  userWeightKg?: number;
  daySeed?: number;
}

export const INDIAN_RECIPES: IndianMeal[] = [
  // --- BREAKFAST ---
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Steamed Idlis with Sambar & Coconut Chutney",
    hindiName: "इडली सांभर",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹40",
    shortTag: "Quick Fermented Rice Staple",
    badgeList: ["Easy Digestion", "Low Fat", "Prebiotics"],
    calories: 340, protein: 12, carbs: 58, fat: 6, fiber: 7, iron_mg: 2.8, calcium_mg: 80, vitamins: ["B1", "B2"],
    keyNutrients: ["Prebiotics", "Low Fat"],
    servingSize: "3 Idlis + 1 cup Sambar",
    whyHelps: "Bio-available fermented rice & dal batter that soothes stomach acid.",
    recoveryBenefits: "Fermented legumes optimize gut bio-flora.",
    energyBenefits: "Complex starches release steadily over 4 hours.",
    hydrationSupport: "Warm sambar supplies fluid electrolytes.",
    ingredients: ["rice", "urad dal", "tur dal", "coconut", "mustard seeds"],
    instructions: ["Steam idlis for 10 mins.", "Heat sambar.", "Serve with chutney."],
    timingIntelligence: "Ideal morning digestive opener.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Moong Dal Pesarattu with Upma & Ginger Chutney",
    hindiName: "पेसारट्टू उपमा",
    region: "andhra",
    cuisineRegion: "Andhra",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "₹50",
    shortTag: "High Protein Andhra Moong Crepe",
    badgeList: ["High Protein", "Iron Rich", "Folate"],
    calories: 390, protein: 18, carbs: 52, fat: 9, fiber: 9, iron_mg: 4.2, calcium_mg: 95, vitamins: ["A", "C"],
    keyNutrients: ["High Protein", "Iron"],
    servingSize: "2 Pesarattu + Upma + Allam Chutney",
    whyHelps: "Whole green gram crepe loaded with plant protein and iron.",
    recoveryBenefits: "Folate and iron rebuild red blood cells post-workout.",
    energyBenefits: "High protein & fiber matrix keeps glycemic response flat.",
    hydrationSupport: "Tangy ginger chutney stimulates digestive juices.",
    ingredients: ["green moong dal", "semolina", "ginger", "tamarind", "green chillies"],
    instructions: ["Spread moong batter on hot tawa.", "Add upma inside, fold and crisp."],
    timingIntelligence: "High-protein Andhra morning fuel.",
    stapleCategory: "lentil"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Ragi Dosa with Vegetable Sambar & Tomato Chutney",
    hindiName: "रागी डोसा",
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹45",
    shortTag: "Calcium & Fiber Finger Millet Dosa",
    badgeList: ["Calcium Rich", "High Fiber", "Zero Gluten"],
    calories: 350, protein: 11, carbs: 56, fat: 7, fiber: 10, iron_mg: 3.9, calcium_mg: 340, vitamins: ["B3", "Calcium"],
    keyNutrients: ["High Calcium", "Fiber"],
    servingSize: "2 Ragi Dosas + 1 cup Sambar",
    whyHelps: "Finger millet is extraordinarily rich in calcium & fiber.",
    recoveryBenefits: "High calcium supports joint & skeletal strength.",
    energyBenefits: "Super-slow starch release maintains steady energy.",
    hydrationSupport: "Sambar hydrates cellular fluid reserves.",
    ingredients: ["ragi flour", "rice flour", "tomatoes", "tur dal", "carrots"],
    instructions: ["Pour ragi batter on tawa.", "Cook crisp with 1 tsp oil."],
    timingIntelligence: "Bone-density morning breakfast.",
    stapleCategory: "millet"
  },

  // --- LUNCH ---
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Andhra Special Thali (Pappu, Sambar, Gunpowder Rice & Curd)",
    hindiName: "आंध्र स्पेशल थाली",
    region: "andhra",
    cuisineRegion: "Andhra",
    dietType: "veg",
    spiceLevel: "Spicy",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹90",
    shortTag: "Complete Balanced Andhra Meal",
    badgeList: ["Balanced Aminos", "Probiotics", "High Fiber"],
    calories: 560, protein: 20, carbs: 82, fat: 14, fiber: 11, iron_mg: 5.2, calcium_mg: 240, vitamins: ["A", "C"],
    keyNutrients: ["Balanced Aminos", "Probiotics"],
    servingSize: "1 cup Rice + Pappu + Sambar + Kandi Podi + Curd",
    whyHelps: "Steamed rice with authentic tur dal (pappu), lentil powder (kandi podi), ghee, and curd.",
    recoveryBenefits: "Curd probiotics combined with lentil aminos optimize muscle recovery.",
    energyBenefits: "Sustained glycogen loading fuels afternoon activity.",
    hydrationSupport: "Fresh curd & sambar balance body temperature.",
    ingredients: ["rice", "tur dal", "ghee", "curd", "drumsticks"],
    instructions: ["Mix rice with pappu, ghee, and podi.", "Serve with sambar and curd."],
    timingIntelligence: "Traditional Andhra mid-day thali.",
    stapleCategory: "rice"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Chettinad Chicken Curry with Steamed Rice & Pepper Rasam",
    hindiName: "चेट्टिनाड चिकन करी",
    region: "tamil_nadu",
    cuisineRegion: "Tamil Nadu",
    dietType: "non-veg",
    spiceLevel: "Spicy",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹120",
    shortTag: "Lean Protein Muscle Power",
    badgeList: ["High Protein", "Thermogenic", "Zinc"],
    calories: 580, protein: 42, carbs: 54, fat: 16, fiber: 6, iron_mg: 3.8, calcium_mg: 110, vitamins: ["B3", "B6", "B12"],
    keyNutrients: ["Lean Protein", "Black Pepper"],
    servingSize: "150g Chicken + 1 cup Rice + Pepper Rasam",
    whyHelps: "Lean chicken breast cooked in roasted black pepper & fennel spices.",
    recoveryBenefits: "Delivers 42g pure protein for muscle protein synthesis.",
    energyBenefits: "Black pepper piperine boosts nutrient absorption.",
    hydrationSupport: "Warm sour pepper rasam restores electrolytes.",
    ingredients: ["chicken", "rice", "black pepper", "tomatoes", "onions"],
    instructions: ["Marinate chicken in spices.", "Simmer in pot till tender.", "Serve with rice & rasam."],
    timingIntelligence: "High-protein South Indian power lunch.",
    stapleCategory: "egg_meat"
  },

  // --- DINNER ---
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "Moong Dal Khichdi with Desi Ghee & Roasted Papad",
    hindiName: "मूंग दाल खिचड़ी",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "₹35",
    shortTag: "Ayurvedic Light Sleep Dinner",
    badgeList: ["Ayurvedic Detox", "Easy Digestion", "Melatonin Support"],
    calories: 420, protein: 16, carbs: 64, fat: 10, fiber: 8, iron_mg: 3.4, calcium_mg: 75, vitamins: ["A", "B1"],
    keyNutrients: ["Easy Digestion", "Melatonin Support"],
    servingSize: "1.5 cups Warm Khichdi + 1 tsp Ghee + Papad",
    whyHelps: "Rice and yellow split moong dal pressure cooked soft with ghee, cumin, and turmeric.",
    recoveryBenefits: "The most bio-available Ayurvedic detox meal, easing digestive burden during sleep.",
    energyBenefits: "Calms central nervous system and promotes tryptophan transport for melatonin synthesis.",
    hydrationSupport: "Moist watery consistency keeps colon hydrated overnight.",
    ingredients: ["rice", "moong dal", "ghee", "turmeric", "cumin"],
    instructions: ["Pressure cook rice & moong dal for 4 whistles.", "Temper with ghee, cumin seeds, and hing."],
    timingIntelligence: "Ayurvedic gold-standard light dinner.",
    stapleCategory: "rice"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "South Indian Curd Rice with Pomegranate & Beetroot Poriyal",
    hindiName: "दही भात",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹40",
    shortTag: "Probiotic Gut-Cooling Dinner",
    badgeList: ["Probiotics", "Nitrates", "Gut Calm"],
    calories: 390, protein: 12, carbs: 62, fat: 9, fiber: 7, iron_mg: 2.9, calcium_mg: 260, vitamins: ["B12", "C"],
    keyNutrients: ["Probiotics", "Nitrates"],
    servingSize: "1.5 cups Curd Rice + Beetroot Poriyal",
    whyHelps: "Soft mashed rice folded with probiotic curd, tempered with mustard seeds, topped with pomegranate.",
    recoveryBenefits: "Probiotics soothe gut mucosa and reduce core body temperature before sleep.",
    energyBenefits: "Nitrates from beetroot enhance nocturnal blood oxygenation.",
    hydrationSupport: "High fluid content prevents morning mouth dryness.",
    ingredients: ["rice", "curd", "pomegranate", "beetroot", "mustard seeds"],
    instructions: ["Mash cooked rice, mix with fresh curd and milk.", "Temper with mustard seeds & curry leaves."],
    timingIntelligence: "Ultra-soothing probiotic dinner for deep sleep.",
    stapleCategory: "rice"
  },

  // --- SNACK ---
  {
    mealType: "snack",
    dishesCategory: "evening_snack",
    name: "Black Chana Sundal with Fresh Coconut & Curry Leaves",
    hindiName: "काला चने सुंदल",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹25",
    shortTag: "High Iron & Fiber Evening Snack",
    badgeList: ["Iron Rich", "High Fiber", "Low GI"],
    calories: 210, protein: 11, carbs: 30, fat: 5, fiber: 9, iron_mg: 4.1, calcium_mg: 75, vitamins: ["B6", "Folate"],
    keyNutrients: ["Iron", "Fiber"],
    servingSize: "1 cup Chana Sundal",
    whyHelps: "Boiled black chickpeas tempered with mustard seeds, curry leaves, and grated coconut.",
    recoveryBenefits: "High iron & fiber matrix rebuilds red blood cells.",
    energyBenefits: "Extremely low glycemic index provides 3+ hours of flat energy.",
    hydrationSupport: "Fresh coconut lipids protect GI lining.",
    ingredients: ["black chana", "coconut", "mustard seeds", "curry leaves", "green chillies"],
    instructions: ["Boil black chana till tender.", "Temper mustard seeds & curry leaves in 1 tsp oil.", "Toss black chana, top with coconut."],
    timingIntelligence: "High-protein, high-iron evening workout fuel.",
    stapleCategory: "lentil"
  },
  {
    mealType: "snack",
    dishesCategory: "healthy_snack",
    name: "Roasted Makhana (Foxnuts) with Turmeric & Himalayan Salt",
    hindiName: "भुना मखाना",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "₹35",
    shortTag: "Zero Sugar Lotus Seed Crunch",
    badgeList: ["Zero Sugar", "Magnesium", "Low Calorie"],
    calories: 160, protein: 5, carbs: 26, fat: 4, fiber: 4, iron_mg: 1.8, calcium_mg: 60, vitamins: ["Magnesium"],
    keyNutrients: ["Zero Sugar", "Magnesium"],
    servingSize: "1.5 cups Roasted Makhana",
    whyHelps: "Low-calorie crunchy lotus seeds roasted in light ghee with turmeric & rock salt.",
    recoveryBenefits: "Curcumin suppresses exercise-induced muscle inflammation.",
    energyBenefits: "Zero glycemic spike; perfect focus food during screen work.",
    hydrationSupport: "Pair with a tall glass of water or buttermilk.",
    ingredients: ["makhana", "ghee", "turmeric", "rock salt"],
    instructions: ["Dry roast makhana in pan with ghee for 5 mins till crunchy.", "Toss with turmeric and rock salt."],
    timingIntelligence: "Zero-sugar evening crunch.",
    stapleCategory: "snack_seed"
  }
];

// SIMPLIFIED DYNAMIC RECOMMENDATION ALGORITHM (NO LOCATION / GPS)
export function generateSimplifiedAIMealRecommendations(options: MultiPlanOptions): RecommendationCard[] {
  const {
    goal = "Muscle Gain",
    preference = "No Preference",
    pantryIngredients = [],
    dislikedFoods = [],
    favoriteFoods = [],
    loggedTodayNames = [],
    daySeed = Date.now()
  } = options;

  let valid = INDIAN_RECIPES.filter((r) => {
    // Exclude disliked foods
    if (dislikedFoods.some((d) => r.name.toLowerCase().includes(d.toLowerCase()))) return false;
    // Exclude foods already eaten today
    if (loggedTodayNames.some((l) => l.toLowerCase().includes(r.name.toLowerCase()))) return false;

    // Food Preference Matching
    if (preference === "Vegan" && r.dietType !== "vegan") return false;
    if (preference === "Vegetarian" && r.dietType !== "veg" && r.dietType !== "vegan") return false;
    if (preference === "Eggetarian" && r.dietType === "non-veg") return false;

    return true;
  });

  if (valid.length < 3) valid = INDIAN_RECIPES;

  const userPantry = pantryIngredients.map(p => p.toLowerCase().trim());

  const scored = valid.map((recipe, index) => {
    let score = 75;

    // Goal Scoring Alignment
    if (goal === "Weight Loss" || goal === "Fat Loss") {
      if (recipe.calories <= 380 || recipe.fiber >= 8) score += 15;
    } else if (goal === "Muscle Gain" || goal === "Strength Building" || goal === "High Protein") {
      if (recipe.protein >= 15) score += 15;
    } else if (goal === "Diabetes Friendly") {
      if (recipe.fiber >= 8 || recipe.keyNutrients.includes("Low GI")) score += 15;
    } else if (goal === "Heart Healthy") {
      if (recipe.fat <= 8 || recipe.badgeList.includes("Low Fat")) score += 15;
    }

    // Pantry Ingredient Match (+15)
    if (userPantry.length > 0) {
      let matchCount = 0;
      recipe.ingredients.forEach((ing) => {
        if (userPantry.some((u) => ing.toLowerCase().includes(u) || u.includes(ing.toLowerCase()))) {
          matchCount++;
        }
      });
      if (matchCount > 0) score += 15;
    }

    // Favorite Boost (+10)
    if (favoriteFoods.some((fav) => recipe.name.toLowerCase().includes(fav.toLowerCase()))) {
      score += 10;
    }

    // Seed Rotation (+ 1..5)
    const pseudoRandomOffset = ((daySeed + index * 19) % 7);
    score += pseudoRandomOffset;

    const finalScore = Math.min(99, Math.max(70, score));
    return {
      ...recipe,
      matchScore: finalScore,
      matchBadge: `${finalScore}% Best Match`
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  const top3 = scored.slice(0, 3);
  const ranks = ["🥇 Best Match", "🥈 Great Alternative", "🥉 Quick Healthy Option"];

  return top3.map((card, idx) => ({
    ...card,
    matchBadge: ranks[idx] || `${card.matchScore}% Match`
  }));
}
