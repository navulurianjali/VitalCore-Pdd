export interface IndianMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  dishesCategory: "breakfast" | "lunch" | "dinner" | "evening_snack" | "healthy_snack" | "pre_workout" | "post_workout" | "dessert" | "quick_meal";
  name: string;
  hindiName?: string;
  imageUrl: string;
  region: "south" | "north" | "east" | "west" | "andhra" | "telangana" | "tamil_nadu" | "karnataka" | "kerala" | "mixed" | "pan-indian";
  cuisineRegion: string;
  dietType: "veg" | "vegan" | "eggetarian" | "non-veg";
  spiceLevel: "Mild" | "Medium" | "Spicy";
  prepTimeMinutes: number;
  prepTime: string;
  estimatedCost: string;
  shortTag: string; // e.g. "High Protein", "Iron Rich", "Quick Breakfast"
  badgeList: string[]; // e.g. ["High Protein", "Iron", "Calcium"]
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
  stapleCategory: "rice" | "millet" | "wheat" | "lentil" | "egg_meat" | "dairy" | "snack_seed";
}

export interface RecommendationCard extends IndianMeal {
  matchScore: number;
  matchBadge: string;
}

export interface MultiPlanOptions {
  goal?: string;
  preference?: string;
  cuisine?: string;
  mealCategory?: string;
  queryPrompt?: string;
  spiceLevel?: string;
  maxPrepTimeMinutes?: number;
  budget?: string;
  dislikedFoods?: string[];
  favoriteFoods?: string[];
  userWeightKg?: number;
  daySeed?: number;
}

