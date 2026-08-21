import { getLocalDateString, isRecordOnDate } from "../utils/dateUtils";

export interface DailyHealthRecord {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  calories_consumed: number;
  calorie_goal: number;
  protein_g: number;
  protein_goal: number;
  carbs_g: number;
  carbs_goal: number;
  fat_g: number;
  fat_goal: number;
  water_ml: number;
  water_goal_ml: number;
  workout_minutes: number;
  workout_goal_minutes: number;
  steps: number;
  steps_goal: number;
  sleep_hours: number;
  sleep_goal_hours: number;
  habit_completion: number; // 0..100
  overall_goal_completion: number; // 0..100
  mood?: string;
  stress_level?: number;
  recovery_percentage?: number;
  has_data: boolean; // false if no telemetry logged on this day
  created_at?: string;
  updated_at?: string;
}

export interface GoalAchievementBreakdown {
  caloriesPct: number;
  proteinPct: number;
  waterPct: number;
  workoutPct: number;
  stepsPct: number;
  sleepPct: number;
  habitPct: number;
  overallScore: number;
}

export interface HistoryAnalytics {
  averageCalories: number;
  averageWater: number;
  averageProtein: number;
  totalWorkouts: number;
  averageSleep: number;
  goalCompletionRate: number;
  workoutConsistency: number;
  sleepConsistency: number;
  habitConsistency: number;
  totalLoggedDays: number;
}

/**
 * Calculates individual goal achievement percentages and overall daily score.
 */
export function calculateGoalBreakdown(
  record: DailyHealthRecord
): GoalAchievementBreakdown {
  if (!record.has_data) {
    return {
      caloriesPct: 0,
      proteinPct: 0,
      waterPct: 0,
      workoutPct: 0,
      stepsPct: 0,
      sleepPct: 0,
      habitPct: 0,
      overallScore: 0,
    };
  }

  const caloriesPct = record.calorie_goal > 0 ? Math.min(100, Math.round((record.calories_consumed / record.calorie_goal) * 100)) : 0;
  const proteinPct = record.protein_goal > 0 ? Math.min(100, Math.round((record.protein_g / record.protein_goal) * 100)) : 0;
  const waterPct = record.water_goal_ml > 0 ? Math.min(100, Math.round((record.water_ml / record.water_goal_ml) * 100)) : 0;
  const workoutPct = record.workout_goal_minutes > 0 ? Math.min(100, Math.round((record.workout_minutes / record.workout_goal_minutes) * 100)) : 0;
  const stepsPct = record.steps_goal > 0 ? Math.min(100, Math.round((record.steps / record.steps_goal) * 100)) : 0;
  const sleepPct = record.sleep_goal_hours > 0 ? Math.min(100, Math.round((record.sleep_hours / record.sleep_goal_hours) * 100)) : 0;
  const habitPct = Math.min(100, Math.round(record.habit_completion || 0));

  const items = [caloriesPct, proteinPct, waterPct, workoutPct, stepsPct, sleepPct];
  const activeItems = items.filter(v => v > 0);
  const overallScore = activeItems.length > 0
    ? Math.round(activeItems.reduce((a, b) => a + b, 0) / activeItems.length)
    : Math.round((caloriesPct + proteinPct + waterPct + workoutPct + stepsPct + sleepPct + habitPct) / 7);

  return {
    caloriesPct,
    proteinPct,
    waterPct,
    workoutPct,
    stepsPct,
    sleepPct,
    habitPct,
    overallScore,
  };
}

/**
 * Ensures a daily record exists for (user_id, date), calculating real totals from logs.
 */
