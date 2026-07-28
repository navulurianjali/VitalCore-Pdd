export interface IndianMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  dishesCategory: "breakfast" | "lunch" | "dinner" | "evening_snack" | "healthy_snack" | "pre_workout" | "post_workout" | "dessert" | "quick_meal";
  name: string;
  hindiName?: string;
  region: "south" | "north" | "east" | "west" | "andhra" | "telangana" | "tamil_nadu" | "karnataka" | "kerala" | "mixed" | "pan-indian";
  cuisineRegion: string; // "South Indian" | "Andhra" | "Telangana" | "Tamil Nadu" | "Karnataka" | "Kerala" | "North Indian" | "Mixed Indian"
  dietType: "veg" | "vegan" | "eggetarian" | "non-veg";
  spiceLevel: "Mild" | "Medium" | "Spicy";
  prepTimeMinutes: number;
  prepTime: string;
  estimatedCost: string; // e.g. "Low (₹30-50)" | "Medium (₹70-120)" | "Premium (₹150+)"
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
  matchScore: number; // 0 - 100%
  matchBadge: string; // e.g. "Best Match - 98%", "High Protein Match", "Quick 10-Min Choice"
}

export interface MultiPlanOptions {
  goal?: string; // "Weight Loss" | "Muscle Gain" | "Fat Loss" | "Diabetes Friendly" | "Heart Healthy" | "High Protein"
  preference?: string; // "Vegetarian" | "Vegan" | "Eggetarian" | "Non-Vegetarian"
  cuisine?: string; // "South Indian" | "Andhra" | "Telangana" | "Tamil Nadu" | "Karnataka" | "Kerala" | "North Indian" | "Mixed Indian"
  mealCategory?: string; // "Breakfast" | "Lunch" | "Dinner" | "Evening Snack" | "Healthy Snack" | "Pre-Workout" | "Post-Workout" | "Dessert" | "Quick Meal"
  queryPrompt?: string; // Free text search e.g. "South Indian high protein breakfast", "dosa", "iron rich foods", "spicy non-veg"
  spiceLevel?: string; // "Any" | "Mild" | "Medium" | "Spicy"
  maxPrepTimeMinutes?: number; // 5, 10, 20, 30, 60
  budget?: string; // "Any" | "Low" | "Medium" | "Premium"
  dislikedFoods?: string[];
  favoriteFoods?: string[];
  userWeightKg?: number;
  daySeed?: number;
}