// EXPANDED AUTHENTIC INDIAN RECIPE DATABASE WITH FOOD IMAGES & MINIMAL BADGES
export const INDIAN_RECIPES: IndianMeal[] = [
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Steamed Idlis with Sambar & Coconut Chutney",
    hindiName: "इडली सांभर और नारियल चटनी",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹40",
    shortTag: "Quick & Easy Digestive Opener",
    badgeList: ["Easy Digestion", "Low Fat", "Prebiotics"],
    calories: 340, protein: 12, carbs: 58, fat: 6, fiber: 7, iron_mg: 2.8, calcium_mg: 80, vitamins: ["B1", "B2", "C"],
    keyNutrients: ["Prebiotics", "Low Fat", "Complex Carbs"],
    servingSize: "3 Idlis + 1 cup Sambar + 2 tbsp Chutney",
    whyHelps: "Fermented rice & tur dal batter is bio-available, soothing to stomach acid, and provides steady morning stamina.",
    recoveryBenefits: "Fermented legumes optimize gut bio-flora and amino acid absorption for muscle tissue repair.",
    energyBenefits: "Complex starches breakdown steadily over 4 hours preventing glucose spikes.",
    hydrationSupport: "Warm vegetable sambar supplies fluid electrolytes (potassium & sodium).",
    ingredients: ["3 fermented idlis", "1 cup lentil vegetable sambar", "2 tbsp coconut chutney", "Mustard seeds & curry leaves"],
    instructions: ["Steam pre-fermented idli batter for 10 mins.", "Heat sambar with drumsticks and carrots.", "Serve hot with tempered fresh coconut chutney."],
    timingIntelligence: "Ideal post-sleep metabolic opener that soothes gastric lining.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Moong Dal Pesarattu with Upma & Ginger Chutney",
    hindiName: "पेसारट्टू उपमा",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    region: "andhra",
    cuisineRegion: "Andhra",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "₹50",
    shortTag: "High Protein Andhra Special",
    badgeList: ["High Protein", "Iron Rich", "Folate"],
    calories: 390, protein: 18, carbs: 52, fat: 9, fiber: 9, iron_mg: 4.2, calcium_mg: 95, vitamins: ["A", "B6", "C", "K"],
    keyNutrients: ["High Protein", "Iron", "Folate"],
    servingSize: "2 Pesarattu + 1/2 cup Upma + 2 tbsp Allam Chutney",
    whyHelps: "Whole green gram (moong) crepe loaded with plant protein and bio-available iron to fight morning fatigue.",
    recoveryBenefits: "Folate and iron rebuild red blood cells and repair muscle fibers post-workout.",
    energyBenefits: "High protein & fiber matrix keeps glycemic response flat for hours.",
    hydrationSupport: "Tangy ginger (allam) chutney stimulates salivary and gastric digestive enzymes.",
    ingredients: ["1 cup soaked green moong batter", "1/2 cup semolina upma", "2 tbsp ginger tamarind chutney", "Cumin & green chillies"],
    instructions: ["Spread green moong batter on hot tawa.", "Place warm upma in center, fold crisply.", "Serve hot with ginger chutney."],
    timingIntelligence: "High-protein Andhra breakfast for active muscular recovery.",
    stapleCategory: "lentil"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Crispy Masala Dosa with Sambar & Allam Chutney",
    hindiName: "मसाला डोसा",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "₹70",
    shortTag: "Classic Energy Booster",
    badgeList: ["Complex Carbs", "Potassium", "Sustained Energy"],
    calories: 380, protein: 11, carbs: 62, fat: 10, fiber: 6, iron_mg: 3.1, calcium_mg: 90, vitamins: ["B-complex", "C"],
    keyNutrients: ["Complex Carbs", "Energy", "Potassium"],
    servingSize: "1 Large Crispy Dosa + Potato Masala + 1 cup Sambar",
    whyHelps: "Golden fermented rice crepe filled with spiced potato masala and mustard seeds.",
    recoveryBenefits: "Provides clean muscle glycogen to replenish morning stamina after sleep.",
    energyBenefits: "Slow fermented carbohydrates sustain morning focus.",
    hydrationSupport: "Sambar provides warm potassium hydration.",
    ingredients: ["1 cup fermented dosa batter", "1/2 cup spiced mashed potatoes", "1 cup tur dal sambar", "Coconut chutney"],
    instructions: ["Pour and spread thin dosa batter on hot griddle.", "Place potato masala inside, roll golden and crisp.", "Serve hot with sambar and chutney."],
    timingIntelligence: "Classic South Indian morning energy meal.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Ragi Dosa with Vegetable Sambar & Tomato Chutney",
    hindiName: "रागी डोसा",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹45",
    shortTag: "Calcium & Fiber Superfood",
    badgeList: ["Calcium Rich", "High Fiber", "Iron"],
    calories: 350, protein: 11, carbs: 56, fat: 7, fiber: 10, iron_mg: 3.9, calcium_mg: 340, vitamins: ["B3", "Calcium", "Iron"],
    keyNutrients: ["High Calcium", "High Fiber", "Iron"],
    servingSize: "2 Ragi Dosas + 1 cup Sambar",
    whyHelps: "Finger millet (Ragi) is extraordinarily rich in calcium and dietary fiber, fortifying bone matrix.",
    recoveryBenefits: "High calcium & polyphenol concentration supports joint cartilage and skeletal strength.",
    energyBenefits: "Super-slow starch release maintains steady cognitive stamina till lunch.",
    hydrationSupport: "Vegetable sambar hydrates cellular fluid reserves.",
    ingredients: ["1 cup Ragi (finger millet) batter", "1 cup vegetable sambar", "2 tbsp roasted tomato garlic chutney"],
    instructions: ["Pour ragi batter on seasoned tawa.", "Cook till crisp with 1 tsp sesame oil.", "Serve warm with vegetable sambar."],
    timingIntelligence: "Exceptional bone-density and insulin-stabilizing breakfast.",
    stapleCategory: "millet"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Andhra Special Thali (Papas, Sambar, Gunpowder Rice & Curd)",
    hindiName: "आंध्र स्पेशल थाली",
    imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80",
    region: "andhra",
    cuisineRegion: "Andhra",
    dietType: "veg",
    spiceLevel: "Spicy",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹90",
    shortTag: "Complete Balanced Andhra Meal",
    badgeList: ["Balanced Aminos", "Probiotics", "High Fiber"],
    calories: 560, protein: 20, carbs: 82, fat: 14, fiber: 11, iron_mg: 5.2, calcium_mg: 240, vitamins: ["A", "C", "Probiotics"],
    keyNutrients: ["Balanced Aminos", "Probiotics", "Digestive Spices"],
    servingSize: "1 cup Brown Rice + Tur Dal + Sambar + Kandi Podi + 1/2 cup Curd",
    whyHelps: "Steamed rice with authentic Andhra tur dal (pappu), spicy lentil powder (kandi podi), ghee, and fresh curd.",
    recoveryBenefits: "Curd probiotics combined with lentil aminos optimize mid-day muscle recovery.",
    energyBenefits: "Sustained glycogen loading fuels active physical output.",
    hydrationSupport: "Fresh homemade curd & watery sambar balance body temperature.",
    ingredients: ["1 cup boiled brown rice", "3/4 cup Andhra pappu (dal)", "1 tsp desi ghee & kandi podi", "1/2 cup fresh curd"],
    instructions: ["Serve warm rice mixed with pappu, ghee, and kandi podi.", "Enjoy alongside vegetable sambar and finish with fresh curd rice."],
    timingIntelligence: "High-satiety traditional Andhra mid-day thali.",
    stapleCategory: "rice"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "High-Protein Egg Curry with 2 Multigrain Phulkas & Salad",
    hindiName: "अंडा करी और फुल्का",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "eggetarian",
    spiceLevel: "Medium",
    prepTimeMinutes: 20,
    prepTime: "20 mins",
    estimatedCost: "₹60",
    shortTag: "Anabolic High Protein Lunch",
    badgeList: ["High Protein", "Choline", "Vitamin D"],
    calories: 490, protein: 28, carbs: 46, fat: 18, fiber: 8, iron_mg: 4.1, calcium_mg: 140, vitamins: ["A", "B12", "D", "Choline"],
    keyNutrients: ["High Protein", "Choline", "Complete Aminos"],
    servingSize: "2 Boiled Eggs Curry + 2 Whole Wheat Phulkas + Salad",
    whyHelps: "Hard-boiled eggs simmered in onion-tomato ginger gravy served with fiber multigrain phulkas.",
    recoveryBenefits: "Complete egg protein profile containing all 9 essential amino acids for muscle synthesis.",
    energyBenefits: "Choline and Vitamin B12 boost cognitive focus and nervous stamina.",
    hydrationSupport: "Cucumber & tomato salad aids fluid balance.",
    ingredients: ["2 whole boiled farm eggs", "Onion, tomato, ginger garlic curry", "2 multigrain wheat phulkas", "1 cup cucumber salad"],
    instructions: ["Boil eggs, peel and score lightly.", "Simmer in spiced onion-tomato gravy for 8 mins.", "Serve hot with phulkas and fresh salad."],
    timingIntelligence: "Anabolic eggetarian hypertrophy lunch.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Chettinad Chicken Curry with Steamed Rice & Pepper Rasam",
    hindiName: "चेट्टिनाड चिकन करी",
    imageUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    region: "tamil_nadu",
    cuisineRegion: "Tamil Nadu",
    dietType: "non-veg",
    spiceLevel: "Spicy",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹120",
    shortTag: "Lean Protein Muscle Power",
    badgeList: ["High Protein", "Thermogenic", "Zinc"],
    calories: 580, protein: 42, carbs: 54, fat: 16, fiber: 6, iron_mg: 3.8, calcium_mg: 110, vitamins: ["B3", "B6", "B12", "Zinc"],
    keyNutrients: ["Lean Protein", "Black Pepper", "Thermogenic Metabolism"],
    servingSize: "150g Chettinad Chicken + 1 cup Rice + 1/2 cup Rasam",
    whyHelps: "Lean chicken breast cooked in roasted black pepper, star anise & fennel spices; maximum lean muscle fuel.",
    recoveryBenefits: "Delivers 42g pure protein to stimulate muscle protein synthesis (MPS).",
    energyBenefits: "Black pepper piperine boosts nutrient absorption by 200%.",
    hydrationSupport: "Warm sour black pepper rasam restores fluid electrolyte balance.",
    ingredients: ["150g skinless chicken breast", "Fresh roasted Chettinad spice paste", "1 cup steamed brown rice", "1/2 cup pepper rasam"],
    instructions: ["Marinate chicken in Chettinad spices.", "Simmer in pot till tender.", "Serve with warm rice and digestive pepper rasam."],
    timingIntelligence: "High-protein South Indian power lunch.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "snack",
    dishesCategory: "evening_snack",
    name: "Black Chana Sundal with Fresh Coconut & Curry Leaves",
    hindiName: "काला चने सुंदल",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹25",
    shortTag: "High Iron & Fiber Snack",
    badgeList: ["Iron Rich", "High Fiber", "Low GI"],
    calories: 210, protein: 11, carbs: 30, fat: 5, fiber: 9, iron_mg: 4.1, calcium_mg: 75, vitamins: ["B6", "Folate", "Iron"],
    keyNutrients: ["High Iron", "Low GI", "Dietary Fiber"],
    servingSize: "1 cup Chana Sundal",
    whyHelps: "Boiled black chickpeas tempered with mustard seeds, curry leaves, and grated fresh coconut.",
    recoveryBenefits: "High iron & fiber matrix rebuilds red blood cells and prevents evening exhaustion.",
    energyBenefits: "Extremely low glycemic index provides 3+ hours of flat energy.",
    hydrationSupport: "Fresh coconut lipids protect gastrointestinal lining.",
    ingredients: ["1 cup boiled black chana", "1 tbsp fresh coconut", "Mustard seeds, green chillies & curry leaves"],
    instructions: ["Boil black chana till tender.", "Temper mustard seeds & curry leaves in 1 tsp oil.", "Toss black chana, top with coconut."],
    timingIntelligence: "High-protein, high-iron evening workout fuel.",
    stapleCategory: "lentil"
  },
  {
    mealType: "snack",
    dishesCategory: "healthy_snack",
    name: "Roasted Makhana (Foxnuts) with Turmeric & Himalayan Salt",
    hindiName: "भुना मखाना",
    imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "₹35",
    shortTag: "Zero Sugar Crunch",
    badgeList: ["Zero Sugar", "Magnesium", "Low Calorie"],
    calories: 160, protein: 5, carbs: 26, fat: 4, fiber: 4, iron_mg: 1.8, calcium_mg: 60, vitamins: ["Magnesium", "B-complex"],
    keyNutrients: ["Zero Sugar", "High Magnesium", "Anti-inflammatory"],
    servingSize: "1.5 cups Roasted Makhana",
    whyHelps: "Low-calorie crunchy lotus seeds roasted in light ghee/oil with turmeric & rock salt.",
    recoveryBenefits: "Curcumin suppresses exercise-induced systemic muscle inflammation.",
    energyBenefits: "Zero glycemic spike; perfect focus food during screen work.",
    hydrationSupport: "Pair with a tall glass of water or buttermilk.",
    ingredients: ["1.5 cups raw makhana", "1 tsp ghee", "1/2 tsp turmeric & rock salt"],
    instructions: ["Dry roast makhana in pan with ghee for 5 mins till crunchy.", "Toss with turmeric and rock salt.", "Serve crisp."],
    timingIntelligence: "Ideal zero-sugar evening crunch to eradicate cravings.",
    stapleCategory: "snack_seed"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "South Indian Curd Rice with Pomegranate & Beetroot Poriyal",
    hindiName: "दही भात और बीटरूट",
    imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "₹40",
    shortTag: "Probiotic Sleep Support",
    badgeList: ["Probiotics", "Nitrates", "Gut Calm"],
    calories: 390, protein: 12, carbs: 62, fat: 9, fiber: 7, iron_mg: 2.9, calcium_mg: 260, vitamins: ["B12", "C", "Probiotics"],
    keyNutrients: ["Probiotics", "Nitrates", "Sleep Support"],
    servingSize: "1.5 cups Curd Rice + 1/2 cup Beetroot Poriyal",
    whyHelps: "Soft mashed rice folded with probiotic curd, tempered with mustard seeds, topped with pomegranate.",
    recoveryBenefits: "Probiotics soothe gut mucosa and reduce core body temperature before sleep.",
    energyBenefits: "Nitrates from beetroot enhance nocturnal blood oxygenation.",
    hydrationSupport: "High fluid content prevents morning mouth dryness.",
    ingredients: ["1 cup soft rice", "1/2 cup fresh curd", "2 tbsp pomegranate seeds", "1/2 cup sautéed beetroot poriyal"],
    instructions: ["Mash cooked rice, mix thoroughly with fresh curd and milk.", "Temper with mustard seeds and curry leaves.", "Serve with beetroot poriyal."],
    timingIntelligence: "Ultra-soothing probiotic dinner for deep sleep.",
    stapleCategory: "rice"
  }
];