export async function getOrCreateDailyRecord(
  supabase: any,
  userId: string,
  targetDateStr: string,
  profile?: any
): Promise<DailyHealthRecord> {
  if (!userId || !supabase) {
    throw new Error("User ID and Supabase client are required");
  }

  const userTimezone = profile?.timezone;
  const targetDate = targetDateStr || getLocalDateString(undefined, userTimezone);

  // 1. Fetch granular logs concurrently
  const [
    { data: rawNutrition },
    { data: rawWorkouts },
    { data: rawHydration },
    { data: rawSleep },
    { data: rawRecovery },
    { data: rawFatigue },
    { data: rawMood },
    { data: rawHabits }
  ] = await Promise.all([
    supabase.from("nutrition_logs").select("calories, protein_g, carbs_g, fat_g, date, created_at").eq("user_id", userId),
    supabase.from("workouts").select("calories_burned, duration_minutes, type, date, created_at").eq("user_id", userId),
    supabase.from("hydration_logs").select("amount_ml, date, created_at").eq("user_id", userId),
    supabase.from("sleep_logs").select("sleep_hours, recovery_quality, date, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("recovery_scores").select("recovery_percentage, date, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("fatigue_logs").select("fatigue_score, physical_fatigue, mental_fatigue, date, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("mood_tracking").select("mood, stress_level, date, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("habit_logs").select("completed, date, created_at").eq("user_id", userId).eq("completed", true)
  ]);

  // Filter logs specifically for targetDate
  const nutritionLogs = (rawNutrition || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const workoutLogs = (rawWorkouts || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const hydrationLogs = (rawHydration || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const sleepLogs = (rawSleep || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const recoveryLogs = (rawRecovery || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const fatigueLogs = (rawFatigue || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const moodLogs = (rawMood || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));
  const habitLogs = (rawHabits || []).filter((item: any) => isRecordOnDate(item.date, item.created_at, targetDate, userTimezone));

  const hasData = (
    nutritionLogs.length > 0 ||
    workoutLogs.length > 0 ||
    hydrationLogs.length > 0 ||
    sleepLogs.length > 0 ||
    recoveryLogs.length > 0 ||
    moodLogs.length > 0 ||
    habitLogs.length > 0
  );

  const caloriesConsumed = nutritionLogs.reduce((sum: number, i: any) => sum + (Number(i.calories) || 0), 0);
  const proteinG = nutritionLogs.reduce((sum: number, i: any) => sum + (Number(i.protein_g) || 0), 0);
  const carbsG = nutritionLogs.reduce((sum: number, i: any) => sum + (Number(i.carbs_g) || 0), 0);
  const fatG = nutritionLogs.reduce((sum: number, i: any) => sum + (Number(i.fat_g) || 0), 0);
  const waterMl = hydrationLogs.reduce((sum: number, i: any) => sum + (Number(i.amount_ml) || 0), 0);
  const workoutMinutes = workoutLogs.reduce((sum: number, i: any) => sum + (Number(i.duration_minutes) || 0), 0);
  const steps = workoutLogs.filter((i: any) => i.type === 'steps').reduce((sum: number, i: any) => sum + (Number(i.duration_minutes) || 0), 0);
  
  const lastSleep = sleepLogs.length > 0 ? sleepLogs[0] : null;
  const sleepHours = lastSleep ? Number(lastSleep.sleep_hours || 0) : 0;

  const lastRecovery = recoveryLogs.length > 0 ? recoveryLogs[0] : null;
  const recoveryPercentage = lastRecovery ? Number(lastRecovery.recovery_percentage || 0) : 0;

  const lastMood = moodLogs.length > 0 ? moodLogs[0] : null;
  const mood = lastMood ? lastMood.mood : 'neutral';
  const stressLevel = lastMood ? Number(lastMood.stress_level || 0) : 0;

  const habitCompletion = habitLogs.length > 0 ? Math.min(100, habitLogs.length * 25) : 0;

  // Mode-adjusted goals from user profile
  const mode = profile?.active_mode || 'wellness';
  const calorieGoal = Number(profile?.calorie_goal) || 2000;
  const proteinGoal = Number(profile?.protein_goal) || (mode === 'performance' ? 140 : 110);
  const carbsGoal = Number(profile?.carb_goal) || 225;
  const fatGoal = Number(profile?.fat_goal) || 65;
  const waterGoalMl = Number(profile?.water_goal) || 2500;
  const stepsGoal = Number(profile?.step_goal) || (mode === 'elderly' ? 5000 : 10000);
  const sleepGoalHours = Number(profile?.sleep_goal) || 8.0;
  const workoutGoalMinutes = Number(profile?.workout_duration_preference) || (mode === 'elderly' ? 20 : mode === 'performance' ? 45 : 30);

  const rawRecord: DailyHealthRecord = {
    user_id: userId,
    date: targetDate,
    calories_consumed: caloriesConsumed,
    calorie_goal: calorieGoal,
    protein_g: proteinG,
    protein_goal: proteinGoal,
    carbs_g: carbsG,
    carbs_goal: carbsGoal,
    fat_g: fatG,
    fat_goal: fatGoal,
    water_ml: waterMl,
    water_goal_ml: waterGoalMl,
    workout_minutes: workoutMinutes,
    workout_goal_minutes: workoutGoalMinutes,
    steps: steps,
    steps_goal: stepsGoal,
    sleep_hours: sleepHours,
    sleep_goal_hours: sleepGoalHours,
    habit_completion: habitCompletion,
    overall_goal_completion: 0,
    mood,
    stress_level: stressLevel,
    recovery_percentage: recoveryPercentage,
    has_data: hasData,
  };

  const breakdown = calculateGoalBreakdown(rawRecord);
  rawRecord.overall_goal_completion = breakdown.overallScore;

  // Try persisting to daily_health_summary table if available
  try {
    const { data: upsertedData, error: upsertError } = await supabase
      .from("daily_health_summary")
      .upsert(
        {
          user_id: userId,
          date: targetDate,
          calories_consumed: caloriesConsumed,
          calorie_goal: calorieGoal,
          protein_g: proteinG,
          protein_goal: proteinGoal,
          carbs_g: carbsG,
          carbs_goal: carbsGoal,
          fat_g: fatG,
          fat_goal: fatGoal,
          water_ml: waterMl,
          water_goal_ml: waterGoalMl,
          workout_minutes: workoutMinutes,
          workout_goal_minutes: workoutGoalMinutes,
          steps: steps,
          steps_goal: stepsGoal,
          sleep_hours: sleepHours,
          sleep_goal_hours: sleepGoalHours,
          habit_completion: habitCompletion,
          overall_goal_completion: breakdown.overallScore,
          mood,
          stress_level: stressLevel,
          recovery_percentage: recoveryPercentage,
          has_data: hasData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .maybeSingle();

    if (upsertedData && !upsertError) {
      return { ...rawRecord, id: upsertedData.id };
    }
  } catch (e) {
    // Fallback if table not present
  }

  return rawRecord;
}

/**
 * Fetches daily records across a list of dates.
 */
export async function fetchDailyHistory(
  supabase: any,
  userId: string,
  dates: string[],
  profile?: any
): Promise<DailyHealthRecord[]> {
  if (!userId || !supabase || !dates || dates.length === 0) return [];

  const results: DailyHealthRecord[] = [];
  for (const d of dates) {
    const record = await getOrCreateDailyRecord(supabase, userId, d, profile);
    results.push(record);
  }

  return results;
}

/**
 * Computes historical summary metrics (averages, totals, consistency) over a date range.
 */
export function computeHistoryAnalytics(records: DailyHealthRecord[]): HistoryAnalytics {
  const loggedDays = records.filter(r => r.has_data);
  const totalDaysCount = records.length;
  const loggedCount = loggedDays.length;

  if (loggedCount === 0) {
    return {
      averageCalories: 0,
      averageWater: 0,
      averageProtein: 0,
      totalWorkouts: 0,
      averageSleep: 0,
      goalCompletionRate: 0,
      workoutConsistency: 0,
      sleepConsistency: 0,
      habitConsistency: 0,
      totalLoggedDays: 0,
    };
  }

  const averageCalories = Math.round(loggedDays.reduce((acc, r) => acc + r.calories_consumed, 0) / loggedCount);
  const averageWater = Math.round(loggedDays.reduce((acc, r) => acc + r.water_ml, 0) / loggedCount);
  const averageProtein = Math.round(loggedDays.reduce((acc, r) => acc + r.protein_g, 0) / loggedCount);
  const totalWorkouts = loggedDays.reduce((acc, r) => acc + (r.workout_minutes > 0 ? 1 : 0), 0);
  
  const sleepLoggedDays = loggedDays.filter(r => r.sleep_hours > 0);
  const averageSleep = sleepLoggedDays.length > 0
    ? Number((sleepLoggedDays.reduce((acc, r) => acc + r.sleep_hours, 0) / sleepLoggedDays.length).toFixed(1))
    : 0;

  const goalCompletionRate = Math.round(loggedDays.reduce((acc, r) => acc + r.overall_goal_completion, 0) / loggedCount);
  const workoutConsistency = Math.round((totalWorkouts / totalDaysCount) * 100);
  const sleepConsistency = Math.round((sleepLoggedDays.length / totalDaysCount) * 100);
  const habitConsistency = Math.round(loggedDays.reduce((acc, r) => acc + r.habit_completion, 0) / loggedCount);

  return {
    averageCalories,
    averageWater,
    averageProtein,
    totalWorkouts,
    averageSleep,
    goalCompletionRate,
    workoutConsistency,
    sleepConsistency,
    habitConsistency,
    totalLoggedDays: loggedCount,
  };
}

/**
 * Fetches all dates within a given month that have active health logs in Supabase.
 */
export async function fetchActiveDatesForMonth(
  supabase: any,
  userId: string,
  year: number,
  month: number
): Promise<Set<string>> {
  const activeDates = new Set<string>();
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const startStr = `${year}-${monthStr}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonthStr = nextMonth < 10 ? `0${nextMonth}` : `${nextMonth}`;
  const endStr = `${nextYear}-${nextMonthStr}-01`;

  try {
    const [hyd, nut, slp, wkt] = await Promise.all([
      supabase.from('hydration_logs').select('date').eq('user_id', userId).gte('date', startStr).lt('date', endStr),
      supabase.from('nutrition_logs').select('date').eq('user_id', userId).gte('date', startStr).lt('date', endStr),
      supabase.from('sleep_logs').select('date').eq('user_id', userId).gte('date', startStr).lt('date', endStr),
      supabase.from('workouts').select('date').eq('user_id', userId).gte('date', startStr).lt('date', endStr),
    ]);

    [...(hyd.data || []), ...(nut.data || []), ...(slp.data || []), ...(wkt.data || [])].forEach((item: any) => {
      if (item.date) activeDates.add(item.date);
    });
  } catch (e) {
    console.error('fetchActiveDatesForMonth error:', e);
  }

  return activeDates;
}
