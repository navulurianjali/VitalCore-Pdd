"use client";

import React, { useState, useEffect } from "react";
import { 
  Utensils, 
  Droplet, 
  Plus, 
  Check, 
  RefreshCw, 
  Heart, 
  Clock, 
  Search, 
  ThumbsDown, 
  X, 
  ChevronDown,
  Sparkles,
  Flame,
  Award
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { supabase } from "@/utils/supabase";
import { 
  generateMultiMealRecommendations, 
  RecommendationCard 
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

interface WaterLog {
  id: string;
  amount_ml: number;
  created_at: string;
}

export default function SmartAINutritionPlansPage() {
  const { profile } = useAuth();

  // Search & Filter state
  const [queryPrompt, setQueryPrompt] = useState("");
  const [activeChip, setActiveChip] = useState("Breakfast");
  const [visibleCount, setVisibleCount] = useState(4); // Display TOP 3-4 cards initially!

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // User feedback tracking
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);

  // Modal inspection states
  const [selectedCardModal, setSelectedCardModal] = useState<RecommendationCard | null>(null);

  // Water & Food Logs states
  const [waterLogged, setWaterLogged] = useState(0);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

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
  });

  const FILTER_PILLS = [
    { label: "Breakfast", type: "category", val: "Breakfast" },
    { label: "Lunch", type: "category", val: "Lunch" },
    { label: "Dinner", type: "category", val: "Dinner" },
    { label: "Snacks", type: "category", val: "Evening Snack" },
    { label: "South Indian", type: "cuisine", val: "South Indian" },
    { label: "Vegetarian", type: "pref", val: "Vegetarian" },
    { label: "Non-Vegetarian", type: "pref", val: "Non-Vegetarian" },
    { label: "High Protein", type: "goal", val: "High Protein" },
    { label: "Weight Loss", type: "goal", val: "Weight Loss" },
    { label: "Quick Meals", type: "time", val: "10" }
  ];

  // Fetch logged meals & water from Supabase
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

  // Primary recommendation generator
  const fetchRecommendations = async (overrideQuery?: string, overrideChip?: string) => {
    setLoadingAI(true);
    setVisibleCount(4); // Reset to top 3-4 cards on new search!
    const activeQuery = overrideQuery !== undefined ? overrideQuery : queryPrompt;
    const activeFilterTag = overrideChip || activeChip;

    try {
      const response = await fetch("/api/nutrition-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryPrompt: activeQuery,
          mealCategory: activeFilterTag,
          cuisine: "South Indian",
          preference: activeFilterTag === "Vegetarian" ? "Vegetarian" : activeFilterTag === "Non-Vegetarian" ? "Non-Vegetarian" : "South Indian",
          goal: activeFilterTag === "High Protein" ? "High Protein" : activeFilterTag === "Weight Loss" ? "Weight Loss" : "Muscle Gain",
          dislikedFoods,
          favoriteFoods,
          daySeed: Date.now()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        } else {
          throw new Error("Empty result");
        }
      } else {
        throw new Error("API error");
      }
    } catch {
      const fallback = generateMultiMealRecommendations({
        queryPrompt: activeQuery,
        mealCategory: activeFilterTag,
        cuisine: "South Indian",
        preference: "South Indian",
        goal: "Muscle Gain",
        dislikedFoods,
        favoriteFoods,
        userWeightKg: profile?.weight_kg || 70,
        daySeed: Date.now()
      });
      setRecommendations(fallback);
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

  // Today's totals calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const todayFoodLogs = foodLogs.filter(log => log.created_at.startsWith(todayStr));
  const totalCalories = todayFoodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = todayFoodLogs.reduce((acc, curr) => acc + curr.protein_g, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        
        {/* HEADER & CLEAN SEARCH BAR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                AI Indian Nutrition Assistant
              </h1>
              <p className="text-xs text-foreground/60 font-medium">
                Personalized South Indian & regional meal recommendations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={() => setShowManualMealModal(true)} className="text-xs font-bold">
                + Log Meal
              </Button>
            </div>
          </div>

          {/* COMPACT AI SEARCH BAR WITH PROPER PADDING OFFSET */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-foreground/40 pointer-events-none z-10" />
            <input
              type="text"
              value={queryPrompt}
              onChange={(e) => setQueryPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRecommendations()}
              placeholder="What are you craving today?"
              className="w-full pl-10 pr-24 py-3.5 rounded-2xl border border-foreground/10 bg-background text-foreground text-xs font-semibold focus:outline-none focus:border-primary shadow-sm"
            />
            <button
              onClick={() => fetchRecommendations()}
              disabled={loadingAI}
              className="absolute right-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
            >
              {loadingAI ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Search"}
            </button>
          </div>

          {/* HORIZONTAL PILL-SHAPED CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            {FILTER_PILLS.map((pill, i) => {
              const isActive = activeChip === pill.val;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActiveChip(pill.val);
                    fetchRecommendations(queryPrompt, pill.val);
                  }}
                  className={`px-3.5 py-1.5 rounded-full border shrink-0 transition-all text-xs font-semibold ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background border-foreground/10 text-foreground/70 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TODAY'S MACRO SNAPSHOT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <GlassCard glowColor="rose" className="p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-foreground/50 uppercase">Today's Calories</span>
            <h3 className="text-xl font-black text-rose-500 mt-1">{totalCalories} kcal</h3>
          </GlassCard>
          <GlassCard glowColor="violet" className="p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-foreground/50 uppercase">Protein Accrued</span>
            <h3 className="text-xl font-black text-primary mt-1">{totalProtein}g</h3>
          </GlassCard>
          <GlassCard glowColor="amber" className="p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-foreground/50 uppercase">Hydration</span>
            <h3 className="text-xl font-black text-amber-500 mt-1">{waterLogged} ml</h3>
          </GlassCard>
          <GlassCard glowColor="emerald" className="p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-foreground/50 uppercase">Logged Meals</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">{todayFoodLogs.length} items</h3>
          </GlassCard>
        </div>

        {/* TOP 3-4 FOCUSED RECOMMENDATION CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Top Recommendations for You
            </h3>
            <span className="text-xs text-foreground/50 font-semibold">
              Showing top {Math.min(visibleCount, recommendations.length)} of {recommendations.length} options
            </span>
          </div>

          {loadingAI ? (
            <div className="p-12 text-center space-y-3 rounded-3xl glass-panel border border-foreground/5">
              <RefreshCw className="h-6 w-6 text-primary animate-spin mx-auto" />
              <p className="text-xs font-semibold text-foreground/60">Selecting top 3-4 AI Indian meal recommendations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, visibleCount).map((card, idx) => {
                const isFav = favoriteFoods.includes(card.name);
                const isLoggedToday = todayFoodLogs.some(l => l.food_name === card.name);

                return (
                  <div
                    key={idx}
                    className="rounded-2xl glass-panel border border-foreground/10 bg-background overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all duration-200 group shadow-sm"
                  >
                    {/* Meal Image Container */}
                    <div className="relative h-44 w-full bg-foreground/5 overflow-hidden">
                      <img
                        src={card.imageUrl || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"}
                        alt={card.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Top Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                          {card.matchBadge}
                        </span>
                        <button
                          onClick={() => toggleFavorite(card.name)}
                          className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-pink-400 transition-all"
                        >
                          <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-pink-500 text-pink-500" : ""}`} />
                        </button>
                      </div>

                      {/* Bottom Image Overlay Details */}
                      <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                        <h4 className="text-sm font-bold leading-tight drop-shadow">{card.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-white/80 mt-0.5">
                          <span>⏱️ {card.prepTime}</span>
                          <span>•</span>
                          <span>approx {card.estimatedCost}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content & Colorful Badges */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      {/* Short Tag & Colorful Badges */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-primary block">
                          ✨ {card.shortTag || "Recommended for You"}
                        </span>

                        <div className="flex flex-wrap gap-1">
                          {(card.badgeList || ["High Protein", "Easy Digestion"]).map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Macro Metrics */}
                      <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-foreground/5 text-foreground/75">
                        <span className="text-rose-500 font-extrabold">{card.calories} kcal</span>
                        <span className="text-primary font-bold">Protein: {card.protein}g</span>
                        <span className="text-emerald-500 font-bold">Carbs: {card.carbs}g</span>
                      </div>

                      {/* ONLY TWO PRIMARY BUTTONS: View Recipe & Log Meal */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setSelectedCardModal(card)}
                          className="w-full py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-all"
                        >
                          View Recipe
                        </button>

                        <button
                          onClick={() => handleLogMeal(card)}
                          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                            isLoggedToday ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/90"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {isLoggedToday ? "Logged" : "Log Meal"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SHOW MORE BUTTON */}
          {recommendations.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 4)}
                className="px-6 py-2.5 rounded-2xl border border-foreground/10 bg-background text-foreground/80 hover:text-primary hover:border-primary/40 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Show More Recommendations ({recommendations.length - visibleCount} left)</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* VIEW RECIPE DETAILED MODAL */}
      {selectedCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCardModal(null)} />
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-foreground/10 bg-background p-6 space-y-4 z-10 shadow-2xl overflow-hidden">
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
              <Button size="sm" variant="primary" onClick={() => handleLogMeal(selectedCardModal)}>
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
                  placeholder="e.g. Idli Sambar"
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
