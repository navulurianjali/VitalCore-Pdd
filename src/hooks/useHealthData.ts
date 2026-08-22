import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { getLocalDateString } from "@/utils/dateUtils";
import { getOrCreateDailyRecord, DailyHealthRecord, calculateGoalBreakdown } from "@/services/dailyTracker";

export interface HealthDigitalTwin {
  caloriesBurned: number;
  caloriesTarget: number;
  caloriesConsumed: number;
  proteinG: number;
  proteinTarget: number;
  carbsG: number;
  carbsTarget: number;
  fatG: number;
  fatTarget: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  hydrationMl: number;
  hydrationTarget: number;
  workoutMinutes: number;
  workoutTarget: number;
  steps: number;
  stepsTarget: number;
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: number;
  habitCompletion: number;
  overallGoalCompletion: number;
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
  trackingDaysCount: number;
  hasTelemetry: boolean;
  hasEnergyTelemetry: boolean;
  selectedDate: string;
  dailyRecord: DailyHealthRecord | null;
}

export function useHealthData(selectedDateInput?: string) {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<HealthDigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active date tracking to handle midnight boundary transitions
  const activeDateRef = useRef<string>(selectedDateInput || getLocalDateString(undefined, profile?.timezone));

  const fetchRealData = useCallback(async () => {
    if (!profile?.id) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentLocalDate = getLocalDateString(undefined, profile?.timezone);
      const targetDate = selectedDateInput || currentLocalDate;
      activeDateRef.current = targetDate;

      // 1. Get or create daily record via dailyTracker service (Database as source of truth)
      const record = await getOrCreateDailyRecord(supabase, profile.id, targetDate, profile);
      const breakdown = calculateGoalBreakdown(record);

      // 2. Query historical telemetry count for stability score
      const [{ data: rawNutrition }, { data: rawWorkouts }, { data: rawHydration }, { data: rawSleep }] = await Promise.all([
        supabase.from("nutrition_logs").select("date, created_at").eq("user_id", profile.id),
        supabase.from("workouts").select("created_at").eq("user_id", profile.id),
        supabase.from("hydration_logs").select("created_at").eq("user_id", profile.id),
        supabase.from("sleep_logs").select("created_at").eq("user_id", profile.id)
      ]);

      const trackingDates = new Set<string>();
      (rawNutrition || []).forEach((i: any) => { const d = i.date || i.created_at?.split('T')[0]; if (d) trackingDates.add(d); });
      (rawWorkouts || []).forEach((i: any) => { if (i.created_at) trackingDates.add(i.created_at.split('T')[0]); });
      (rawHydration || []).forEach((i: any) => { if (i.created_at) trackingDates.add(i.created_at.split('T')[0]); });
      (rawSleep || []).forEach((i: any) => { if (i.created_at) trackingDates.add(i.created_at.split('T')[0]); });

      const hasActivityToday = Boolean(
        record.calories_consumed > 0 ||
        record.water_ml > 0 ||
        record.workout_minutes > 0 ||
        record.sleep_hours > 0 ||
        record.steps > 0
      );

      if (hasActivityToday) {
        trackingDates.add(targetDate);
      }

      const trackingDaysCount = Math.max(hasActivityToday ? 1 : 0, trackingDates.size);
      const hasTelemetry = Boolean(hasActivityToday || trackingDaysCount > 0);

      const realMetrics: HealthDigitalTwin = {
        caloriesBurned: record.workout_minutes * 8, // Estimated calories burned from workout duration
        caloriesTarget: record.calorie_goal,
        caloriesConsumed: record.calories_consumed,
        proteinG: record.protein_g,
        proteinTarget: record.protein_goal,
        carbsG: record.carbs_g,
        carbsTarget: record.carbs_goal,
        fatG: record.fat_g,
        fatTarget: record.fat_goal,
        fiberG: 0,
        sugarG: 0,
        sodiumMg: 0,
        hydrationMl: record.water_ml,
        hydrationTarget: record.water_goal_ml,
        workoutMinutes: record.workout_minutes,
        workoutTarget: record.workout_goal_minutes,
        steps: record.steps,
        stepsTarget: record.steps_goal,
        sleepHours: record.sleep_hours,
        sleepTarget: record.sleep_goal_hours,
        sleepQuality: record.sleep_hours > 0 ? Math.min(100, Math.round((record.sleep_hours / record.sleep_goal_hours) * 100)) : 0,
        habitCompletion: record.habit_completion,
        overallGoalCompletion: record.overall_goal_completion,
        stressLevel: record.stress_level || 0,
        mood: record.mood || 'neutral',
        recoveryPercentage: record.recovery_percentage || 0,
        fatigueScore: 0,
        physicalFatigue: 0,
        mentalFatigue: 0,
        energyLevel: record.recovery_percentage || 0,
        biologicalAge: profile.biological_age ? Number(profile.biological_age) : (profile.age ? Number(profile.age) : 0),
        stabilityScore: hasTelemetry ? Number(profile.stability_score || 0) : 0,
        metabolicEfficiency: 0,
        lifestyleSustainability: 0,
        glycemicIndexLoad: "low",
        sedentaryPostureRisk: "low",
        micronutrientDeficiencies: [],
        trackingDaysCount,
        hasTelemetry,
        hasEnergyTelemetry: Boolean(record.sleep_hours > 0 || record.recovery_percentage),
        selectedDate: targetDate,
        dailyRecord: record,
      };

      setMetrics(realMetrics);
    } catch (err: any) {
      console.warn("Network fetch for health data unavailable, using clean zero baseline metrics:", err);
      const fallbackMetrics: HealthDigitalTwin = {
        caloriesBurned: 0,
        caloriesTarget: profile?.calorie_goal || 2200,
        caloriesConsumed: 0,
        proteinG: 0,
        proteinTarget: profile?.protein_goal || 140,
        carbsG: 0,
        carbsTarget: profile?.carb_goal || 240,
        fatG: 0,
        fatTarget: profile?.fat_goal || 65,
        fiberG: 0,
        sugarG: 0,
        sodiumMg: 0,
        hydrationMl: 0,
        hydrationTarget: profile?.water_goal || 2500,
        workoutMinutes: 0,
        workoutTarget: 60,
        steps: 0,
        stepsTarget: 10000,
        sleepHours: 0,
        sleepTarget: profile?.sleep_goal || 8,
        sleepQuality: 0,
        habitCompletion: 0,
        overallGoalCompletion: 0,
        stressLevel: 0,
        mood: "neutral",
        recoveryPercentage: 0,
        fatigueScore: 0,
        physicalFatigue: 0,
        mentalFatigue: 0,
        energyLevel: 0,
        biologicalAge: profile?.biological_age ? Number(profile.biological_age) : (profile?.age ? Number(profile.age) : 0),
        stabilityScore: 0,
        metabolicEfficiency: 0,
        lifestyleSustainability: 0,
        glycemicIndexLoad: "low",
        sedentaryPostureRisk: "low",
        micronutrientDeficiencies: [],
        trackingDaysCount: 0,
        hasTelemetry: false,
        hasEnergyTelemetry: false,
        selectedDate: activeDateRef.current,
        dailyRecord: null,
      };
      setMetrics(fallbackMetrics);
    } finally {
      setLoading(false);
    }
  }, [profile, selectedDateInput]);

  useEffect(() => {
    fetchRealData();

    const handleDataUpdate = () => {
      fetchRealData();
    };

    window.addEventListener("vitalcore-data-updated", handleDataUpdate);
    window.addEventListener("focus", handleDataUpdate);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        fetchRealData();
      }
    });

    // Periodic midnight boundary check (every 15 seconds)
    const timer = setInterval(() => {
      if (!selectedDateInput) {
        const nowLocalDate = getLocalDateString(undefined, profile?.timezone);
        if (nowLocalDate !== activeDateRef.current) {
          activeDateRef.current = nowLocalDate;
          fetchRealData();
        }
      }
    }, 15000);

    // Realtime Supabase Channels
    let channel: any = null;
    if (supabase && profile?.id) {
      const channelId = `realtime-health-${profile.id}-${Date.now()}`;
      channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hydration_logs', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'nutrition_logs', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sleep_logs', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_health_summary', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .subscribe();
    }

    const handleLogout = () => {
      setMetrics(null);
      setLoading(false);
    };

    window.addEventListener("vitalcore-user-logout", handleLogout);

    return () => {
      clearInterval(timer);
      window.removeEventListener("vitalcore-data-updated", handleDataUpdate);
      window.removeEventListener("vitalcore-user-logout", handleLogout);
      window.removeEventListener("focus", handleDataUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchRealData, profile?.id, profile?.timezone, selectedDateInput]);

  return { metrics, loading, error, refetch: fetchRealData };
}
