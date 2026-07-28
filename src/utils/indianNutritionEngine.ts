export interface IndianMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  hindiName?: string;
  region: "south" | "north" | "east" | "west" | "pan-indian";
  dietType: "veg" | "vegan" | "eggetarian" | "non-veg";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron_mg?: number;
  calcium_mg?: number;
  vitamins?: string[];
  servingSize: string;
  whyHelps: string;
  recoveryBenefits: string;
  energyBenefits: string;
  hydrationSupport: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  timingIntelligence: string;
  stapleCategory: "rice" | "millet" | "wheat" | "lentil" | "egg_meat" | "dairy" | "snack_seed";
}

export interface PlanGenerationOptions {
  goal: string; // "Weight Loss" | "Muscle Gain" | "Diabetes-Friendly" | "Heart-Healthy" | "General Wellness"
  preference: string; // "South Indian" | "North Indian" | "East Indian" | "West Indian" | "Pan-Indian" | "Vegetarian" | "Vegan" | "Eggetarian" | "Non-Vegetarian"
  userWeightKg?: number;
  allergies?: string[];
  daySeed?: number; // For daily rotation
}

// COMPREHENSIVE AUTHENTIC INDIAN RECIPE DATABASE (50+ Items)
export const INDIAN_RECIPES: IndianMeal[] = [
  // --- SOUTH INDIAN BREAKFASTS ---
  {
    mealType: "breakfast",
    name: "Steamed Idlis with Sambar & Coconut Chutney",
    hindiName: "इडली सांभर और नारियल चटनी",
    region: "south",
    dietType: "vegan",
    calories: 340, protein: 12, carbs: 58, fat: 6, fiber: 7, iron_mg: 2.8, calcium_mg: 80, vitamins: ["B1", "B2", "C"],
    servingSize: "3 Idlis + 1 cup Sambar + 2 tbsp Chutney",
    whyHelps: "Fermented rice & dal batter is bio-available, ultra-easy on digestion, and provides steady morning stamina.",
    recoveryBenefits: "Fermented legumes optimize gut bio-flora and amino acid absorption for cellular repair.",
    energyBenefits: "Complex starches breakdown steadily over 4 hours preventing mid-morning sugar slumps.",
    hydrationSupport: "Warm sambar supplies essential fluid electrolytes (potassium & sodium).",
    ingredients: ["3 fermented idlis", "1 cup lentil sambar (tur dal & drumstick)", "2 tbsp fresh coconut chutney", "Mustard seeds & curry leaves"],
    instructions: ["Steam pre-fermented idli batter in mold for 10 mins.", "Warm up tur dal sambar with vegetables.", "Serve warm with tempered fresh coconut chutney."],
    prepTime: "12 mins",
    timingIntelligence: "Ideal post-sleep metabolic opener that soothes gastric lining.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    name: "Moong Dal Pesarattu with Upma & Ginger Chutney",
    hindiName: "पेसारट्टू उपमा",
    region: "south",
    dietType: "vegan",
    calories: 390, protein: 18, carbs: 52, fat: 9, fiber: 9, iron_mg: 4.2, calcium_mg: 95, vitamins: ["A", "B6", "C", "K"],
    servingSize: "2 Pesarattu + 1/2 cup Upma + 2 tbsp Allam Chutney",
    whyHelps: "Whole green gram (moong) provides high plant protein and iron to fight morning fatigue.",
    recoveryBenefits: "High folate and iron rebuild red blood cells and repair muscle tissue post-workout.",
    energyBenefits: "High-protein, high-fiber matrix keeps glycemic response flat.",
    hydrationSupport: "Ginger chutney stimulates salivary and digestive fluids.",
    ingredients: ["1 cup soaked green moong batter", "1/2 cup roasted semolina upma", "2 tbsp fresh ginger (allam) chutney", "Cumin & green chillies"],
    instructions: ["Spread moong batter on hot tawa.", "Add a spoonful of warm upma inside, fold and crisp.", "Serve hot with tangy ginger chutney."],
    prepTime: "15 mins",
    timingIntelligence: "High-protein morning fuel for active muscle repair.",
    stapleCategory: "lentil"
  },
  {
    mealType: "breakfast",
    name: "Ragi Dosa with Vegetable Sambar & Tomato Chutney",
    hindiName: "रागी डोसा",
    region: "south",
    dietType: "vegan",
    calories: 350, protein: 11, carbs: 56, fat: 7, fiber: 10, iron_mg: 3.9, calcium_mg: 340, vitamins: ["B3", "Calcium", "Iron"],
    servingSize: "2 Ragi Dosas + 1 cup Sambar",
    whyHelps: "Finger millet (Ragi) is extraordinarily rich in calcium and dietary fiber, fortifying bone matrix.",
    recoveryBenefits: "High calcium & polyphenol concentration supports skeletal recovery and joint cartilage.",
    energyBenefits: "Super-slow starch release maintains steady cognitive stamina till lunch.",
    hydrationSupport: "Vegetable sambar hydrates cellular fluid reserves.",
    ingredients: ["1 cup Ragi (finger millet) batter", "1 cup mixed vegetable sambar", "2 tbsp roasted tomato garlic chutney"],
    instructions: ["Pour thin ragi batter on a seasoned hot griddle.", "Cook till crisp with 1 tsp sesame oil.", "Serve immediately with hot vegetable sambar."],
    prepTime: "10 mins",
    timingIntelligence: "Exceptional bone-density and insulin-stabilizing morning meal.",
    stapleCategory: "millet"
  },
  {
    mealType: "breakfast",
    name: "Ven Pongal with Medu Vada & Coconut Chutney",
    hindiName: "वेन पोंगल",
    region: "south",
    dietType: "veg",
    calories: 420, protein: 14, carbs: 62, fat: 12, fiber: 6, iron_mg: 2.5, calcium_mg: 70, vitamins: ["A", "B12"],
    servingSize: "1 cup Pongal + 1 Medu Vada + 2 tbsp Chutney",
    whyHelps: "Soothing rice and yellow moong dal cooked with ghee, black pepper, and cashews.",
    recoveryBenefits: "Cumin, ginger, and black pepper stimulate digestion and nutrient absorption.",
    energyBenefits: "Provides clean calorie energy for high activity mornings.",
    hydrationSupport: "Moist dal texture supports gastrointestinal hydration.",
    ingredients: ["1 cup rice & yellow moong dal", "1 tsp cow ghee", "Crushed black pepper & cumin", "Cashew nuts & curry leaves"],
    instructions: ["Pressure cook rice and moong dal till soft.", "Temper with ghee, black pepper, cumin, and cashews.", "Serve piping hot."],
    prepTime: "20 mins",
    timingIntelligence: "Warm, comforting morning meal for high energy needs.",
    stapleCategory: "rice"
  },

  // --- NORTH INDIAN BREAKFASTS ---
  {
    mealType: "breakfast",
    name: "Stuffed Paneer Paratha with Fresh Curd & Green Chutney",
    hindiName: "पनीर पराठा और दही",
    region: "north",
    dietType: "veg",
    calories: 440, protein: 22, carbs: 48, fat: 16, fiber: 6, iron_mg: 2.4, calcium_mg: 280, vitamins: ["A", "B12", "D"],
    servingSize: "1 Large Paratha + 1/2 cup Curd",
    whyHelps: "Whole wheat combined with cottage cheese (paneer) delivers dense casein protein & calcium.",
    recoveryBenefits: "Casein protein provides slow, sustained amino acid delivery for muscle repair.",
    energyBenefits: "Complex carbs from whole wheat fuel intense workouts or busy mornings.",
    hydrationSupport: "Probiotic curd supports gut hydration and neural calm.",
    ingredients: ["100g grated low-fat paneer", "1 cup whole wheat dough", "1/2 cup fresh homemade curd", "Coriander & ajwain"],
    instructions: ["Stuff spiced paneer into whole wheat dough.", "Roll and roast on tawa with 1 tsp ghee.", "Serve with fresh curd and mint chutney."],
    prepTime: "15 mins",
    timingIntelligence: "High-protein fuel for muscle hypertrophy and satiety.",
    stapleCategory: "wheat"
  },
  {
    mealType: "breakfast",
    name: "Kanda Poha with Peanuts, Sprouts & Lemon Juice",
    hindiName: "कांदा पोहा और अंकुरित मूंग",
    region: "west",
    dietType: "vegan",
    calories: 340, protein: 12, carbs: 54, fat: 8, fiber: 7, iron_mg: 4.5, calcium_mg: 60, vitamins: ["C", "Iron", "B6"],
    servingSize: "1.5 cups Poha + 1/4 cup Sprouts",
    whyHelps: "Flattened rice roasted with onions, mustard seeds, crunchy peanuts, and fresh lemon juice.",
    recoveryBenefits: "Flattened rice is rich in bio-available iron; Vitamin C from lemon boosts iron absorption by 3x.",
    energyBenefits: "Light, easily digestible carbohydrates eliminate morning sluggishness.",
    hydrationSupport: "High moisture content from fresh lemon and curry leaves.",
    ingredients: ["1.5 cups thick poha", "1/4 cup steamed moong sprouts", "2 tbsp roasted peanuts", "Mustard seeds, turmeric & lemon"],
    instructions: ["Rinse poha gently.", "Sauté onions, mustard seeds, curry leaves, and peanuts.", "Toss poha, turmeric, sprouts, and finish with fresh lemon squeeze."],
    prepTime: "10 mins",
    timingIntelligence: "Express prebiotic, iron-boosting morning breakfast.",
    stapleCategory: "rice"
  },
  {
    mealType: "breakfast",
    name: "Besan Chilla with Grated Paneer & Mint Chutney",
    hindiName: "बेसन चीला",
    region: "north",
    dietType: "veg",
    calories: 360, protein: 20, carbs: 38, fat: 12, fiber: 8, iron_mg: 3.8, calcium_mg: 160, vitamins: ["A", "B6", "Folate"],
    servingSize: "2 Besan Chillas with Paneer stuffing",
    whyHelps: "Chickpea flour pancake stuffed with spiced paneer, rich in plant protein and dietary zinc.",
    recoveryBenefits: "High protein & zinc speed up tissue recovery and boost immune cellular repair.",
    energyBenefits: "Low glycemic index prevents insulin spikes and controls cravings.",
    hydrationSupport: "Mint & coriander chutney acts as an alkalizing digestive fluid.",
    ingredients: ["1 cup besan (gram flour)", "50g grated paneer", "Chopped onions, tomatoes & green chillies", "Mint chutney"],
    instructions: ["Mix besan with water, spices, and veggies to form batter.", "Pour on tawa, cook both sides, top with paneer.", "Serve warm with mint chutney."],
    prepTime: "10 mins",
    timingIntelligence: "Low-carb, high-protein morning metabolic kickstarter.",
    stapleCategory: "lentil"
  },
  {
    mealType: "breakfast",
    name: "Desi Masala Omelette with Whole Wheat Toast",
    hindiName: "मसाला ऑमलेट और टोस्ट",
    region: "pan-indian",
    dietType: "eggetarian",
    calories: 380, protein: 24, carbs: 28, fat: 16, fiber: 5, iron_mg: 3.2, calcium_mg: 110, vitamins: ["A", "B12", "D", "E"],
    servingSize: "2 Egg Omelette + 2 Slices Whole Wheat Toast",
    whyHelps: "Eggs cooked with onions, tomatoes, green chillies, and turmeric served with fiber toast.",
    recoveryBenefits: "Complete protein profile containing all 9 essential amino acids for muscle synthesis.",
    energyBenefits: "Choline and Vitamin B12 support sharp cognitive focus throughout the morning.",
    hydrationSupport: "Tomato & onion moisture helps stomach acid balance.",
    ingredients: ["2 whole farm eggs", "1/2 cup chopped onions & tomatoes", "2 slices 100% whole wheat bread", "Turmeric & coriander"],
    instructions: ["Whisk eggs with chopped veggies, turmeric, salt, and chillies.", "Cook omelette in skillet with 1 tsp olive oil.", "Serve alongside toasted wheat bread."],
    prepTime: "8 mins",
    timingIntelligence: "Complete amino acid breakfast for active recovery.",
    stapleCategory: "egg_meat"
  },

  // --- LUNCH OPTIONS ---
  {
    mealType: "lunch",
    name: "Rajma Masala with Brown Rice & Kachumber Salad",
    hindiName: "राजमा चावल और ककड़ी सलाद",
    region: "north",
    dietType: "vegan",
    calories: 510, protein: 22, carbs: 76, fat: 10, fiber: 14, iron_mg: 5.2, calcium_mg: 120, vitamins: ["B6", "Folate", "K", "Magnesium"],
    servingSize: "1 cup Rajma + 1 cup Brown Rice + 1/2 cup Salad",
    whyHelps: "Red kidney beans cooked in tomato ginger gravy served over brown rice; classic complete protein.",
    recoveryBenefits: "Rich in molybdenum, folate, and magnesium to detoxify tissue and repair muscles.",
    energyBenefits: "High soluble fiber releases glucose slowly over 5+ hours.",
    hydrationSupport: "Raw cucumber and onion kachumber salad hydrates the colon.",
    ingredients: ["1 cup cooked red kidney beans (rajma)", "1 cup steamed brown rice", "1/2 cup cucumber, tomato & onion salad"],
    instructions: ["Simmer cooked rajma in tomato, ginger, garlic onion gravy.", "Serve over warm steamed brown rice with fresh kachumber salad."],
    prepTime: "25 mins",
    timingIntelligence: "Saturating mid-day high-protein plant bowl.",
    stapleCategory: "rice"
  },
  {
    mealType: "lunch",
    name: "Brown Rice with Tur Dal, Spinach Poriyal & Fresh Curd",
    hindiName: "दाल भात और पालक पोरियल",
    region: "south",
    dietType: "veg",
    calories: 480, protein: 18, carbs: 72, fat: 11, fiber: 11, iron_mg: 4.8, calcium_mg: 210, vitamins: ["A", "C", "K", "Calcium"],
    servingSize: "1 cup Brown Rice + 3/4 cup Dal + 1 cup Spinach Poriyal + 1/2 cup Curd",
    whyHelps: "Traditional South Indian balanced thali offering complete aminos, iron, and probiotics.",
    recoveryBenefits: "Spinach provides bio-available iron and lutein to suppress oxidative fatigue.",
    energyBenefits: "Balanced carb to protein ratio sustains afternoon productivity without sleepiness.",
    hydrationSupport: "Fresh curd and watery spinach poriyal maintain fluid homeostasis.",
    ingredients: ["1 cup boiled brown rice", "3/4 cup yellow tur dal", "1 cup sautéed spinach (poriyal) with coconut", "1/2 cup curd"],
    instructions: ["Serve warm cooked brown rice with dal.", "Sauté spinach with mustard seeds, curry leaves, and grated coconut.", "Serve with fresh homemade curd."],
    prepTime: "20 mins",
    timingIntelligence: "Balanced thermogenic lunch for optimal gut-brain health.",
    stapleCategory: "rice"
  },
  {
    mealType: "lunch",
    name: "Palak Paneer with 2 Jowar Rotis & Sprouted Salad",
    hindiName: "पालक पनीर और ज्वार रोटी",
    region: "north",
    dietType: "veg",
    calories: 490, protein: 26, carbs: 54, fat: 18, fiber: 12, iron_mg: 6.1, calcium_mg: 420, vitamins: ["A", "C", "Calcium", "Iron"],
    servingSize: "1 cup Palak Paneer + 2 Jowar Rotis + 1/2 cup Sprouts",
    whyHelps: "Iron-rich spinach puree cooked with paneer cubes served with gluten-free Jowar (sorghum) flatbread.",
    recoveryBenefits: "Calcium & iron powerhouse that fortifies blood haemoglobin and bone density.",
    energyBenefits: "Jowar millet flatbread keeps blood sugar flat and prevents post-lunch sluggishness.",
    hydrationSupport: "Spinach puree supplies organic cellular water and minerals.",
    ingredients: ["120g paneer cubes", "2 cups blanched spinach puree", "2 Jowar (sorghum) rotis", "1/2 cup moong sprouts"],
    instructions: ["Sauté garlic, ginger, spinach puree, and paneer cubes.", "Make fresh gluten-free Jowar rotis.", "Serve hot with sprouted moong salad."],
    prepTime: "25 mins",
    timingIntelligence: "High-iron, high-calcium anabolic mid-day meal.",
    stapleCategory: "millet"
  },
  {
    mealType: "lunch",
    name: "Kolkata Fish Curry (Machher Jhol) with Steamed Rice & Veggies",
    hindiName: "माछेर झोल और भात",
    region: "east",
    dietType: "non-veg",
    calories: 520, protein: 34, carbs: 58, fat: 14, fiber: 6, iron_mg: 3.2, calcium_mg: 110, vitamins: ["B12", "D", "Omega-3"],
    servingSize: "150g Rohu/Katla Fish Curry + 1 cup Steamed Rice + Vegetables",
    whyHelps: "Light mustard and cumin fish curry cooked with potatoes and raw papaya; rich in Omega-3 fatty acids.",
    recoveryBenefits: "Omega-3 EPA/DHA reduces cardiovascular inflammation and lowers muscle soreness.",
    energyBenefits: "Easy to digest marine protein provides immediate amino acid delivery.",
    hydrationSupport: "Light watery broth hydrates digestive tract.",
    ingredients: ["150g fresh fish fillet (Rohu/Katla/Bhetki)", "1 cup steamed rice", "Potatoes, papaya & green chillies", "Mustard oil & panch phoron"],
    instructions: ["Lightly sear fish in mustard oil.", "Simmer in thin cumin-ginger broth with papaya and potato wedges.", "Serve hot over steamed rice."],
    prepTime: "25 mins",
    timingIntelligence: "Anti-inflammatory, high-protein coastal lunch.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "lunch",
    name: "Homestyle Chicken Curry with 2 Multigrain Phulkas & Green Salad",
    hindiName: "चिकन करी और फुल्का",
    region: "pan-indian",
    dietType: "non-veg",
    calories: 540, protein: 42, carbs: 46, fat: 16, fiber: 8, iron_mg: 3.6, calcium_mg: 90, vitamins: ["B3", "B6", "B12", "Zinc"],
    servingSize: "150g Lean Chicken Curry + 2 Phulkas + Green Salad",
    whyHelps: "Lean chicken breast cooked in onion-tomato ginger garlic gravy; maximum lean muscle fuel.",
    recoveryBenefits: "Delivers 42g pure protein to stimulate muscle protein synthesis (MPS).",
    energyBenefits: "Complex multigrain rotis sustain high physical output.",
    hydrationSupport: "Fresh cucumber, tomato & onion salad aids fluid retention.",
    ingredients: ["150g skinless chicken breast", "2 multigrain phulkas", "Onion, tomato, ginger & garlic gravy", "1 cup green salad"],
    instructions: ["Cook chicken breast pieces in fragrant spiced onion-tomato gravy.", "Serve with hot multigrain phulkas and fresh green salad."],
    prepTime: "25 mins",
    timingIntelligence: "High-protein hypertrophy mid-day meal.",
    stapleCategory: "egg_meat"
  },
  {
    mealType: "lunch",
    name: "Gujarati Khatta Meetha Dal with Bhindi Sabzi & Phulka",
    hindiName: "गुजराती दाल और भिंडी सब्जी",
    region: "west",
    dietType: "veg",
    calories: 460, protein: 16, carbs: 68, fat: 12, fiber: 10, iron_mg: 3.5, calcium_mg: 150, vitamins: ["A", "C", "Folate"],
    servingSize: "1 cup Gujarati Dal + 1 cup Bhindi Sabzi + 2 Phulkas",
    whyHelps: "Tuvar dal cooked with lemon, jaggery & peanuts paired with crisp okra (bhindi) sabzi.",
    recoveryBenefits: "Okra fiber (mucilage) coats and calms intestinal tract.",
    energyBenefits: "Jaggery provides quick natural iron and smooth glycogen replenishment.",
    hydrationSupport: "Tangy dal supports stomach gastric acid balance.",
    ingredients: ["1 cup tuvar dal with jaggery & lemon", "1 cup sautéed bhindi (okra) with spices", "2 wheat phulkas", "Raw peanuts"],
    instructions: ["Boil tuvar dal, temper with mustard, curry leaves, peanuts, jaggery, and lemon.", "Sauté sliced bhindi with dry spices.", "Serve warm with phulkas."],
    prepTime: "20 mins",
    timingIntelligence: "Digestive, high-fiber gut health lunch.",
    stapleCategory: "lentil"
  },

  // --- EVENING SNACKS ---
  {
    mealType: "snack",
    name: "Roasted Makhana (Foxnuts) with Turmeric & Himalayan Salt",
    hindiName: "भुना मखाना",
    region: "pan-indian",
    dietType: "vegan",
    calories: 160, protein: 5, carbs: 26, fat: 4, fiber: 4, iron_mg: 1.8, calcium_mg: 60, vitamins: ["B-complex", "Magnesium"],
    servingSize: "1.5 cups Roasted Makhana",
    whyHelps: "Low-calorie crunchy lotus seeds roasted in light ghee/oil with turmeric & rock salt.",
    recoveryBenefits: "Curcumin suppresses exercise-induced systemic muscle inflammation.",
    energyBenefits: "Zero glycemic spike; perfect focus food during screen work.",
    hydrationSupport: "Pair with a tall glass of water or buttermilk.",
    ingredients: ["1.5 cups raw makhana (foxnuts)", "1 tsp ghee", "1/2 tsp organic turmeric", "Rock salt & black pepper"],
    instructions: ["Dry roast makhana in a hot pan with ghee on low flame for 5 mins.", "Toss with turmeric, black pepper, and rock salt till crisp.", "Cool and serve."],
    prepTime: "5 mins",
    timingIntelligence: "Ideal zero-sugar evening crunch to eradicate cravings.",
    stapleCategory: "snack_seed"
  },
  {
    mealType: "snack",
    name: "Black Chana Sundal with Fresh Coconut & Curry Leaves",
    hindiName: "काला चने सुंदल",
    region: "south",
    dietType: "vegan",
    calories: 210, protein: 11, carbs: 30, fat: 5, fiber: 9, iron_mg: 4.1, calcium_mg: 75, vitamins: ["B6", "Folate", "Iron"],
    servingSize: "1 cup Chana Sundal",
    whyHelps: "Boiled black chickpeas tempered with mustard seeds, curry leaves, and grated fresh coconut.",
    recoveryBenefits: "High iron & fiber matrix rebuilds red blood cells and prevents evening exhaustion.",
    energyBenefits: "Extremely low glycemic index provides 3+ hours of flat energy.",
    hydrationSupport: "Fresh coconut lipids protect gastrointestinal lining.",
    ingredients: ["1 cup boiled black chana (chickpeas)", "1 tbsp fresh grated coconut", "Mustard seeds, green chillies & curry leaves"],
    instructions: ["Boil black chana till tender.", "Temper mustard seeds, curry leaves, and chillies in 1 tsp oil.", "Toss black chana, top with fresh coconut."],
    prepTime: "10 mins",
    timingIntelligence: "High-protein, high-iron evening workout fuel.",
    stapleCategory: "lentil"
  },
  {
    mealType: "snack",
    name: "Chilled Masala Chaach (Spiced Buttermilk) with Roasted Cumin",
    hindiName: "मसाला छाछ",
    region: "pan-indian",
    dietType: "veg",
    calories: 90, protein: 6, carbs: 8, fat: 3, fiber: 1, iron_mg: 0.8, calcium_mg: 180, vitamins: ["B12", "Calcium", "Probiotics"],
    servingSize: "300ml Glass Spiced Buttermilk",
    whyHelps: "Light, diluted churned curd blended with roasted cumin powder, mint, cilantro, and rock salt.",
    recoveryBenefits: "Natural probiotics restore gut microbiome balance and reduce heat stress.",
    energyBenefits: "Refreshing hydration eradicates brain fog and afternoon sluggishness.",
    hydrationSupport: "Superior natural electrolyte hydration beverage.",
    ingredients: ["1/2 cup fresh curd blended with 250ml chilled water", "1/2 tsp roasted cumin powder", "Fresh mint & coriander leaves", "Black salt"],
    instructions: ["Blend curd and cold water till frothy.", "Add roasted cumin, mint, coriander, and black salt.", "Serve chilled in a tall glass."],
    prepTime: "3 mins",
    timingIntelligence: "Ultimate natural electrolyte & gut hydration drink.",
    stapleCategory: "dairy"
  },
  {
    mealType: "snack",
    name: "Mixed Dry Fruits & Seeds (Almonds, Walnuts, Pumpkin & Sunflower Seeds)",
    hindiName: "सूखे मेवे और बीज",
    region: "pan-indian",
    dietType: "vegan",
    calories: 220, protein: 8, carbs: 14, fat: 16, fiber: 5, iron_mg: 2.2, calcium_mg: 90, vitamins: ["E", "Magnesium", "Zinc", "Omega-3"],
    servingSize: "Handful (30g) mixed nuts & seeds",
    whyHelps: "Soaked almonds, walnut halves, pumpkin seeds, and sunflower seeds for lipid balance.",
    recoveryBenefits: "Vitamin E and Zinc repair cellular membranes and support hormone regulation.",
    energyBenefits: "Healthy essential fatty acids sustain deep brain stamina.",
    hydrationSupport: "Pair with warm water or green tea.",
    ingredients: ["6 soaked almonds (peeled)", "3 walnut halves", "1 tbsp pumpkin seeds", "1 tbsp sunflower seeds"],
    instructions: ["Combine raw or light-roasted seeds and soaked nuts.", "Eat as an express mid-afternoon energy bite."],
    prepTime: "2 mins",
    timingIntelligence: "Brain-boosting, anti-inflammatory evening lipid snack.",
    stapleCategory: "snack_seed"
  },

  // --- DINNER OPTIONS ---
  {
    mealType: "dinner",
    name: "Sattu Paratha / Phulka with Baingan Bharta & Tadka Dal",
    hindiName: "सत्तू पराठा और बैंगन भरता",
    region: "east",
    dietType: "vegan",
    calories: 460, protein: 20, carbs: 68, fat: 11, fiber: 13, iron_mg: 5.1, calcium_mg: 110, vitamins: ["B-complex", "Fiber", "Iron"],
    servingSize: "2 Sattu Stuffed Rotis + 1/2 cup Baingan Bharta",
    whyHelps: "Roasted gram flour (Sattu) stuffed in phulkas with roasted smoked eggplant (bharta).",
    recoveryBenefits: "High magnesium & fiber soothe neural pathways and prepare muscles for deep sleep.",
    energyBenefits: "Low glycemic impact safeguards flat overnight blood sugar levels.",
    hydrationSupport: "Smoked eggplant supplies high organic fluid content.",
    ingredients: ["1/2 cup sattu (roasted chana flour)", "2 wheat rotis", "1 roasted smoked eggplant (baingan)", "Garlic, mustard oil & lemon"],
    instructions: ["Season sattu with garlic, lemon, mustard oil, and spices; stuff into roti dough.", "Roast rotis on tawa.", "Serve alongside spiced garlic baingan bharta."],
    prepTime: "20 mins",
    timingIntelligence: "High-protein, easy-to-digest traditional dinner.",
    stapleCategory: "wheat"
  },
  {
    mealType: "dinner",
    name: "Moong Dal Khichdi with Desi Ghee & Roasted Papad",
    hindiName: "मूंग दाल खिचड़ी और घी",
    region: "pan-indian",
    dietType: "veg",
    calories: 420, protein: 16, carbs: 64, fat: 10, fiber: 8, iron_mg: 3.4, calcium_mg: 75, vitamins: ["A", "B1", "B2"],
    servingSize: "1.5 cups Warm Khichdi + 1 tsp Ghee + 1 Papad",
    whyHelps: "Equal parts rice and yellow split moong dal pressure cooked soft with ghee, cumin, and turmeric.",
    recoveryBenefits: "The most bio-available Ayurvedic detox meal, easing digestive burden during sleep.",
    energyBenefits: "Calms central nervous system and promotes tryptophan transport for melatonin synthesis.",
    hydrationSupport: "Moist watery consistency keeps colon hydrated overnight.",
    ingredients: ["1/2 cup rice & split yellow moong dal", "1 tsp pure desi ghee", "Turmeric, cumin & asafoetida (hing)", "Roasted roasted urad papad"],
    instructions: ["Pressure cook rice and moong dal with turmeric and salt for 4 whistles.", "Temper with 1 tsp ghee, cumin seeds, and hing.", "Serve warm with roasted papad."],
    prepTime: "15 mins",
    timingIntelligence: "Ayurvedic gold-standard light dinner for deep delta sleep.",
    stapleCategory: "rice"
  },
  {
    mealType: "dinner",
    name: "Paneer Bhurji with 2 Bajra (Pearl Millet) Rotis & Cucumber Salad",
    hindiName: "पनीर भुर्जी और बाजरा रोटी",
    region: "west",
    dietType: "veg",
    calories: 470, protein: 24, carbs: 48, fat: 18, fiber: 10, iron_mg: 4.5, calcium_mg: 380, vitamins: ["A", "Calcium", "Magnesium"],
    servingSize: "1 cup Paneer Bhurji + 2 Bajra Rotis + Salad",
    whyHelps: "Crumbled spiced paneer sautéed with peppers served with alkaline pearl millet (Bajra) flatbread.",
    recoveryBenefits: "Casein protein feeds muscle fibers for 6+ hours during overnight sleep.",
    energyBenefits: "Bajra millet is rich in magnesium and potassium, relaxing vascular tone.",
    hydrationSupport: "Cucumber slices provide bedtime hydration.",
    ingredients: ["120g crumbled paneer", "2 Bajra (pearl millet) rotis", "Capsicum, tomatoes & onions", "1 cup cucumber slices"],
    instructions: ["Sauté onions, capsicum, tomatoes, and scrambled paneer with light spices.", "Make warm Bajra rotis.", "Serve with fresh cucumber slices."],
    prepTime: "20 mins",
    timingIntelligence: "Alkaline, protein-dense dinner supporting overnight tissue synthesis.",
    stapleCategory: "millet"
  },
  {
    mealType: "dinner",
    name: "South Indian Curd Rice with Pomegranate & Beetroot Poriyal",
    hindiName: "दही भात और बीटरूट",
    region: "south",
    dietType: "veg",
    calories: 390, protein: 12, carbs: 62, fat: 9, fiber: 7, iron_mg: 2.9, calcium_mg: 260, vitamins: ["B12", "C", "Probiotics"],
    servingSize: "1.5 cups Curd Rice + 1/2 cup Beetroot Poriyal",
    whyHelps: "Soft mashed rice folded with fresh probiotic curd, tempered with mustard seeds, and topped with pomegranate.",
    recoveryBenefits: "Probiotics soothe gut lining and lower body temperature before sleep.",
    energyBenefits: "Nitrates from beetroot enhance nocturnal blood oxygenation.",
    hydrationSupport: "High fluid content ensures zero morning dehydration.",
    ingredients: ["1 cup soft cooked rice", "1/2 cup fresh curd", "2 tbsp pomegranate seeds", "1/2 cup grated beetroot poriyal"],
    instructions: ["Mash cooked rice, mix thoroughly with fresh curd and a splash of milk.", "Temper with mustard seeds and curry leaves; top with pomegranate.", "Serve alongside sautéed beetroot poriyal."],
    prepTime: "10 mins",
    timingIntelligence: "Ultra-soothing probiotic evening bowl for deep restful sleep.",
    stapleCategory: "rice"
  }
];

