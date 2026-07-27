"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useHealthData } from "@/hooks/useHealthData";
import {
  Activity, ArrowRight, Brain, Clock, Droplet, Flame, Heart, 
  Leaf, Milestone, Moon, ShieldAlert, Sparkles, Target, 
  TrendingDown, TrendingUp, Zap, Footprints, Award, CheckCircle2,
  Utensils, Dumbbell, ShieldCheck, AlertTriangle, FileText, Download,
  Layers, UserCheck, Stethoscope, RefreshCw, Info, HelpCircle
} from "lucide-react";

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
  getHealthReport,
  simulateDecisionImpact
} from "@/utils/futureLabEngine";

export default function FutureHealthLabPage() {
  const { profile } = useAuth();
  const { metrics, loading } = useHealthData();
  
  const [simSleep, setSimSleep] = useState(0);
  const [simWater, setSimWater] = useState(0);
  const [simSteps, setSimSteps] = useState(0);
  const [simCals, setSimCals] = useState(0);

  const [expandedTimelineIndex, setExpandedTimelineIndex] = useState<number | null>(null);
  const [expandedWarningId, setExpandedWarningId] = useState<string | null>(null);
  const [checkedGoals, setCheckedGoals] = useState<Record<number, boolean>>({});

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-[var(--muted)]">Initializing Digital Twin Healthcare Engine...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Engine Outputs dynamically from 100% real Supabase telemetry
  const digitalTwin = getDigitalTwinProfile(metrics, profile);
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
  const simImpact = simulateDecisionImpact(metrics, simSleep, simWater, simSteps, simCals);

  const toggleGoal = (index: number) => {
    setCheckedGoals(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-16">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            <Sparkles className="w-40 h-40 text-primary animate-pulse" />
          </div>
          <div className="space-y-3 relative z-10">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              AI Preventive Healthcare Center
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Future Health Lab
            </h1>
            <p className="text-base text-[var(--muted)] font-medium max-w-2xl leading-relaxed">
              Driven by your living Digital Twin. Continuously analyzes nutrition, workouts, sleep architecture, hydration, body metrics, and stress telemetry to predict risks and guide your longevity.
            </p>
          </div>
        </div>

        {/* DIGITAL TWIN REAL-TIME SYNCHRONIZATION BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[var(--card-bg)] rounded-3xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10">
                <Brain className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '12s' }} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                Digital Twin Profile Active
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  100% Real Supabase Data
                </span>
              </h3>
              <p className="text-[11px] text-[var(--muted)] font-medium">
                Telemetry synced: <span className="font-bold text-[var(--foreground)]">{metrics.sleepHours}h sleep</span>, <span className="font-bold text-[var(--foreground)]">{metrics.hydrationMl}ml hydration</span>, <span className="font-bold text-[var(--foreground)]">{metrics.caloriesConsumed} kcal</span>, <span className="font-bold text-[var(--foreground)]">{metrics.recoveryPercentage}% recovery</span>.
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider rounded-xl border border-emerald-500/20 shadow-sm flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-Time Engine Sync
          </div>
        </div>

        {/* 1. COMPREHENSIVE DIGITAL TWIN PROFILE & OVERALL HEALTH SCORE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Overall Health Score & Bio Age Card */}
          <GlassCard glowColor="emerald" className="lg:col-span-5 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Overall Health Score
                </h2>
                <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {digitalTwin.overallHealthScore >= 80 ? 'Optimal' : digitalTwin.overallHealthScore >= 65 ? 'Good' : 'Action Required'}
                </span>
              </div>

              {/* Gauge */}
              <div className="flex flex-col items-center justify-center my-4 space-y-3">
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-foreground/10" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="42" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray={264}
                      strokeDashoffset={264 - (264 * (digitalTwin.overallHealthScore / 100))}
                      strokeLinecap="round"
                      className="text-emerald-500" 
                      fill="transparent" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-[var(--foreground)]">{digitalTwin.overallHealthScore}</span>
                    <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Health Score</span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-black text-[var(--foreground)]">
                    Biological Age: <span className="text-emerald-500">{digitalTwin.biologicalAge} yrs</span>
                  </div>
                  <div className="text-[11px] font-bold text-[var(--muted)]">
                    Chronological Age: {digitalTwin.chronologicalAge} yrs ({digitalTwin.ageDifference > 0 ? `+${digitalTwin.ageDifference}` : digitalTwin.ageDifference} yrs difference)
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--foreground)] font-medium leading-relaxed bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] mt-4">
              {healthScore.explanation}
            </p>
          </GlassCard>

          {/* Living Body System Avatar Grid */}
          <GlassCard className="lg:col-span-7 p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" /> Living Digital Twin Body Systems
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                8 Body Systems Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {digitalTwin.bodySystems.map((system, i) => (
                <div key={i} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--foreground)]">{system.name}</span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      system.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      system.status === 'Good' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      system.status === 'Needs Attention' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {system.status} ({system.score}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      system.status === 'Optimal' ? 'bg-emerald-500' :
                      system.status === 'Good' ? 'bg-blue-500' :
                      system.status === 'Needs Attention' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} style={{ width: `${system.score}%` }} />
                  </div>

                  <p className="text-[11px] font-medium text-[var(--muted)] leading-snug">
                    {system.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* 10 DOMAIN HEALTH SCORES GRID */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 px-2">
            <Layers className="h-6 w-6 text-primary" /> 10 Digital Twin Domain Scores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {digitalTwin.domainScores.map((domain, i) => (
              <GlassCard key={i} className="p-4 space-y-2 text-center border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">{domain.name}</span>
                <p className="text-2xl font-black text-[var(--foreground)]">{domain.score}</p>
                <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    domain.score >= 80 ? 'bg-emerald-500' : domain.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                  }`} style={{ width: `${domain.score}%` }} />
                </div>
                <span className={`text-[9px] font-bold uppercase ${domain.trend === 'Improving' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {domain.trend}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 2. EXPANDED PREVENTIVE HEALTH EARLY WARNING RADAR */}
        <GlassCard className="p-8 space-y-6 border border-rose-500/20 shadow-lg shadow-rose-500/5">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" /> Continuous Preventive Early Warning Radar
            </h2>
            <span className="text-[10px] font-black uppercase bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-full border border-rose-500/20">
              15+ Risk Markers Evaluated
            </span>
          </div>

          {earlyWarnings.length === 0 ? (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-500">All Preventive Systems Clear</h3>
              <p className="text-xs text-[var(--muted)]">No lifestyle risk flags detected. Keep maintaining your hydration, sleep, and nutrition targets!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earlyWarnings.map((warning) => (
                <div key={warning.id} className={`p-5 rounded-2xl border ${
                  warning.severity === 'high' ? 'bg-rose-500/5 border-rose-500/30' : 'bg-amber-500/5 border-amber-500/30'
                } space-y-3 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${warning.severity === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                        {warning.type}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {warning.confidenceScore}% Confidence
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[var(--foreground)] leading-relaxed mb-3">
                      {warning.message}
                    </p>

                    <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-amber-500">
                        <span>EXPECTED TIMELINE</span>
                        <span>{warning.expectedTimeline}</span>
                      </div>
                      <p className="text-[11px] font-medium text-[var(--muted)] leading-snug">{warning.consequences}</p>
                    </div>

                    {expandedWarningId === warning.id && (
                      <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20 text-[10px] font-semibold text-[var(--foreground)] space-y-1 animate-in fade-in">
                        <span className="text-primary font-bold uppercase block">Data Attribution</span>
                        <p>{warning.dataAttribution}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setExpandedWarningId(expandedWarningId === warning.id ? null : warning.id)}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-foreground/5 hover:bg-foreground/10 text-[var(--muted)] border border-[var(--border)] shrink-0"
                    >
                      {expandedWarningId === warning.id ? "Hide Source" : "Why AI predicted this?"}
                    </button>
                    <button 
                      onClick={() => alert(`Initiated action: ${warning.actionTrigger}`)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                        warning.severity === 'high' 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      {warning.actionTrigger}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* 3. TODAY'S AI HEALTH PLAN (COORDINATED MULTI-MODULE PLAN) */}
        <GlassCard glowColor="emerald" className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Today's Dynamic Longevity Plan
              </span>
              <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] mt-2">
                {dailyPlan.headline}
              </h2>
              <p className="text-xs text-[var(--muted)] font-medium max-w-2xl leading-relaxed">
                {dailyPlan.statusMessage}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recommended Meals */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                <Utensils className="h-4 w-4 text-amber-500" /> Recommended Daily Meals
              </h3>
              <div className="space-y-3">
                {dailyPlan.recommendedMeals.map((m, i) => (
                  <div key={i} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-primary">{m.mealType}</span>
                      <span className="text-[var(--muted)]">{m.calories} kcal</span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--foreground)]">{m.name}</h4>
                    <p className="text-[11px] text-[var(--muted)] leading-snug">{m.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Workout & Recovery Schedule */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-emerald-500" /> Fitness & Recovery Protocol
              </h3>
              
              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Today's Workout Target</span>
                <h4 className="text-base font-bold text-[var(--foreground)]">{dailyPlan.workoutRoutine.title}</h4>
                <div className="flex gap-4 text-xs font-medium text-[var(--muted)]">
                  <span>⏱ {dailyPlan.workoutRoutine.durationMin} mins</span>
                  <span>⚡ Intensity: {dailyPlan.workoutRoutine.intensity}</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--border)]">
                  Focus: {dailyPlan.workoutRoutine.focus}
                </p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-violet-500 uppercase">Recovery & Sleep Schedule</span>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Wind-down Time: {dailyPlan.sleepSchedule.windDown}</span>
                  <span>Target: {dailyPlan.sleepSchedule.targetHours} hrs</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-snug">{dailyPlan.sleepSchedule.tip}</p>
              </div>
            </div>

            {/* Daily Wellness Goals & Supplements */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" /> Actionable Longevity Goals
              </h3>

              <div className="space-y-2">
                {dailyPlan.wellnessGoals.map((goal, i) => (
                  <div 
                    key={i} 
                    onClick={() => toggleGoal(i)}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      checkedGoals[i] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]'
                    }`}
                  >
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${checkedGoals[i] ? 'text-emerald-500' : 'text-foreground/20'}`} />
                    <span className="text-xs font-bold leading-snug">{goal}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                <span className="text-[10px] font-bold text-amber-500 uppercase">Nutrient & Mineral Recommendations</span>
                <div className="flex flex-wrap gap-1.5">
                  {dailyPlan.recommendedSupplements.map((supp, i) => (
                    <span key={i} className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {supp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </GlassCard>

        {/* 4. NUTRITION INTELLIGENCE CENTER */}
        <GlassCard className="p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Micro & Macro Analysis</span>
              <h2 className="text-xl font-bold flex items-center gap-2 mt-1">
                <Flame className="h-5 w-5 text-amber-500" /> Nutrition Intelligence Center
              </h2>
            </div>
            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Score: {nutritionIntel.overallNutritionScore}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nutritionIntel.micros.map((micro, i) => (
              <div key={i} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>{micro.name}</span>
                  <span className={micro.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}>
                    {micro.currentAmount} / {micro.targetAmount} {micro.unit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${micro.status === 'Optimal' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.round((micro.currentAmount / micro.targetAmount) * 100))}%` }} />
                </div>
                <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">
                  Sources: {micro.foodSources.slice(0, 3).join(", ")}
                </span>
              </div>
            ))}
          </div>

          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Recommended Foods to Correct Deficiencies</h4>
              <p className="text-xs font-medium text-[var(--foreground)]">
                Add these foods to your next meal: <span className="font-bold text-emerald-500">{nutritionIntel.recommendedFoodsToCorrect.join(", ")}</span>.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 5. RECALCULATING FUTURE TIMELINE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 px-2">
            <Milestone className="h-6 w-6 text-primary" /> Recalculating Future Longevity Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeline.map((t, i) => (
              <GlassCard 
                key={i} 
                onClick={() => setExpandedTimelineIndex(expandedTimelineIndex === i ? null : i)}
                className="p-6 relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock className="w-24 h-24 text-[var(--foreground)]" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">
                      {t.label} Projection
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {t.confidenceScore}% Confidence
                    </span>
                  </div>
                  <div className="space-y-2.5 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--muted)] font-medium">Predicted Weight</span>
                      <span className="font-bold">{t.predictedWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--muted)] font-medium">Recovery Index</span>
                      <span className="font-bold">{t.recovery}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-[var(--border)]">
                      <span className="text-[var(--muted)] font-bold uppercase text-[10px]">Vitality Age</span>
                      <span className="font-black text-emerald-500 text-lg">{t.vitalityAge} yrs</span>
                    </div>
                  </div>
                </div>
                
                {expandedTimelineIndex === i && (
                  <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-3 relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">Evolution Preview</span>
                      <p className="text-[11px] font-semibold text-[var(--foreground)] leading-snug">{t.predictionText}</p>
                    </div>
                    <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/10">
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block mb-1 flex items-center gap-1">⚠️ Precautions</span>
                      <p className="text-[10px] font-bold text-amber-600/90 leading-snug">{t.precautions}</p>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg border border-primary/10 text-[9px] text-[var(--muted)] font-medium">
                      <span className="font-bold text-primary">Data Attribution:</span> {t.dataAttribution}
                    </div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 6. DECISION IMPACT SIMULATOR & HABIT EVOLUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <GlassCard glowColor="violet" className="p-8 space-y-8">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-violet-500" /> Interactive Decision Impact Sandbox
                </h2>
                <span className="text-[10px] uppercase font-bold bg-violet-500/10 text-violet-500 px-3 py-1.5 rounded-full">Digital Twin Simulator</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-[var(--foreground)] flex justify-between mb-3">
                    <span className="flex items-center gap-2"><Moon className="h-4 w-4 text-violet-500" /> What if I sleep...</span>
                    <span className="font-black text-violet-500">{simSleep > 0 ? `+${simSleep}` : simSleep} hrs</span>
                  </label>
                  <input type="range" min="-2" max="2" step="0.5" value={simSleep} onChange={(e) => setSimSleep(Number(e.target.value))} className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-violet-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--foreground)] flex justify-between mb-3">
                    <span className="flex items-center gap-2"><Droplet className="h-4 w-4 text-cyan-500" /> What if I drink...</span>
                    <span className="font-black text-cyan-500">{simWater > 0 ? `+${simWater}` : simWater} ml</span>
                  </label>
                  <input type="range" min="-1000" max="2000" step="250" value={simWater} onChange={(e) => setSimWater(Number(e.target.value))} className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-cyan-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--foreground)] flex justify-between mb-3">
                    <span className="flex items-center gap-2"><Footprints className="h-4 w-4 text-amber-500" /> What if I walk...</span>
                    <span className="font-black text-amber-500">{simSteps > 0 ? `+${simSteps}` : simSteps} steps</span>
                  </label>
                  <input type="range" min="-3000" max="10000" step="1000" value={simSteps} onChange={(e) => setSimSteps(Number(e.target.value))} className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase block mb-1">Energy Impact</span>
                  <span className="text-xl font-black text-primary">{simImpact.energyProjected}%</span>
                </div>
                <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase block mb-1">Burnout Risk</span>
                  <span className={`text-xl font-black ${simImpact.burnoutRiskProjected > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>{simImpact.burnoutRiskProjected}%</span>
                </div>
                <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)] text-center">
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase block mb-1">Bio-Age Shift</span>
                  <span className="text-xl font-black text-emerald-500">{simImpact.vitalityAgeChange} yrs</span>
                </div>
              </div>
            </GlassCard>

            {/* Achievement & Motivation Center */}
            <GlassCard className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" /> Achievement & Motivation Center
                </h2>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {motivation.hydrationStreakDays} Day Streak 🔥
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {motivation.badges.map((badge) => (
                  <div key={badge.id} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--foreground)]">{badge.title}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        badge.unlocked ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-foreground/10 text-[var(--muted)]'
                      }`}>
                        {badge.unlocked ? 'Unlocked' : `${badge.progressPct}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] leading-snug">{badge.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs font-semibold text-[var(--foreground)]">
                💬 <span className="font-bold text-amber-500">Coach Encouragement:</span> "{motivation.encouragingAiMessage}"
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-emerald-500" /> Habit Evolution Center
              </h2>
              <div className="space-y-3">
                {habitEvo.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                    <span className="font-bold text-sm">{h.habit}</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      h.status === 'Growing' ? 'bg-emerald-500/10 text-emerald-500' :
                      h.status === 'Stable' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {h.status}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Health Reports Center */}
            <GlassCard className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Weekly Health Report Center
                </h2>
                <Button variant="glass" size="sm" onClick={handleExportPDF} className="text-xs font-bold gap-1">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
              </div>

              <div className="space-y-3 text-xs font-medium text-[var(--foreground)]">
                <p className="leading-relaxed bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
                  {healthReport.headlineSummary}
                </p>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">Top Improvements</span>
                  {healthReport.biggestImprovements.map((imp, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
