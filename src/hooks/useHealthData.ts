import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

export interface HealthDigitalTwin {
  caloriesBurned: number;
  caloriesTarget: number;
  caloriesConsumed: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  hydrationMl: number;
  hydrationTarget: number;
  steps: number;
  stepsTarget: number;
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: number;
  stressLevel: number;
  mood: string;
  recoveryPercentage: number;
  fatigueScore: number;
  physicalFatigue: number;
  mentalFatigue: number;
  energyLevel: number;
  biologicalAge: number;
  stabilityScore: number;
  metabolicEfficiency: number;
  lifestyleSustainability: number;
  glycemicIndexLoad: "low" | "medium" | "high";
  sedentaryPostureRisk: "low" | "medium" | "critical";
  micronutrientDeficiencies: string[];
}

export function useHealthData() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<HealthDigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];

      // 1. Fetch Nutrition
      const { data: nutritionData } = await supabase
        .from("nutrition_logs")
        .select("calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg")
        .eq("user_id", profile.id)
        .or(`date.eq.${today},created_at.gte.${today}T00:00:00Z`);

      const caloriesConsumed = nutritionData?.reduce((sum, item) => sum + (Number(item.calories) || 0), 0) || 0;
      const proteinG = nutritionData?.reduce((sum, item) => sum + (Number(item.protein_g) || 0), 0) || 0;
      const carbsG = nutritionData?.reduce((sum, item) => sum + (Number(item.carbs_g) || 0), 0) || 0;
      const fatG = nutritionData?.reduce((sum, item) => sum + (Number(item.fat_g) || 0), 0) || 0;
      const fiberG = nutritionData?.reduce((sum, item) => sum + (Number(item.fiber_g) || 0), 0) || 0;
      const sugarG = nutritionData?.reduce((sum, item) => sum + (Number(item.sugar_g) || 0), 0) || 0;
      const sodiumMg = nutritionData?.reduce((sum, item) => sum + (Number(item.sodium_mg) || 0), 0) || 0;

      // 2. Fetch Workouts
      const { data: workoutData } = await supabase
        .from("workouts")
        .select("calories_burned")
        .eq("user_id", profile.id)
        .gte("created_at", `${today}T00:00:00Z`);
      const caloriesBurned = workoutData?.reduce((sum, item) => sum + (item.calories_burned || 0), 0) || 0;

      // 3. Fetch Hydration
      const { data: hydrationData } = await supabase
        .from("hydration_logs")
        .select("amount_ml")
        .eq("user_id", profile.id)
        .gte("created_at", `${today}T00:00:00Z`);
      const hydrationMl = hydrationData?.reduce((sum, item) => sum + (item.amount_ml || 0), 0) || 0;

      // 4. Fetch Sleep
      const { data: sleepData } = await supabase
        .from("sleep_logs")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const lastSleep = sleepData?.[0] || { sleep_hours: 0, recovery_quality: 50 };

      // 5. Fetch Recovery/Fatigue/Mood
      const { data: recoveryData } = await supabase
        .from("recovery_scores")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const lastRecovery = recoveryData?.[0] || { recovery_percentage: 50 };

      const { data: fatigueData } = await supabase
        .from("fatigue_logs")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const lastFatigue = fatigueData?.[0] || { physical_fatigue: 50, mental_fatigue: 50, fatigue_score: 50 };

      const { data: moodData } = await supabase
        .from("mood_tracking")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const lastMood = moodData?.[0] || { stress_level: 50, mood: 'neutral' };

      // 6. Fetch Steps
      const { data: stepCountData } = await supabase
        .from("workouts")
        .select("duration_minutes")
        .eq("user_id", profile.id)
        .eq("type", "steps")
        .gte("created_at", `${today}T00:00:00Z`);
        
      const realSteps = stepCountData?.reduce((sum, item) => sum + (item.duration_minutes || 0), 0) || 0;

      const realMetrics: HealthDigitalTwin = {
        caloriesBurned,
        caloriesTarget: 600,
        caloriesConsumed,
        proteinG,
        carbsG,
        fatG,
        fiberG,
        sugarG,
        sodiumMg,
        hydrationMl,
        hydrationTarget: 2500,
        steps: realSteps,
        stepsTarget: 10000,
        sleepHours: Number(lastSleep.sleep_hours || 0),
        sleepTarget: 8.0,
        sleepQuality: Number(lastSleep.recovery_quality || 50),
        stressLevel: Number(lastMood.stress_level || 50),
        mood: lastMood.mood || 'neutral',
        recoveryPercentage: Number(lastRecovery.recovery_percentage || 50),
        fatigueScore: Number(lastFatigue.fatigue_score || 50),
        physicalFatigue: Number(lastFatigue.physical_fatigue || 50),
        mentalFatigue: Number(lastFatigue.mental_fatigue || 50),
        energyLevel: 100 - Number(lastFatigue.fatigue_score || 50),
        biologicalAge: profile.biological_age || 30,
        stabilityScore: profile.stability_score || 80,
        metabolicEfficiency: 80, 
        lifestyleSustainability: 80,
        glycemicIndexLoad: "medium",
        sedentaryPostureRisk: "low",
        micronutrientDeficiencies: []
      };

      setMetrics(realMetrics);
    } catch (err: any) {
      console.error("Error fetching health data:", err);
      setError("Failed to load your health telemetry.");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchRealData();
    
    const handleDataUpdate = () => {
      fetchRealData();
    };
    
    window.addEventListener("vitalcore-data-updated", handleDataUpdate);

    let channel: any = null;
    if (supabase && profile?.id) {
      const channelId = `realtime-health-${profile.id}-${Date.now()}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hydration_logs',
            filter: `user_id=eq.${profile.id}`,
          },
          () => {
            fetchRealData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'nutrition_logs',
            filter: `user_id=eq.${profile.id}`,
          },
          () => {
            fetchRealData();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("vitalcore-data-updated", handleDataUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchRealData, profile?.id]);

  return { metrics, loading, error, refetch: fetchRealData };
}
