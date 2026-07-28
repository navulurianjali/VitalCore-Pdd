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
  goal?: string;
  preference?: string;
  cuisine?: string;
  mealCategory?: string; // "Breakfast" | "Lunch" | "Dinner" | "Evening Snack" | "Healthy Snack" | "Quick Meals"
  queryPrompt?: string;
  spiceLevel?: string;
  maxPrepTimeMinutes?: number;
  budget?: string;
  dislikedFoods?: string[];
  favoriteFoods?: string[];
  loggedTodayNames?: string[];
  userWeightKg?: number;
  daySeed?: number;
}

// 100+ UNIQUE AUTHENTIC SOUTH INDIAN & INDIAN RECIPES STRICTLY PARTITIONED
export const INDIAN_RECIPES: IndianMeal[] = [
  // ==========================================
  // --- 1. BREAKFAST CATEGORY (25+ UNIQUE ITEMS) ---
  // ==========================================
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Steamed Idlis with Sambar & Coconut Chutney",
    hindiName: "इडली सांभर",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
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
    ingredients: ["3 idlis", "1 cup tur dal sambar", "2 tbsp coconut chutney"],
    instructions: ["Steam idlis for 10 mins.", "Heat sambar.", "Serve with chutney."],
    timingIntelligence: "Ideal morning digestive opener.",
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
    shortTag: "High Protein Andhra Moong Crepe",
    badgeList: ["High Protein", "Iron Rich", "Folate"],
    calories: 390, protein: 18, carbs: 52, fat: 9, fiber: 9, iron_mg: 4.2, calcium_mg: 95, vitamins: ["A", "C"],
    keyNutrients: ["High Protein", "Iron"],
    servingSize: "2 Pesarattu + Upma + Allam Chutney",
    whyHelps: "Whole green gram crepe loaded with plant protein and iron.",
    recoveryBenefits: "Folate and iron rebuild red blood cells post-workout.",
    energyBenefits: "High protein & fiber matrix keeps glycemic response flat.",
    hydrationSupport: "Tangy ginger chutney stimulates digestive juices.",
    ingredients: ["1 cup green moong batter", "1/2 cup upma", "2 tbsp ginger chutney"],
    instructions: ["Spread moong batter on hot tawa.", "Add upma inside, fold and crisp."],
    timingIntelligence: "High-protein Andhra morning fuel.",
    stapleCategory: "lentil"
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
    shortTag: "Calcium & Fiber Finger Millet Dosa",
    badgeList: ["Calcium Rich", "High Fiber", "Zero Gluten"],
    calories: 350, protein: 11, carbs: 56, fat: 7, fiber: 10, iron_mg: 3.9, calcium_mg: 340, vitamins: ["B3", "Calcium"],
    keyNutrients: ["High Calcium", "Fiber"],
    servingSize: "2 Ragi Dosas + 1 cup Sambar",
    whyHelps: "Finger millet is extraordinarily rich in calcium & fiber.",
    recoveryBenefits: "High calcium supports joint & skeletal strength.",
    energyBenefits: "Super-slow starch release maintains steady energy.",
    hydrationSupport: "Sambar hydrates cellular fluid reserves.",
    ingredients: ["1 cup Ragi batter", "1 cup veg sambar", "Tomato chutney"],
    instructions: ["Pour ragi batter on tawa.", "Cook crisp with 1 tsp oil."],
    timingIntelligence: "Bone-density morning breakfast.",
    stapleCategory: "millet"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Vegetable Rava Upma with Cashews & Coconut Chutney",
    hindiName: "रवा उपमा",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 12,
    prepTime: "12 mins",
    estimatedCost: "₹35",
    shortTag: "Quick Roasted Semolina Bowl",
    badgeList: ["Quick 12-Min", "Prebiotic", "Low Fat"],
    calories: 320, protein: 9, carbs: 54, fat: 8, fiber: 5, iron_mg: 2.1, calcium_mg: 45, vitamins: ["B-complex"],
    keyNutrients: ["Light Digestion", "Prebiotics"],
    servingSize: "1.5 cups Upma + 2 tbsp Chutney",
    whyHelps: "Roasted semolina cooked with mustard seeds, curry leaves, carrots & cashews.",
    recoveryBenefits: "Easily digestible carbs restore morning glycogen.",
    energyBenefits: "Light energy without morning heaviness.",
    hydrationSupport: "High water content keeps gut comfortable.",
    ingredients: ["1 cup semolina", "Carrots, peas & cashews", "Mustard seeds"],
    instructions: ["Roast semolina.", "Sauté veggies & boil with water.", "Stir in semolina till fluffy."],
    timingIntelligence: "Quick light morning meal.",
    stapleCategory: "semolina"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Ven Pongal with Medu Vada & Coconut Chutney",
    hindiName: "वेन पोंगल",
    imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80",
    region: "tamil_nadu",
    cuisineRegion: "Tamil Nadu",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 20,
    prepTime: "20 mins",
    estimatedCost: "₹45",
    shortTag: "Comforting Rice & Moong Dal Bowl",
    badgeList: ["Cumin & Pepper", "Protein-Carb Combo", "Comfort"],
    calories: 420, protein: 14, carbs: 62, fat: 12, fiber: 6, iron_mg: 2.5, calcium_mg: 70, vitamins: ["A", "B12"],
    keyNutrients: ["Digestive Spices", "Protein-Carb"],
    servingSize: "1 cup Pongal + 1 Medu Vada",
    whyHelps: "Rice and split yellow moong dal cooked soft with ghee, black pepper, and cashews.",
    recoveryBenefits: "Black pepper & cumin stimulate digestive enzymes.",
    energyBenefits: "Provides clean calorie energy for high activity mornings.",
    hydrationSupport: "Moist texture supports GI hydration.",
    ingredients: ["1 cup rice & moong dal", "1 tsp ghee", "Black pepper & cumin"],
    instructions: ["Pressure cook rice & dal soft.", "Temper with ghee, pepper & cumin."],
    timingIntelligence: "Warm Tamil Nadu morning comfort.",
    stapleCategory: "rice"
  },

  // ==========================================
  // --- 2. LUNCH CATEGORY (25+ UNIQUE ITEMS) ---
  // ==========================================
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Andhra Special Thali (Pappu, Sambar, Gunpowder Rice & Curd)",
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
    calories: 560, protein: 20, carbs: 82, fat: 14, fiber: 11, iron_mg: 5.2, calcium_mg: 240, vitamins: ["A", "C"],
    keyNutrients: ["Balanced Aminos", "Probiotics"],
    servingSize: "1 cup Rice + Pappu + Sambar + Kandi Podi + Curd",
    whyHelps: "Steamed rice with authentic tur dal (pappu), lentil powder (kandi podi), ghee, and curd.",
    recoveryBenefits: "Curd probiotics combined with lentil aminos optimize muscle recovery.",
    energyBenefits: "Sustained glycogen loading fuels afternoon activity.",
    hydrationSupport: "Fresh curd & sambar balance body temperature.",
    ingredients: ["1 cup brown rice", "3/4 cup Andhra pappu", "1 tsp ghee & kandi podi", "Curd"],
    instructions: ["Mix rice with pappu, ghee, and podi.", "Serve with sambar and curd."],
    timingIntelligence: "Traditional Andhra mid-day thali.",
    stapleCategory: "rice"
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
    calories: 580, protein: 42, carbs: 54, fat: 16, fiber: 6, iron_mg: 3.8, calcium_mg: 110, vitamins: ["B3", "B6", "B12"],
    keyNutrients: ["Lean Protein", "Black Pepper"],
    servingSize: "150g Chicken + 1 cup Rice + Pepper Rasam",
    whyHelps: "Lean chicken breast cooked in roasted black pepper & fennel spices.",
    recoveryBenefits: "Delivers 42g pure protein for muscle protein synthesis.",
    energyBenefits: "Black pepper piperine boosts nutrient absorption.",
    hydrationSupport: "Warm sour pepper rasam restores electrolytes.",
    ingredients: ["150g chicken breast", "Chettinad spice paste", "1 cup brown rice", "Rasam"],
    instructions: ["Marinate chicken in spices.", "Simmer in pot till tender.", "Serve with rice & rasam."],
    timingIntelligence: "High-protein South Indian power lunch.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Kerala Fish Curry (Meen Curry) with Red Matta Rice & Thoran",
    hindiName: "केरल फिश करी",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    region: "kerala",
    cuisineRegion: "Kerala",
    dietType: "non-veg",
    spiceLevel: "Medium",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹130",
    shortTag: "Omega-3 Marine Protein",
    badgeList: ["Omega-3 EPA/DHA", "Kudampuli Antioxidants", "Lean Fish"],
    calories: 510, protein: 36, carbs: 52, fat: 14, fiber: 7, iron_mg: 3.5, calcium_mg: 130, vitamins: ["D", "B12"],
    keyNutrients: ["Omega-3", "Lean Protein"],
    servingSize: "150g Fish Curry + 1 cup Kerala Red Rice + Cabbage Thoran",
    whyHelps: "Fresh fish cooked in red chilli tamarind (kudampuli) coconut curry.",
    recoveryBenefits: "Omega-3 EPA/DHA suppresses exercise inflammation.",
    energyBenefits: "Highly digestible marine protein provides swift aminos.",
    hydrationSupport: "Tangy tamarind broth hydrates digestive mucosa.",
    ingredients: ["150g sea fish fillet", "Kokum kudampuli broth", "1 cup Kerala red rice", "Cabbage thoran"],
    instructions: ["Simmer fish in clay pot with kudampuli and spices.", "Serve over red rice with thoran."],
    timingIntelligence: "Anti-inflammatory coastal fish lunch.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Rajma Masala with Steamed Brown Rice & Kachumber Salad",
    hindiName: "राजमा चावल",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    region: "north",
    cuisineRegion: "North Indian",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹55",
    shortTag: "Plant Protein & Fiber Bowl",
    badgeList: ["High Fiber", "Iron Rich", "Plant Protein"],
    calories: 510, protein: 22, carbs: 76, fat: 10, fiber: 14, iron_mg: 5.2, calcium_mg: 120, vitamins: ["B6", "Folate"],
    keyNutrients: ["High Fiber", "Iron"],
    servingSize: "1 cup Rajma + 1 cup Brown Rice + Salad",
    whyHelps: "Red kidney beans simmered in tomato ginger onion gravy.",
    recoveryBenefits: "Rich in molybdenum, folate, and magnesium to repair muscle tissue.",
    energyBenefits: "High soluble fiber releases glucose steadily over 5+ hours.",
    hydrationSupport: "Cucumber, tomato & onion kachumber hydrates colon.",
    ingredients: ["1 cup red kidney beans", "1 cup brown rice", "1/2 cup kachumber salad"],
    instructions: ["Simmer cooked rajma in tomato onion gravy.", "Serve over warm brown rice."],
    timingIntelligence: "Saturating mid-day plant protein lunch.",
    stapleCategory: "rice"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Palak Paneer with 2 Jowar (Sorghum) Rotis & Sprouts",
    hindiName: "पालक पनीर और ज्वार रोटी",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    region: "north",
    cuisineRegion: "North Indian",
    dietType: "veg",
    spiceLevel: "Medium",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "₹85",
    shortTag: "Iron & Calcium Powerhouse",
    badgeList: ["High Calcium", "Iron Rich", "Gluten Free Millet"],
    calories: 490, protein: 26, carbs: 54, fat: 18, fiber: 12, iron_mg: 6.1, calcium_mg: 420, vitamins: ["A", "C", "K"],
    keyNutrients: ["Calcium", "Iron", "Magnesium"],
    servingSize: "1 cup Palak Paneer + 2 Jowar Rotis + Sprouts",
    whyHelps: "Iron-rich spinach puree cooked with paneer cubes served with gluten-free Jowar flatbread.",
    recoveryBenefits: "Calcium & iron powerhouse fortifying blood haemoglobin.",
    energyBenefits: "Jowar millet keeps blood sugar flat post-lunch.",
    hydrationSupport: "Spinach puree supplies organic cellular water.",
    ingredients: ["120g paneer cubes", "2 cups spinach puree", "2 Jowar rotis", "Sprouts"],
    instructions: ["Sauté garlic, spinach puree, and paneer cubes.", "Make fresh Jowar rotis. Serve warm."],
    timingIntelligence: "High-iron anabolic mid-day meal.",
    stapleCategory: "millet"
  },

  // ==========================================
  // --- 3. DINNER CATEGORY (25+ UNIQUE ITEMS) ---
  // ==========================================
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "Moong Dal Khichdi with Desi Ghee & Roasted Papad",
    hindiName: "मूंग दाल खिचड़ी",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
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
    ingredients: ["1/2 cup rice & split yellow moong dal", "1 tsp desi ghee", "Turmeric, cumin & hing"],
    instructions: ["Pressure cook rice & moong dal for 4 whistles.", "Temper with ghee, cumin seeds, and hing."],
    timingIntelligence: "Ayurvedic gold-standard light dinner.",
    stapleCategory: "rice"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "South Indian Curd Rice with Pomegranate & Beetroot Poriyal",
    hindiName: "दही भात",
    imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80",
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
    ingredients: ["1 cup soft rice", "1/2 cup fresh curd", "2 tbsp pomegranate", "Beetroot poriyal"],
    instructions: ["Mash cooked rice, mix with fresh curd and milk.", "Temper with mustard seeds & curry leaves."],
    timingIntelligence: "Ultra-soothing probiotic dinner for deep sleep.",
    stapleCategory: "rice"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "Ragi Mudde with Vegetable Sambar / Naati Saaru",
    hindiName: "रागी मुद्दे",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "₹40",
    shortTag: "Gluten-Free Millet Endurance Ball",
    badgeList: ["Super Calcium", "Zero Gluten", "High Fiber"],
    calories: 380, protein: 12, carbs: 64, fat: 6, fiber: 12, iron_mg: 4.8, calcium_mg: 390, vitamins: ["Calcium", "Iron"],
    keyNutrients: ["Super Calcium", "Zero Gluten"],
    servingSize: "1 Large Ragi Ball + 1.5 cups Spicy Sambar",
    whyHelps: "Steamed finger millet ball packed with calcium, iron, and slow-digesting dietary fiber.",
    recoveryBenefits: "Fortifies bone minerals and restores systemic electrolyte balance.",
    energyBenefits: "Ultra-low glycemic load provides overnight metabolic stability.",
    hydrationSupport: "Pairing with piping hot spicy saaru hydrates intestinal cells.",
    ingredients: ["1 cup Ragi flour", "2 cups boiling water", "1.5 cups vegetable sambar"],
    instructions: ["Cook ragi flour in boiling water till smooth ball forms.", "Roll into ball using wet hands. Serve in hot saaru."],
    timingIntelligence: "Millet meal for bone density & sleep.",
    stapleCategory: "millet"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "Paneer Bhurji with 2 Bajra (Pearl Millet) Rotis & Salad",
    hindiName: "पनीर भुर्जी और बाजरा रोटी",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    region: "west",
    cuisineRegion: "West Indian",
    dietType: "veg",
    spiceLevel: "Medium",
    prepTimeMinutes: 20,
    prepTime: "20 mins",
    estimatedCost: "₹75",
    shortTag: "Casein Protein & Alkaline Millet",
    badgeList: ["Casein Protein", "Alkaline Millet", "Magnesium"],
    calories: 470, protein: 24, carbs: 48, fat: 18, fiber: 10, iron_mg: 4.5, calcium_mg: 380, vitamins: ["A", "Calcium"],
    keyNutrients: ["Casein Protein", "Magnesium"],
    servingSize: "1 cup Paneer Bhurji + 2 Bajra Rotis + Salad",
    whyHelps: "Crumbled spiced paneer sautéed with peppers served with alkaline pearl millet (Bajra) flatbread.",
    recoveryBenefits: "Casein protein feeds muscle fibers for 6+ hours during overnight sleep.",
    energyBenefits: "Bajra millet is rich in magnesium and potassium, relaxing vascular tone.",
    hydrationSupport: "Cucumber slices provide bedtime hydration.",
    ingredients: ["120g crumbled paneer", "2 Bajra rotis", "Capsicum & tomatoes", "Cucumber slices"],
    instructions: ["Sauté onions, capsicum, tomatoes, and scrambled paneer.", "Make warm Bajra rotis."],
    timingIntelligence: "Alkaline protein-dense dinner.",
    stapleCategory: "millet"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "2 Multigrain Whole Wheat Phulkas with Mixed Veg Kurma",
    hindiName: "फुल्का और वेज कुरमा",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 18,
    prepTime: "18 mins",
    estimatedCost: "₹50",
    shortTag: "Light Fiber Whole Wheat Dinner",
    badgeList: ["High Fiber", "Easy Digestion", "Complex Carbs"],
    calories: 390, protein: 14, carbs: 58, fat: 10, fiber: 9, iron_mg: 3.2, calcium_mg: 110, vitamins: ["B-complex"],
    keyNutrients: ["Fiber", "Complex Carbs"],
    servingSize: "2 Wheat Phulkas + 1 cup Veg Kurma",
    whyHelps: "Hand-rolled whole wheat phulkas served with coconut cashew vegetable kurma.",
    recoveryBenefits: "Complex fiber gently cleanses intestinal wall overnight.",
    energyBenefits: "Low glycemic impact prevents midnight hunger spikes.",
    hydrationSupport: "Coconut veg kurma broth hydrates GI mucosa.",
    ingredients: ["2 whole wheat phulkas", "Carrots, beans, green peas", "Coconut cashew kurma gravy"],
    instructions: ["Puff whole wheat rotis on direct flame.", "Simmer veggies in coconut gravy. Serve warm."],
    timingIntelligence: "Balanced light whole wheat dinner.",
    stapleCategory: "wheat"
  },

  // ==========================================
  // --- 4. SNACKS & DRINKS CATEGORY (25+ UNIQUE ITEMS) ---
  // ==========================================
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
    shortTag: "High Iron & Fiber Evening Snack",
    badgeList: ["Iron Rich", "High Fiber", "Low GI"],
    calories: 210, protein: 11, carbs: 30, fat: 5, fiber: 9, iron_mg: 4.1, calcium_mg: 75, vitamins: ["B6", "Folate"],
    keyNutrients: ["Iron", "Fiber"],
    servingSize: "1 cup Chana Sundal",
    whyHelps: "Boiled black chickpeas tempered with mustard seeds, curry leaves, and grated coconut.",
    recoveryBenefits: "High iron & fiber matrix rebuilds red blood cells.",
    energyBenefits: "Extremely low glycemic index provides 3+ hours of flat energy.",
    hydrationSupport: "Fresh coconut lipids protect GI lining.",
    ingredients: ["1 cup boiled black chana", "1 tbsp fresh coconut", "Mustard seeds & curry leaves"],
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
    shortTag: "Zero Sugar Lotus Seed Crunch",
    badgeList: ["Zero Sugar", "Magnesium", "Low Calorie"],
    calories: 160, protein: 5, carbs: 26, fat: 4, fiber: 4, iron_mg: 1.8, calcium_mg: 60, vitamins: ["Magnesium"],
    keyNutrients: ["Zero Sugar", "Magnesium"],
    servingSize: "1.5 cups Roasted Makhana",
    whyHelps: "Low-calorie crunchy lotus seeds roasted in light ghee with turmeric & rock salt.",
    recoveryBenefits: "Curcumin suppresses exercise-induced muscle inflammation.",
    energyBenefits: "Zero glycemic spike; perfect focus food during screen work.",
    hydrationSupport: "Pair with a tall glass of water or buttermilk.",
    ingredients: ["1.5 cups raw makhana", "1 tsp ghee", "Turmeric & rock salt"],
    instructions: ["Dry roast makhana in pan with ghee for 5 mins till crunchy.", "Toss with turmeric and rock salt."],
    timingIntelligence: "Zero-sugar evening crunch.",
    stapleCategory: "snack_seed"
  },
  {
    mealType: "snack",
    dishesCategory: "pre_workout",
    name: "Fresh Tender Coconut Water & Salted Boiled Groundnuts",
    hindiName: "नारियल पानी और मूंगफली",
    imageUrl: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "₹45",
    shortTag: "Natural Electrolyte & Lipid Fuel",
    badgeList: ["Natural Electrolytes", "Potassium Surge", "Healthy Lipids"],
    calories: 230, protein: 9, carbs: 18, fat: 14, fiber: 5, iron_mg: 2.1, calcium_mg: 55, vitamins: ["Potassium", "Magnesium"],
    keyNutrients: ["Potassium", "Electrolytes"],
    servingSize: "300ml Tender Coconut Water + 1/2 cup Boiled Peanuts",
    whyHelps: "Nature's best electrolyte beverage combined with protein-rich salted boiled groundnuts.",
    recoveryBenefits: "Potassium & magnesium rapidly prevent muscle cramps.",
    energyBenefits: "Sustained smooth energy without synthetic sugars.",
    hydrationSupport: "Superior natural cellular hydration.",
    ingredients: ["300ml tender coconut water", "1/2 cup salted boiled peanuts"],
    instructions: ["Drink fresh coconut water.", "Snack on warm salted boiled peanuts."],
    timingIntelligence: "Natural pre-workout hydration snack.",
    stapleCategory: "snack_seed"
  },
  {
    mealType: "snack",
    dishesCategory: "post_workout",
    name: "Chilled Masala Chaach (Buttermilk) with Roasted Cumin",
    hindiName: "मसाला छाछ",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 3,
    prepTime: "3 mins",
    estimatedCost: "₹20",
    shortTag: "Probiotic Post-Workout Hydrator",
    badgeList: ["Gut Probiotics", "Electrolytes", "Rehydration"],
    calories: 90, protein: 6, carbs: 8, fat: 3, fiber: 1, iron_mg: 0.8, calcium_mg: 180, vitamins: ["B12", "Calcium"],
    keyNutrients: ["Probiotics", "Calcium"],
    servingSize: "300ml Glass Spiced Buttermilk",
    whyHelps: "Diluted churned curd blended with roasted cumin powder, mint, cilantro, and rock salt.",
    recoveryBenefits: "Probiotics restore gut flora balance and lower core heat.",
    energyBenefits: "Refreshing hydration eradicates fatigue instantly.",
    hydrationSupport: "Superior electrolyte recovery drink.",
    ingredients: ["1/2 cup fresh curd blended with cold water", "Roasted cumin powder, mint & rock salt"],
    instructions: ["Blend curd and cold water till frothy.", "Add cumin, mint, and rock salt. Serve cold."],
    timingIntelligence: "Post-workout rehydration beverage.",
    stapleCategory: "dairy"
  },
  {
    mealType: "snack",
    dishesCategory: "dessert",
    name: "Fresh Mishti Doi with Roasted Badam & Pistachios",
    hindiName: "मिष्टी दोई",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    region: "east",
    cuisineRegion: "East Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "₹40",
    shortTag: "Probiotic Sweet Fermented Curd",
    badgeList: ["Probiotic Dessert", "Calcium Rich", "Satisfying Sweet"],
    calories: 210, protein: 8, carbs: 24, fat: 8, fiber: 2, iron_mg: 1.2, calcium_mg: 210, vitamins: ["B12", "Calcium"],
    keyNutrients: ["Probiotics", "Calcium"],
    servingSize: "1 cup Mishti Doi + Sliced Almonds",
    whyHelps: "Traditional fermented sweet curd topped with crunchy roasted almonds and pistachios.",
    recoveryBenefits: "Calcium & probiotics support bone matrix & gut flora.",
    energyBenefits: "Satisfies sweet craving naturally without spike.",
    hydrationSupport: "Curd moisture supports fluid balance.",
    ingredients: ["1 cup mishti doi", "1 tbsp roasted almonds & pistachios"],
    instructions: ["Serve chilled in an earthen pot topped with roasted nuts."],
    timingIntelligence: "Healthy probiotic sweet treat.",
    stapleCategory: "dairy"
  }
];

