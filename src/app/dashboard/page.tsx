"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Droplet,
  Moon,
  Brain,
  Activity,
  Zap,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Wind,
  Footprints,
  ShieldAlert,
  Sparkles,
  Milestone,
  Calendar,
  Award,
  ArrowRight,
  Scan,
  Dumbbell,
  CheckSquare,
  Scale
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme, ActiveMode } from "@/context/ThemeContext";
import { useHealthData, HealthDigitalTwin } from "@/hooks/useHealthData";
import { supabase } from "@/utils/supabase";
import { getLocalDateString } from "@/utils/dateUtils";
import { calculateFutureHealthPredictions } from "@/utils/predictiveEngine";
import { usePedometer } from "@/hooks/usePedometer";

export default function DashboardPage() {
  const { profile, updateProfile } = useAuth();
  const { activeMode } = useTheme();

  const { metrics, loading, refetch } = useHealthData();
  const [waterLogged, setWaterLogged] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [sleepHrs, setSleepHrs] = useState(0);
  const [stepsLogged, setStepsLogged] = useState(0);

  // Simulation states
  const [simulating, setSimulating] = useState(false);
  const [simSleep, setSimSleep] = useState(8);
  const [simWater, setSimWater] = useState(2000);
  const [simStress, setSimStress] = useState(30);

  // Quick Logging visual feedback
  const [loggingInProgress, setLoggingInProgress] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  // Breathing (wellness mode)
  const [breathPhase, setBreathPhase] = useState("Ready");
  const [breathingActive, setBreathingActive] = useState(false);

  // Medication (elderly mode) - initialized from profile.medication_schedule / profile.medications
  const [meds, setMeds] = useState<{ name: string; time: string; taken: boolean }[]>([]);

  useEffect(() => {
    if (profile?.medication_schedule) {
      try {
        const parsed = JSON.parse(profile.medication_schedule);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMeds(parsed);
          return;
        }
      } catch (e) {
        // Fallthrough if not JSON
      }
    }
    if (profile?.medications) {
      const items = profile.medications.split(",").map(s => s.trim()).filter(Boolean);
      if (items.length > 0) {
        setMeds(items.map((name, i) => ({
          name,
          time: i === 0 ? "8:00 AM" : i === 1 ? "12:00 PM" : "6:00 PM",
          taken: false
        })));
        return;
      }
    }
    // Set empty state if user has no medications in profile
    setMeds([]);
  }, [profile?.medications, profile?.medication_schedule]);


  // Live Pedometer integration
  const pedometer = usePedometer();
  const prevSessionSteps = React.useRef(0);

  useEffect(() => {
    if (pedometer.isTracking) {
      const diff = pedometer.sessionSteps - prevSessionSteps.current;
      if (diff > 0) {
        setStepsLogged(prev => prev + diff);
        
        // Optimistically sync to DB in chunks to avoid spamming
        if (diff > 50 && profile && supabase) {
          supabase.from("workouts").insert({
            user_id: profile.id,
            name: "Live Pedometer Sync",
            type: "steps",
            duration_minutes: diff,
            calories_burned: Math.round(diff * 0.04)
          }).then(() => {
            window.dispatchEvent(new Event("vitalcore-data-updated"));
          });
        }
      }
      prevSessionSteps.current = pedometer.sessionSteps;
    } else {
      // Sync remaining steps on stop
      const finalDiff = pedometer.sessionSteps - prevSessionSteps.current;
      if (finalDiff > 0 && profile && supabase) {
        supabase.from("workouts").insert({
          user_id: profile.id,
          name: "Live Pedometer Sync",
          type: "steps",
          duration_minutes: finalDiff,
          calories_burned: Math.round(finalDiff * 0.04)
        }).then(() => {
          window.dispatchEvent(new Event("vitalcore-data-updated"));
        });
      }
      prevSessionSteps.current = 0;
    }
  }, [pedometer.sessionSteps, pedometer.isTracking]);

  useEffect(() => {
    if (metrics) {
      setWaterLogged(metrics.hydrationMl);
      setTotalCalories(metrics.caloriesConsumed);
      setSleepHrs(metrics.sleepHours);
      setStepsLogged(metrics.steps);
    } else {
      setWaterLogged(0);
      setTotalCalories(0);
      setSleepHrs(0);
      setStepsLogged(0);
    }
  }, [metrics]);

  // Real quick-logging handlers connected to Supabase
  const handleLogWater = async (amount: number) => {
    setLoggingInProgress(true);
    setLogStatus("Logging hydration...");
    try {
      if (supabase && profile) {
        const todayDate = getLocalDateString(undefined, profile?.timezone);
        const { error } = await supabase.from("hydration_logs").insert({
          user_id: profile.id,
          date: todayDate,
          amount_ml: amount
        });
        if (error) throw error;
        
        await refetch();
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      }
      setLogStatus("Hydration logged! Enjoy your day! 💧");
      setTimeout(() => setLogStatus(null), 3000);
    } catch (e) {
      console.error("Hydration logging error:", e);
      setLogStatus("Error logging hydration.");
      setTimeout(() => setLogStatus(null), 3000);
    } finally {
      setLoggingInProgress(false);
    }
  };

  const handleLogSteps = async (amount: number) => {
    setLoggingInProgress(true);
    setLogStatus("Logging steps...");
    
    try {
      if (supabase && profile) {
        const todayDate = getLocalDateString(undefined, profile?.timezone);
        const { error } = await supabase.from("workouts").insert({
          user_id: profile.id,
          date: todayDate,
          name: "Manual Steps Log",
          type: "steps",
          duration_minutes: amount,
          calories_burned: Math.round(amount * 0.04)
        });
        if (error) throw error;
        
        setStepsLogged(prev => prev + amount);
        await refetch();
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      }
      setLogStatus("Steps logged! Keep moving! 🚶");
      setTimeout(() => setLogStatus(null), 3000);
    } catch (e) {
      console.error("Steps logging error:", e);
      setLogStatus("Error logging steps.");
      setTimeout(() => setLogStatus(null), 3000);
    } finally {
      setLoggingInProgress(false);
    }
  };

  const handleLogSleep = async (hours: number, quality: number) => {
    setLoggingInProgress(true);
    setLogStatus("Logging sleep patterns...");
    try {
      if (supabase && profile) {
        const todayDate = getLocalDateString(undefined, profile?.timezone);
        const { error } = await supabase.from("sleep_logs").insert({
          user_id: profile.id,
          date: todayDate,
          sleep_hours: hours,
          recovery_quality: quality
        });
        if (error) throw error;
        
        await refetch();
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      }
      setLogStatus("Sleep logged! Rest up well! 🌙");
      setTimeout(() => setLogStatus(null), 3000);
    } catch (e) {
      console.error("Sleep logging error:", e);
      setLogStatus("Error logging sleep.");
      setTimeout(() => setLogStatus(null), 3000);
    } finally {
      setLoggingInProgress(false);
    }
  };

  // No additional local state sync needed here for profile change, useHealthData handles it

  // Box breathing timer
  useEffect(() => {
    if (!breathingActive) return;
    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      const phases = ["Inhale (4s)", "Hold (4s)", "Exhale (4s)", "Hold (4s)"];
      setBreathPhase(phases[count]);
    }, 4000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  const fallbackDigitalTwin: HealthDigitalTwin = {
    caloriesBurned: 0,
    caloriesTarget: profile?.calorie_goal || 2200,
    caloriesConsumed: totalCalories || 0,
    proteinG: 0,
    proteinTarget: profile?.protein_goal || 140,
    carbsG: 0,
    carbsTarget: profile?.carb_goal || 240,
    fatG: 0,
    fatTarget: profile?.fat_goal || 65,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
    hydrationMl: waterLogged || 0,
    hydrationTarget: profile?.water_goal || 2500,
    workoutMinutes: 0,
    workoutTarget: 60,
    steps: stepsLogged || 0,
    stepsTarget: 10000,
    sleepHours: sleepHrs || 0,
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
    biologicalAge: profile?.biological_age ? Number(profile.biological_age) : 0,
    stabilityScore: 0,
    metabolicEfficiency: 0,
    lifestyleSustainability: 0,
    glycemicIndexLoad: "low",
    sedentaryPostureRisk: "low",
    micronutrientDeficiencies: [],
    trackingDaysCount: 0,
    hasTelemetry: false,
    hasEnergyTelemetry: false,
    selectedDate: getLocalDateString(),
    dailyRecord: null,
  };

  const activeMetrics = metrics || fallbackDigitalTwin;

  const handleToggleMed = async (idx: number) => {
    const nextMeds = meds.map((m, i) => i === idx ? { ...m, taken: !m.taken } : m);
    setMeds(nextMeds);
    if (profile && updateProfile) {
      try {
        await updateProfile({ medication_schedule: JSON.stringify(nextMeds) } as any);
      } catch (e) {
        console.error("Medication status sync error:", e);
      }
    }
  };

  // Greeting helper
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const calorieTarget = (activeMetrics.caloriesTarget || 2200) * 3;
  const hydrationPct = activeMetrics.hydrationTarget > 0 ? Math.min(100, (waterLogged / activeMetrics.hydrationTarget) * 100) : 0;
  const caloriePct = calorieTarget > 0 ? Math.min(100, (totalCalories / calorieTarget) * 100) : 0;
  const sleepPct = activeMetrics.sleepTarget > 0 ? Math.min(100, (sleepHrs / activeMetrics.sleepTarget) * 100) : 0;
  const stepsPct = activeMetrics.stepsTarget > 0 ? Math.min(100, (stepsLogged / activeMetrics.stepsTarget) * 100) : 0;

  const hasUserActivity = Boolean(
    simulating ||
    totalCalories > 0 ||
    waterLogged > 0 ||
    sleepHrs > 0 ||
    stepsLogged > 0 ||
    (metrics?.hasTelemetry && metrics?.trackingDaysCount > 0)
  );

  const predictions = calculateFutureHealthPredictions({
    sleepHours: simulating ? simSleep : sleepHrs,
    sleepQuality: simulating ? (simSleep >= 8 ? 90 : simSleep >= 6 ? 70 : 45) : (sleepHrs > 0 ? (metrics?.sleepQuality || 80) : 0),
    hydrationMl: simulating ? simWater : waterLogged,
    hydrationTarget: activeMetrics.hydrationTarget || 2500,
    stressLevel: simulating ? simStress : (hasUserActivity ? activeMetrics.stressLevel : 0),
    fatigueScore: simulating ? (simStress > 60 ? 70 : 30) : (hasUserActivity ? activeMetrics.fatigueScore : 0),
    physicalFatigue: simulating ? (simStress > 60 ? 60 : 25) : (hasUserActivity ? activeMetrics.physicalFatigue : 0),
    mentalFatigue: simulating ? (simStress > 60 ? 75 : 35) : (hasUserActivity ? activeMetrics.mentalFatigue : 0),
    sorenessLevel: profile?.soreness_level || 0,
    recoveryPercentage: simulating ? (simSleep >= 8 ? 85 : 45) : (hasUserActivity ? activeMetrics.recoveryPercentage : 0),
    stabilityScore: hasUserActivity ? activeMetrics.stabilityScore : 0,
    screenTimeHours: profile?.screen_time_hours ?? undefined,
    caffeineIntake: profile?.caffeine_intake ?? undefined,
    hasTelemetry: hasUserActivity
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-2">
        {/* Page Header Welcome */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 suppressHydrationWarning className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              {greeting}{profile?.full_name ? `, ${profile.full_name.split(" ")[0].toUpperCase()}` : ""} 👋
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Here is your health overview today
            </p>
          </div>
          <Link
            href="/history"
            className="flex flex-col items-center justify-center bg-orange-500/10 border border-orange-500/30 px-5 py-2 rounded-2xl shadow-sm shadow-orange-500/10 hover:scale-105 hover:bg-orange-500/20 transition-all cursor-pointer group"
            title="View Health History & Streaks"
          >
            <span className="text-xl animate-bounce mt-0.5">🔥</span>
            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1 group-hover:underline">
              {profile?.streak_days || 0} Day Streak
            </span>
          </Link>
        </div>

        {/* Feedback banner */}
        {logStatus && (
          <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold text-center animate-[fadeIn_0.2s_ease-out]">
            {logStatus}
          </div>
        )}

        {/* ======= COMMON FOCUS CARDS GRID ======= */}
        {activeMode !== "elderly" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* Calories */}
            <Link
              href="/calorie-tracker"
              className="bg-[var(--card-bg)] border border-rose-500/30 rounded-xl p-5 hover:border-rose-500/60 hover:shadow-md hover:shadow-rose-500/10 transition-all shadow-sm group cursor-pointer block"
              title="Open Calorie & Nutrition Tracker"
            >
              <div className="flex justify-between items-center mb-3">
                <Flame className="h-[18px] w-[18px] text-rose-500" />
                <span className="text-[10px] text-rose-400 font-extrabold group-hover:underline">Track Intake →</span>
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <div className="text-2xl font-bold text-[var(--foreground)]">{totalCalories}</div>
                <div className="text-[10px] text-[var(--muted)] font-medium uppercase">kcal</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Daily Meals Logged</div>
            </Link>

            {/* Hydration */}
            <div className="bg-[var(--card-bg)] border border-blue-500/30 rounded-xl p-5 hover:border-blue-500/60 hover:shadow-md hover:shadow-blue-500/10 transition-all shadow-sm flex flex-col justify-between group">
              <Link href="/history" className="block cursor-pointer" title="Open Hydration Logs in Health History">
                <div className="flex justify-between items-center mb-3">
                  <Droplet className="h-[18px] w-[18px] text-blue-500" />
                  <span className="text-[10px] text-blue-400 font-extrabold group-hover:underline">Track Water →</span>
                </div>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <div className="text-2xl font-bold text-[var(--foreground)]">{waterLogged}</div>
                  <div className="text-[10px] text-[var(--muted)] font-medium uppercase">ml</div>
                </div>
                <div className="text-[11px] text-[var(--muted)] font-medium mb-3">Hydration Intake</div>
              </Link>
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogWater(250);
                  }}
                  className="flex-1 text-[10px] font-bold text-blue-500 bg-blue-500/5 border border-blue-500/30 rounded-lg py-1.5 hover:bg-blue-500/15 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  + 250ml
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogWater(500);
                  }}
                  className="flex-1 text-[10px] font-bold text-blue-500 bg-blue-500/5 border border-blue-500/30 rounded-lg py-1.5 hover:bg-blue-500/15 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  + 500ml
                </button>
              </div>
            </div>

            {/* Sleep */}
            <Link
              href="/sleep"
              className="bg-[var(--card-bg)] border border-violet-500/30 rounded-xl p-5 hover:border-violet-500/60 hover:shadow-md hover:shadow-violet-500/10 transition-all shadow-sm group cursor-pointer block"
              title="Open Sleep Tracking"
            >
              <div className="flex justify-between items-center mb-3">
                <Moon className="h-[18px] w-[18px] text-violet-500" />
                <span className="text-[10px] text-violet-400 font-extrabold group-hover:underline">Track Sleep →</span>
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <div className="text-2xl font-bold text-[var(--foreground)]">{sleepHrs > 0 ? sleepHrs : "0"}</div>
                <div className="text-[10px] text-[var(--muted)] font-medium uppercase">hrs</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Sleep Duration</div>
            </Link>

            {/* Steps / Activity */}
            <Link
              href="/fitness"
              className="bg-[var(--card-bg)] border border-amber-500/30 rounded-xl p-5 hover:border-amber-500/60 hover:shadow-md hover:shadow-amber-500/10 transition-all relative overflow-hidden shadow-sm group cursor-pointer block"
              title="Open Fitness & Activity Tracker"
            >
              <div className="flex justify-between items-center mb-3">
                <Footprints className="h-[18px] w-[18px] text-amber-500" />
                <span className="text-[10px] text-amber-400 font-extrabold group-hover:underline">Track Activity →</span>
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <div className="text-2xl font-bold text-[var(--foreground)]">{stepsLogged.toLocaleString()}</div>
                <div className="text-[10px] text-[var(--muted)] font-medium uppercase">steps</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Activity Tracker</div>
              
              {pedometer.isTracking && (
                <div className="absolute top-5 right-5 flex items-center gap-1.5">
                   <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                   <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Live</span>
                </div>
              )}
            </Link>

          </div>
        )}

        {/* ======= ELDERLY MODE ACCESSIBLE LAYOUT ======= */}
        {activeMode === "elderly" && (
          <div className="space-y-6">

            {/* Emergency button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-red-500/10 bg-red-500/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-600 text-base">Quick Family Alert</p>
                  <p className="text-xs text-[var(--muted)]">Instantly notify your care circle if you need help.</p>
                </div>
              </div>
              <button
                onClick={() => alert("Signal broadcasted to your care circles!")}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-2xl text-xs transition-all shrink-0 cursor-pointer shadow-sm shadow-red-500/20 active:scale-[0.98]"
              >
                Send Alert
              </button>
            </div>

            {/* Accessible metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/fitness" className="block cursor-pointer group" title="Open Steps & Activity Tracker">
                <GlassCard glowColor="emerald" className="p-6 text-center rounded-3xl group-hover:border-primary/50 transition-all">
                  <Footprints className="h-10 w-10 text-primary mx-auto mb-2" />
                  <span className="text-xs font-semibold text-[var(--muted)] block">Steps Today</span>
                  <span className="text-3xl font-bold text-[var(--foreground)] block my-1">{activeMetrics.steps}</span>
                  <span className="text-xs text-primary font-semibold group-hover:underline">Target: 5,000 steps →</span>
                </GlassCard>
              </Link>

              <div className="block">
                <GlassCard glowColor="violet" className="p-6 text-center rounded-3xl">
                  <Link href="/history" className="block cursor-pointer group" title="Open Hydration History">
                    <Droplet className="h-10 w-10 text-secondary mx-auto mb-2" />
                    <span className="text-xs font-semibold text-[var(--muted)] block">Water Logged</span>
                    <span className="text-3xl font-bold text-[var(--foreground)] block my-1">{waterLogged} ml</span>
                    <span className="text-xs text-secondary font-semibold group-hover:underline">View History →</span>
                  </Link>
                  <Button
                    variant="glass"
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogWater(250);
                    }}
                    className="mt-3 w-full border-primary/20 text-primary bg-primary/5 rounded-2xl cursor-pointer"
                  >
                    + Add 1 Cup (250ml)
                  </Button>
                </GlassCard>
              </div>
            </div>

            {/* Medication list */}
            <GlassCard glowColor="none" className="p-6 rounded-3xl">
              <h3 className="font-semibold text-sm text-[var(--foreground)] mb-4">Your Daily Reminders</h3>
              <div className="space-y-3">
                {meds.map((med, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleMed(idx)}
                    className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all ${
                      med.taken
                        ? "border-primary/10 bg-primary/5 opacity-60"
                        : "border-[var(--border)] bg-[var(--muted-bg)]/30 hover:bg-[var(--muted-bg)]/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-[var(--foreground)] block">{med.name}</span>
                      <span className="text-[10px] text-[var(--muted)]">{med.time}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${
                      med.taken
                        ? "bg-primary/10 text-primary"
                        : "bg-[var(--border)] text-[var(--muted)]"
                    }`}>
                      {med.taken ? "✓ Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        )}

        {/* ======= ATHLETE PERFORMANCE MODE ======= */}
        {activeMode === "performance" && (
          <div className="space-y-6">

            {/* Performance metrics row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/future-lab" className="block cursor-pointer group" title="Open Future Health Lab Telemetry">
                <GlassCard glowColor="violet" className="p-5 flex flex-col justify-between min-h-[130px] group-hover:border-violet-500/50 transition-all">
                  <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">CNS Fatigue</span>
                  <div className="analytics-number text-[var(--foreground)]">{activeMetrics.fatigueScore > 0 ? `${activeMetrics.fatigueScore}%` : "0%"}</div>
                  <span className="text-[10px] text-emerald-600 mt-1 block">Optimal Threshold</span>
                  <div className="progress-bar mt-3">
                    <div className="progress-bar-fill bg-primary" style={{ width: `${activeMetrics.fatigueScore}%` }} />
                  </div>
                </GlassCard>
              </Link>

              <Link href="/future-lab" className="block cursor-pointer group" title="Open HRV Status in Future Health Lab">
                <GlassCard glowColor="emerald" className="p-5 flex flex-col justify-between min-h-[130px] group-hover:border-emerald-500/50 transition-all">
                  <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">HRV Status</span>
                  <div className="analytics-number text-[var(--foreground)]">{activeMetrics.recoveryPercentage > 0 ? `${Math.round(activeMetrics.recoveryPercentage * 1.1)} ms` : "--"}</div>
                  <span className="text-[10px] text-emerald-600 mt-1 block">{activeMetrics.recoveryPercentage > 0 ? "Stable Stance" : "No telemetry"}</span>
                  <div className="progress-bar mt-3">
                    <div className="progress-bar-fill bg-secondary" style={{ width: `${activeMetrics.recoveryPercentage}%` }} />
                  </div>
                </GlassCard>
              </Link>

              <Link href="/future-lab" className="block cursor-pointer group" title="Open Metabolic Rate in Future Health Lab">
                <GlassCard glowColor="rose" className="p-5 flex flex-col justify-between min-h-[130px] group-hover:border-rose-500/50 transition-all">
                  <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">Metabolic Rate</span>
                  <div className="analytics-number text-[var(--foreground)]">{activeMetrics.metabolicEfficiency}%</div>
                  <span className="text-[10px] text-[var(--muted)] mt-1 block">{activeMetrics.metabolicEfficiency > 0 ? "Optimal" : "No telemetry"}</span>
                  <div className="progress-bar mt-3">
                    <div className="progress-bar-fill bg-rose-500/80" style={{ width: `${activeMetrics.metabolicEfficiency}%` }} />
                  </div>
                </GlassCard>
              </Link>

              <Link href="/calorie-tracker" className="block cursor-pointer group" title="Open Glycemic Intake in Calorie Tracker">
                <GlassCard glowColor="amber" className="p-5 flex flex-col justify-between min-h-[130px] group-hover:border-amber-500/50 transition-all">
                  <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">Glycemic Level</span>
                  <div className="analytics-number text-primary">{activeMetrics.caloriesConsumed > 0 ? activeMetrics.glycemicIndexLoad : "--"}</div>
                  <span className="text-[10px] text-[var(--muted)] mt-1 block">{activeMetrics.caloriesConsumed > 0 ? "Glycogen stores tracked" : "Log meals to track"}</span>
                </GlassCard>
              </Link>
            </div>

            {/* Precision macros */}
            <Link href="/calorie-tracker" className="block cursor-pointer group" title="Open Macro Breakdown in Calorie Tracker">
              <GlassCard glowColor="none" className="p-5 group-hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-xs text-[var(--foreground)] uppercase tracking-wider">Nutrition Intake vs Targets</h3>
                  </div>
                  <span className="text-[10px] text-primary font-bold group-hover:underline">Open Tracker →</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Protein", value: `${activeMetrics.proteinG} / ${activeMetrics.proteinTarget}g`, color: "text-primary" },
                    { label: "Carbs", value: `${activeMetrics.carbsG} / ${activeMetrics.carbsTarget}g`, color: "text-secondary" },
                    { label: "Healthy Fats", value: `${activeMetrics.fatG} / ${activeMetrics.fatTarget}g`, color: "text-accent" },
                  ].map((m) => (
                    <div key={m.label} className="p-4 rounded-2xl bg-[var(--muted-bg)]/45 border border-[var(--border)]">
                      <span className={`text-[10px] font-semibold ${m.color} block uppercase tracking-wider`}>{m.label}</span>
                      <span className="text-base font-bold text-[var(--foreground)] block mt-1">{m.value}</span>
                      <span className="text-[9px] text-[var(--muted)] mt-0.5 block">Logged / Target</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Link>

            {/* PR Tracker */}
            <Link href="/fitness" className="block cursor-pointer group" title="Open Fitness Benchmarks">
              <GlassCard glowColor="rose" className="p-5 group-hover:border-rose-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-rose-500" /> 
                    Personal Benchmarks
                  </span>
                  <span className="text-[9px] bg-rose-500/10 text-rose-500 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider group-hover:underline">
                    {activeMetrics.workoutMinutes > 0 ? "Active →" : "Log Workout →"}
                  </span>
                </div>
                {activeMetrics.workoutMinutes > 0 ? (
                  <div className="grid grid-cols-4 gap-3 text-center text-xs font-semibold">
                    <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                      <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Workout</span>
                      <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">{activeMetrics.workoutMinutes} min</span>
                    </div>
                    <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                      <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Active Cals</span>
                      <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">{activeMetrics.caloriesBurned} kcal</span>
                    </div>
                    <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                      <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Steps</span>
                      <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">{activeMetrics.steps}</span>
                    </div>
                    <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                      <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Target</span>
                      <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">{activeMetrics.stepsTarget}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted)] font-medium text-center py-2 group-hover:text-[var(--foreground)] transition-colors">
                    No exercise sessions recorded today. Log a workout in Fitness to record personal benchmarks.
                  </p>
                )}
              </GlassCard>
            </Link>

          </div>
        )}

        {/* ======= EVERYDAY WELLNESS MODE ======= */}
        {activeMode === "wellness" && (
          <div className="space-y-6">

            {/* Wellness indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/future-lab" className="block cursor-pointer group" title="Open Lifestyle Balance in Future Health Lab">
                <GlassCard glowColor="violet" className="p-5 flex flex-col justify-between min-h-[120px] group-hover:border-violet-500/50 transition-all">
                  <div>
                    <span className="text-[10px] font-semibold text-[var(--muted)] block uppercase tracking-wider">Lifestyle Balance</span>
                    <div className="analytics-number text-[var(--foreground)] mt-2">{activeMetrics.hasTelemetry ? `${activeMetrics.lifestyleSustainability}%` : "--"}</div>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
                    {activeMetrics.hasTelemetry ? "Consistent rest schedules protect your cardiovascular rhythm." : "Log daily activities to compute lifestyle balance."}
                  </p>
                </GlassCard>
              </Link>

              <Link href="/ai-coach" className="block cursor-pointer group" title="Consult AI Coach on Health Triggers">
                <GlassCard glowColor="amber" className="p-5 flex flex-col justify-between min-h-[120px] border border-amber-500/20 relative overflow-hidden group-hover:border-amber-500/60 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldAlert className="w-16 h-16 text-amber-500" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <span className="text-[10px] font-bold text-amber-500 block uppercase tracking-wider flex items-center gap-1.5">
                      <span className="animate-pulse">🚨</span> Daily Health Triggers
                    </span>
                    
                    <div className="bg-amber-500/10 text-amber-600 p-3 rounded-xl border border-amber-500/10 shadow-inner">
                      <p className="text-[11px] font-black leading-snug flex items-start gap-1.5">
                        <span className="mt-0.5">{activeMetrics.micronutrientDeficiencies?.length ? "⚠️" : "✅"}</span>
                        <span>
                          {activeMetrics.micronutrientDeficiencies?.[0] || (activeMetrics.hasTelemetry ? "No active health triggers detected today." : "No health triggers recorded yet. Start logging your telemetry!")}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-4 pt-3 border-t border-[var(--border)]">
                    <p className="text-[11px] font-bold text-foreground/80 leading-relaxed flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 text-sm">💡</span> 
                      <span className="flex-1 group-hover:underline">
                        {activeMetrics.micronutrientDeficiencies?.length ? "Action: Focus on dietary intake and outdoor activity today." : "Action: Keep logging your daily meals, water, and sleep to generate personalized health triggers."}
                      </span>
                    </p>
                  </div>
                </GlassCard>
              </Link>
            </div>

          </div>
        )}

        {/* ======= LIFESTYLE FORECASTS & TIMELINE ======= */}
        {predictions && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[var(--foreground)]">Health Insights</h2>
              <button
                onClick={() => setSimulating(!simulating)}
                className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                {simulating ? "Close Simulator" : "Try Simulator"}
              </button>
            </div>

            {/* Simulated sliders panel */}
            {simulating && (
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 mb-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex justify-between items-center text-[11px] font-bold text-indigo-500 mb-4 uppercase tracking-wider">
                  <span>Lifestyle Prediction Simulator</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between font-medium text-xs text-[var(--muted)]">
                      <span>Sleep</span>
                      <span className="text-[var(--foreground)]">{simSleep}h</span>
                    </div>
                    <input
                      type="range" min="4" max="10" step="0.5" value={simSleep}
                      onChange={(e) => setSimSleep(Number(e.target.value))}
                      className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between font-medium text-xs text-[var(--muted)]">
                      <span>Water Target</span>
                      <span className="text-[var(--foreground)]">{simWater} ml</span>
                    </div>
                    <input
                      type="range" min="500" max="4000" step="250" value={simWater}
                      onChange={(e) => setSimWater(Number(e.target.value))}
                      className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between font-medium text-xs text-[var(--muted)]">
                      <span>Daily Stress</span>
                      <span className="text-[var(--foreground)]">{simStress}%</span>
                    </div>
                    <input
                      type="range" min="10" max="95" step="5" value={simStress}
                      onChange={(e) => setSimStress(Number(e.target.value))}
                      className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Energy Balance */}
              <Link
                href="/future-lab"
                className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all block cursor-pointer group"
                title="View Energy Analytics in Future Health Lab"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-500" />
                  </div>
                  <span className={`text-xl font-bold ${
                    hasUserActivity
                      ? (predictions.burnoutRisk > 60 ? "text-rose-500" : predictions.burnoutRisk > 35 ? "text-amber-500" : "text-green-500")
                      : "text-[var(--muted)]"
                  }`}>
                    {hasUserActivity ? `${100 - predictions.burnoutRisk}%` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Energy Balance</h3>
                  <span className="text-[10px] text-emerald-500 font-bold group-hover:underline">View Lab →</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {hasUserActivity
                    ? (predictions.burnoutRisk > 60 ? "Focus on restorative periods today." : "Optimal energy reservoir.")
                    : "No telemetry data available yet."}
                </p>
              </Link>

              {/* Rest Profile */}
              <Link
                href="/sleep"
                className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-md transition-all block cursor-pointer group"
                title="View Sleep & Rest Analysis"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className={`text-xl font-bold ${
                    hasUserActivity
                      ? (predictions.fatigueBuildup > 65 ? "text-rose-500" : predictions.fatigueBuildup > 40 ? "text-amber-500" : "text-indigo-500")
                      : "text-[var(--muted)]"
                  }`}>
                    {hasUserActivity ? `${100 - predictions.fatigueBuildup}%` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Rest Profile</h3>
                  <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">Track Sleep →</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {hasUserActivity
                    ? (predictions.fatigueBuildup > 65 ? "Slight rest debt. Wind down early." : "Recovery battery fully charged.")
                    : "Start logging your sleep or workouts."}
                </p>
              </Link>

              {/* Recommendations */}
              <Link
                href="/ai-coach"
                className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-center min-h-[140px] block cursor-pointer group"
                title="Ask AI Coach for Personalized Recommendations"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--muted)]" />
                    <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Recommendations</h3>
                  </div>
                  <span className="text-[10px] text-primary font-bold group-hover:underline">Consult AI →</span>
                </div>
                {hasUserActivity && predictions.preventiveReminders.length > 0 ? (
                  <div className="space-y-2">
                    {predictions.preventiveReminders.slice(0, 2).map((reminder, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Sparkles className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-[var(--muted)] leading-snug">{reminder.replace("Circadian Debt Alert", "Rest Alert")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[12px] font-semibold text-[var(--foreground)]">No recommendations yet</p>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                      Start tracking your health activities to receive personalized recommendations.
                    </p>
                  </div>
                )}
              </Link>

            </div>
          </div>
        )}

        {/* ======= QUICK ACTIONS (all modes except elderly) ======= */}
        {activeMode !== "elderly" && (
          <div className="mb-8">
            <h2 className="text-[15px] font-bold text-[var(--foreground)] mb-4">Quick Actions & Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Calorie Tracker */}
              <Link href="/calorie-tracker" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-rose-500/40 hover:shadow-md transition-all group cursor-pointer" title="Calorie & Meal Tracker">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/10">
                    <Flame className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-rose-500 transition-colors">Calorie Tracker</div>
                    <div className="text-[11px] text-[var(--muted)]">Log meals & nutrition</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-rose-500 transition-colors" />
              </Link>

              {/* Log Sleep */}
              <Link href="/sleep" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-teal-500/40 hover:shadow-md transition-all group cursor-pointer" title="Sleep Tracker">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/10">
                    <Moon className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-teal-500 transition-colors">Log Sleep</div>
                    <div className="text-[11px] text-[var(--muted)]">Note last night's rest</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-teal-500 transition-colors" />
              </Link>

              {/* AI Coach */}
              <Link href="/ai-coach" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/40 hover:shadow-md transition-all group cursor-pointer" title="AI Wellness Coach">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/10">
                    <Brain className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-indigo-500 transition-colors">Wellness Chat</div>
                    <div className="text-[11px] text-[var(--muted)]">Speak with AI Coach</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-indigo-500 transition-colors" />
              </Link>

              {/* Fitness */}
              <Link href="/fitness" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-red-500/40 hover:shadow-md transition-all group cursor-pointer" title="Fitness & Workouts">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-red-500/10">
                    <Dumbbell className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-red-500 transition-colors">Fitness</div>
                    <div className="text-[11px] text-[var(--muted)]">Track & log workouts</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-red-500 transition-colors" />
              </Link>

              {/* Future Health Lab */}
              <Link href="/future-lab" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-fuchsia-500/40 hover:shadow-md transition-all group cursor-pointer" title="Future Health Lab">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-fuchsia-500/10">
                    <Sparkles className="h-5 w-5 text-fuchsia-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-fuchsia-500 transition-colors">Future Health Lab</div>
                    <div className="text-[11px] text-[var(--muted)]">Predict future trends</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-fuchsia-500 transition-colors" />
              </Link>

              {/* Healthy Habits */}
              <Link href="/challenges" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/40 hover:shadow-md transition-all group cursor-pointer" title="Healthy Habits & Challenges">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                    <CheckSquare className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-emerald-500 transition-colors">Healthy Habits</div>
                    <div className="text-[11px] text-[var(--muted)]">Daily goals & quests</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-emerald-500 transition-colors" />
              </Link>

              {/* Health History */}
              <Link href="/history" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-amber-500/40 hover:shadow-md transition-all group cursor-pointer" title="Health History & Analytics">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10">
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-amber-500 transition-colors">Health History</div>
                    <div className="text-[11px] text-[var(--muted)]">Telemetry & trends</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-amber-500 transition-colors" />
              </Link>

              {/* BMI & Body Metrics */}
              <Link href="/profile" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-sky-500/40 hover:shadow-md transition-all group cursor-pointer" title="BMI & Body Metrics">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/10">
                    <Scale className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5 group-hover:text-sky-500 transition-colors">BMI & Body Metrics</div>
                    <div className="text-[11px] text-[var(--muted)]">Biometrics & targets</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-sky-500 transition-colors" />
              </Link>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
