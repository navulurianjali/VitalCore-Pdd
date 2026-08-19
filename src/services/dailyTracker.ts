import { getLocalDateString, isRecordOnDate, getDatesInRange } from "@/utils/dateUtils";

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
/**
 * Queries a table with server-side date filtering.
 * 
 * Strategy:
 * - If the table has a `date` date column, filter: .eq("date", targetDate)
 * - Falls back to .gte("created_at", dayStart).lt("created_at", dayEnd) if date column is missing.
 * - NEVER fetches all rows and filters client-side.
 */
async function queryTableForDate(
  supabase: any,
  table: string,
  selectCols: string,
  userId: string,
  targetDate: string,
  extraFilter?: (q: any) => any
): Promise<any[]> {
  try {
    // Primary: filter by explicit `date` column (most accurate)
    let q = supabase
      .from(table)
      .select(selectCols)
      .eq("user_id", userId)
      .eq("date", targetDate);
    if (extraFilter) q = extraFilter(q);
    const res = await q;
    
    if (!res.error) {
      return res.data || [];
    }
    
    // PGRST204: `date` column doesn't exist yet — fall back to created_at range filter
    // This ensures we STILL only get today's records, not all records
    if (res.error && (res.error.code === "PGRST204" || res.error.code === "42703")) {
      // Calculate UTC day boundaries for the local date
      // e.g., for "2026-08-10" in IST (+5:30): start = "2026-08-09T18:30:00Z", end = "2026-08-10T18:30:00Z"
      const dayStart = new Date(targetDate + "T00:00:00");
      const dayEnd = new Date(targetDate + "T23:59:59.999");
      
      const fallbackCols = selectCols.split(",").map(c => c.trim()).filter(c => c !== "date").join(",");
      let fbQuery = supabase
        .from(table)
        .select(fallbackCols || selectCols)
        .eq("user_id", userId)
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());
      if (extraFilter) fbQuery = extraFilter(fbQuery);
      const fbRes = await fbQuery;
      return fbRes.data || [];
    }
    
    console.error(`[DAILY DATA] Query error for "${table}":`, res.error);
    return [];
  } catch (e) {
    console.error(`[DAILY DATA] Exception querying "${table}":`, e);
    return [];
  }
}

/**
 * Legacy helper for non-date-filtered queries (telemetry count only).
 */
async function safeQueryTable(supabase: any, table: string, selectCols: string, userId: string, extraFilter?: (q: any) => any) {
  try {
    let q = supabase.from(table).select(selectCols).eq("user_id", userId);
    if (extraFilter) q = extraFilter(q);
    const res = await q;
    if (!res.error && res.data) return res.data;
    if (res.error && (res.error.code === "42703" || res.error.code === "PGRST204") && selectCols.includes("date")) {
      const fallbackCols = selectCols.split(",").map(c => c.trim()).filter(c => c !== "date").join(",");
      let fbQuery = supabase.from(table).select(fallbackCols).eq("user_id", userId);
      if (extraFilter) fbQuery = extraFilter(fbQuery);
      const fbRes = await fbQuery;
      return fbRes.data || [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * Ensures a daily record exists for (user_id, date), calculating real totals from logs.
 * 
 * CRITICAL: All queries use server-side date filtering. 
 * We NEVER fetch all rows and filter client-side (that was the 20,750 ml bug).
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

  console.log(`[DAILY DATA] Fetching records for user=${userId.slice(0,8)}... date=${targetDate}`);

  // 1. Fetch granular logs with SERVER-SIDE date filtering
  const [
    nutritionLogs,
    workoutLogs,
    hydrationLogs,
    sleepLogs,
    recoveryLogs,
    fatigueLogs,
    moodLogs,
    habitLogs
  ] = await Promise.all([
    queryTableForDate(supabase, "nutrition_logs", "calories, protein_g, carbs_g, fat_g", userId, targetDate),
    queryTableForDate(supabase, "workouts", "calories_burned, duration_minutes, type", userId, targetDate),
    queryTableForDate(supabase, "hydration_logs", "amount_ml, date", userId, targetDate),
    queryTableForDate(supabase, "sleep_logs", "sleep_hours, recovery_quality", userId, targetDate, q => q.order("created_at", { ascending: false })),
    queryTableForDate(supabase, "recovery_scores", "recovery_percentage", userId, targetDate, q => q.order("created_at", { ascending: false })),
    queryTableForDate(supabase, "fatigue_logs", "fatigue_score, physical_fatigue, mental_fatigue", userId, targetDate, q => q.order("created_at", { ascending: false })),
    queryTableForDate(supabase, "mood_tracking", "mood, stress_level", userId, targetDate, q => q.order("created_at", { ascending: false })),
    queryTableForDate(supabase, "habit_logs", "completed", userId, targetDate, q => q.eq("completed", true))
  ]);

  const waterMl = hydrationLogs.reduce((sum: number, i: any) => sum + (Number(i.amount_ml) || 0), 0);
  
  console.log(`[DAILY HYDRATION] user=${userId.slice(0,8)}... date=${targetDate} rows=${hydrationLogs.length} total=${waterMl}ml`);

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
    // If daily_health_summary table is not yet created, return computed rawRecord gracefully
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

  // Try batch fetching from daily_health_summary
  let existingSummariesMap = new Map<string, any>();
  try {
    const { data: summaries } = await supabase
      .from("daily_health_summary")
      .select("*")
      .eq("user_id", userId)
      .in("date", dates);

    if (summaries) {
      summaries.forEach((s: any) => existingSummariesMap.set(s.date, s));
    }
  } catch (e) {
    // Table not created yet, fallback to computation below
  }

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
 * Fetches all unique dates in a given month where the authenticated user has stored data.
 */
export async function fetchActiveDatesForMonth(
  supabase: any,
  userId: string,
  year: number,
  month: number
): Promise<Set<string>> {
  if (!supabase || !userId) return new Set();

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const startDate = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${pad(month)}-${pad(lastDay)}`;

  const activeDates = new Set<string>();

  try {
    // 1. Fetch from daily_health_summary
    const { data: summaries } = await supabase
      .from("daily_health_summary")
      .select("date, has_data")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (summaries) {
      summaries.forEach((s: any) => {
        if (s.has_data && s.date) {
          activeDates.add(s.date);
        }
      });
    }

    // 2. Concurrently check telemetry tables for any date entries for this user
    const tables = ["nutrition_logs", "hydration_logs", "workouts", "sleep_logs", "habit_logs", "mood_tracking"];
    await Promise.all(
      tables.map(async (table) => {
        try {
          // First try selecting 'date'
          let res = await supabase.from(table).select("date").eq("user_id", userId);
          if (res.error || !res.data) {
            // Fallback to 'created_at' if 'date' column does not exist
            res = await supabase.from(table).select("created_at").eq("user_id", userId);
          }
          if (res.data) {
            res.data.forEach((r: any) => {
              const dStr = r.date || (r.created_at ? r.created_at.split("T")[0] : null);
              if (dStr && dStr >= startDate && dStr <= endDate) {
                activeDates.add(dStr);
              }
            });
          }
        } catch (e) {
          // Table or column missing error ignored
        }
      })
    );
  } catch (e) {
    console.error("[DAILY DATA] Error fetching active dates for month:", e);
  }

  return activeDates;
}