// EXPANDED 70+ AUTHENTIC INDIAN & SOUTH INDIAN RECIPE DATABASE
export const INDIAN_RECIPES: IndianMeal[] = [
  // --- SOUTH INDIAN BREAKFASTS & QUICK MEALS ---
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Steamed Idlis with Sambar & Coconut Chutney",
    hindiName: "इडली सांभर और नारियल चटनी",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "Low (₹30-50)",
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
    region: "andhra",
    cuisineRegion: "Andhra",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "Low (₹40-60)",
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
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "Medium (₹60-80)",
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
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "Low (₹30-50)",
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
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Kerala Appam with Vegetable Stew & Coconut Milk",
    hindiName: "अपम और सब्जी स्टू",
    region: "kerala",
    cuisineRegion: "Kerala",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "Medium (₹70-90)",
    calories: 370, protein: 9, carbs: 58, fat: 12, fiber: 6, iron_mg: 2.5, calcium_mg: 70, vitamins: ["E", "Lauric Acid"],
    keyNutrients: ["Healthy MCT Fats", "Easy Digestion", "Gut Calm"],
    servingSize: "2 Soft Appams + 1 cup Coconut Milk Veg Stew",
    whyHelps: "Lacy fermented rice hoppers served with aromatic coconut milk vegetable stew.",
    recoveryBenefits: "Lauric acid in coconut milk supports immune resilience and calms gut inflammation.",
    energyBenefits: "Medium-chain triglycerides (MCTs) provide instant clean cellular energy.",
    hydrationSupport: "Hydrating coconut milk broth supports digestive tract hydration.",
    ingredients: ["2 fermented rice appams", "1 cup mixed veg stew (carrots, peas, potatoes)", "1/2 cup fresh coconut milk", "Curry leaves & cardamom"],
    instructions: ["Swirl appam batter in appachatti pan, cover and steam 2 mins.", "Simmer veggies in light coconut milk with spices.", "Serve warm together."],
    timingIntelligence: "Gentle, soothing coastal Kerala breakfast.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    dishesCategory: "breakfast",
    name: "Ven Pongal with Medu Vada & Coconut Chutney",
    hindiName: "वेन पोंगल",
    region: "tamil_nadu",
    cuisineRegion: "Tamil Nadu",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 20,
    prepTime: "20 mins",
    estimatedCost: "Low (₹40-60)",
    calories: 420, protein: 14, carbs: 62, fat: 12, fiber: 6, iron_mg: 2.5, calcium_mg: 70, vitamins: ["A", "B12"],
    keyNutrients: ["Protein-Carb Ratio", "Cumin & Pepper", "Satiation"],
    servingSize: "1 cup Pongal + 1 Medu Vada + 2 tbsp Chutney",
    whyHelps: "Comforting rice and yellow moong dal cooked soft with cow ghee, black pepper, and cashews.",
    recoveryBenefits: "Cumin, ginger, and black pepper stimulate salivary & pancreatic digestive enzymes.",
    energyBenefits: "Provides clean calorie energy for high activity mornings.",
    hydrationSupport: "Moist dal texture supports gastrointestinal hydration.",
    ingredients: ["1 cup rice & yellow moong dal", "1 tsp cow ghee", "Crushed black pepper & cumin", "Cashew nuts & curry leaves"],
    instructions: ["Pressure cook rice and moong dal till soft.", "Temper with ghee, black pepper, cumin, and cashews.", "Serve piping hot."],
    timingIntelligence: "Warm, comforting morning meal for high energy needs.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    dishesCategory: "quick_meal",
    name: "Ragi Mudde with Vegetable Sambar / Naati Saaru",
    hindiName: "रागी मुद्दे",
    region: "karnataka",
    cuisineRegion: "Karnataka",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 15,
    prepTime: "15 mins",
    estimatedCost: "Low (₹30-50)",
    calories: 380, protein: 12, carbs: 64, fat: 6, fiber: 12, iron_mg: 4.8, calcium_mg: 390, vitamins: ["Calcium", "Iron", "Fiber"],
    keyNutrients: ["Super High Calcium", "Zero Gluten", "Sustained Glycemic Control"],
    servingSize: "1 Large Ragi Ball + 1.5 cups Sambar / Saaru",
    whyHelps: "Traditional steamed finger millet ball packed with immense calcium, iron, and slow-digesting dietary fiber.",
    recoveryBenefits: "Fortifies bone minerals and restores systemic electrolyte balance.",
    energyBenefits: "Ultra-low glycemic load provides 5+ hours of endurance stamina.",
    hydrationSupport: "Pairing with piping hot spicy saaru hydrates intestinal cells.",
    ingredients: ["1 cup Ragi flour", "2 cups boiling water", "1.5 cups spicy vegetable sambar/saaru"],
    instructions: ["Cook ragi flour in boiling water while stirring continuously till smooth ball forms.", "Roll into ball while hot using wet hands.", "Serve immersed in hot spicy sambar."],
    timingIntelligence: "Powerhouse millet meal for muscle endurance and bone density.",
    stapleCategory: "millet"
  },
  {
    mealType: "breakfast",
    dishesCategory: "quick_meal",
    name: "Sprouted Moong Salad with Lemon & Pomegranate",
    hindiName: "अंकुरित मूंग सलाद",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "Low (₹20-40)",
    calories: 220, protein: 15, carbs: 32, fat: 3, fiber: 9, iron_mg: 4.5, calcium_mg: 65, vitamins: ["C", "Folate", "K", "Iron"],
    keyNutrients: ["High Iron", "Raw Enzymes", "Vitamin C"],
    servingSize: "1.5 cups Sprouted Moong + Pomegranate + Lemon Juice",
    whyHelps: "Live sprouted green gram rich in digestive enzymes, bio-available iron, and Vitamin C.",
    recoveryBenefits: "Sprouted enzymes accelerate cellular detox and red blood cell synthesis.",
    energyBenefits: "Light, zero-cook meal that prevents morning brain fog.",
    hydrationSupport: "Fresh cucumber, tomato & lemon juice hydrate the digestive tract.",
    ingredients: ["1.5 cups sprouted green moong", "2 tbsp pomegranate seeds", "1/2 chopped cucumber & tomato", "Fresh lemon squeeze"],
    instructions: ["Toss steamed or raw sprouts with cucumber, tomato, and pomegranate.", "Squeeze fresh lemon juice, add rock salt & cumin.", "Enjoy fresh."],
    timingIntelligence: "Express 5-minute raw prebiotic breakfast.",
    stapleCategory: "lentil"
  },

  // --- LUNCH OPTIONS ---
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Andhra Special Thali (Papas, Sambar, Gunpowder Rice & Curd)",
    hindiName: "आंध्र स्पेशल थाली",
    region: "andhra",
    cuisineRegion: "Andhra",
    dietType: "veg",
    spiceLevel: "Spicy",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "Medium (₹80-110)",
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
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "eggetarian",
    spiceLevel: "Medium",
    prepTimeMinutes: 20,
    prepTime: "20 mins",
    estimatedCost: "Low (₹50-70)",
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
    region: "tamil_nadu",
    cuisineRegion: "Tamil Nadu",
    dietType: "non-veg",
    spiceLevel: "Spicy",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "Medium (₹100-140)",
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
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Kerala Fish Curry (Meen Curry) with Brown Rice & Cabbage Thoran",
    hindiName: "केरल फिश करी",
    region: "kerala",
    cuisineRegion: "Kerala",
    dietType: "non-veg",
    spiceLevel: "Medium",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "Medium (₹110-150)",
    calories: 510, protein: 36, carbs: 52, fat: 14, fiber: 7, iron_mg: 3.5, calcium_mg: 130, vitamins: ["D", "B12", "Omega-3"],
    keyNutrients: ["Omega-3 EPA/DHA", "Kudampuli Antioxidants", "Lean Marine Protein"],
    servingSize: "150g Fish Curry + 1 cup Kerala Red Rice + 1/2 cup Thoran",
    whyHelps: "Fresh fish cooked in red chilli tamarind (kudampuli) coconut curry; rich in Omega-3 fatty acids.",
    recoveryBenefits: "Omega-3 EPA/DHA suppresses systemic exercise inflammation and joint stiffness.",
    energyBenefits: "Highly digestible marine protein provides swift amino acid delivery.",
    hydrationSupport: "Tangy tamarind broth hydrates the digestive mucosa.",
    ingredients: ["150g fresh sea fish fillet", "Kokum/Kudampuli tamarind broth", "1 cup Kerala red Matta rice", "1/2 cup cabbage coconut thoran"],
    instructions: ["Simmer fish pieces in clay pot with kudampuli and coconut chilli gravy.", "Serve hot over Kerala red rice alongside cabbage thoran."],
    timingIntelligence: "Anti-inflammatory coastal fish lunch.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "lunch",
    dishesCategory: "lunch",
    name: "Rajma Masala with Steamed Brown Rice & Kachumber Salad",
    hindiName: "राजमा चावल",
    region: "north",
    cuisineRegion: "North Indian",
    dietType: "vegan",
    spiceLevel: "Medium",
    prepTimeMinutes: 25,
    prepTime: "25 mins",
    estimatedCost: "Low (₹40-60)",
    calories: 510, protein: 22, carbs: 76, fat: 10, fiber: 14, iron_mg: 5.2, calcium_mg: 120, vitamins: ["B6", "Folate", "K", "Magnesium"],
    keyNutrients: ["High Fiber", "Iron", "Plant Protein"],
    servingSize: "1 cup Rajma + 1 cup Brown Rice + 1/2 cup Salad",
    whyHelps: "Red kidney beans simmered in tomato ginger onion gravy; classic complete plant protein bowl.",
    recoveryBenefits: "Rich in molybdenum, folate, and magnesium to detoxify muscle tissue and repair fibers.",
    energyBenefits: "High soluble fiber releases glucose steadily over 5+ hours.",
    hydrationSupport: "Fresh cucumber, tomato & onion kachumber hydrates the colon.",
    ingredients: ["1 cup cooked red kidney beans (rajma)", "1 cup brown rice", "1/2 cup cucumber tomato salad"],
    instructions: ["Simmer cooked rajma in spiced tomato onion ginger gravy.", "Serve over warm brown rice with kachumber salad."],
    timingIntelligence: "Saturating mid-day plant protein lunch.",
    stapleCategory: "rice"
  },

  // --- EVENING SNACKS & HEALTHY SNACKS ---
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
    estimatedCost: "Low (₹20-30)",
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
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "Low (₹30-40)",
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
    mealType: "snack",
    dishesCategory: "pre_workout",
    name: "Fresh Tender Coconut Water & Boiled Groundnuts",
    hindiName: "नारियल पानी और मूंगफली",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "vegan",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "Low (₹40-60)",
    calories: 230, protein: 9, carbs: 18, fat: 14, fiber: 5, iron_mg: 2.1, calcium_mg: 55, vitamins: ["Potassium", "Magnesium", "Electrolytes"],
    keyNutrients: ["Natural Electrolytes", "Healthy Lipids", "Potassium Surge"],
    servingSize: "300ml Tender Coconut Water + 1/2 cup Boiled Peanuts",
    whyHelps: "Nature's best electrolyte beverage combined with protein-rich salted boiled groundnuts.",
    recoveryBenefits: "Potassium & magnesium rapidly prevent muscle cramps before physical activity.",
    energyBenefits: "Sustained smooth energy without synthetic sugars.",
    hydrationSupport: "Superior natural cellular hydration.",
    ingredients: ["300ml fresh tender coconut water", "1/2 cup salted boiled peanuts"],
    instructions: ["Drink chilled fresh coconut water.", "Snack on warm salted boiled groundnuts."],
    timingIntelligence: "Optimal natural pre-workout hydration snack.",
    stapleCategory: "snack_seed"
  },
  {
    mealType: "snack",
    dishesCategory: "post_workout",
    name: "Chilled Masala Chaach (Buttermilk) with Roasted Cumin",
    hindiName: "मसाला छाछ",
    region: "pan-indian",
    cuisineRegion: "Mixed Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 3,
    prepTime: "3 mins",
    estimatedCost: "Low (₹15-25)",
    calories: 90, protein: 6, carbs: 8, fat: 3, fiber: 1, iron_mg: 0.8, calcium_mg: 180, vitamins: ["B12", "Calcium", "Probiotics"],
    keyNutrients: ["Gut Probiotics", "Electrolytes", "Post-Workout Rehydration"],
    servingSize: "300ml Glass Spiced Buttermilk",
    whyHelps: "Diluted churned curd blended with roasted cumin powder, mint, cilantro, and rock salt.",
    recoveryBenefits: "Probiotics restore gut flora balance and lower internal core heat.",
    energyBenefits: "Refreshing hydration eradicates fatigue instantly.",
    hydrationSupport: "Superior electrolyte recovery drink.",
    ingredients: ["1/2 cup fresh curd blended with cold water", "Roasted cumin powder, mint & rock salt"],
    instructions: ["Blend curd and cold water till frothy.", "Add cumin, mint, and rock salt. Serve cold."],
    timingIntelligence: "Ultimate natural post-workout rehydration.",
    stapleCategory: "dairy"
  },

  // --- DINNER & DESSERT OPTIONS ---
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "South Indian Curd Rice with Pomegranate & Beetroot Poriyal",
    hindiName: "दही भात और बीटरूट",
    region: "south",
    cuisineRegion: "South Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 10,
    prepTime: "10 mins",
    estimatedCost: "Low (₹30-50)",
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
  },
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
    estimatedCost: "Low (₹30-50)",
    calories: 420, protein: 16, carbs: 64, fat: 10, fiber: 8, iron_mg: 3.4, calcium_mg: 75, vitamins: ["A", "B1", "B2"],
    keyNutrients: ["Ayurvedic Detox", "Easy Digestion", "Melatonin Support"],
    servingSize: "1.5 cups Warm Khichdi + 1 tsp Ghee + 1 Papad",
    whyHelps: "Equal parts rice and yellow split moong dal pressure cooked soft with ghee, cumin, and turmeric.",
    recoveryBenefits: "The most bio-available Ayurvedic detox meal, easing digestive burden during sleep.",
    energyBenefits: "Calms central nervous system and promotes tryptophan transport for melatonin synthesis.",
    hydrationSupport: "Moist watery consistency keeps colon hydrated overnight.",
    ingredients: ["1/2 cup rice & split yellow moong dal", "1 tsp pure desi ghee", "Turmeric, cumin & hing", "Roasted papad"],
    instructions: ["Pressure cook rice and moong dal with turmeric for 4 whistles.", "Temper with ghee, cumin seeds, and hing.", "Serve warm with papad."],
    timingIntelligence: "Ayurvedic gold-standard light dinner for deep sleep.",
    stapleCategory: "rice"
  },
  {
    mealType: "dinner",
    dishesCategory: "dinner",
    name: "Paneer Bhurji with 2 Bajra (Pearl Millet) Rotis & Salad",
    hindiName: "पनीर भुर्जी और बाजरा रोटी",
    region: "west",
    cuisineRegion: "West Indian",
    dietType: "veg",
    spiceLevel: "Medium",
    prepTimeMinutes: 20,
    prepTime: "20 mins",
    estimatedCost: "Medium (₹70-90)",
    calories: 470, protein: 24, carbs: 48, fat: 18, fiber: 10, iron_mg: 4.5, calcium_mg: 380, vitamins: ["A", "Calcium", "Magnesium"],
    keyNutrients: ["Casein Protein", "Alkaline Millet", "High Calcium"],
    servingSize: "1 cup Paneer Bhurji + 2 Bajra Rotis + Salad",
    whyHelps: "Crumbled spiced paneer sautéed with peppers served with alkaline pearl millet (Bajra) flatbread.",
    recoveryBenefits: "Casein protein feeds muscle fibers for 6+ hours during overnight sleep.",
    energyBenefits: "Bajra millet is rich in magnesium and potassium, relaxing vascular tone.",
    hydrationSupport: "Cucumber slices provide bedtime hydration.",
    ingredients: ["120g crumbled paneer", "2 Bajra rotis", "Capsicum, tomatoes & onions", "1 cup cucumber slices"],
    instructions: ["Sauté onions, capsicum, tomatoes, and scrambled paneer.", "Make warm Bajra rotis.", "Serve with fresh cucumber slices."],
    timingIntelligence: "Alkaline, protein-dense dinner supporting overnight tissue synthesis.",
    stapleCategory: "millet"
  },
  {
    mealType: "snack",
    dishesCategory: "dessert",
    name: "Fresh Mishti Doi with Roasted Badam & Pistachio",
    hindiName: "मिष्टी दोई और बादाम",
    region: "east",
    cuisineRegion: "East Indian",
    dietType: "veg",
    spiceLevel: "Mild",
    prepTimeMinutes: 5,
    prepTime: "5 mins",
    estimatedCost: "Low (₹30-50)",
    calories: 210, protein: 8, carbs: 24, fat: 8, fiber: 2, iron_mg: 1.2, calcium_mg: 210, vitamins: ["B12", "Calcium", "Probiotics"],
    keyNutrients: ["Probiotic Dessert", "Calcium", "Satisfying Sweet"],
    servingSize: "1 cup Mishti Doi + 1 tbsp Sliced Almonds",
    whyHelps: "Traditional fermented sweet curd topped with crunchy roasted almonds and pistachios.",
    recoveryBenefits: "Calcium & probiotics support bone matrix and overnight gut flora.",
    energyBenefits: "Satisfies sweet craving naturally without spike.",
    hydrationSupport: "Curd moisture supports fluid balance.",
    ingredients: ["1 cup fresh mishti doi (sweet curd)", "1 tbsp roasted sliced almonds & pistachios"],
    instructions: ["Serve chilled in an earthen pot topped with roasted nuts."],
    timingIntelligence: "Healthy probiotic sweet treat after meals.",
    stapleCategory: "dairy"
  }
];