export function generateMultiMealRecommendations(options: MultiPlanOptions): RecommendationCard[] {
  const {
    goal = "Muscle Gain",
    preference = "South Indian",
    cuisine = "South Indian",
    mealCategory = "Breakfast",
    queryPrompt = "",
    spiceLevel = "Any",
    maxPrepTimeMinutes = 60,
    budget = "Any",
    dislikedFoods = [],
    favoriteFoods = []
  } = options;

  let filtered = INDIAN_RECIPES.filter((r) => {
    if (dislikedFoods.some((dis) => r.name.toLowerCase().includes(dis.toLowerCase()))) {
      return false;
    }
    if (preference === "Vegan" && r.dietType !== "vegan") return false;
    if (preference === "Vegetarian" && r.dietType !== "veg" && r.dietType !== "vegan") return false;
    if (preference === "Eggetarian" && r.dietType === "non-veg") return false;
    if (maxPrepTimeMinutes && r.prepTimeMinutes > maxPrepTimeMinutes) return false;
    if (spiceLevel !== "Any" && r.spiceLevel !== spiceLevel) return false;

    return true;
  });

  if (filtered.length < 3) {
    filtered = INDIAN_RECIPES;
  }

  const promptLower = queryPrompt.toLowerCase();
  const scored = filtered.map((recipe) => {
    let score = 70;

    if (cuisine !== "Mixed Indian" && (recipe.cuisineRegion.includes(cuisine) || recipe.region === "south")) {
      score += 15;
    }

    if (promptLower) {
      if (promptLower.includes("south indian") && (recipe.region === "south" || recipe.cuisineRegion.includes("South"))) score += 15;
      if (promptLower.includes("dosa") && recipe.name.toLowerCase().includes("dosa")) score += 20;
      if (promptLower.includes("idli") && recipe.name.toLowerCase().includes("idli")) score += 20;
      if (promptLower.includes("protein") && (recipe.protein >= 15 || recipe.keyNutrients.includes("High Protein"))) score += 15;
      if (promptLower.includes("iron") && (recipe.iron_mg >= 3.5 || recipe.keyNutrients.includes("High Iron"))) score += 15;
      if (promptLower.includes("quick") && recipe.prepTimeMinutes <= 10) score += 15;
    }

    if (favoriteFoods.some((fav) => recipe.name.toLowerCase().includes(fav.toLowerCase()))) {
      score += 10;
    }

    const finalScore = Math.min(99, Math.max(65, score));
    let badge = `${finalScore}% Best Match`;
    if (finalScore >= 90) badge = `${finalScore}% Top AI Choice`;
    else if (recipe.prepTimeMinutes <= 10) badge = `${finalScore}% Quick 10-Min Choice`;
    else if (recipe.protein >= 20) badge = `${finalScore}% High Protein Match`;

    return {
      ...recipe,
      matchScore: finalScore,
      matchBadge: badge
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored;
}
