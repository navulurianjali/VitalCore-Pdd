import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getFutureHealthScore,
  getHabitEvolution,
  getFoodEvolution,
  getEarlyWarnings,
  getFutureTimeline,
  getHealthMilestoneForecast,
  getPersonalizedStory,
  getRiskScores,
  getDailyImprovementPlan,
  getDigitalTwinProfile,
  getNutritionIntelligence,
  getAchievementsAndMotivation,
  getHealthReport
} from "@/utils/futureLabEngine";
import { HealthDigitalTwin } from "@/hooks/useHealthData";

export async function GET(req: NextRequest) {
  try {
    let user = null;
    const authHeader = req.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
      );
      const { data: authData } = await supabaseAdmin.auth.getUser(token);
      user = authData?.user || null;
    }

    if (!user) {
      const supabase = await createClient();
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid Supabase session required." },
        { status: 401 }
      );
    }

    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bevolemwakfozxuymxsn.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
    );

    const today = new Date().toISOString().split("T")[0];

    // Fetch Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch Today's Nutrition
    const { data: nutritionData } = await supabase
      .from("nutrition_logs")
      .select("calories, protein_g, carbs_g, fat_g, food_name")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00Z`);

    const caloriesConsumed = nutritionData?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;

    // Fetch Today's Workouts
    const { data: workoutData } = await supabase
      .from("workouts")
      .select("calories_burned, duration_minutes, type")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00Z`);

    const caloriesBurned = workoutData?.reduce((sum, item) => sum + (item.calories_burned || 0), 0) || 0;
    const totalWorkoutDuration = workoutData?.reduce((sum, item) => sum + (item.duration_minutes || 0), 0) || 0;

    // Fetch Today's Hydration
    const { data: hydrationData } = await supabase
      .from("hydration_logs")
      .select("amount_ml")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00Z`);

    const hydrationMl = hydrationData?.reduce((sum, item) => sum + (item.amount_ml || 0), 0) || 0;

    // Fetch Latest Sleep Log
    const { data: sleepData } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastSleep = sleepData?.[0] || null;

    // Fetch Latest Recovery Log
    const { data: recoveryData } = await supabase
      .from("recovery_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastRecovery = recoveryData?.[0] || null;

    // Fetch Latest Fatigue Log
    const { data: fatigueData } = await supabase
      .from("fatigue_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastFatigue = fatigueData?.[0] || null;

    // Fetch Latest Mood Log
    const { data: moodData } = await supabase
      .from("mood_tracking")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastMood = moodData?.[0] || null;

    // Fetch distinct log dates count
    const [
      { data: nDates },
      { data: wDates },
      { data: hDates },
      { data: sDates }
    ] = await Promise.all([
      supabase.from("nutrition_logs").select("created_at, date").eq("user_id", user.id),
      supabase.from("workouts").select("created_at").eq("user_id", user.id),
      supabase.from("hydration_logs").select("created_at").eq("user_id", user.id),
      supabase.from("sleep_logs").select("created_at").eq("user_id", user.id)
    ]);

    const trackingDates = new Set<string>();
    (nDates || []).forEach((i: any) => { const d = i.date || i.created_at?.split('T')[0]; if (d) trackingDates.add(d); });
    (wDates || []).forEach((i: any) => { if (i.created_at) trackingDates.add(i.created_at.split('T')[0]); });
    (hDates || []).forEach((i: any) => { if (i.created_at) trackingDates.add(i.created_at.split('T')[0]); });
    (sDates || []).forEach((i: any) => { if (i.created_at) trackingDates.add(i.created_at.split('T')[0]); });

    const trackingDaysCount = trackingDates.size;
    const hasTelemetry = trackingDaysCount > 0;
    const hasEnergyTelemetry = Boolean(lastSleep || lastRecovery || lastFatigue || lastMood);

    const proteinG = nutritionData?.reduce((sum, item) => sum + (Number(item.protein_g) || 0), 0) || 0;
    const carbsG = nutritionData?.reduce((sum, item) => sum + (Number(item.carbs_g) || 0), 0) || 0;
    const fatG = nutritionData?.reduce((sum, item) => sum + (Number(item.fat_g) || 0), 0) || 0;

    const metrics: HealthDigitalTwin = {
      caloriesBurned,
      caloriesTarget: 600,
      caloriesConsumed,
      proteinG,
      carbsG,
      fatG,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
      hydrationMl,
      hydrationTarget: 2500,
      steps: totalWorkoutDuration * 80,
      stepsTarget: 10000,
      sleepHours: lastSleep ? Number(lastSleep.sleep_hours || 0) : 0,
      sleepTarget: 8.0,
      sleepQuality: lastSleep ? Number(lastSleep.recovery_quality || 0) : 0,
      stressLevel: lastMood ? Number(lastMood.stress_level || 0) : 0,
      mood: lastMood ? lastMood.mood : "neutral",
      recoveryPercentage: lastRecovery ? Number(lastRecovery.recovery_percentage || 0) : 0,
      fatigueScore: lastFatigue ? Number(lastFatigue.fatigue_score || 0) : 0,
      physicalFatigue: lastFatigue ? Number(lastFatigue.physical_fatigue || 0) : 0,
      mentalFatigue: lastFatigue ? Number(lastFatigue.mental_fatigue || 0) : 0,
      energyLevel: lastFatigue ? Math.max(0, 100 - Number(lastFatigue.fatigue_score || 0)) : 0,
      biologicalAge: profile?.biological_age || 30,
      stabilityScore: hasTelemetry ? (profile?.stability_score || 100) : 0,
      metabolicEfficiency: 0,
      lifestyleSustainability: 0,
      glycemicIndexLoad: "low",
      sedentaryPostureRisk: "low",
      micronutrientDeficiencies: [],
      trackingDaysCount,
      hasTelemetry,
      hasEnergyTelemetry
    };

    const digitalTwinProfile = getDigitalTwinProfile(metrics, profile);
    const healthScore = getFutureHealthScore(metrics);
    const habitEvo = getHabitEvolution(metrics);
    const foodEvo = getFoodEvolution(metrics);
    const earlyWarnings = getEarlyWarnings(metrics);
    const timeline = getFutureTimeline(metrics, profile?.biological_age || 30);
    const milestones = getHealthMilestoneForecast(metrics);
    const storyFeed = getPersonalizedStory(metrics);
    const riskScores = getRiskScores(metrics);
    const dailyPlan = getDailyImprovementPlan(metrics, profile);
    const nutritionIntel = getNutritionIntelligence(metrics);
    const motivation = getAchievementsAndMotivation(metrics);
    const healthReport = getHealthReport(metrics, profile);

    return NextResponse.json({
      metrics,
      digitalTwinProfile,
      healthScore,
      habitEvo,
      foodEvo,
      earlyWarnings,
      timeline,
      milestones,
      storyFeed,
      riskScores,
      dailyPlan,
      nutritionIntel,
      motivation,
      healthReport
    });
  } catch (err: any) {
    console.error("Future Health Lab API Error:", err);
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
