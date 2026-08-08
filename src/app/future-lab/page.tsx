"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useHealthData } from "@/hooks/useHealthData";
import {
  Activity, ArrowRight, Brain, Clock, Droplet, Flame, Heart, 
  Moon, ShieldAlert, Sparkles, Target, TrendingUp, TrendingDown,
  Footprints, Award, CheckCircle2, Utensils, Dumbbell, ShieldCheck,
  FileText, Download, Layers, X, ChevronRight, Zap
} from "lucide-react";

import {
  getFutureHealthScore,
  getEarlyWarnings,
  getFutureTimeline,
  getDailyImprovementPlan,
  getDigitalTwinProfile,
  getNutritionIntelligence,
  getAchievementsAndMotivation,
  getHealthReport,
  simulateDecisionImpact
} from "@/utils/futureLabEngine";

export default function FutureHealthLabPage() {
  const { profile } = useAuth();
  const { metrics, loading } = useHealthData();
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checkedGoals, setCheckedGoals] = useState<Record<number, boolean>>({});

  // Decision Impact Simulator State
  const [simSleep, setSimSleep] = useState(0);
  const [simWater, setSimWater] = useState(0);
  const [simSteps, setSimSteps] = useState(0);

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-xs font-semibold text-[var(--muted)]">Syncing Digital Twin...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Engine Calculations
  const digitalTwin = getDigitalTwinProfile(metrics, profile);
  const healthScore = getFutureHealthScore(metrics);
  const earlyWarnings = getEarlyWarnings(metrics).slice(0, 3); // Max top 3 insights
  const timeline = getFutureTimeline(metrics, profile?.biological_age || 30);
  const dailyPlan = getDailyImprovementPlan(metrics, profile);
  const nutritionIntel = getNutritionIntelligence(metrics);
  const motivation = getAchievementsAndMotivation(metrics);
  const healthReport = getHealthReport(metrics, profile);
  const simulation = simulateDecisionImpact(metrics, simSleep, simWater, simSteps);

  const projection30Days = timeline.find(t => t.day === 30) || timeline[1];
  const projection1Year = timeline.find(t => t.day === 365) || timeline[3];

  const toggleGoal = (index: number) => {
    setCheckedGoals(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-500">
        
        {/* TOP BAR: Clean Minimal Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Digital Twin Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Future Health Lab
            </h1>
          </div>

          <button 
            onClick={() => setShowDetailsModal(true)}
            className="px-4 py-2 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold border border-[var(--border)] transition-all flex items-center gap-1.5 text-[var(--foreground)]"
          >
            <Layers className="h-4 w-4 text-primary" />
            <span>Detailed Insights</span>
          </button>
        </div>

        {/* 1. HERO SCORE CARD: "How healthy am I?" */}
        <GlassCard glowColor="emerald" className="p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Score Ring */}
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-foreground/10" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="42" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray={264}
                    strokeDashoffset={isNaN(digitalTwin.overallHealthScore) ? 264 : 264 - (264 * ((digitalTwin.overallHealthScore || 0) / 100))}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-1000" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[var(--foreground)]">
                    {metrics.hasTelemetry && digitalTwin.overallHealthScore > 0 ? digitalTwin.overallHealthScore : "--"}
                  </span>
                  <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-wider">Score</span>
                </div>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    healthScore.direction === 'Improving' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {metrics.hasTelemetry ? (healthScore.direction === 'Improving' ? '↗ Improving' : '→ Stable') : 'No Data'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[var(--foreground)]">
                  Bio Age: <span className="text-emerald-500">
                    {metrics.hasTelemetry && digitalTwin.biologicalAge > 0 ? `${digitalTwin.biologicalAge} yrs` : "Not enough data yet."}
                  </span>
                </h2>
                <p className="text-xs font-semibold text-[var(--muted)]">
                  {metrics.hasTelemetry && digitalTwin.biologicalAge > 0
                    ? (digitalTwin.ageDifference > 0 ? `${digitalTwin.ageDifference} yrs younger than actual age` : 'Aligned with actual age')
                    : 'Track your health for several days to compute Bio Age'}
                </p>
              </div>
            </div>

            {/* AI Summary Sentence */}
            <div className="sm:max-w-xs bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)] leading-relaxed space-y-1">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">AI Health Summary</span>
              <p>{healthScore.explanation}</p>
            </div>
          </div>
        </GlassCard>

        {/* 2. TOP 3 ACTION INSIGHTS: "What is wrong / what is going well?" */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted)] px-1">
            Top Priority Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {earlyWarnings.length > 0 ? (
              earlyWarnings.map((warning) => (
                <div key={warning.id} className="p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] flex flex-col justify-between space-y-3 hover:border-primary/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {warning.type}
                      </span>
                      <span className="text-[8px] font-bold text-[var(--muted)]">{warning.confidenceScore}% Conf</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--foreground)] leading-snug">
                      {warning.message.slice(0, 85)}...
                    </p>
                  </div>
                  <button 
                    onClick={() => alert(`Triggered: ${warning.actionTrigger}`)}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>{warning.actionTrigger}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center text-xs font-bold text-emerald-500 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {metrics.hasTelemetry ? "All primary health systems clear and optimal today!" : "Not enough data yet. Log sleep, workouts, or nutrition to generate insights."}
              </div>
            )}
          </div>
        </div>

        {/* 3. TODAY'S AI PLAN (MAIN FOCUS): "What should I do today?" */}
        <GlassCard glowColor="emerald" className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Daily Protocol</span>
              <h2 className="text-lg font-black text-[var(--foreground)]">Today's AI Action Plan</h2>
            </div>
            <span className="text-[10px] font-bold text-[var(--muted)] bg-foreground/5 px-3 py-1 rounded-full border border-[var(--border)]">
              Auto-Generated Today
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Meal */}
            <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                <Utensils className="h-4 w-4" /> Meal
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{dailyPlan.recommendedMeals[0]?.name || "Healthy Oatmeal"}</h4>
              <p className="text-[10px] text-[var(--muted)] font-semibold">{dailyPlan.recommendedMeals[0]?.calories || 380} kcal</p>
            </div>

            {/* Workout */}
            <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                <Dumbbell className="h-4 w-4" /> Workout
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{dailyPlan.workoutRoutine.title}</h4>
              <p className="text-[10px] text-[var(--muted)] font-semibold">{dailyPlan.workoutRoutine.durationMin} mins • {dailyPlan.workoutRoutine.intensity}</p>
            </div>

            {/* Hydration */}
            <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-500 text-xs font-bold">
                <Droplet className="h-4 w-4" /> Hydration
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)]">{dailyPlan.hydrationGoalMl} ml Target</h4>
              <p className="text-[10px] text-[var(--muted)] font-semibold">{metrics.hydrationMl} ml logged</p>
            </div>

            {/* Sleep */}
            <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-violet-500 text-xs font-bold">
                <Moon className="h-4 w-4" /> Sleep Target
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)]">{dailyPlan.sleepSchedule.targetHours} Hours</h4>
              <p className="text-[10px] text-[var(--muted)] font-semibold">Wind down: {dailyPlan.sleepSchedule.windDown}</p>
            </div>

            {/* Goal */}
            <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-500 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" /> Wellness Goal
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{dailyPlan.wellnessGoals[0] || "10m Breathing"}</h4>
              <p className="text-[10px] text-emerald-500 font-bold">In Progress</p>
            </div>

          </div>
        </GlassCard>

        {/* 4. SINGLE FUTURE PROJECTION CARD: "What will happen if I continue?" */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Future Longevity Projection
            </h2>
            {metrics.trackingDaysCount >= 7 && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                90% Projection Confidence
              </span>
            )}
          </div>

          {metrics.trackingDaysCount >= 7 ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              
              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1">
                <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">Today</span>
                <p className="text-xl font-black text-[var(--foreground)]">{digitalTwin.overallHealthScore}</p>
                <span className="text-[10px] font-semibold text-[var(--muted)]">Baseline</span>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-2xl border border-primary/20 space-y-1 bg-primary/5">
                <span className="text-[9px] font-bold text-primary uppercase block">30 Days</span>
                <p className="text-xl font-black text-emerald-500">{projection30Days.wellness}</p>
                <span className="text-[10px] font-bold text-emerald-500">Bio Age: {projection30Days.vitalityAge} yrs</span>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1">
                <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">1 Year</span>
                <p className="text-xl font-black text-emerald-500">{projection1Year.wellness}</p>
                <span className="text-[10px] font-bold text-emerald-500">Bio Age: {projection1Year.vitalityAge} yrs</span>
              </div>

            </div>
          ) : (
            <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] text-center space-y-2">
              <Clock className="h-6 w-6 text-amber-500 mx-auto" />
              <p className="text-xs font-bold text-[var(--foreground)]">
                Complete at least 7 days of health tracking to generate predictions.
              </p>
            </div>
          )}
        </GlassCard>

        {/* 4.5. DECISION IMPACT SIMULATOR */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
            <div>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest block">Interactive AI Simulation</span>
              <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Decision Impact Simulator
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[var(--muted)]">Simulate habit changes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Sleep Chip Group */}
            <div className="space-y-1.5 bg-[var(--background)] p-3.5 rounded-2xl border border-[var(--border)]">
              <label className="text-xs font-bold text-[var(--foreground)] block">Extra Sleep (+{simSleep} hrs)</label>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSimSleep(val)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      simSleep === val
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-foreground/5"
                    }`}
                  >
                    +{val}h
                  </button>
                ))}
              </div>
            </div>

            {/* Hydration Chip Group */}
            <div className="space-y-1.5 bg-[var(--background)] p-3.5 rounded-2xl border border-[var(--border)]">
              <label className="text-xs font-bold text-[var(--foreground)] block">Extra Water (+{simWater} ml)</label>
              <div className="flex gap-1.5">
                {[0, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSimWater(val)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      simWater === val
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-foreground/5"
                    }`}
                  >
                    +{val}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Steps Chip Group */}
            <div className="space-y-1.5 bg-[var(--background)] p-3.5 rounded-2xl border border-[var(--border)]">
              <label className="text-xs font-bold text-[var(--foreground)] block">Extra Activity (+{simSteps} steps)</label>
              <div className="flex gap-1.5">
                {[0, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSimSteps(val)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      simSteps === val
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-foreground/5"
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Simulation Output */}
          <div className="p-4 bg-primary/8 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-bold text-primary">📊 Projected Simulation Impact:</span>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-[var(--foreground)]">
              <span>Energy: <strong className="text-emerald-500">{simulation.energyProjected}%</strong></span>
              <span>Recovery: <strong className="text-emerald-500">{simulation.recoveryProjected}%</strong></span>
              <span>Burnout Risk: <strong className="text-amber-500">{simulation.burnoutRiskProjected}%</strong></span>
            </div>
          </div>
        </GlassCard>

        {/* 5. COMPACT DIGITAL TWIN STATUS & NUTRITION SCORE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Digital Twin Status (5 Categories) */}
          <GlassCard className="p-6 space-y-4">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Digital Twin Status</span>
            <div className="space-y-2.5">
              {digitalTwin.domainScores.slice(0, 5).map((domain, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[var(--foreground)]">{domain.name}</span>
                  <div className="flex items-center gap-2">
                    {metrics.hasTelemetry && domain.score > 0 ? (
                      <>
                        <div className="w-24 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${domain.score >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${domain.score}%` }} />
                        </div>
                        <span className="font-bold text-[var(--foreground)] w-7 text-right">{domain.score}</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--muted)] italic">Not enough data</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Nutrition Score */}
          <GlassCard className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Nutrition Balance</span>
                <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {metrics.caloriesConsumed > 0 ? `${nutritionIntel.overallNutritionScore}/100` : "Not enough data"}
                </span>
              </div>

              {metrics.caloriesConsumed > 0 && nutritionIntel.deficiencies.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[var(--muted)]">Focus Deficiencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {nutritionIntel.deficiencies.map((def, i) => (
                      <span key={i} className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20">
                        ⚠️ {def}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] text-xs text-[var(--muted)] font-semibold text-center">
                  Log meals to generate nutritional analysis.
                </div>
              )}
            </div>

            {metrics.caloriesConsumed > 0 && (
              <button 
                onClick={() => setShowDetailsModal(true)}
                className="w-full py-2 bg-foreground/5 hover:bg-foreground/10 text-xs font-bold rounded-xl border border-[var(--border)] transition-all flex items-center justify-center gap-1 text-[var(--foreground)] cursor-pointer"
              >
                <span>View Full Micronutrient Analysis</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </GlassCard>

        </div>

        {/* 6. HORIZONTAL ACHIEVEMENT CAROUSEL */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider px-1">Recent Achievements & Streaks</span>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <div className="p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] min-w-[200px] shrink-0 space-y-1">
              <span className="text-base">🔥</span>
              <h4 className="text-xs font-bold text-[var(--foreground)]">{motivation.hydrationStreakDays} Day Hydration Streak</h4>
              <p className="text-[10px] text-[var(--muted)]">Keep logging 2500ml daily</p>
            </div>
            {motivation.badges.map((b) => (
              <div key={b.id} className="p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] min-w-[200px] shrink-0 space-y-1">
                <span className="text-base">{b.unlocked ? '🏆' : '🔒'}</span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">{b.title}</h4>
                <p className="text-[10px] text-[var(--muted)]">{b.unlocked ? 'Unlocked' : `${b.progressPct}% Progress`}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECONDARY DETAILED INSIGHTS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Advanced Analytics</span>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Digital Twin Detailed Insights</h2>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 text-[var(--foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 8 Body Systems */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-[var(--muted)]">8 Living Body Systems</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {digitalTwin.bodySystems.map((sys, i) => (
                  <div key={i} className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>{sys.name}</span>
                      <span className="text-emerald-500">{sys.score}%</span>
                    </div>
                    <p className="text-[10px] text-[var(--muted)]">{sys.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Micronutrients */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-[var(--muted)]">Full Micronutrient Analysis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {nutritionIntel.micros.map((m, i) => (
                  <div key={i} className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] text-xs">
                    <span className="font-bold block text-[var(--foreground)]">{m.name}</span>
                    <span className={m.status === 'Optimal' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                      {m.currentAmount} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Export */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
              <span className="text-xs font-semibold text-[var(--muted)]">Export official weekly health summary</span>
              <Button variant="primary" size="sm" onClick={handleExportPDF} className="gap-1.5 text-xs font-bold">
                <Download className="h-4 w-4" /> Export Report (PDF)
              </Button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
