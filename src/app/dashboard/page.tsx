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
  Dumbbell
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme, ActiveMode } from "@/context/ThemeContext";
import { useHealthData, HealthDigitalTwin } from "@/hooks/useHealthData";
import { supabase } from "@/utils/supabase";
import { calculateFutureHealthPredictions } from "@/utils/predictiveEngine";
import { usePedometer } from "@/hooks/usePedometer";

export default function DashboardPage() {
  const { profile } = useAuth();
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

  // Medication (elderly mode)
  const [meds, setMeds] = useState([
    { name: "Blood Pressure Capsule", time: "8:00 AM", taken: true },
    { name: "Joint Strength Vitamin D", time: "12:00 PM", taken: false },
    { name: "Glucosamine Tablet", time: "6:00 PM", taken: false }
  ]);

  // Live Pedometer integration
  const pedometer = usePedometer();
  const prevSessionSteps = React.useRef(0);

  useEffect(() => {
    if (pedometer.isTracking) {
      const diff = pedometer.sessionSteps - prevSessionSteps.current;
      if (diff > 0) {
        setStepsLogged(prev => {
          const updated = prev + diff;
          localStorage.setItem("vitalcore_daily_steps", updated.toString());
          return updated;
        });
      }
      prevSessionSteps.current = pedometer.sessionSteps;
    } else {
      prevSessionSteps.current = 0;
    }
  }, [pedometer.sessionSteps, pedometer.isTracking]);

  useEffect(() => {
    if (metrics) {
      setWaterLogged(metrics.hydrationMl);
      setTotalCalories(metrics.caloriesConsumed);
      setSleepHrs(metrics.sleepHours);
      setStepsLogged(metrics.steps);
    }
  }, [metrics]);

  // Real quick-logging handlers connected to Supabase
  const handleLogWater = async (amount: number) => {
    setLoggingInProgress(true);
    setLogStatus("Logging hydration...");
    try {
      if (supabase && profile) {
        const { error } = await supabase.from("hydration_logs").insert({
          user_id: profile.id,
          amount_ml: amount
        });
        if (error) throw error;
        
        await refetch();
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      } else {
        // Fallback for unauthenticated/offline
        setWaterLogged(w => w + amount);
      }
      setLogStatus("Hydration logged! Enjoy your day! 💧");
      setTimeout(() => setLogStatus(null), 3000);
    } catch (e) {
      console.error("Hydration logging error:", e);
      setWaterLogged(w => w + amount);
      setLogStatus("Logged locally.");
      setTimeout(() => setLogStatus(null), 3000);
    } finally {
      setLoggingInProgress(false);
    }
  };

  const handleLogSteps = (amount: number) => {
    setLoggingInProgress(true);
    setLogStatus("Logging steps...");
    const newSteps = stepsLogged + amount;
    setStepsLogged(newSteps);
    localStorage.setItem("vitalcore_daily_steps", newSteps.toString());
    
    // Simulate updating global state
    setTimeout(() => {
      window.dispatchEvent(new Event("vitalcore-data-updated"));
      setLogStatus("Steps logged! Keep moving! 🚶");
      setTimeout(() => setLogStatus(null), 3000);
      setLoggingInProgress(false);
    }, 500);
  };

  const handleLogSleep = async (hours: number, quality: number) => {
    setLoggingInProgress(true);
    setLogStatus("Logging sleep patterns...");
    try {
      if (supabase && profile) {
        const { error } = await supabase.from("sleep_logs").insert({
          user_id: profile.id,
          sleep_hours: hours,
          recovery_quality: quality
        });
        if (error) throw error;
        
        await refetch();
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      } else {
        setSleepHrs(hours);
      }
      setLogStatus("Sleep logged successfully! 🛌");
      setTimeout(() => setLogStatus(null), 3000);
    } catch (e) {
      console.error("Sleep logging error:", e);
      setSleepHrs(hours);
      setLogStatus("Logged locally.");
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[var(--muted)] font-medium text-sm animate-pulse">Syncing your telemetry...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!metrics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">No Data Available</h2>
          <p className="text-[var(--muted)] text-sm max-w-md text-center">
            We couldn't load your health metrics. Please log in or try refreshing the page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleToggleMed = (idx: number) => {
    setMeds(prev => prev.map((m, i) => i === idx ? { ...m, taken: !m.taken } : m));
  };

  // Greeting helper
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const calorieTarget = metrics.caloriesTarget * 3;
  const hydrationPct = Math.min(100, (waterLogged / metrics.hydrationTarget) * 100);
  const caloriePct = Math.min(100, (totalCalories / calorieTarget) * 100);
  const sleepPct = Math.min(100, (sleepHrs / metrics.sleepTarget) * 100);
  const stepsPct = Math.min(100, (stepsLogged / metrics.stepsTarget) * 100);

  const predictions = calculateFutureHealthPredictions({
    sleepHours: simulating ? simSleep : (sleepHrs || metrics.sleepHours),
    sleepQuality: simulating ? (simSleep >= 8 ? 90 : simSleep >= 6 ? 70 : 45) : (sleepHrs > 0 ? 80 : metrics.sleepQuality),
    hydrationMl: simulating ? simWater : (waterLogged || metrics.hydrationMl),
    hydrationTarget: metrics.hydrationTarget,
    stressLevel: simulating ? simStress : metrics.stressLevel,
    fatigueScore: simulating ? (simStress > 60 ? 70 : 30) : metrics.fatigueScore,
    physicalFatigue: simulating ? (simStress > 60 ? 60 : 25) : metrics.physicalFatigue,
    mentalFatigue: simulating ? (simStress > 60 ? 75 : 35) : metrics.mentalFatigue,
    sorenessLevel: profile?.soreness_level || 0,
    recoveryPercentage: simulating ? (simSleep >= 8 ? 85 : 45) : metrics.recoveryPercentage,
    stabilityScore: metrics.stabilityScore,
    screenTimeHours: profile?.screen_time_hours || 6,
    caffeineIntake: profile?.caffeine_intake || 'moderate'
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-2">
        {/* Page Header Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {greeting}{profile?.full_name ? `, ${profile.full_name.split(" ")[0].toUpperCase()}` : ""} 👋
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Here is your health overview today
          </p>
        </div>

        {/* ======= COMMON FOCUS CARDS GRID ======= */}
        {activeMode !== "elderly" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* Calories */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="mb-3">
                <Flame className="h-[18px] w-[18px] text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <div className="text-2xl font-bold text-[var(--foreground)]">{totalCalories}</div>
                <div className="text-[10px] text-[var(--muted)] font-medium uppercase">kcal</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Daily Meals Logged</div>
            </div>

            {/* Hydration */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="mb-3">
                <Droplet className="h-[18px] w-[18px] text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <div className="text-2xl font-bold text-[var(--foreground)]">{waterLogged}</div>
                <div className="text-[10px] text-[var(--muted)] font-medium uppercase">ml</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Hydration Intake</div>
            </div>

            {/* Sleep */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="mb-3">
                <Moon className="h-[18px] w-[18px] text-violet-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <div className="text-2xl font-bold text-[var(--foreground)]">{sleepHrs > 0 ? sleepHrs : "0"}</div>
                <div className="text-[10px] text-[var(--muted)] font-medium uppercase">hrs</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-medium">Sleep Duration</div>
            </div>

            {/* Steps */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors relative overflow-hidden">
              <div className="mb-3">
                <Footprints className="h-[18px] w-[18px] text-amber-500" />
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
            </div>

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
              <GlassCard glowColor="emerald" className="p-6 text-center rounded-3xl">
                <Footprints className="h-10 w-10 text-primary mx-auto mb-2" />
                <span className="text-xs font-semibold text-[var(--muted)] block">Steps Today</span>
                <span className="text-3xl font-bold text-[var(--foreground)] block my-1">{metrics.steps}</span>
                <span className="text-xs text-[var(--muted)]">Target: 5,000 steps</span>
              </GlassCard>

              <GlassCard glowColor="violet" className="p-6 text-center rounded-3xl">
                <Droplet className="h-10 w-10 text-secondary mx-auto mb-2" />
                <span className="text-xs font-semibold text-[var(--muted)] block">Water Logged</span>
                <span className="text-3xl font-bold text-[var(--foreground)] block my-1">{waterLogged} ml</span>
                <Button
                  variant="glass"
                  size="md"
                  onClick={() => setWaterLogged(w => w + 250)}
                  className="mt-3 w-full border-primary/20 text-primary bg-primary/5 rounded-2xl"
                >
                  + Add 1 Cup (250ml)
                </Button>
              </GlassCard>
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
              <GlassCard glowColor="violet" className="p-5 flex flex-col justify-between min-h-[130px]">
                <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">CNS Fatigue</span>
                <div className="analytics-number text-[var(--foreground)]">42%</div>
                <span className="text-[10px] text-emerald-600 mt-1 block">Optimal Threshold</span>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill bg-primary" style={{ width: "42%" }} />
                </div>
              </GlassCard>

              <GlassCard glowColor="emerald" className="p-5 flex flex-col justify-between min-h-[130px]">
                <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">HRV Status</span>
                <div className="analytics-number text-[var(--foreground)]">84 ms</div>
                <span className="text-[10px] text-emerald-600 mt-1 block">Stable Stance</span>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill bg-secondary" style={{ width: "84%" }} />
                </div>
              </GlassCard>

              <GlassCard glowColor="rose" className="p-5 flex flex-col justify-between min-h-[130px]">
                <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">Metabolic Rate</span>
                <div className="analytics-number text-[var(--foreground)]">{metrics.metabolicEfficiency}%</div>
                <span className="text-[10px] text-[var(--muted)] mt-1 block">Optimal</span>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill bg-rose-500/80" style={{ width: `${metrics.metabolicEfficiency}%` }} />
                </div>
              </GlassCard>

              <GlassCard glowColor="amber" className="p-5 flex flex-col justify-between min-h-[130px]">
                <span className="text-[10px] font-semibold text-[var(--muted)] block mb-1">Glycemic Level</span>
                <div className="analytics-number text-primary">{metrics.glycemicIndexLoad}</div>
                <span className="text-[10px] text-[var(--muted)] mt-1 block">Glycogen stores primed</span>
              </GlassCard>
            </div>

            {/* Precision macros */}
            <GlassCard glowColor="none" className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-xs text-[var(--foreground)] uppercase tracking-wider">Nutrition Target Mix</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Protein", value: "165.4g", color: "text-primary" },
                  { label: "Carbs", value: "210.0g", color: "text-secondary" },
                  { label: "Healthy Fats", value: "54.2g", color: "text-accent" },
                ].map((m) => (
                  <div key={m.label} className="p-4 rounded-2xl bg-[var(--muted-bg)]/45 border border-[var(--border)]">
                    <span className={`text-[10px] font-semibold ${m.color} block uppercase tracking-wider`}>{m.label}</span>
                    <span className="text-base font-bold text-[var(--foreground)] block mt-1">{m.value}</span>
                    <span className="text-[9px] text-[var(--muted)] mt-0.5 block">Recommended</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* PR Tracker */}
            <GlassCard glowColor="rose" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-rose-500" /> 
                  Personal Benchmarks
                </span>
                <span className="text-[9px] bg-rose-500/10 text-rose-500 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center text-xs font-semibold">
                <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Deadlift</span>
                  <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">160 kg</span>
                </div>
                <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Squat</span>
                  <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">135 kg</span>
                </div>
                <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Bench</span>
                  <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">105 kg</span>
                </div>
                <div className="p-3 bg-[var(--muted-bg)]/40 rounded-2xl border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">5K Run</span>
                  <span className="text-sm font-bold text-[var(--foreground)] block mt-0.5">19:42 m</span>
                </div>
              </div>
            </GlassCard>

          </div>
        )}

        {/* ======= EVERYDAY WELLNESS MODE ======= */}
        {activeMode === "wellness" && (
          <div className="space-y-6">

            {/* Wellness indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassCard glowColor="violet" className="p-5 flex flex-col justify-between min-h-[120px]">
                <div>
                  <span className="text-[10px] font-semibold text-[var(--muted)] block uppercase tracking-wider">Lifestyle Balance</span>
                  <div className="analytics-number text-[var(--foreground)] mt-2">{metrics.lifestyleSustainability}%</div>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">Consistent rest schedules protect your cardiovascular rhythm.</p>
              </GlassCard>

              <GlassCard glowColor="rose" className="p-5 flex flex-col justify-between min-h-[120px]">
                <div>
                  <span className="text-[10px] font-semibold text-[var(--muted)] block uppercase tracking-wider">Daily Health Observations</span>
                  <p className="text-xs font-semibold text-rose-500 leading-snug mt-2">{metrics.micronutrientDeficiencies[0]}</p>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">Spend 15 minutes in natural afternoon sunlight today.</p>
              </GlassCard>
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
                className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
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
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-500" />
                  </div>
                  <span className={`text-xl font-bold ${predictions.burnoutRisk > 60 ? "text-rose-500" : predictions.burnoutRisk > 35 ? "text-amber-500" : "text-green-500"}`}>
                    {100 - predictions.burnoutRisk}%
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-1">Energy Balance</h3>
                <p className="text-[11px] text-[var(--muted)]">
                  {predictions.burnoutRisk > 60 ? "Focus on restorative periods today." : "Optimal energy reservoir."}
                </p>
              </div>

              {/* Rest Profile */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className={`text-xl font-bold ${predictions.fatigueBuildup > 65 ? "text-rose-500" : predictions.fatigueBuildup > 40 ? "text-amber-500" : "text-indigo-500"}`}>
                    {100 - predictions.fatigueBuildup}%
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-1">Rest Profile</h3>
                <p className="text-[11px] text-[var(--muted)]">
                  {predictions.fatigueBuildup > 65 ? "Slight rest debt. Wind down early." : "Recovery battery fully charged."}
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/30 transition-colors flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="h-4 w-4 text-[var(--muted)]" />
                  <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {predictions.preventiveReminders.length > 0 ? (
                    predictions.preventiveReminders.slice(0, 2).map((reminder, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Sparkles className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-[var(--muted)] leading-snug">{reminder.replace("Circadian Debt Alert", "Rest Alert")}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-[var(--muted)]">Keep up the great work! No urgent alerts.</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======= QUICK ACTIONS (all modes except elderly) ======= */}
        {activeMode !== "elderly" && (
          <div className="mb-8">
            <h2 className="text-[15px] font-bold text-[var(--foreground)] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Link href="/nutrition" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/10">
                    <Flame className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5">Log Meals</div>
                    <div className="text-[11px] text-[var(--muted)]">Track your daily foods</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/sleep" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/10">
                    <Moon className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5">Log Sleep</div>
                    <div className="text-[11px] text-[var(--muted)]">Note last night's rest</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/ai-coach" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/10">
                    <Brain className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5">Wellness Chat</div>
                    <div className="text-[11px] text-[var(--muted)]">Speak with your AI companion</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/scanner" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/10">
                    <Scan className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5">Food Scanner</div>
                    <div className="text-[11px] text-[var(--muted)]">Scan or search any ingredient</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/fitness" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/10">
                    <Dumbbell className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5">Fitness</div>
                    <div className="text-[11px] text-[var(--muted)]">Track and log your workouts</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/future-lab" className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-fuchsia-500/10">
                    <Sparkles className="h-5 w-5 text-fuchsia-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--foreground)] mb-0.5">Future Health Lab</div>
                    <div className="text-[11px] text-[var(--muted)]">Predict future health trends</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted)] group-hover:text-primary transition-colors" />
              </Link>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
