import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { getLocalDateString } from '../utils/dateUtils';
import { getOrCreateDailyRecord, DailyHealthRecord, calculateGoalBreakdown } from '../services/dailyTracker';
import { computeDigitalTwin, HealthDigitalTwin, BaseHealthMetrics } from '../utils/digitalTwinEngine';

export type { HealthDigitalTwin, BaseHealthMetrics, DailyHealthRecord };

export interface HealthDataResult {
  metrics: HealthDigitalTwin | null;
  dailyRecord: DailyHealthRecord | null;
  loading: boolean;
  error: string | null;
  hasLoggedNutrition: boolean;
  hasLoggedHydration: boolean;
  hasLoggedSleep: boolean;
  hasLoggedWorkouts: boolean;
  selectedDate: string;
  refetch: () => Promise<void>;
}

export function useHealthData(selectedDateInput?: string): HealthDataResult {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<HealthDigitalTwin | null>(null);
  const [dailyRecord, setDailyRecord] = useState<DailyHealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasLoggedNutrition, setHasLoggedNutrition] = useState(false);
  const [hasLoggedHydration, setHasLoggedHydration] = useState(false);
  const [hasLoggedSleep, setHasLoggedSleep] = useState(false);
  const [hasLoggedWorkouts, setHasLoggedWorkouts] = useState(false);

  const activeDateRef = useRef<string>(selectedDateInput || getLocalDateString(undefined, profile?.timezone));

  const fetchRealData = useCallback(async () => {
    if (!profile?.id || !supabase) {
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
      setDailyRecord(record);

      setHasLoggedNutrition(record.calories_consumed > 0);
      setHasLoggedHydration(record.water_ml > 0);
      setHasLoggedWorkouts(record.workout_minutes > 0);
      setHasLoggedSleep(record.sleep_hours > 0);

      const baseMetrics: BaseHealthMetrics = {
        caloriesBurned: record.workout_minutes * 8,
        caloriesTarget: record.calorie_goal,
        caloriesConsumed: record.calories_consumed,
        hydrationMl: record.water_ml,
        hydrationTarget: record.water_goal_ml,
        steps: record.steps,
        stepsTarget: record.steps_goal,
        sleepHours: record.sleep_hours,
        sleepTarget: record.sleep_goal_hours,
        sleepQuality: record.sleep_hours > 0 ? Math.min(100, Math.round((record.sleep_hours / record.sleep_goal_hours) * 100)) : 0,
        stressLevel: record.stress_level || 0,
        mood: record.mood || 'neutral',
        recoveryPercentage: record.recovery_percentage || 0,
        fatigueScore: 0,
        physicalFatigue: 0,
        mentalFatigue: 0,
        energyLevel: record.recovery_percentage || 0,
        biologicalAge: profile.biological_age ? Number(profile.biological_age) : (profile.age ? Number(profile.age) : 0),
        stabilityScore: (record.sleep_hours > 0 || record.water_ml > 0 || record.calories_consumed > 0 || record.steps > 0) ? Number(profile.stability_score || 100) : 0,
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
  }, [profile, selectedDateInput]);

  useEffect(() => {
    fetchRealData();

    // App state listener for background -> foreground transitions in Expo
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        const nowLocalDate = getLocalDateString(undefined, profile?.timezone);
        if (!selectedDateInput && nowLocalDate !== activeDateRef.current) {
          activeDateRef.current = nowLocalDate;
        }
        fetchRealData();
      }
    });

    // Realtime Supabase Channels
    let channel: any = null;
    if (supabase && profile?.id) {
      const channelId = `expo-realtime-health-${profile.id}-${Math.random().toString(36).substring(2, 8)}`;
      channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hydration_logs', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'nutrition_logs', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sleep_logs', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_health_summary', filter: `user_id=eq.${profile.id}` }, fetchRealData)
        .subscribe();
    }

    return () => {
      subscription.remove();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchRealData, profile?.id, profile?.timezone, selectedDateInput]);

  return {
    metrics,
    dailyRecord,
    loading,
    error,
    hasLoggedNutrition,
    hasLoggedHydration,
    hasLoggedSleep,
    hasLoggedWorkouts,
    selectedDate: activeDateRef.current,
    refetch: fetchRealData,
  };
}
