export interface IndianMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  hindiName?: string;
  dietType: "veg" | "vegan" | "eggetarian" | "non-veg";
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
  servingSize: string;
  whyHelps: string;
  ingredients: string[];
  instructions: string[];
}

export interface DailyDietPlan {
  goal: string;
  preference: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  breakfast: IndianMeal;
  lunch: IndianMeal;
  snack: IndianMeal;
  dinner: IndianMeal;
}

export interface MultiPlanOptions {
  goal?: string;
  preference?: string;
  pantryIngredients?: string[];
  dislikedFoods?: string[];
  favoriteFoods?: string[];
  loggedTodayNames?: string[];
  remainingCalories?: number;
  proteinDeficitGrams?: number;
  daySeed?: number;
}

// EVIDENCE-BASED HEALTHY MEALS DATABASE
export const EVIDENCE_BASED_MEALS: IndianMeal[] = [
  // --- BREAKFAST ---
  {
    mealType: "breakfast",
    name: "Vegetable Oats Porridge with 2 Boiled Eggs",
    hindiName: "सब्जी ओट्स और उबले अंडे",
    dietType: "eggetarian",
    prepTime: "10 mins",
    estimatedCost: "₹45",
    shortTag: "Low Calorie High Fiber Opener",
    badgeList: ["Weight Loss Friendly", "High Fiber", "Satiety Boost"],
    calories: 320, protein: 18, carbs: 38, fat: 9, fiber: 7, iron_mg: 3.2, calcium_mg: 90,
    servingSize: "1 bowl Oats + 2 Egg Whites/Whole",
    whyHelps: "Soluble beta-glucan fiber slows gastric emptying, preventing morning blood sugar spikes.",
    ingredients: ["oats", "eggs", "onions", "tomatoes", "carrots", "spinach"],
    instructions: ["Cook rolled oats with chopped vegetables in water.", "Boil 2 eggs.", "Serve warm."]
  },
  {
    mealType: "breakfast",
    name: "Paneer & Spinach Whole Wheat Toast",
    hindiName: "पनीर पालक टोस्ट",
    dietType: "veg",
    prepTime: "12 mins",
    estimatedCost: "₹55",
    shortTag: "High Protein Muscle Fuel",
    badgeList: ["High Protein", "Muscle Gain", "Calcium Rich"],
    calories: 410, protein: 22, carbs: 44, fat: 14, fiber: 6, iron_mg: 4.1, calcium_mg: 280,
    servingSize: "2 Slices Toast + 100g Paneer Bhurji",
    whyHelps: "Dense casein protein combined with complex wheat carbs supports muscle anabolic recovery.",
    ingredients: ["paneer", "spinach", "bread", "onions", "tomatoes"],
    instructions: ["Sauté paneer and spinach with spices.", "Place over toasted whole wheat bread."]
  },
  {
    mealType: "breakfast",
    name: "Moong Dal Pesarattu Crepe with Ginger Chutney",
    hindiName: "मूंग दाल पेसारट्टू",
    dietType: "vegan",
    prepTime: "15 mins",
    estimatedCost: "₹40",
    shortTag: "Plant Protein & Iron Crepe",
    badgeList: ["Plant Protein", "Low GI", "Iron Rich"],
    calories: 340, protein: 16, carbs: 48, fat: 7, fiber: 8, iron_mg: 4.5, calcium_mg: 85,
    servingSize: "2 Pesarattu + Ginger Chutney",
    whyHelps: "Whole green gram provides slow-digesting plant protein and essential folate.",
    ingredients: ["green moong dal", "ginger", "green chillies", "tamarind"],
    instructions: ["Grind soaked moong with ginger & chillies.", "Pour thin crepe on hot pan till crisp."]
  },

  // --- LUNCH ---
  {
    mealType: "lunch",
    name: "Grilled Chicken Breast with Brown Rice & Salad",
    hindiName: "ग्रिल्ड चिकन और ब्राउन राइस",
    dietType: "non-veg",
    prepTime: "20 mins",
    estimatedCost: "₹120",
    shortTag: "Lean Protein Lean Muscle Power",
    badgeList: ["Lean Muscle", "High Protein", "Low Fat"],
    calories: 520, protein: 44, carbs: 52, fat: 10, fiber: 6, iron_mg: 3.8, calcium_mg: 60,
    servingSize: "150g Chicken + 1 cup Brown Rice + Salad",
    whyHelps: "Delivers maximum leucine and essential amino acids for fast post-workout muscle repair.",
    ingredients: ["chicken", "rice", "spinach", "tomatoes", "onions", "carrots"],
    instructions: ["Grind spices, marinate chicken breast, grill for 12 mins.", "Serve with cooked brown rice and fresh salad."]
  },
  {
    mealType: "lunch",
    name: "Tofu Stir-Fry with Quinoa & Steamed Broccoli",
    hindiName: "टोफू और क्विनोआ बाउल",
    dietType: "vegan",
    prepTime: "18 mins",
    estimatedCost: "₹95",
    shortTag: "Heart Healthy Complete Protein",
    badgeList: ["Heart Healthy", "Zero Cholesterol", "High Fiber"],
    calories: 440, protein: 26, carbs: 54, fat: 11, fiber: 9, iron_mg: 5.4, calcium_mg: 210,
    servingSize: "1 bowl Quinoa + 120g Tofu + Vegetables",
    whyHelps: "Isoflavones and complete amino acid profile reduce LDL cholesterol and improve arterial health.",
    ingredients: ["tofu", "brocolli", "carrots", "onions", "spinach"],
    instructions: ["Sauté tofu cubes with broccoli and carrots in olive oil.", "Serve over cooked quinoa."]
  },
  {
    mealType: "lunch",
    name: "Dal Tadka with Multigrain Roti & Cucumber Salad",
    hindiName: "दाल तड़का और मल्टीग्रेन रोटी",
    dietType: "veg",
    prepTime: "20 mins",
    estimatedCost: "₹50",
    shortTag: "Balanced Fiber & Complex Carbs",
    badgeList: ["Balanced Diet", "High Fiber", "Gut Health"],
    calories: 460, protein: 19, carbs: 68, fat: 9, fiber: 11, iron_mg: 4.8, calcium_mg: 110,
    servingSize: "1.5 cups Dal + 2 Rotis + Cucumber Salad",
    whyHelps: "Legumes combined with multigrain wheat complete the essential amino acid spectrum.",
    ingredients: ["tur dal", "yellow moong dal", "wheat", "onions", "tomatoes", "cucumber"],
    instructions: ["Pressure cook dal.", "Temper with 1 tsp ghee, cumin seeds, garlic.", "Serve with hot rotis."]
  },

  // --- SNACK ---
  {
    mealType: "snack",
    name: "Greek Yogurt Bowl with Almonds & Flaxseeds",
    hindiName: "ग्रीक योगर्ट और बादाम",
    dietType: "veg",
    prepTime: "5 mins",
    estimatedCost: "₹60",
    shortTag: "Probiotic Muscle Snack",
    badgeList: ["High Protein", "Probiotics", "Omega-3"],
    calories: 220, protein: 16, carbs: 14, fat: 9, fiber: 4, iron_mg: 1.5, calcium_mg: 240,
    servingSize: "1 cup Greek Yogurt + 10 Almonds + 1 tsp Flaxseeds",
    whyHelps: "Concentrated whey & casein protein maintains positive nitrogen balance between main meals.",
    ingredients: ["curd", "almonds", "flaxseeds", "fruits"],
    instructions: ["Whisk Greek yogurt.", "Top with chopped almonds and ground flaxseeds."]
  },
  {
    mealType: "snack",
    name: "Sprouted Moong & Chana Salad with Lemon",
    hindiName: "अंकुरित मूंग सलाद",
    dietType: "vegan",
    prepTime: "5 mins",
    estimatedCost: "₹25",
    shortTag: "Enzyme Rich Low Calorie Snack",
    badgeList: ["Weight Loss Friendly", "Low GI", "Enzyme Rich"],
    calories: 180, protein: 11, carbs: 28, fat: 2, fiber: 8, iron_mg: 4.0, calcium_mg: 70,
    servingSize: "1.5 cups Sprouted Salad",
    whyHelps: "Sprouting boosts vitamin C and bio-available iron while keeping calories minimal.",
    ingredients: ["sprouts", "onions", "tomatoes", "lemon"],
    instructions: ["Toss sprouted moong with chopped onions, tomatoes, coriander, and fresh lemon juice."]
  },

  // --- DINNER ---
  {
    mealType: "dinner",
    name: "Paneer Vegetable Stir-Fry with Grilled Peppers",
    hindiName: "पनीर और सब्जी स्टिर फ्राई",
    dietType: "veg",
    prepTime: "15 mins",
    estimatedCost: "₹75",
    shortTag: "Slow Digesting Casein Dinner",
    badgeList: ["Muscle Repair", "Low Carb", "Casein Power"],
    calories: 380, protein: 24, carbs: 16, fat: 22, fiber: 6, iron_mg: 3.1, calcium_mg: 350,
    servingSize: "150g Paneer + Mixed Vegetables",
    whyHelps: "Casein protein digests slowly over 7-8 hours, feeding muscle tissue throughout night sleep.",
    ingredients: ["paneer", "onions", "tomatoes", "spinach", "carrots"],
    instructions: ["Sauté paneer cubes and bell peppers in 1 tsp olive oil till tender.", "Season with herbs."]
  },
  {
    mealType: "dinner",
    name: "Baked Fish Curry with Cauliflower Rice",
    hindiName: "फिश करी और गोभी राइस",
    dietType: "non-veg",
    prepTime: "20 mins",
    estimatedCost: "₹130",
    shortTag: "Ultra Low Carb Lean Fish Dinner",
    badgeList: ["Fat Loss", "Omega-3", "Low Carb"],
    calories: 360, protein: 36, carbs: 12, fat: 14, fiber: 5, iron_mg: 2.9, calcium_mg: 80,
    servingSize: "150g Fish + 1 cup Cauliflower Rice",
    whyHelps: "Omega-3 fatty acids optimize nocturnal insulin sensitivity and hormone production.",
    ingredients: ["fish", "cauliflower", "tomatoes", "onions"],
    instructions: ["Simmer fish in light tomato tamarind curry.", "Serve over grated steamed cauliflower rice."]
  }
];

