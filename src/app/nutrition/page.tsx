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
  Trash2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import confetti from "canvas-confetti";
import { supabase } from "@/utils/supabase";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from "recharts";
import { generateIndianMealPlan, INDIAN_RECIPES } from "@/utils/indianNutritionEngine";

interface Meal {
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  servingSize?: string;
  whyHelps: string;
  recoveryBenefits: string;
  energyBenefits: string;
  hydrationSupport: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  timingIntelligence: string;
}

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

  const [plannerStep, setPlannerStep] = useState<"onboarding" | "generating" | "ready">("ready");
  const [selectedGoal, setSelectedGoal] = useState("Muscle Gain");
  const [selectedPreference, setSelectedPreference] = useState("South Indian");
  const [activePlan, setActivePlan] = useState<{
    plan: Meal[];
    insights: string[];
    habits: string[];
    warnings: string[];
  } | null>(null);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [waterLogged, setWaterLogged] = useState(0);
  const [waterLogsList, setWaterLogsList] = useState<WaterLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Custom Interaction States
  const [selectedMealDetails, setSelectedMealDetails] = useState<Meal | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  const [editingWater, setEditingWater] = useState<WaterLog | null>(null);
  const [editWaterAmount, setEditWaterAmount] = useState(250);

  const GOAL_OPTIONS = [
    { id: "Weight Loss", label: "Weight Loss", icon: "📉", desc: "Steady deficit" },
    { id: "Weight Gain", label: "Weight Gain", icon: "📈", desc: "Gain mass" },
    { id: "Muscle Gain", label: "Muscle Gain", icon: "💪", desc: "Hypertrophy focus" },
    { id: "Diabetes-Friendly", label: "Diabetes-Friendly", icon: "🩺", desc: "Low Glycemic" },
    { id: "Heart-Healthy", label: "Heart-Healthy", icon: "❤️", desc: "Cardio recovery" },
    { id: "Stress Recovery", label: "Stress Recovery", icon: "🧠", desc: "Cortisol balance" },
    { id: "General Wellness", label: "General Wellness", icon: "🌱", desc: "Cell longevity" }
  ];

  const PREFERENCE_OPTIONS = [
    { id: "South Indian", label: "South Indian", icon: "🥥", desc: "Idli, Dosa, Sambar, Ragi, Pesarattu" },
    { id: "North Indian", label: "North Indian", icon: "🫓", desc: "Paratha, Rajma, Dal Makhani, Paneer" },
    { id: "East Indian", label: "East Indian", icon: "🍚", desc: "Litti Chokha, Sattu, Machher Jhol" },
    { id: "West Indian", label: "West Indian", icon: "🍋", desc: "Poha, Khaman Dhokla, Bajra Roti" },
    { id: "Vegetarian", label: "Vegetarian", icon: "🥗", desc: "Pan-Indian Plant & Dairy" },
    { id: "Vegan", label: "Vegan", icon: "🌿", desc: "100% Strict Plant Based" },
    { id: "Eggetarian", label: "Eggetarian", icon: "🥚", desc: "Eggs, Sprouts & Indian Veg" },
    { id: "Non-Vegetarian", label: "Non-Vegetarian", icon: "🍗", desc: "Chicken, Fish & Indian Curries" }
  ];

  const loadingPhrases = [
    "Ingesting biological sleep parameters...",
    "Querying Google Gemini AI Dietitian...",
    "Injecting workout recovery telemetry...",
    "Calibrating micro-hydration ratios...",
    "Formulating 3-step structured recipes..."
  ];

  // Fetch logged meals and water
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
        .gte("created_at", `${todayStr}T00:00:00Z`)
        .order("created_at", { ascending: false });

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

  // Default active plan initialization
  useEffect(() => {
    if (!activePlan) {
      const indianPlan = generateIndianMealPlan({
        goal: selectedGoal,
        preference: selectedPreference,
        userWeightKg: profile?.weight_kg || 70,
        daySeed: Date.now()
      });
      setActivePlan(indianPlan as any);
    }
  }, [activePlan, profile, selectedGoal, selectedPreference]);

  const handleMarkEaten = async (meal: Meal) => {
    if (!profile?.id) return;
    try {
      const logData = {
        user_id: profile.id,
        meal_type: meal.mealType,
        food_name: meal.name,
        serving_size: "1 portion",
        calories: Number(meal.calories),
        protein_g: Number(meal.protein),
        carbs_g: Number(meal.carbs),
        fat_g: Number(meal.fat),
        fiber_g: Number(meal.fiber || 0),
        sugar_g: Number(meal.sugar || 0),
        sodium_mg: 150,
        stress_eating: false
      };

      const { error } = await supabase.from("nutrition_logs").insert(logData);
      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        setSelectedMealDetails(null);
        confetti({ particleCount: 40, spread: 40, colors: ["#10b981", "#8b5cf6"] });
      }
    } catch (err) {
      console.error("Error logging meal:", err);
    }
  };

  const handleSaveManualMeal = async () => {
    if (!profile?.id || !manualMealForm.food_name) return;
    try {
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
        sugar_g: Number(manualMealForm.sugar_g || 0),
        sodium_mg: Number(manualMealForm.sodium_mg || 0),
      });

      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        setShowManualMealModal(false);
        setManualMealForm({
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
        confetti({ particleCount: 40, spread: 30, colors: ["#10b981"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditedMeal = async () => {
    if (!profile?.id || !editingMeal || !editMealForm) return;
    try {
      const { error } = await supabase
        .from("nutrition_logs")
        .update({
          meal_type: editMealForm.meal_type,
          food_name: editMealForm.food_name,
          serving_size: editMealForm.serving_size || '1 portion',
          calories: Number(editMealForm.calories || 0),
          protein_g: Number(editMealForm.protein_g || 0),
          carbs_g: Number(editMealForm.carbs_g || 0),
          fat_g: Number(editMealForm.fat_g || 0),
          fiber_g: Number(editMealForm.fiber_g || 0),
          sugar_g: Number(editMealForm.sugar_g || 0),
          sodium_mg: Number(editMealForm.sodium_mg || 0),
        })
        .eq("id", editingMeal.id)
        .eq("user_id", profile.id);

      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        setEditingMeal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from("nutrition_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", profile.id);

      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogWater = async (amount: number) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from("hydration_logs")
        .insert({
          user_id: profile.id,
          amount_ml: amount
        });
      
      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        confetti({ particleCount: 20, spread: 20, colors: ["#3b82f6"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditedWater = async () => {
    if (!profile?.id || !editingWater) return;
    try {
      const { error } = await supabase
        .from("hydration_logs")
        .update({ amount_ml: Number(editWaterAmount) })
        .eq("id", editingWater.id)
        .eq("user_id", profile.id);

      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
        setEditingWater(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWater = async (id: string) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from("hydration_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", profile.id);

      if (!error) {
        window.dispatchEvent(new Event("vitalcore-data-updated"));
        await fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Today's food logs calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayFoodLogs = foodLogs.filter(log => log.created_at.startsWith(todayStr));

  const totalCalories = todayFoodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = todayFoodLogs.reduce((acc, curr) => acc + curr.protein_g, 0);
  const totalCarbs = todayFoodLogs.reduce((acc, curr) => acc + curr.carbs_g, 0);
  const totalFat = todayFoodLogs.reduce((acc, curr) => acc + curr.fat_g, 0);

  const fatigueChartData = [
    { hour: "12:00 PM", CurrentPlan: 45, HighSugarPlan: 68 },
    { hour: "03:00 PM", CurrentPlan: 38, HighSugarPlan: 75 },
    { hour: "06:00 PM", CurrentPlan: 25, HighSugarPlan: 82 },
    { hour: "09:00 PM", CurrentPlan: 18, HighSugarPlan: 60 },
    { hour: "12:00 AM", CurrentPlan: 12, HighSugarPlan: 48 }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 max-w-6xl">
        
        {/* Banner header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5 p-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Utensils className="h-6 w-6 text-primary animate-pulse" />
              Real-Time Nutrition & Hydration Companion
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Log meals, track live water intake, edit/delete entries, and see real-time updates across devices.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowManualMealModal(true)} 
              className="text-xs font-bold flex items-center gap-1.5 bg-primary text-white shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Log Custom Meal</span>
            </Button>
            <Button 
              variant="glass" 
              size="sm" 
              onClick={() => handleLogWater(250)} 
              className="text-xs font-bold flex items-center gap-1.5 border-amber-500/20 text-amber-500 bg-amber-500/10 shrink-0"
            >
              <Droplet className="h-4 w-4" />
              <span>+250ml Water</span>
            </Button>
          </div>
        </div>

        {/* DAILY PROGRESS HEADER ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GlassCard glowColor="rose" className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-black text-foreground/50 uppercase">Calories Logged Today</span>
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

        {/* LOGGED MEALS CRUD SECTION */}
        <div className="rounded-3xl glass-panel p-6 border-foreground/5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                Today's Logged Meals
              </h3>
              <p className="text-xs text-foreground/60">Manage your logged meals, edit details or delete entries</p>
            </div>
            <Button size="sm" variant="glass" onClick={() => setShowManualMealModal(true)}>
              + Add Meal
            </Button>
          </div>

          {todayFoodLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-foreground/50 bg-foreground/5 rounded-2xl border border-foreground/5">
              No meals logged today yet. Click "+ Add Meal" or mark a recommended meal as eaten.
            </div>
          ) : (
            <div className="space-y-2">
              {todayFoodLogs.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-foreground/5 rounded-2xl border border-foreground/5 gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {item.meal_type}
                      </span>
                      <span className="text-xs font-bold text-foreground">{item.food_name}</span>
                    </div>
                    <span className="text-[10px] text-foreground/60 font-semibold block">
                      {item.calories} kcal | P: {item.protein_g}g | C: {item.carbs_g}g | F: {item.fat_g}g | Portion: {item.serving_size}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setEditingMeal(item);
                        setEditMealForm({ ...item });
                      }}
                      className="p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-colors"
                      title="Edit Meal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Meal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOGGED WATER CRUD SECTION */}
        <div className="rounded-3xl glass-panel p-6 border-foreground/5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Droplet className="h-4 w-4 text-amber-500" /> Today's Hydration Entries ({waterLogged} ml / 2500 ml)
              </h3>
              <p className="text-xs text-foreground/60">Log water intake, modify amounts, or remove entries</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLogWater(250)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition-colors"
              >
                +250 ml
              </button>
              <button
                onClick={() => handleLogWater(500)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition-colors"
              >
                +500 ml
              </button>
            </div>
          </div>

          {waterLogsList.length === 0 ? (
            <div className="p-6 text-center text-xs text-foreground/50 bg-foreground/5 rounded-2xl border border-foreground/5">
              No hydration logged today yet. Click quick add buttons above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {waterLogsList.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">+{log.amount_ml} ml</span>
                      <span className="text-[9px] text-foreground/45 font-semibold block">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingWater(log);
                        setEditWaterAmount(log.amount_ml);
                      }}
                      className="p-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/60"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteWater(log.id)}
                      className="p-1 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE PLAN MEAL RECOMMENDATIONS */}
        {activePlan && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest pl-1">
              Recommended Daily AI Meal Plan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePlan.plan.map((meal) => {
                const isLogged = foodLogs.some(l => l.meal_type === meal.mealType && l.food_name === meal.name);

                return (
                  <button
                    key={meal.mealType}
                    onClick={() => setSelectedMealDetails(meal)}
                    className="text-left rounded-3xl glass-panel p-5 border border-foreground/5 hover:border-primary/20 hover:bg-primary/3 cursor-pointer group transition-all duration-300 flex flex-col justify-between min-h-[200px]"
                  >
                    <div className="space-y-3 w-full">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-black text-foreground/40 block uppercase tracking-widest">{meal.mealType}</span>
                        <span className="text-xs text-foreground/50 font-bold block shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-foreground/45" /> {meal.prepTime}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {meal.name}
                        </h4>
                        <p className="text-[10px] text-foreground/60 leading-normal font-semibold line-clamp-2">
                          {meal.whyHelps}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-foreground/5 pt-3 w-full flex justify-between items-center text-[10px] font-bold text-foreground/50">
                      <span className="text-primary flex gap-1 font-semibold">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase flex items-center gap-0.5 ${
                        isLogged ? "bg-emerald-500/10 text-emerald-400" : "bg-foreground/5 text-foreground/50"
                      }`}>
                        <Check className="h-2.5 w-2.5" />
                        {isLogged ? "Logged" : "Log Meal"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* MANUAL MEAL LOG MODAL */}
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
                  placeholder="e.g. Scrambled Eggs & Toast"
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

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setShowManualMealModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveManualMeal}>Save Meal</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEAL MODAL */}
      {editingMeal && editMealForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingMeal(null)} />
          <div className="relative w-full max-w-md rounded-3xl glass-panel border border-foreground/10 bg-background/95 p-6 space-y-4 z-10 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground">Edit Logged Meal</h3>
              <button onClick={() => setEditingMeal(null)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Food Name</label>
                <input 
                  type="text" 
                  value={editMealForm.food_name}
                  onChange={(e) => setEditMealForm({ ...editMealForm, food_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Calories</label>
                  <input 
                    type="number" 
                    value={editMealForm.calories}
                    onChange={(e) => setEditMealForm({ ...editMealForm, calories: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    value={editMealForm.protein_g}
                    onChange={(e) => setEditMealForm({ ...editMealForm, protein_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    value={editMealForm.carbs_g}
                    onChange={(e) => setEditMealForm({ ...editMealForm, carbs_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground/60 text-[9px] uppercase font-bold mb-1">Fat (g)</label>
                  <input 
                    type="number" 
                    value={editMealForm.fat_g}
                    onChange={(e) => setEditMealForm({ ...editMealForm, fat_g: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setEditingMeal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveEditedMeal}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WATER MODAL */}
      {editingWater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingWater(null)} />
          <div className="relative w-full max-w-xs rounded-3xl glass-panel border border-foreground/10 bg-background/95 p-6 space-y-4 z-10 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Edit Water Log</h3>
              <button onClick={() => setEditingWater(null)} className="text-foreground/50 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-foreground/60 text-[10px] uppercase font-bold mb-1">Water Amount (ml)</label>
              <input 
                type="number" 
                value={editWaterAmount}
                onChange={(e) => setEditWaterAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setEditingWater(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveEditedWater}>Update</Button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC MEAL DETAILS MODAL */}
      {selectedMealDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMealDetails(null)} />
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-foreground/10 bg-background/95 p-6 space-y-6 z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 min-w-0">
                <span className="rounded-full bg-primary/10 border border-primary/15 px-2.5 py-0.5 text-[9px] font-bold text-primary capitalize">
                  Timing: {selectedMealDetails.mealType} ({selectedMealDetails.prepTime})
                </span>
                <h3 className="text-lg font-black text-foreground leading-snug">{selectedMealDetails.name}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                  Why this helps: {selectedMealDetails.whyHelps}
                </p>
              </div>
              <button 
                onClick={() => setSelectedMealDetails(null)} 
                className="h-8 w-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground shrink-0 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold bg-foreground/5 p-3 rounded-2xl border border-foreground/5">
              <div>
                <span className="text-foreground/45 block text-[9px] uppercase">Protein</span>
                <span className="text-primary font-black mt-0.5 block">{selectedMealDetails.protein}g</span>
              </div>
              <div>
                <span className="text-foreground/45 block text-[9px] uppercase">Carbs</span>
                <span className="text-secondary font-black mt-0.5 block">{selectedMealDetails.carbs}g</span>
              </div>
              <div>
                <span className="text-foreground/45 block text-[9px] uppercase">Fats</span>
                <span className="text-amber-500 font-black mt-0.5 block">{selectedMealDetails.fat}g</span>
              </div>
              <div>
                <span className="text-foreground/45 block text-[9px] uppercase">Fiber</span>
                <span className="text-emerald-400 font-black mt-0.5 block">{selectedMealDetails.fiber}g</span>
              </div>
              <div>
                <span className="text-foreground/45 block text-[9px] uppercase">Calories</span>
                <span className="text-rose-400 font-black mt-0.5 block">{selectedMealDetails.calories} kcal</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-foreground/5">
              <Button variant="glass" size="sm" onClick={() => setSelectedMealDetails(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => handleMarkEaten(selectedMealDetails)}>Mark Eaten & Log Macros</Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
