import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { computeDigitalTwin, HealthDigitalTwin, BaseHealthMetrics } from '../utils/digitalTwinEngine';

export type { HealthDigitalTwin, BaseHealthMetrics };

export interface HealthDataResult {
  metrics: HealthDigitalTwin | null;
  loading: boolean;
  error: string | null;
  hasLoggedNutrition: boolean;
  hasLoggedHydration: boolean;
  hasLoggedSleep: boolean;
  hasLoggedWorkouts: boolean;
  refetch: () => Promise<void>;
}

export function useHealthData(): HealthDataResult {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<HealthDigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasLoggedNutrition, setHasLoggedNutrition] = useState(false);
  const [hasLoggedHydration, setHasLoggedHydration] = useState(false);
  const [hasLoggedSleep, setHasLoggedSleep] = useState(false);
  const [hasLoggedWorkouts, setHasLoggedWorkouts] = useState(false);

  const fetchRealData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      // 1. Fetch Today's Nutrition Logs
      const { data: nutritionData } = await supabase
        .from('nutrition_logs')
        .select('calories')
        .eq('user_id', profile.id)
        .eq('date', today);
      
      const loggedNutritionCount = nutritionData?.length || 0;
      setHasLoggedNutrition(loggedNutritionCount > 0);
      const caloriesConsumed = nutritionData?.reduce((sum, item) => sum + (Number(item.calories) || 0), 0) || 0;

      // 2. Fetch Today's Workout Logs
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('calories_burned, duration_minutes, type')
        .eq('user_id', profile.id)
        .gte('created_at', `${today}T00:00:00Z`);
      
      const loggedWorkoutCount = workoutData?.length || 0;
      setHasLoggedWorkouts(loggedWorkoutCount > 0);
      const caloriesBurned = workoutData?.reduce((sum, item) => sum + (Number(item.calories_burned) || 0), 0) || 0;

      const stepWorkouts = workoutData?.filter(w => w.type === 'steps') || [];
      const realSteps = stepWorkouts.reduce((sum, item) => sum + (Number(item.duration_minutes) || 0), 0);

      // 3. Fetch Today's Hydration Logs
      const { data: hydrationData } = await supabase
        .from('hydration_logs')
        .select('amount_ml')
        .eq('user_id', profile.id)
        .gte('created_at', `${today}T00:00:00Z`);
      
      const loggedHydrationCount = hydrationData?.length || 0;
      setHasLoggedHydration(loggedHydrationCount > 0);
      const hydrationMl = hydrationData?.reduce((sum, item) => sum + (Number(item.amount_ml) || 0), 0) || 0;

      // 4. Fetch Latest Sleep Log
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const loggedSleepCount = sleepData?.length || 0;
      setHasLoggedSleep(loggedSleepCount > 0);
      const lastSleep = sleepData?.[0] || null;

      // 5. Fetch Latest Recovery/Fatigue/Mood Logs
      const { data: recoveryData } = await supabase
        .from('recovery_scores')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      const lastRecovery = recoveryData?.[0] || null;

      const { data: fatigueData } = await supabase
        .from('fatigue_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      const lastFatigue = fatigueData?.[0] || null;

      const { data: moodData } = await supabase
        .from('mood_tracking')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      const lastMood = moodData?.[0] || null;

      const baseMetrics: BaseHealthMetrics = {
        caloriesBurned: caloriesBurned,
        caloriesTarget: profile.calorie_goal || 2000,
        caloriesConsumed: caloriesConsumed,
        hydrationMl: hydrationMl,
        hydrationTarget: profile.water_goal || 2500,
        steps: realSteps,
        stepsTarget: profile.step_goal || 10000,
        sleepHours: lastSleep ? Number(lastSleep.sleep_hours || 0) : 0,
        sleepTarget: profile.sleep_goal || 8.0,
        sleepQuality: lastSleep ? Number(lastSleep.recovery_quality || 0) : 0,
        stressLevel: lastMood ? Number(lastMood.stress_level || 0) : 0,
        mood: lastMood?.mood || 'neutral',
        recoveryPercentage: lastRecovery ? Number(lastRecovery.recovery_percentage || 0) : 0,
        fatigueScore: lastFatigue ? Number(lastFatigue.fatigue_score || 0) : 0,
        physicalFatigue: lastFatigue ? Number(lastFatigue.physical_fatigue || 0) : 0,
        mentalFatigue: lastFatigue ? Number(lastFatigue.mental_fatigue || 0) : 0,
        energyLevel: lastFatigue ? Math.max(0, 100 - Number(lastFatigue.fatigue_score || 0)) : 0,
        biologicalAge: profile.biological_age || 25.0,
        stabilityScore: profile.stability_score || 100.0,
        metabolicEfficiency: 0,
        lifestyleSustainability: 0,
        glycemicIndexLoad: 'low',
        sedentaryPostureRisk: 'low',
        micronutrientDeficiencies: [],
      };

      const twin = computeDigitalTwin(baseMetrics, profile.biological_age || 30.0);
      setMetrics(twin);
    } catch (err: any) {
      console.error('Error fetching real health telemetry:', err);
      setError('Failed to query Supabase health telemetry.');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchRealData();

    let channel: any = null;
    if (supabase && profile?.id) {
      const channelId = `expo-realtime-health-${profile.id}-${Math.random().toString(36).substring(2, 8)}`;
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
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchRealData, profile?.id]);

  return {
    metrics,
    loading,
    error,
    hasLoggedNutrition,
    hasLoggedHydration,
    hasLoggedSleep,
    hasLoggedWorkouts,
    refetch: fetchRealData,
  };
}