// MODE 1: GENERATE COMPLETE DAILY DIET PLAN (4 MEALS + TOTAL MACROS)
export function generateFullDailyDietPlan(options: MultiPlanOptions): DailyDietPlan {
  const { goal = "Weight Loss", preference = "No Preference", loggedTodayNames = [] } = options;

  let pool = EVIDENCE_BASED_MEALS.filter((m) => {
    if (loggedTodayNames.some((l) => l.toLowerCase().includes(m.name.toLowerCase()))) return false;
    if (preference === "Vegan" && m.dietType !== "vegan") return false;
    if (preference === "Vegetarian" && m.dietType !== "veg" && m.dietType !== "vegan") return false;
    if (preference === "Eggetarian" && m.dietType === "non-veg") return false;
    return true;
  });

  if (pool.length < 4) pool = EVIDENCE_BASED_MEALS;

  const b = pool.find((m) => m.mealType === "breakfast") || pool[0];
  const l = pool.find((m) => m.mealType === "lunch") || pool[1] || pool[0];
  const s = pool.find((m) => m.mealType === "snack") || pool[2] || pool[0];
  const d = pool.find((m) => m.mealType === "dinner") || pool[3] || pool[0];

  const totalCalories = b.calories + l.calories + s.calories + d.calories;
  const totalProtein = b.protein + l.protein + s.protein + d.protein;
  const totalCarbs = b.carbs + l.carbs + s.carbs + d.carbs;
  const totalFat = b.fat + l.fat + s.fat + d.fat;
  const totalFiber = b.fiber + l.fiber + s.fiber + d.fiber;

  return {
    goal,
    preference,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    breakfast: b,
    lunch: l,
    snack: s,
    dinner: d
  };
}

// MODE 2: GENERATE INGREDIENT-BASED RECIPES (STRICT INGREDIENTS ONLY)
export function generateIngredientBasedRecipes(userIngredients: string[]): IndianMeal[] {
  if (!userIngredients || userIngredients.length === 0) {
    return EVIDENCE_BASED_MEALS.slice(0, 3);
  }

  const ingsLower = userIngredients.map((i) => i.toLowerCase().trim());

  const scored = EVIDENCE_BASED_MEALS.map((meal) => {
    let matchCount = 0;
    meal.ingredients.forEach((ing) => {
      if (ingsLower.some((u) => ing.toLowerCase().includes(u) || u.includes(ing.toLowerCase()))) {
        matchCount++;
      }
    });

    return {
      meal,
      matchCount
    };
  });

  scored.sort((a, b) => b.matchCount - a.matchCount);

  return scored.slice(0, 3).map((item) => item.meal);
}