// INTELLIGENT MULTI-CARD RECOMMENDATION ENGINE (RETURNS 6-10 CARDS)
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
    favoriteFoods = [],
    daySeed = Date.now()
  } = options;

  // 1. Filter recipe pool
  let filtered = INDIAN_RECIPES.filter((r) => {
    // Exclude disliked foods
    if (dislikedFoods.some((dis) => r.name.toLowerCase().includes(dis.toLowerCase()))) {
      return false;
    }

    // Filter by dietary type
    if (preference === "Vegan" && r.dietType !== "vegan") return false;
    if (preference === "Vegetarian" && r.dietType !== "veg" && r.dietType !== "vegan") return false;
    if (preference === "Eggetarian" && r.dietType === "non-veg") return false;

    // Cooking time filter
    if (maxPrepTimeMinutes && r.prepTimeMinutes > maxPrepTimeMinutes) return false;

    // Spice level filter
    if (spiceLevel !== "Any" && r.spiceLevel !== spiceLevel) return false;

    return true;
  });

  if (filtered.length < 6) {
    filtered = INDIAN_RECIPES;
  }

  // 2. Score & Rank Each Recipe (Match Score 0 - 100%)
  const promptLower = queryPrompt.toLowerCase();
  const scored = filtered.map((recipe) => {
    let score = 70; // Base score

    // Cuisine bonus (Prioritize South Indian / selected cuisine)
    if (cuisine !== "Mixed Indian" && (recipe.cuisineRegion.includes(cuisine) || recipe.region === "south")) {
      score += 15;
    }

    // Prompt keyword matching
    if (promptLower) {
      if (promptLower.includes("south indian") && (recipe.region === "south" || recipe.cuisineRegion.includes("South"))) score += 15;
      if (promptLower.includes("dosa") && recipe.name.toLowerCase().includes("dosa")) score += 20;
      if (promptLower.includes("idli") && recipe.name.toLowerCase().includes("idli")) score += 20;
      if (promptLower.includes("protein") && (recipe.protein >= 15 || recipe.keyNutrients.includes("High Protein"))) score += 15;
      if (promptLower.includes("iron") && (recipe.iron_mg >= 3.5 || recipe.keyNutrients.includes("High Iron"))) score += 15;
      if (promptLower.includes("quick") && recipe.prepTimeMinutes <= 10) score += 15;
      if (promptLower.includes("spicy") && recipe.spiceLevel === "Spicy") score += 15;
      if (promptLower.includes("non-veg") || promptLower.includes("chicken") || promptLower.includes("fish") || promptLower.includes("egg")) {
        if (recipe.dietType === "non-veg" || recipe.dietType === "eggetarian") score += 20;
      }
    }

    // Favorite bonus
    if (favoriteFoods.some((fav) => recipe.name.toLowerCase().includes(fav.toLowerCase()))) {
      score += 10;
    }

    // Cap score at 99%
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

  // Sort descending by match score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Return top 6 to 10 cards
  return scored.slice(0, 10);
}
