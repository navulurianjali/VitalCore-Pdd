"use client";

import React, { useState, useEffect } from "react";
import { 
  Utensils, 
  Check, 
  RefreshCw, 
  X, 
  Sparkles, 
  ChefHat,
  Flame,
  Dumbbell,
  Scale,
  HeartPulse,
  Activity,
  Zap,
  ShieldCheck,
  Sunrise,
  Sun,
  Coffee,
  Moon
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { supabase } from "@/utils/supabase";
import { 
  generateFullDailyDietPlan, 
  generateIngredientBasedRecipes,
  IndianMeal,
  DailyDietPlan 
} from "@/utils/indianNutritionEngine";

interface FoodLog {
  id: string;
  meal_type: string;
  food_name: string;
  serving_size?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
}

export default function SmartAINutritionPlansPage() {
  const { profile } = useAuth();

  // TOP LEVEL MODE SELECTOR: "diet_plan" | "cook_with_pantry"
  const [activeMode, setActiveMode] = useState<"diet_plan" | "cook_with_pantry">("diet_plan");

  // MODE 1 STATE: FOOD PREFERENCE & PRIMARY GOAL
  const [selectedPref, setSelectedPref] = useState("No Preference");
  const [selectedGoal, setSelectedGoal] = useState("Weight Loss");
  const [dailyDietPlan, setDailyDietPlan] = useState<DailyDietPlan | null>(null);

  // MODE 2 STATE: INGREDIENTS ONLY
  const [pantryIngredients, setPantryIngredients] = useState<string[]>(["rice", "eggs", "onions"]);
  const [customIngInput, setCustomIngInput] = useState("");
  const [pantryRecipes, setPantryRecipes] = useState<IndianMeal[]>([]);

  // Loading state
  const [loadingAI, setLoadingAI] = useState(false);

  // Modal inspection states
  const [selectedCardModal, setSelectedCardModal] = useState<IndianMeal | null>(null);

  // Water & Food Logs states
  const [waterLogged, setWaterLogged] = useState(0);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  // Manual Meal Log Modal
  const [showManualMealModal, setShowManualMealModal] = useState(false);
  const [manualMealForm, setManualMealForm] = useState({
    food_name: "",
    meal_type: "breakfast",
    serving_size: "1 portion",
    calories: 300,
    protein_g: 20,
    carbs_g: 30,
    fat_g: 10,
  });

  const PREFERENCE_OPTIONS = [
    { label: "Vegetarian", val: "Vegetarian" },
    { label: "Non-Vegetarian", val: "Non-Vegetarian" },
    { label: "Vegan", val: "Vegan" },
    { label: "Eggetarian", val: "Eggetarian" },
    { label: "No Preference", val: "No Preference" }
  ];

  const GOAL_OPTIONS = [
    { label: "Weight Loss", val: "Weight Loss", icon: Scale },
    { label: "Fat Loss", val: "Fat Loss", icon: Flame },
    { label: "Muscle Gain", val: "Muscle Gain", icon: Dumbbell },
    { label: "Strength Building", val: "Strength Building", icon: Activity },
    { label: "Lean Muscle", val: "Lean Muscle", icon: Zap },
    { label: "Healthy Lifestyle", val: "Healthy Lifestyle", icon: Sparkles },
    { label: "Balanced Diet", val: "Balanced Diet", icon: ShieldCheck },
    { label: "High Protein", val: "High Protein", icon: Dumbbell },
    { label: "Diabetes Friendly", val: "Diabetes Friendly", icon: HeartPulse },
    { label: "Heart Healthy", val: "Heart Healthy", icon: HeartPulse }
  ];

  const COMMON_PANTRY_ITEMS = [
    "rice", "eggs", "chicken", "paneer", "dal", "onion", "tomato", "spinach", "potato", "carrot", "beans", "curd", "milk", "banana"
  ];

  // Fetch logged meals from Supabase
  const fetchLogs = async () => {
    if (!profile?.id) return;
    try {
      const { data: foodData } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (foodData) {
        setFoodLogs(foodData.map((d: any) => ({
          id: d.id,
          meal_type: d.meal_type,
          food_name: d.food_name,
          serving_size: d.serving_size || '1 portion',
          calories: Number(d.calories || 0),
          protein_g: Number(d.protein_g || 0),
          carbs_g: Number(d.carbs_g || 0),
          fat_g: Number(d.fat_g || 0),
          created_at: d.created_at
        })));
      }

      const todayStr = new Date().toISOString().split("T")[0];
      const { data: waterData } = await supabase
        .from("hydration_logs")
        .select("*")
        .eq("user_id", profile.id)
        .gte("created_at", `${todayStr}T00:00:00Z`);

      if (waterData) {
        const total = waterData.reduce((sum: number, log: any) => sum + Number(log.amount_ml), 0);
        setWaterLogged(total);
      }
    } catch (e) {
      console.error("Supabase load error:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [profile]);

  // Primary recommendation generator based on ACTIVE MODE
  const fetchRecommendations = async () => {
    setLoadingAI(true);
    const todayStr = new Date().toISOString().split("T")[0];
    const loggedTodayNames = foodLogs
      .filter(log => log.created_at.startsWith(todayStr))
      .map(log => log.food_name);

    try {
      const response = await fetch("/api/nutrition-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeMode,
          preference: selectedPref,
          goal: selectedGoal,
          pantryIngredients,
          loggedTodayNames
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (activeMode === "diet_plan" && data.dailyPlan) {
          setDailyDietPlan(data.dailyPlan);
        } else if (activeMode === "cook_with_pantry" && data.recipes) {
          setPantryRecipes(data.recipes);
        } else {
          throw new Error("Empty response");
        }
      } else {
        throw new Error("API error");
      }
    } catch {
      if (activeMode === "diet_plan") {
        const fallback = generateFullDailyDietPlan({ goal: selectedGoal, preference: selectedPref, loggedTodayNames });
        setDailyDietPlan(fallback);
      } else {
        const fallback = generateIngredientBasedRecipes(pantryIngredients);
        setPantryRecipes(fallback);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeMode, selectedPref, selectedGoal, pantryIngredients]);

  // Handle Mark Eaten & Log Meal
  const handleLogMeal = async (card: IndianMeal) => {
    if (!profile?.id) return;
    try {
      const logData = {
        user_id: profile.id,
        meal_type: card.mealType || "breakfast",
        food_name: card.name,
        serving_size: card.servingSize || "1 portion",
        calories: Number(card.calories),
        protein_g: Number(card.protein),
        carbs_g: Number(card.carbs),
        fat_g: Number(card.fat),
        fiber_g: Number(card.fiber || 0),
        sugar_g: 2,
        sodium_mg: 180,
        stress_eating: false
      };

      const { error } = await supabase.from("nutrition_logs").insert(logData);
      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        setSelectedCardModal(null);
        confetti({ particleCount: 60, spread: 50, colors: ["#10b981", "#8b5cf6"] });
      }
    } catch (err) {
      console.error("Error logging meal:", err);
    }
  };

  const togglePantryIng = (ing: string) => {
    if (pantryIngredients.includes(ing)) {
      setPantryIngredients(pantryIngredients.filter(i => i !== ing));
    } else {
      setPantryIngredients([...pantryIngredients, ing]);
    }
  };

  const addCustomIng = () => {
    if (!customIngInput.trim()) return;
    const clean = customIngInput.trim().toLowerCase();
    if (!pantryIngredients.includes(clean)) {
      setPantryIngredients([...pantryIngredients, clean]);
      setCustomIngInput("");
    }
  };

  const renderMealCard = (meal: IndianMeal, mealLabel: string, IconComp: any) => {
    const isLoggedToday = foodLogs.some(l => l.food_name === meal.name);

    return (
      <div className="p-4 rounded-2xl glass-panel border border-foreground/10 bg-background flex flex-col justify-between space-y-3 hover:border-primary/30 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1.5">
            <IconComp className="h-3.5 w-3.5" />
            {mealLabel}
          </span>
          <span className="text-xs text-foreground/50 font-bold">⏱️ {meal.prepTime}</span>
        </div>

        <div>
          <h4 className="text-base font-bold text-foreground leading-tight">
            {meal.name}
          </h4>
          <p className="text-xs font-semibold text-primary mt-1">
            ✨ {meal.shortTag || "Evidence-Based Nutrition"}
          </p>
          <p className="text-xs text-foreground/60 line-clamp-2 mt-1 font-normal">
            {meal.whyHelps}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-foreground/5 text-center text-xs font-bold border border-foreground/5">
          <div>
            <span className="text-rose-500 block text-xs font-black">{meal.calories}</span>
            <span className="text-[9px] text-foreground/45 uppercase">kcal</span>
          </div>
          <div>
            <span className="text-primary block text-xs font-black">{meal.protein}g</span>
            <span className="text-[9px] text-foreground/45 uppercase">Protein</span>
          </div>
          <div>
            <span className="text-emerald-500 block text-xs font-black">{meal.carbs}g</span>
            <span className="text-[9px] text-foreground/45 uppercase">Carbs</span>
          </div>
          <div>
            <span className="text-amber-500 block text-xs font-black">{meal.fat}g</span>
            <span className="text-[9px] text-foreground/45 uppercase">Fat</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setSelectedCardModal(meal)}
            className="w-full py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-all border border-foreground/5"
          >
            View Recipe
          </button>
          <button
            onClick={() => handleLogMeal(meal)}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
              isLoggedToday ? "bg-emerald-600 text-white" : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {isLoggedToday ? "Logged" : "Log Meal"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Smart AI Meal Planner
            </h1>
            <p className="text-xs text-foreground/60 font-medium">
              Evidence-based clinical nutrition & recipe generator
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="glass" onClick={() => fetchRecommendations()} className="text-xs font-bold border border-foreground/10 flex items-center gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAI ? "animate-spin" : ""}`} />
              Recalculate AI
            </Button>
            <Button size="sm" variant="primary" onClick={() => setShowManualMealModal(true)} className="text-xs font-bold bg-primary text-white">
              + Log Custom Meal
            </Button>
          </div>
        </div>

        {/* TOP LEVEL MODE SELECTOR CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setActiveMode("diet_plan")}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              activeMode === "diet_plan"
                ? "bg-primary/10 border-primary shadow-md"
                : "bg-background border-foreground/10 hover:border-primary/40"
            }`}
          >
            <div className={`p-2.5 rounded-xl ${activeMode === "diet_plan" ? "bg-primary text-white" : "bg-foreground/5 text-foreground/70"}`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${activeMode === "diet_plan" ? "text-primary" : "text-foreground"}`}>
                ① AI Personalized Diet Plan
              </h3>
              <p className="text-xs text-foreground/60 mt-0.5 font-normal">
                Complete 4-meal daily nutrition plan optimized for your goal.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveMode("cook_with_pantry")}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              activeMode === "cook_with_pantry"
                ? "bg-primary/10 border-primary shadow-md"
                : "bg-background border-foreground/10 hover:border-primary/40"
            }`}
          >
            <div className={`p-2.5 rounded-xl ${activeMode === "cook_with_pantry" ? "bg-primary text-white" : "bg-foreground/5 text-foreground/70"}`}>
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${activeMode === "cook_with_pantry" ? "text-primary" : "text-foreground"}`}>
                ② Cook With What I Have
              </h3>
              <p className="text-xs text-foreground/60 mt-0.5 font-normal">
                Recipe generator using ONLY ingredients currently at home.
              </p>
            </div>
          </button>
        </div>

        {/* MODE 1 VIEW: DIET PLAN WORKFLOW */}
        {activeMode === "diet_plan" && (
          <div className="space-y-6">
            {/* QUESTION 1: FOOD PREFERENCE */}
            <div className="p-4 rounded-2xl glass-panel border border-foreground/10 bg-background space-y-2.5 shadow-sm">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Question 1: What is your food preference?
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {PREFERENCE_OPTIONS.map((pref) => {
                  const isSelected = selectedPref === pref.val;
                  return (
                    <button
                      key={pref.val}
                      onClick={() => setSelectedPref(pref.val)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold shrink-0 transition-all ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-background border-foreground/10 text-foreground/70 hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {pref.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUESTION 2: PRIMARY GOAL */}
            <div className="p-4 rounded-2xl glass-panel border border-foreground/10 bg-background space-y-2.5 shadow-sm">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Question 2: What is your primary goal?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = selectedGoal === g.val;
                  const IconComp = g.icon;
                  return (
                    <button
                      key={g.val}
                      onClick={() => setSelectedGoal(g.val)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-background border-foreground/10 text-foreground/75 hover:border-primary/40"
                      }`}
                    >
                      <IconComp className={`h-4 w-4 ${isSelected ? "text-white" : "text-primary"}`} />
                      <span className="text-xs font-bold mt-2">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FULL DAILY DIET PLAN OUTPUT */}
            {dailyDietPlan && (
              <div className="space-y-4">
                {/* TOTAL DAILY MACROS BAR */}
                <div className="p-4 rounded-2xl glass-panel border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">
                      Full Daily Nutrition Targets ({selectedGoal})
                    </h3>
                    <span className="text-xs text-primary font-bold">4 Complete Meals</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold pt-1">
                    <div className="p-2 rounded-xl bg-background border border-foreground/5">
                      <span className="text-rose-500 block text-sm font-black">{dailyDietPlan.totalCalories}</span>
                      <span className="text-[9px] text-foreground/50 uppercase">Total kcal</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-foreground/5">
                      <span className="text-primary block text-sm font-black">{dailyDietPlan.totalProtein}g</span>
                      <span className="text-[9px] text-foreground/50 uppercase">Protein</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-foreground/5">
                      <span className="text-emerald-500 block text-sm font-black">{dailyDietPlan.totalCarbs}g</span>
                      <span className="text-[9px] text-foreground/50 uppercase">Carbs</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-foreground/5">
                      <span className="text-amber-500 block text-sm font-black">{dailyDietPlan.totalFat}g</span>
                      <span className="text-[9px] text-foreground/50 uppercase">Fat</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-foreground/5">
                      <span className="text-violet-500 block text-sm font-black">{dailyDietPlan.totalFiber}g</span>
                      <span className="text-[9px] text-foreground/50 uppercase">Fiber</span>
                    </div>
                  </div>
                </div>

                {/* 4 STRUCTURED MEALS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderMealCard(dailyDietPlan.breakfast, "Breakfast", Sunrise)}
                  {renderMealCard(dailyDietPlan.lunch, "Lunch", Sun)}
                  {renderMealCard(dailyDietPlan.snack, "Evening Snack", Coffee)}
                  {renderMealCard(dailyDietPlan.dinner, "Dinner", Moon)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2 VIEW: COOK WITH WHAT I HAVE WORKFLOW */}
        {activeMode === "cook_with_pantry" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl glass-panel border border-foreground/10 bg-background space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-primary" />
                  What ingredients do you currently have?
                </h3>
                {pantryIngredients.length > 0 && (
                  <button onClick={() => setPantryIngredients([])} className="text-[11px] font-bold text-rose-500 hover:underline">
                    Clear All
                  </button>
                )}
              </div>

              {/* Ingredient Chips */}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PANTRY_ITEMS.map((item) => {
                  const isSelected = pantryIngredients.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => togglePantryIng(item)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-background border-foreground/10 text-foreground/70 hover:border-primary/40"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{item}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Ingredient Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-foreground/5">
                <input
                  type="text"
                  value={customIngInput}
                  onChange={(e) => setCustomIngInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomIng()}
                  placeholder="Type custom ingredient (e.g. oats, broccoli, fish)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-foreground/10 bg-background text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
                <button
                  onClick={addCustomIng}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Add Ingredient
                </button>
              </div>
            </div>

            {/* RECIPES GENERATED STRICTLY FROM INGREDIENTS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                Best Recipes Using Only Available Ingredients
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pantryRecipes.map((meal, idx) => renderMealCard(meal, `Recipe ${idx + 1}`, ChefHat))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* VIEW RECIPE MODAL */}
      {selectedCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCardModal(null)} />
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-foreground/10 bg-background p-6 space-y-4 z-10 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary uppercase">{selectedCardModal.mealType}</span>
              <button onClick={() => setSelectedCardModal(null)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-foreground">{selectedCardModal.name}</h3>
              <p className="text-xs text-primary font-bold mt-0.5">{selectedCardModal.servingSize}</p>
              <p className="text-xs text-foreground/70 font-semibold mt-2">{selectedCardModal.whyHelps}</p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-foreground/5 text-xs font-bold">
              <div><span className="text-rose-500 block text-base font-black">{selectedCardModal.calories}</span><span className="text-[9px] text-foreground/45 uppercase">Calories</span></div>
              <div><span className="text-primary block text-base font-black">{selectedCardModal.protein}g</span><span className="text-[9px] text-foreground/45 uppercase">Protein</span></div>
              <div><span className="text-emerald-500 block text-base font-black">{selectedCardModal.carbs}g</span><span className="text-[9px] text-foreground/45 uppercase">Carbs</span></div>
              <div><span className="text-amber-500 block text-base font-black">{selectedCardModal.fat}g</span><span className="text-[9px] text-foreground/45 uppercase">Fat</span></div>
            </div>

            {selectedCardModal.ingredients && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground uppercase">Ingredients:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCardModal.ingredients.map((ing, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-foreground/5 text-foreground/75 text-[11px] font-medium">
                      • {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCardModal.instructions && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground uppercase">Preparation Steps:</h4>
                <ol className="list-decimal list-inside text-xs text-foreground/75 space-y-1 font-medium">
                  {selectedCardModal.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-foreground/5">
              <Button size="sm" variant="glass" onClick={() => setSelectedCardModal(null)}>
                Close
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleLogMeal(selectedCardModal)} className="bg-primary text-white font-bold">
                Log Meal Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL MEAL LOG MODAL */}
      {showManualMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowManualMealModal(false)} />
          <div className="relative w-full max-w-md rounded-3xl glass-panel border border-foreground/10 bg-background p-6 space-y-4 z-10 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground">Log Custom Meal</h3>
              <button onClick={() => setShowManualMealModal(false)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Food Name</label>
                <input 
                  type="text" 
                  value={manualMealForm.food_name}
                  onChange={(e) => setManualMealForm({ ...manualMealForm, food_name: e.target.value })}
                  placeholder="e.g. Oats Porridge"
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Meal Type</label>
                  <select 
                    value={manualMealForm.meal_type}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, meal_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Serving Size</label>
                  <input 
                    type="text" 
                    value={manualMealForm.serving_size}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, serving_size: e.target.value })}
                    placeholder="1 portion"
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-background text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Calories</label>
                  <input 
                    type="number" 
                    value={manualMealForm.calories}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, calories: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    value={manualMealForm.protein_g}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, protein_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    value={manualMealForm.carbs_g}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, carbs_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button size="sm" variant="glass" onClick={() => setShowManualMealModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={async () => {
                if (!profile?.id || !manualMealForm.food_name) return;
                const { error } = await supabase.from("nutrition_logs").insert({
                  user_id: profile.id,
                  meal_type: manualMealForm.meal_type,
                  food_name: manualMealForm.food_name,
                  serving_size: manualMealForm.serving_size || '1 portion',
                  calories: Number(manualMealForm.calories || 0),
                  protein_g: Number(manualMealForm.protein_g || 0),
                  carbs_g: Number(manualMealForm.carbs_g || 0),
                  fat_g: Number(manualMealForm.fat_g || 0),
                  fiber_g: 5,
                  sugar_g: 2,
                  sodium_mg: 200
                });
                if (!error) {
                  window.dispatchEvent(new Event("vitalcore-data-updated"));
                  await fetchLogs();
                  setShowManualMealModal(false);
                }
              }} className="bg-primary text-white font-bold">
                Save Meal Log
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
