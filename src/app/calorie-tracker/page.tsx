"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { FOOD_DATABASE, searchFoodDatabase, smartFoodSearch, calculateNutrition, FoodItem, SearchStatus } from "@/utils/foodDatabase";
import { getLocalDateString, formatDisplayDate, addDaysToDate, isRecordOnDate } from "@/utils/dateUtils";
import { Utensils, Plus, Trash2, Edit2, Search, X, Flame, CheckCircle, PieChart, Sparkles, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface LoggedFood {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snacks';
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at?: string;
}

export default function CalorieTrackerPage() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<LoggedFood[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily goals derived from user profile targets
  const goalCalories = profile?.calorie_goal || 2000;
  const goalProtein = profile?.protein_goal || 110;
  const goalCarbs = profile?.carb_goal || 225;
  const goalFat = profile?.fat_goal || 65;

  // Add/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Search & selection inside modal
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState<number>(100);

  // Date Selector state (default TODAY in local timezone)
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // Fetch food logs for selectedDate from Supabase
  const fetchLogs = async () => {
    if (!user?.id || !supabase) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data && !error) {
        const filtered = (data as any[]).filter(item => isRecordOnDate(item.date, item.created_at, selectedDate));
        setLogs(filtered as LoggedFood[]);
      }
    } catch (e) {
      console.error("Error fetching food logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (!user?.id || !supabase) return;

    const channel = supabase
      .channel(`web_nutrition_logs_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nutrition_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedDate]);

  const foodSearchResults = searchResults.length > 0 ? searchResults : searchFoodDatabase(searchQuery);
  const currentNutritionPreview = selectedFood ? calculateNutrition(selectedFood, grams) : null;

  // Open modal to add food
  const handleOpenAddModal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setActiveMealType(mealType);
    setEditingLogId(null);
    setSearchQuery("");
    const defaultFood = FOOD_DATABASE.slice(0, 10)[0];
    setSelectedFood(defaultFood);
    setGrams(100);
    setSearchStatus('idle');
    setModalOpen(true);
  };

  // Open modal to edit existing food
  const handleOpenEditModal = (log: LoggedFood) => {
    setActiveMealType(log.meal_type === 'snacks' ? 'snack' : log.meal_type);
    setEditingLogId(log.id);
    const matched = FOOD_DATABASE.find(f => log.food_name.toLowerCase().includes(f.name.toLowerCase())) || FOOD_DATABASE[0];
    setSelectedFood(matched);
    setGrams(100);
    setModalOpen(true);
  };

  // Save food log to Supabase
  const handleSaveFood = async () => {
    if (!user?.id || !selectedFood) return;

    const nutrition = calculateNutrition(selectedFood, grams);
    const formattedName = `${selectedFood.name} (${grams}g)`;

    const tempId = editingLogId || `temp-${Date.now()}`;
    const newLogEntry: LoggedFood = {
      id: tempId,
      meal_type: activeMealType,
      food_name: formattedName,
      calories: Math.round(nutrition.calories),
      protein_g: Number(nutrition.protein) || 0,
      carbs_g: Number(nutrition.carbs) || 0,
      fat_g: Number(nutrition.fat) || 0,
    };

    if (editingLogId) {
      setLogs(prev => prev.map(item => item.id === editingLogId ? { ...item, ...newLogEntry } : item));
    } else {
      setLogs(prev => [...prev, newLogEntry]);
    }
    setModalOpen(false);

    window.dispatchEvent(new Event("vitalcore-data-updated"));

    try {
      if (editingLogId) {
        const { error } = await supabase
          .from("nutrition_logs")
          .update({
            meal_type: activeMealType,
            food_name: formattedName,
            calories: Math.round(nutrition.calories),
            protein_g: Number(nutrition.protein) || 0,
            carbs_g: Number(nutrition.carbs) || 0,
            fat_g: Number(nutrition.fat) || 0,
          })
          .eq("id", editingLogId);

        if (error) console.error("Update error:", error);
        fetchLogs();
      } else {
        const { error } = await supabase
          .from("nutrition_logs")
          .insert({
            user_id: user.id,
            date: selectedDate,
            meal_type: activeMealType,
            food_name: formattedName,
            calories: Math.round(nutrition.calories),
            protein_g: Number(nutrition.protein) || 0,
            carbs_g: Number(nutrition.carbs) || 0,
            fat_g: Number(nutrition.fat) || 0,
          });

        if (error) console.error("Insert error:", error);
        fetchLogs();
      }
      window.dispatchEvent(new Event("vitalcore-data-updated"));
    } catch (e) {
      console.error("Save error:", e);
      fetchLogs();
    }
  };

  // Delete food log from Supabase
  const handleDeleteLog = async (id: string) => {
    setLogs(prev => prev.filter(item => item.id !== id));
    window.dispatchEvent(new Event("vitalcore-data-updated"));

    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("nutrition_logs")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        fetchLogs();
      }
      window.dispatchEvent(new Event("vitalcore-data-updated"));
    } catch (e) {
      console.error("Delete error:", e);
      fetchLogs();
    }
  };

  // Calculate totals
  const totalCalories = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = Number(logs.reduce((sum, item) => sum + (item.protein_g || 0), 0).toFixed(1));
  const totalCarbs = Number(logs.reduce((sum, item) => sum + (item.carbs_g || 0), 0).toFixed(1));
  const totalFat = Number(logs.reduce((sum, item) => sum + (item.fat_g || 0), 0).toFixed(1));

  const remainingCalories = Math.max(0, goalCalories - totalCalories);

  // Group logs by meal
  const breakfastLogs = logs.filter(l => l.meal_type === 'breakfast');
  const lunchLogs = logs.filter(l => l.meal_type === 'lunch');
  const dinnerLogs = logs.filter(l => l.meal_type === 'dinner');
  const snackLogs = logs.filter(l => l.meal_type === 'snack' || l.meal_type === 'snacks');



  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-foreground/5 bg-gradient-to-r from-emerald-500/10 via-background to-primary/5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Utensils className="h-6 w-6 text-emerald-500 animate-pulse" />
              Calorie Intake Tracker
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Simple and effortless daily calorie and macro intake logger.
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0 gap-1">
            <span className="text-[10px] uppercase font-bold text-foreground/50 block">Tracking Date</span>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl">
              <button 
                onClick={() => setSelectedDate(prev => addDaysToDate(prev, -1))} 
                className="p-1 hover:bg-foreground/10 rounded-lg transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4 text-emerald-400" />
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 min-w-[110px] justify-center">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDisplayDate(selectedDate)}</span>
              </div>
              <button 
                onClick={() => setSelectedDate(prev => addDaysToDate(prev, 1))} 
                disabled={selectedDate >= getLocalDateString()} 
                className="p-1 hover:bg-foreground/10 rounded-lg transition-colors disabled:opacity-30"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4 text-emerald-400" />
              </button>
              {selectedDate !== getLocalDateString() && (
                <button 
                  onClick={() => setSelectedDate(getLocalDateString())} 
                  className="text-[10px] text-emerald-400 font-extrabold underline ml-1 hover:text-emerald-300"
                >
                  Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: TODAY'S MEALS */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/60 pl-1 flex items-center gap-1.5">
            <Utensils className="h-3.5 w-3.5 text-emerald-500" />
            Section 1: Today&apos;s Meals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'breakfast' as const, label: 'Breakfast', icon: '🍳', count: breakfastLogs.length, cal: breakfastLogs.reduce((s, i) => s + i.calories, 0) },
              { type: 'lunch' as const, label: 'Lunch', icon: '🥗', count: lunchLogs.length, cal: lunchLogs.reduce((s, i) => s + i.calories, 0) },
              { type: 'dinner' as const, label: 'Dinner', icon: '🍲', count: dinnerLogs.length, cal: dinnerLogs.reduce((s, i) => s + i.calories, 0) },
              { type: 'snack' as const, label: 'Snacks', icon: '🍎', count: snackLogs.length, cal: snackLogs.reduce((s, i) => s + i.calories, 0) },
            ].map(meal => (
              <GlassCard key={meal.type} glowColor="emerald" className="p-5 flex flex-col justify-between border border-foreground/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{meal.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">{meal.label}</h3>
                      <span className="text-[10px] text-foreground/50 font-semibold">{meal.count} items logged</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">{meal.cal} kcal</span>
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleOpenAddModal(meal.type)}
                  className="w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Food</span>
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* SECTION 2: TODAY'S NUTRITION SUMMARY & SECTION 3: REMAINING CALORIES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* SECTION 2: NUTRITION SUMMARY (8 Cols) */}
          <GlassCard glowColor="violet" className="lg:col-span-8 p-6 space-y-6 border border-foreground/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-1.5">
                <PieChart className="h-4 w-4 text-primary" />
                Section 2: Today&apos;s Nutrition Summary
              </h2>
              <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">
                Daily Goal Metrics
              </span>
            </div>

            <div className="space-y-4">
              
              {/* Calories Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-foreground">
                    <Flame className="h-4 w-4 text-amber-500" />
                    Calories
                  </span>
                  <span className="text-amber-500">
                    {totalCalories} / {goalCalories} kcal
                  </span>
                </div>
                <div className="w-full bg-foreground/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalCalories / goalCalories) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Protein Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Protein</span>
                  <span className="text-emerald-400">
                    {totalProtein} / {goalProtein} g
                  </span>
                </div>
                <div className="w-full bg-foreground/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalProtein / goalProtein) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbohydrates Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Carbohydrates</span>
                  <span className="text-primary">
                    {totalCarbs} / {goalCarbs} g
                  </span>
                </div>
                <div className="w-full bg-foreground/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalCarbs / goalCarbs) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fat Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Fat</span>
                  <span className="text-rose-400">
                    {totalFat} / {goalFat} g
                  </span>
                </div>
                <div className="w-full bg-foreground/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalFat / goalFat) * 100)}%` }}
                  />
                </div>
              </div>

            </div>
          </GlassCard>

          {/* SECTION 3: REMAINING CALORIES CARD (4 Cols) */}
          <GlassCard glowColor="emerald" className="lg:col-span-4 p-6 flex flex-col justify-between border border-foreground/5 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-emerald-500" />
                Section 3: Remaining Calories
              </h2>
              <p className="text-[11px] text-foreground/60 font-semibold">
                Daily Goal − Calories Consumed
              </p>
            </div>

            <div className="space-y-3 bg-foreground/5 p-4 rounded-2xl border border-foreground/5 text-xs font-bold">
              <div className="flex justify-between items-center pb-2 border-b border-foreground/5">
                <span className="text-foreground/60">Daily Goal</span>
                <span className="text-foreground font-black">{goalCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-foreground/5">
                <span className="text-foreground/60">Consumed</span>
                <span className="text-amber-400 font-black">{totalCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-emerald-400 font-bold uppercase text-[11px]">Remaining</span>
                <span className="text-2xl font-black text-emerald-400">{remainingCalories} kcal</span>
              </div>
            </div>

            <div className="text-[10px] text-foreground/50 text-center font-semibold">
              {remainingCalories > 0 ? `You have ${remainingCalories} kcal left for today.` : 'Daily goal target reached!'}
            </div>
          </GlassCard>

        </div>

        {/* SECTION 4: TODAY'S FOOD LOG */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/60 pl-1 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            Section 4: Today&apos;s Food Log
          </h2>

          {loading ? (
            <GlassCard className="p-8 text-center text-xs text-foreground/50 font-bold">
              Fetching today&apos;s food log entries...
            </GlassCard>
          ) : logs.length === 0 ? (
            <GlassCard className="p-8 text-center text-xs text-foreground/50 font-bold space-y-2">
              <p>No food items logged for today yet.</p>
              <p className="text-[11px] text-foreground/40 font-normal">Click &quot;Add Food&quot; on any meal above to log your first meal!</p>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              {[
                { title: 'Breakfast', icon: '🍳', items: breakfastLogs, type: 'breakfast' as const },
                { title: 'Lunch', icon: '🥗', items: lunchLogs, type: 'lunch' as const },
                { title: 'Dinner', icon: '🍲', items: dinnerLogs, type: 'dinner' as const },
                { title: 'Snacks', icon: '🍎', items: snackLogs, type: 'snack' as const },
              ].map(group => (
                <div key={group.title} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span className="text-lg">{group.icon}</span>
                      <span>{group.title}</span>
                      <span className="text-[10px] text-foreground/45 bg-foreground/5 px-2 py-0.5 rounded-full font-semibold">
                        {group.items.length} items
                      </span>
                    </h3>
                    <span className="text-xs font-extrabold text-emerald-400">
                      {group.items.reduce((s, i) => s + i.calories, 0)} kcal
                    </span>
                  </div>

                  {group.items.length === 0 ? (
                    <div className="text-[11px] text-foreground/40 italic pl-6 py-1">
                      No items logged for {group.title.toLowerCase()}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map(item => (
                        <GlassCard key={item.id} className="p-3.5 flex items-center justify-between border border-foreground/5">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-foreground leading-normal">{item.food_name}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-foreground/60 font-semibold">
                              <span className="text-amber-400 font-extrabold">{item.calories} kcal</span>
                              <span>•</span>
                              <span>P: {item.protein_g}g</span>
                              <span>•</span>
                              <span>C: {item.carbs_g}g</span>
                              <span>•</span>
                              <span>F: {item.fat_g}g</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 rounded-lg text-foreground/50 hover:text-primary hover:bg-foreground/5 transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(item.id)}
                              className="p-1.5 rounded-lg text-foreground/50 hover:text-rose-400 hover:bg-foreground/5 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ADD / EDIT FOOD DIALOG MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard glowColor="emerald" className="w-full max-w-lg p-6 space-y-6 border border-foreground/10 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                  {editingLogId ? 'Edit Logged Food' : `Log ${activeMealType.toUpperCase()}`}
                </span>
                <h3 className="text-base font-bold text-foreground leading-tight">
                  Select Food & Quantity
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Food Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Search Food Database</label>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none z-10 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && foodSearchResults.length > 0 && !selectedFood) {
                      e.preventDefault();
                      setSelectedFood(foodSearchResults[0]);
                    }
                  }}
                  placeholder="e.g., Idli, Chapati, Rice, Chicken Curry, Apple..."
                  className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-xl bg-foreground/5 border border-foreground/10 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-foreground/40 transition-all leading-normal"
                />
              </div>
            </div>

            {/* Selectable Food Results */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Select Item</span>
              {foodSearchResults.length === 0 ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 text-center space-y-1">
                  <p className="font-bold">No matching foods found</p>
                  <p className="text-[11px] opacity-80">Try searching for Idli, Chapati, Rice, Dal, Chicken Curry, or Apple.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {foodSearchResults.map(food => (
                    <button
                      key={food.id}
                      onClick={() => {
                        setSelectedFood(food);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border hover:scale-[1.005] cursor-pointer ${
                        selectedFood?.id === food.id
                          ? 'bg-primary/15 border-primary text-primary shadow-sm ring-1 ring-primary/30'
                          : 'bg-foreground/5 border-foreground/8 text-foreground/80 hover:bg-foreground/10 hover:border-foreground/15'
                      }`}
                    >
                      <span className="font-bold text-foreground">{food.name}</span>
                      <span className="text-[10px] opacity-70 font-semibold tabular-nums bg-foreground/5 px-2 py-1 rounded-lg">
                        {food.per100gCalories || food.baseCalories} kcal / 100g
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {selectedFood && (
              <div className="space-y-4 pt-2 border-t border-foreground/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground uppercase">Amount in Grams</label>
                    <p className="text-[11px] text-foreground/60 font-semibold">
                      Calculated per: <span className="text-primary font-bold">100g</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGrams(prev => Math.max(10, prev - 25))}
                      className="h-9 w-9 rounded-lg bg-foreground/10 text-foreground font-bold text-base hover:bg-foreground/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step="25"
                      min="10"
                      value={grams}
                      onChange={e => setGrams(parseInt(e.target.value, 10) || 100)}
                      className="w-20 text-center py-2 text-xs font-bold rounded-lg bg-foreground/5 border border-foreground/10 text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={() => setGrams(prev => prev + 25)}
                      className="h-9 w-9 rounded-lg bg-foreground/10 text-foreground font-bold text-base hover:bg-foreground/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Auto Calculated Live Nutrition Breakdown */}
                {currentNutritionPreview && (
                  <div className="bg-foreground/5 border border-foreground/5 p-3.5 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      ⚡ Automatically Calculated Nutrition
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                      <div className="bg-background/40 p-2 rounded-xl border border-foreground/5">
                        <span className="text-[9px] text-foreground/45 block uppercase">Calories</span>
                        <span className="text-amber-400 font-extrabold">{currentNutritionPreview.calories} kcal</span>
                      </div>
                      <div className="bg-background/40 p-2 rounded-xl border border-foreground/5">
                        <span className="text-[9px] text-foreground/45 block uppercase">Protein</span>
                        <span className="text-emerald-400 font-extrabold">{currentNutritionPreview.protein}g</span>
                      </div>
                      <div className="bg-background/40 p-2 rounded-xl border border-foreground/5">
                        <span className="text-[9px] text-foreground/45 block uppercase">Carbs</span>
                        <span className="text-primary font-extrabold">{currentNutritionPreview.carbs}g</span>
                      </div>
                      <div className="bg-background/40 p-2 rounded-xl border border-foreground/5">
                        <span className="text-[9px] text-foreground/45 block uppercase">Fat</span>
                        <span className="text-rose-400 font-extrabold">{currentNutritionPreview.fat}g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="glass"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveFood}
                disabled={!selectedFood}
                className="flex-1 py-2.5 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Save Food Log
              </Button>
            </div>

          </GlassCard>
        </div>
      )}

    </DashboardLayout>
  );
}