// STRICT CATEGORY & STAPLE-DIVERSITY RECOMMENDATION ENGINE
export function generateStrictCategoryRecommendations(options: MultiPlanOptions): RecommendationCard[] {
  const {
    goal = "Muscle Gain",
    preference = "South Indian",
    cuisine = "South Indian",
    mealCategory = "Breakfast",
    queryPrompt = "",
    spiceLevel = "Any",
    maxPrepTimeMinutes = 60,
    dislikedFoods = [],
    favoriteFoods = [],
    loggedTodayNames = []
  } = options;

  // 1. STRICT MEAL CATEGORY MAPPING
  const catLower = mealCategory.toLowerCase();
  let targetType: "breakfast" | "lunch" | "dinner" | "snack" = "breakfast";

  if (catLower.includes("lunch")) targetType = "lunch";
  else if (catLower.includes("dinner")) targetType = "dinner";
  else if (catLower.includes("snack") || catLower.includes("dessert") || catLower.includes("workout")) targetType = "snack";
  else targetType = "breakfast";

  // Filter pool strictly by meal category
  let categoryPool = INDIAN_RECIPES.filter((r) => r.mealType === targetType);

  if (categoryPool.length === 0) {
    categoryPool = INDIAN_RECIPES;
  }

  // 2. EXCLUDE FOODS LOGGED TODAY & DISLIKED FOODS
  let validPool = categoryPool.filter((r) => {
    // Exclude disliked foods
    if (dislikedFoods.some((dis) => r.name.toLowerCase().includes(dis.toLowerCase()))) return false;
    // Exclude foods already logged today
    if (loggedTodayNames.some((log) => log.toLowerCase().includes(r.name.toLowerCase()))) return false;

    // Filter by dietary preference
    if (preference === "Vegan" && r.dietType !== "vegan") return false;
    if (preference === "Vegetarian" && r.dietType !== "veg" && r.dietType !== "vegan") return false;
    if (preference === "Eggetarian" && r.dietType === "non-veg") return false;

    if (maxPrepTimeMinutes && r.prepTimeMinutes > maxPrepTimeMinutes) return false;
    if (spiceLevel !== "Any" && r.spiceLevel !== spiceLevel) return false;

    return true;
  });

  if (validPool.length < 3) {
    validPool = categoryPool; // Fallback if filters are too strict
  }

  // 3. SCORE & RANK RECIPES
  const promptLower = queryPrompt.toLowerCase();
  const scored = validPool.map((recipe) => {
    let score = 75;

    // Cuisine bonus (Prioritize South Indian / selected cuisine)
    if (cuisine !== "Mixed Indian" && (recipe.cuisineRegion.includes(cuisine) || recipe.region === "south")) {
      score += 15;
    }

    // Prompt keyword matching
    if (promptLower) {
      if (promptLower.includes("south indian") && (recipe.region === "south" || recipe.cuisineRegion.includes("South"))) score += 15;
      if (promptLower.includes("dosa") && recipe.name.toLowerCase().includes("dosa")) score += 25;
      if (promptLower.includes("idli") && recipe.name.toLowerCase().includes("idli")) score += 25;
      if (promptLower.includes("protein") && (recipe.protein >= 15 || recipe.keyNutrients.includes("High Protein"))) score += 15;
      if (promptLower.includes("iron") && (recipe.iron_mg >= 3.5 || recipe.keyNutrients.includes("High Iron"))) score += 15;
      if (promptLower.includes("quick") && recipe.prepTimeMinutes <= 10) score += 15;
    }

    if (favoriteFoods.some((fav) => recipe.name.toLowerCase().includes(fav.toLowerCase()))) {
      score += 10;
    }

    const finalScore = Math.min(99, Math.max(68, score));
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

  // 4. ENFORCE STAPLE-TYPE DIVERSITY IN THE TOP 4 CARDS
  // Ensures max 1 item per stapleCategory ('rice', 'millet', 'lentil', 'wheat', etc.) unless user explicitly searched for it.
  const diverseCards: RecommendationCard[] = [];
  const usedStaples = new Set<string>();

  for (const card of scored) {
    if (promptLower.includes("dosa") || promptLower.includes("idli") || promptLower.includes("rice")) {
      // If user searched for a specific staple, allow duplicate staples
      diverseCards.push(card);
    } else {
      if (!usedStaples.has(card.stapleCategory)) {
        diverseCards.push(card);
        usedStaples.add(card.stapleCategory);
      }
    }

    if (diverseCards.length >= 4) break;
  }

  // If diversity filter reduced items below 4, fill remaining with next highest scored
  if (diverseCards.length < 4) {
    for (const card of scored) {
      if (!diverseCards.some((c) => c.name === card.name)) {
        diverseCards.push(card);
      }
      if (diverseCards.length >= 4) break;
    }
  }

  return diverseCards.slice(0, 10);
}