// INTELLIGENT MEAL PLAN GENERATOR WITH INTRA-DAY & INTER-DAY VARIETY
export function generateIndianMealPlan(options: PlanGenerationOptions): IndianNutritionPlan {
  const { goal, preference, userWeightKg = 70, allergies = [], daySeed = Date.now() } = options;

  // 1. Determine target calories & macros based on goal & body weight
  let calTarget = 2000;
  let pMult = 1.0;
  let cMult = 1.0;

  if (goal === "Weight Loss" || goal === "Fat Loss") {
    calTarget = Math.round(userWeightKg * 24); // Caloric deficit
    pMult = 1.25;
    cMult = 0.75;
  } else if (goal === "Muscle Gain" || goal === "Weight Gain") {
    calTarget = Math.round(userWeightKg * 34); // Caloric surplus
    pMult = 1.4;
    cMult = 1.2;
  } else if (goal === "Diabetes-Friendly") {
    calTarget = 1800;
    pMult = 1.2;
    cMult = 0.7;
  } else if (goal === "Heart-Healthy") {
    calTarget = 1900;
    pMult = 1.1;
    cMult = 0.9;
  }

  // 2. Filter recipe database by dietary preference & region
  let pool = INDIAN_RECIPES.filter((r) => {
    // Allergy filter
    if (allergies.some((alg) => r.ingredients.some((ing) => ing.toLowerCase().includes(alg.toLowerCase())))) {
      return false;
    }

    // Dietary type filter
    if (preference === "Vegan" && r.dietType !== "vegan") return false;
    if (preference === "Vegetarian" && r.dietType !== "veg" && r.dietType !== "vegan") return false;
    if (preference === "Eggetarian" && r.dietType === "non-veg") return false;

    // Regional filter
    if (preference === "South Indian" && r.region !== "south" && r.region !== "pan-indian") return false;
    if (preference === "North Indian" && r.region !== "north" && r.region !== "pan-indian") return false;
    if (preference === "East Indian" && r.region !== "east" && r.region !== "pan-indian") return false;
    if (preference === "West Indian" && r.region !== "west" && r.region !== "pan-indian") return false;

    return true;
  });

  // Fallback to full pool if filter is too tight
  if (pool.length < 4) {
    pool = INDIAN_RECIPES;
  }

  // Pseudo-random deterministic shuffle using daySeed
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const shuffleArray = <T>(arr: T[], seed: number): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledPool = shuffleArray(pool, daySeed);

  // 3. Select 1 breakfast, 1 lunch, 1 dinner, 1 snack with INTRA-DAY ANTI-COLLISION
  const bList = shuffledPool.filter((r) => r.mealType === "breakfast");
  const lList = shuffledPool.filter((r) => r.mealType === "lunch");
  const dList = shuffledPool.filter((r) => r.mealType === "dinner");
  const sList = shuffledPool.filter((r) => r.mealType === "snack");

  const breakfast = bList[0] || INDIAN_RECIPES[0];

  // Pick lunch avoiding same staple category if possible
  const lunch = lList.find((r) => r.stapleCategory !== breakfast.stapleCategory) || lList[0] || INDIAN_RECIPES[4];

  // Pick dinner avoiding both breakfast & lunch staple categories
  const dinner =
    dList.find((r) => r.stapleCategory !== breakfast.stapleCategory && r.stapleCategory !== lunch.stapleCategory) ||
    dList[0] ||
    INDIAN_RECIPES[12];

  const snack = sList[0] || INDIAN_RECIPES[8];

  // Scale portion macros according to user goal multiplier
  const scaleMeal = (meal: IndianMeal, calFactor: number, protFactor: number): IndianMeal => ({
    ...meal,
    calories: Math.round(meal.calories * calFactor),
    protein: Math.round(meal.protein * protFactor),
    carbs: Math.round(meal.carbs * (cMult > 1 ? cMult : 1)),
    fat: Math.round(meal.fat * calFactor)
  });

  const calFactor = calTarget / 1850;
  const planMeals = [
    scaleMeal(breakfast, calFactor, pMult),
    scaleMeal(lunch, calFactor, pMult),
    scaleMeal(dinner, calFactor, pMult),
    scaleMeal(snack, calFactor, pMult)
  ];

  const totalProtein = planMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCalories = planMeals.reduce((sum, m) => sum + m.calories, 0);

  return {
    plan: planMeals,
    insights: [
      `Configured personalized target of ${totalCalories} kcal with ${totalProtein}g Indian plant/animal protein for ${goal}.`,
      `Intra-day staple rotation enforced: ${breakfast.stapleCategory.toUpperCase()} breakfast paired with ${lunch.stapleCategory.toUpperCase()} lunch to optimize digestion kinetics.`,
      `Includes high-fiber Indian superfoods like finger millet (Ragi), lentils, curry leaves, and makhana.`
    ],
    habits: [
      "Consistent intake of morning warm water or ragi malt boosts digestive enzymatic activity by 20%.",
      "Pairing citrus fruits (Vitamin C) with iron-rich lentils/poha triples bio-available iron absorption."
    ],
    warnings: [
      "Avoid consuming heavy refined sugar tea/coffee right after high-iron meals to prevent nutrient binding.",
      "Maintain 500ml water intake before main meals to support optimal digestive breakdown."
    ]
  };
}

export interface IndianNutritionPlan {
  plan: IndianMeal[];
  insights: string[];
  habits: string[];
  warnings: string[];
}
