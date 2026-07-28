"use client";

import React, { useState, useEffect } from "react";
import { 
  Utensils, 
  Droplet, 
  Flame,
  Sparkles, 
  AlertTriangle, 
  Apple, 
  Plus, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Moon,
  Activity,
  Calendar,
  ShieldAlert,
  Check,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Award,
  Heart,
  BarChart2,
  Clock,
  ShoppingCart,
  Zap,
  Filter,
  CheckSquare,
  ListTodo,
  X,
  Edit2,
  Trash2,
  Search,
  ThumbsDown,
  ChevronRight,
  DollarSign
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import confetti from "canvas-confetti";
import { supabase } from "@/utils/supabase";
import { 
  generateMultiMealRecommendations, 
  RecommendationCard, 
  INDIAN_RECIPES 
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
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  created_at: string;
}

interface WaterLog {
  id: string;
  amount_ml: number;
  created_at: string;
}

export default function SmartAINutritionPlansPage() {
  const { profile } = useAuth();
  const { activeMode } = useTheme();

  // Natural language query & preferences
  const [queryPrompt, setQueryPrompt] = useState("");
  const [selectedMealCategory, setSelectedMealCategory] = useState("Breakfast");
  const [selectedCuisine, setSelectedCuisine] = useState("South Indian");
  const [selectedPreference, setSelectedPreference] = useState("South Indian");
  const [selectedGoal, setSelectedGoal] = useState("Muscle Gain");
  const [selectedSpice, setSelectedSpice] = useState("Any");
  const [selectedMaxTime, setSelectedMaxTime] = useState(30);
  const [selectedBudget, setSelectedBudget] = useState("Any");

  // Recommendation state (6 - 10 cards)
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [habits, setHabits] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // User feedback tracking
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"recommendations" | "favorites" | "disliked" | "logged">("recommendations");

  // Modal inspection states
  const [selectedCardModal, setSelectedCardModal] = useState<RecommendationCard | null>(null);

  // Water & Food Logs states
  const [waterLogged, setWaterLogged] = useState(0);
  const [waterLogsList, setWaterLogsList] = useState<WaterLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // CRUD Modal States
  const [showManualMealModal, setShowManualMealModal] = useState(false);
  const [manualMealForm, setManualMealForm] = useState({
    food_name: "",
    meal_type: "breakfast",
    serving_size: "1 portion",
    calories: 300,
    protein_g: 20,
    carbs_g: 30,
    fat_g: 10,
    fiber_g: 5,
    sugar_g: 2,
    sodium_mg: 200
  });

  const [editingMeal, setEditingMeal] = useState<FoodLog | null>(null);
  const [editMealForm, setEditMealForm] = useState<any>(null);

  const MEAL_CATEGORIES = [
    "Breakfast", "Lunch", "Dinner", "Evening Snack", "Healthy Snack", "Pre-Workout", "Post-Workout", "Dessert", "Quick Meal"
  ];

  const CUISINE_OPTIONS = [
    "South Indian", "Andhra", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "North Indian", "Mixed Indian"
  ];

  const PREFERENCE_OPTIONS = [
    "South Indian", "Vegetarian", "Vegan", "Eggetarian", "Non-Vegetarian"
  ];

  const GOAL_OPTIONS = [
    "Muscle Gain", "Weight Loss", "Fat Loss", "Diabetes Friendly", "Heart Healthy", "High Protein"
  ];

  const SAMPLE_PROMPTS = [
    "I want a South Indian high-protein breakfast",
    "I feel like eating dosa today",
    "spicy non-veg lunch under 600 calories",
    "I need foods rich in iron",
    "quick vegetarian meal in 15 minutes"
  ];

  // Fetch logged meals & water from Supabase
  const fetchLogs = async () => {
    if (!profile?.id) {
      setLoadingHistory(false);
      return;
    }
    try {
      setLoadingHistory(true);
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
          fiber_g: Number(d.fiber_g || 0),
          sugar_g: Number(d.sugar_g || 0),
          sodium_mg: Number(d.sodium_mg || 0),
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
        setWaterLogsList(waterData.map((w: any) => ({
          id: w.id,
          amount_ml: Number(w.amount_ml),
          created_at: w.created_at
        })));
        const total = waterData.reduce((sum: number, log: any) => sum + Number(log.amount_ml), 0);
        setWaterLogged(total);
      }
    } catch (e) {
      console.error("Supabase load error:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [profile]);

  // Primary recommendation generator function
  const fetchRecommendations = async (overridePrompt?: string) => {
    setLoadingAI(true);
    const activeQuery = overridePrompt !== undefined ? overridePrompt : queryPrompt;

    try {
      const response = await fetch("/api/nutrition-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryPrompt: activeQuery,
          mealCategory: selectedMealCategory,
          cuisine: selectedCuisine,
          preference: selectedPreference,
          goal: selectedGoal,
          spiceLevel: selectedSpice,
          maxPrepTimeMinutes: selectedMaxTime,
          budget: selectedBudget,
          dislikedFoods,
          favoriteFoods,
          daySeed: Date.now()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setInsights(data.insights || []);
          setHabits(data.habits || []);
          setWarnings(data.warnings || []);
        } else {
          throw new Error("Empty recommendations");
        }
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.warn("Using local Indian Nutrition Engine fallback", err);
      const fallback = generateMultiMealRecommendations({
        queryPrompt: activeQuery,
        mealCategory: selectedMealCategory,
        cuisine: selectedCuisine,
        preference: selectedPreference,
        goal: selectedGoal,
        spiceLevel: selectedSpice,
        maxPrepTimeMinutes: selectedMaxTime,
        budget: selectedBudget,
        dislikedFoods,
        favoriteFoods,
        userWeightKg: profile?.weight_kg || 70,
        daySeed: Date.now()
      });
      setRecommendations(fallback);
      setInsights(["Configured 6-10 South Indian AI recommendations."]);
    } finally {
      setLoadingAI(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (recommendations.length === 0) {
      fetchRecommendations();
    }
  }, []);

  // Handle Mark Eaten & Log Meal to database in real-time
  const handleLogMeal = async (card: RecommendationCard) => {
    if (!profile?.id) return;
    try {
      const logData = {
        user_id: profile.id,
        meal_type: card.mealType || card.dishesCategory || "breakfast",
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

  // Favorites & Dislikes handlers
  const toggleFavorite = (dishName: string) => {
    if (favoriteFoods.includes(dishName)) {
      setFavoriteFoods(favoriteFoods.filter(f => f !== dishName));
    } else {
      setFavoriteFoods([...favoriteFoods, dishName]);
      setDislikedFoods(dislikedFoods.filter(d => d !== dishName));
      confetti({ particleCount: 30, spread: 30, colors: ["#ec4899"] });
    }
  };

  const markDisliked = (dishName: string) => {
    if (!dislikedFoods.includes(dishName)) {
      const updated = [...dislikedFoods, dishName];
      setDislikedFoods(updated);
      setFavoriteFoods(favoriteFoods.filter(f => f !== dishName));
      // Instantly remove from active recommendations
      setRecommendations(recommendations.filter(r => r.name !== dishName));
    }
  };

  // Water logging & editing
  const handleLogWater = async (amountMl: number) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase.from("hydration_logs").insert({
        user_id: profile.id,
        amount_ml: amountMl
      });
      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        confetti({ particleCount: 30, spread: 30, colors: ["#3b82f6"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Today's totals calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const todayFoodLogs = foodLogs.filter(log => log.created_at.startsWith(todayStr));
  const totalCalories = todayFoodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = todayFoodLogs.reduce((acc, curr) => acc + curr.protein_g, 0);
  const totalCarbs = todayFoodLogs.reduce((acc, curr) => acc + curr.carbs_g, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-6xl">
        
        {/* Banner header */}
        <div className="p-6 rounded-3xl glass-panel border border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-amber-500/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Utensils className="h-6 w-6 text-primary animate-pulse" />
                Smart AI Indian Nutrition Assistant
              </h1>
              <p className="text-xs text-foreground/70 font-semibold mt-1">
                Conversational South Indian AI Meal Assistant • Multi-Card Recommendations • Real-Time Database Sync
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => setShowManualMealModal(true)} className="text-xs font-bold">
                + Custom Log
              </Button>
              <Button size="sm" variant="glass" onClick={() => handleLogWater(250)} className="text-xs font-bold text-amber-500 border-amber-500/20">
                +250ml Water
              </Button>
            </div>
          </div>

          {/* NATURAL LANGUAGE SEARCH BAR */}
          <div className="space-y-2 pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-foreground/45" />
              <input
                type="text"
                value={queryPrompt}
                onChange={(e) => setQueryPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRecommendations()}
                placeholder="What would you like to eat today? (e.g., 'I want a South Indian high-protein breakfast', 'foods rich in iron', 'spicy dosa')"
                className="w-full pl-11 pr-28 py-3 rounded-2xl border border-foreground/10 bg-background/90 text-foreground text-xs font-semibold focus:outline-none focus:border-primary shadow-inner"
              />
              <button
                onClick={() => fetchRecommendations()}
                disabled={loadingAI}
                className="absolute right-2 px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
              >
                {loadingAI ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Ask AI"}
              </button>
            </div>

            {/* Sample Natural Language Prompt Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-foreground/50 font-bold">Try asking:</span>
              {SAMPLE_PROMPTS.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQueryPrompt(promptText);
                    fetchRecommendations(promptText);
                  }}
                  className="px-2.5 py-1 rounded-full bg-foreground/5 hover:bg-primary/10 hover:text-primary border border-foreground/5 text-foreground/75 font-semibold transition-all text-left"
                >
                  "{promptText}"
                </button>
              ))}
            </div>
          </div>

          {/* INTERACTIVE PREFERENCE FILTER BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2 border-t border-foreground/5 text-xs font-semibold">
            {/* Meal Category */}
            <div>
              <label className="block text-[9px] font-black text-foreground/45 uppercase mb-1">Meal Category</label>
              <select
                value={selectedMealCategory}
                onChange={(e) => {
                  setSelectedMealCategory(e.target.value);
                  fetchRecommendations();
                }}
                className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground text-[11px] font-bold focus:outline-none"
              >
                {MEAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-[9px] font-black text-foreground/45 uppercase mb-1">Cuisine</label>
              <select
                value={selectedCuisine}
                onChange={(e) => {
                  setSelectedCuisine(e.target.value);
                  fetchRecommendations();
                }}
                className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground text-[11px] font-bold focus:outline-none"
              >
                {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Diet Preference */}
            <div>
              <label className="block text-[9px] font-black text-foreground/45 uppercase mb-1">Diet Preference</label>
              <select
                value={selectedPreference}
                onChange={(e) => {
                  setSelectedPreference(e.target.value);
                  fetchRecommendations();
                }}
                className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground text-[11px] font-bold focus:outline-none"
              >
                {PREFERENCE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-[9px] font-black text-foreground/45 uppercase mb-1">Target Goal</label>
              <select
                value={selectedGoal}
                onChange={(e) => {
                  setSelectedGoal(e.target.value);
                  fetchRecommendations();
                }}
                className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground text-[11px] font-bold focus:outline-none"
              >
                {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-[9px] font-black text-foreground/45 uppercase mb-1">Spice Level</label>
              <select
                value={selectedSpice}
                onChange={(e) => {
                  setSelectedSpice(e.target.value);
                  fetchRecommendations();
                }}
                className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground text-[11px] font-bold focus:outline-none"
              >
                <option value="Any">Any Spice</option>
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy 🌶️</option>
              </select>
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-[9px] font-black text-foreground/45 uppercase mb-1">Cooking Time</label>
              <select
                value={selectedMaxTime}
                onChange={(e) => {
                  setSelectedMaxTime(Number(e.target.value));
                  fetchRecommendations();
                }}
                className="w-full p-2 rounded-xl border border-foreground/10 bg-background text-foreground text-[11px] font-bold focus:outline-none"
              >
                <option value={10}>⚡ 10 mins</option>
                <option value={20}>⏱️ 20 mins</option>
                <option value={30}>🍳 30+ mins</option>
              </select>
            </div>
          </div>
        </div>

        {/* DAILY MACRO METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GlassCard glowColor="rose" className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-black text-foreground/50 uppercase">Today's Calories</span>
            <h3 className="text-3xl font-black text-rose-500 mt-2">{totalCalories} kcal</h3>
            <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalCalories / 2200) * 100)}%` }} />
            </div>
          </GlassCard>

          <GlassCard glowColor="violet" className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-black text-foreground/50 uppercase">Protein Accrued</span>
            <h3 className="text-3xl font-black text-primary mt-2">{totalProtein}g</h3>
            <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (totalProtein / 140) * 100)}%` }} />
            </div>
          </GlassCard>

          <GlassCard glowColor="emerald" className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-black text-foreground/50 uppercase">Glycogen Carbs</span>
            <h3 className="text-3xl font-black text-emerald-500 mt-2">{totalCarbs}g</h3>
            <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalCarbs / 220) * 100)}%` }} />
            </div>
          </GlassCard>

          <GlassCard glowColor="amber" className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-black text-foreground/50 uppercase">Hydration Volume</span>
            <h3 className="text-3xl font-black text-amber-500 mt-2">{waterLogged} ml</h3>
            <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (waterLogged / 2500) * 100)}%` }} />
            </div>
          </GlassCard>
        </div>

        {/* TAB NAVIGATION: RECOMMENDATIONS | FAVORITES | DISLIKED | LOGGED */}
        <div className="flex items-center gap-2 border-b border-foreground/5 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "recommendations" ? "bg-primary text-white" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            ✨ AI Recommendations ({recommendations.length})
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "favorites" ? "bg-pink-500 text-white" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            ❤️ Favorites ({favoriteFoods.length})
          </button>

          <button
            onClick={() => setActiveTab("disliked")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "disliked" ? "bg-rose-500 text-white" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            🚫 Disliked ({dislikedFoods.length})
          </button>

          <button
            onClick={() => setActiveTab("logged")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "logged" ? "bg-emerald-500 text-white" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            📋 Today's Logged ({todayFoodLogs.length})
          </button>

          <div className="ml-auto">
            <button
              onClick={() => fetchRecommendations()}
              disabled={loadingAI}
              className="px-3 py-1.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground/75 hover:text-primary text-[11px] font-bold flex items-center gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAI ? "animate-spin" : ""}`} />
              Refresh Options
            </button>
          </div>
        </div>

        {/* 6 TO 10 MULTI-CARD RECOMMENDATIONS GRID */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            {loadingAI ? (
              <div className="p-12 text-center space-y-3 rounded-3xl glass-panel border border-foreground/5">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="text-xs font-bold text-foreground/70">Analyzing your parameters & formulating 6-10 South Indian AI recommendations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((card, idx) => {
                  const isFav = favoriteFoods.includes(card.name);
                  const isLoggedToday = todayFoodLogs.some(l => l.food_name === card.name);

                  return (
                    <div
                      key={idx}
                      className="rounded-3xl glass-panel p-5 border border-foreground/5 hover:border-primary/20 bg-background/60 transition-all duration-300 flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                            {card.matchBadge}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-foreground/50 font-bold">
                            <span>⏱️ {card.prepTime}</span>
                            <span>•</span>
                            <span className="text-emerald-500 font-semibold">{card.estimatedCost}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {card.name}
                            {isFav && <span className="text-pink-500 text-xs">❤️</span>}
                          </h4>
                          {card.servingSize && (
                            <p className="text-[10px] text-primary font-bold mt-0.5">
                              Serving Portion: {card.servingSize}
                            </p>
                          )}
                          <p className="text-[11px] text-foreground/70 leading-relaxed font-semibold mt-1">
                            {card.whyHelps}
                          </p>
                        </div>

                        {/* Nutrient Tags */}
                        {card.keyNutrients && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {card.keyNutrients.map((nut, nIdx) => (
                              <span key={nIdx} className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/60 text-[9px] font-bold">
                                {nut}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Macros row */}
                      <div className="pt-3 border-t border-foreground/5 flex items-center justify-between text-xs font-bold">
                        <div className="flex gap-2">
                          <span className="text-rose-500">{card.calories} kcal</span>
                          <span className="text-primary">P: {card.protein}g</span>
                          <span className="text-emerald-500">C: {card.carbs}g</span>
                          <span className="text-amber-500">F: {card.fat}g</span>
                        </div>

                        {/* Interactive Buttons: Log Meal, Favorite, Dislike */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleFavorite(card.name)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isFav ? "bg-pink-500/10 border-pink-500/30 text-pink-500" : "bg-foreground/5 border-foreground/5 text-foreground/45 hover:text-pink-500"
                            }`}
                            title="Favorite"
                          >
                            <Heart className="h-3.5 w-3.5 fill-current" />
                          </button>

                          <button
                            onClick={() => markDisliked(card.name)}
                            className="p-1.5 rounded-lg bg-foreground/5 border border-foreground/5 text-foreground/45 hover:text-rose-500 transition-all"
                            title="Not Interested / Dislike"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedCardModal(card)}
                            className="px-2.5 py-1 rounded-xl bg-foreground/5 text-foreground/75 hover:bg-foreground/10 text-[10px] font-bold"
                          >
                            Recipe
                          </button>

                          <button
                            onClick={() => handleLogMeal(card)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                              isLoggedToday ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/90"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {isLoggedToday ? "Logged" : "Log Meal"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-pink-500 uppercase tracking-widest pl-1">Your Favorite Dishes</h3>
            {favoriteFoods.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-3xl border border-foreground/5 text-xs text-foreground/60">
                No favorites saved yet. Click the ❤️ icon on any meal card to add it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {favoriteFoods.map((favName, i) => (
                  <div key={i} className="p-4 rounded-2xl glass-panel border border-pink-500/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500 fill-current" /> {favName}
                    </span>
                    <button
                      onClick={() => toggleFavorite(favName)}
                      className="text-xs text-rose-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DISLIKED TAB */}
        {activeTab === "disliked" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest pl-1">Disliked / Excluded Dishes</h3>
            {dislikedFoods.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-3xl border border-foreground/5 text-xs text-foreground/60">
                No excluded foods. Click the 🚫 icon on any meal card to hide it from future AI recommendations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dislikedFoods.map((disName, i) => (
                  <div key={i} className="p-4 rounded-2xl glass-panel border border-rose-500/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-rose-500" /> {disName}
                    </span>
                    <button
                      onClick={() => setDislikedFoods(dislikedFoods.filter(d => d !== disName))}
                      className="text-xs text-emerald-500 font-bold hover:underline"
                    >
                      Restore to AI
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TODAY'S LOGGED TAB */}
        {activeTab === "logged" && (
          <div className="rounded-3xl glass-panel p-6 border-foreground/5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Today's Logged Meals</h3>
                <p className="text-xs text-foreground/60">Saved directly in Supabase for real-time tracking</p>
              </div>
              <Button size="sm" variant="glass" onClick={() => setShowManualMealModal(true)}>
                + Custom Log
              </Button>
            </div>

            {todayFoodLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-foreground/50 border border-dashed border-foreground/10 rounded-2xl">
                No meals logged today yet. Click "Log Meal" on any recommendation card above.
              </div>
            ) : (
              <div className="space-y-2">
                {todayFoodLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3.5 bg-foreground/3 rounded-2xl border border-foreground/5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-foreground block">{log.food_name}</span>
                      <span className="text-[10px] text-foreground/60 font-semibold block">
                        {log.meal_type.toUpperCase()} • {log.calories} kcal • P: {log.protein_g}g C: {log.carbs_g}g F: {log.fat_g}g
                      </span>
                    </div>
                    <span className="text-[9px] text-foreground/45 font-bold">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* RECIPE DETAILS MODAL */}
      {selectedCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCardModal(null)} />
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-foreground/10 bg-background/95 p-6 space-y-4 z-10 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary uppercase">{selectedCardModal.matchBadge}</span>
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

            <div className="pt-3 flex justify-end gap-2 border-t border-foreground/5">
              <Button size="sm" variant="glass" onClick={() => setSelectedCardModal(null)}>
                Close
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleLogMeal(selectedCardModal)}>
                Log Meal Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL MEAL MODAL */}
      {showManualMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowManualMealModal(false)} />
          <div className="relative w-full max-w-md rounded-3xl glass-panel border border-foreground/10 bg-background/95 p-6 space-y-4 z-10 shadow-2xl">
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
                  placeholder="e.g. South Indian Idli Sambar"
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Meal Type</label>
                  <select 
                    value={manualMealForm.meal_type}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, meal_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary"
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
                    className="w-full p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Calories</label>
                  <input 
                    type="number" 
                    value={manualMealForm.calories}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, calories: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    value={manualMealForm.protein_g}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, protein_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    value={manualMealForm.carbs_g}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, carbs_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Fat (g)</label>
                  <input 
                    type="number" 
                    value={manualMealForm.fat_g}
                    onChange={(e) => setManualMealForm({ ...manualMealForm, fat_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
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
                  fiber_g: Number(manualMealForm.fiber_g || 0),
                  sugar_g: 2,
                  sodium_mg: 200
                });
                if (!error) {
                  window.dispatchEvent(new Event("vitalcore-data-updated"));
                  await fetchLogs();
                  setShowManualMealModal(false);
                }
              }}>
                Save Meal Log
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
